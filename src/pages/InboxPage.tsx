import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import {
  Send,
  Search,
  MoreVertical,
  CheckCheck,
  ArrowLeft,
  Paperclip,
  Shield,
  Bell,
  Lock,
  MessageSquare,
  ExternalLink,
  User as UserIcon
} from "lucide-react";
import {
  fetchUserConversationsApi,
  fetchConversationMessagesApi,
  sendMessageApi,
  getOrCreateConversationWithUserApi
} from "../api";
import { Conversation, Message } from "../types";
import { useAuthStore } from "../store/authStore";
import { toast } from "../store/toastStore";
import { resolveMediaUrl } from "../utils/media";
import {
  requestBrowserNotificationPermission,
  sendBrowserNotification,
  playNotificationChime
} from "../utils/notification";

export const InboxPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(() => {
    return params.id || searchParams.get("c") || null;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [avatarErrors, setAvatarErrors] = useState<Record<string, boolean>>({});
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(() => {
    return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated) return;
    loadConversations();
  }, [isAuthenticated]);

  // Sync activeConvId with URL parameters
  useEffect(() => {
    const urlConvId = params.id || searchParams.get("c");
    if (urlConvId && urlConvId !== activeConvId) {
      setActiveConvId(urlConvId);
    }
  }, [params.id, searchParams]);

  // Handle URL param ?userId=... to initiate chat with a seller or farmer
  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (targetUserId && isAuthenticated && user?.id !== targetUserId) {
      initiateConversationWithUser(targetUserId);
    }
  }, [searchParams, isAuthenticated, user?.id]);

  const loadConversations = async () => {
    try {
      setLoadingConvs(true);
      const list = await fetchUserConversationsApi();
      setConversations(list || []);

      const targetId = params.id || searchParams.get("c");
      if (targetId) {
        setActiveConvId(targetId);
      } else if (window.innerWidth >= 768 && list && list.length > 0 && !activeConvId) {
        // Auto-select first conversation on desktop
        setActiveConvId(list[0].id);
        setSearchParams({ c: list[0].id }, { replace: true });
      }
    } catch (err: any) {
      console.warn("Could not fetch conversations:", err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const initiateConversationWithUser = async (targetUserId: string) => {
    try {
      const conv = await getOrCreateConversationWithUserApi(targetUserId);
      if (conv?.id) {
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === conv.id);
          return exists ? prev : [conv, ...prev];
        });
        setActiveConvId(conv.id);
        setSearchParams({ c: conv.id }, { replace: true });
      }
    } catch (err: any) {
      toast.error("Failed to start conversation. Please try again.");
    }
  };

  // Select conversation and sync URL
  const handleSelectConversation = (convId: string) => {
    setActiveConvId(convId);
    setSearchParams({ c: convId }, { replace: true });
  };

  // Back to conversation list on mobile
  const handleBackToList = () => {
    setActiveConvId(null);
    setSearchParams({}, { replace: true });
  };

  // Load messages when activeConvId changes
  useEffect(() => {
    if (!activeConvId || !isAuthenticated) return;

    let isMounted = true;
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const msgs = await fetchConversationMessagesApi(activeConvId);
        if (isMounted) {
          setMessages(msgs || []);
        }
      } catch (err: any) {
        console.warn("Could not fetch messages:", err);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    fetchMessages();
    return () => {
      isMounted = false;
    };
  }, [activeConvId, isAuthenticated]);

  // Message Polling (Real-time updates)
  useEffect(() => {
    if (!activeConvId || !isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const fresh = await fetchConversationMessagesApi(activeConvId);
        if (!fresh) return;
        setMessages((prev) => {
          if (fresh.length > prev.length) {
            const lastMsg = fresh[fresh.length - 1];
            if (lastMsg && lastMsg.senderId !== user?.id) {
              playNotificationChime();
              const conv = conversations.find((c) => c.id === activeConvId);
              const senderName = conv?.participantName || conv?.farmerName || "AgroMarket Partner";
              sendBrowserNotification(`New message from ${senderName}`, {
                body: lastMsg.content,
                icon: resolveMediaUrl(conv?.participantAvatar || conv?.farmerAvatar) || "/agromarket-logo.png"
              });
            }
            return fresh;
          }
          return prev;
        });
      } catch (err) {
        // silent polling catch
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConvId, isAuthenticated, user?.id, conversations]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConv || sending) return;

    const textToSend = inputText.trim();
    setInputText("");

    const targetReceiverId = activeConv.participantId || activeConv.farmerId || "merchant";

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      conversationId: activeConv.id,
      senderId: user?.id || "",
      receiverId: targetReceiverId,
      content: textToSend,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      setSending(true);
      const res = await sendMessageApi(targetReceiverId, textToSend);
      const savedMsg = res?.message;

      if (savedMsg) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? savedMsg : m))
        );
      }

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
              ...c,
              lastMessage: textToSend,
              lastMessageTime: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })
            }
            : c
        )
      );
    } catch (err: any) {
      toast.error("Failed to deliver message. Tap to retry.");
      // Rollback optimistic update
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputText(textToSend);
    } finally {
      setSending(false);
      chatInputRef.current?.focus();
    }
  };

  const handleEnableDesktopAlerts = async () => {
    const granted = await requestBrowserNotificationPermission();
    setHasNotificationPermission(granted);
    if (granted) {
      toast.success("Desktop alerts enabled! You will be notified instantly when growers reply.");
      sendBrowserNotification("AgroMarket Notifications Activated", {
        body: "You will receive desktop alerts whenever you receive a message or order update."
      });
    } else {
      toast.info("Notifications were not granted. Check your browser site settings.");
    }
  };

  // Navigate to public profile
  const handleGoToPublicProfile = () => {
    const targetUserId = activeConv?.participantId || activeConv?.farmerId;
    if (targetUserId) {
      navigate(`/profile/${targetUserId}`);
    } else {
      toast.info("Profile link is not available for this contact.");
    }
  };

  // Helper to mark avatar as failed
  const handleAvatarError = (id: string) => {
    setAvatarErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Guest Gate
  if (!isAuthenticated) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 bg-[#FAFBF9]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#CCEBD5] text-center shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EEF8F1] flex items-center justify-center text-[#4E8B3F] text-3xl mb-4 border border-[#CCEBD5]">
            <Lock className="w-8 h-8 text-[#4E8B3F]" />
          </div>
          <h2 className="text-2xl font-bold text-[#173A20] mb-2">Direct AgroMarket Messaging</h2>
          <p className="text-sm text-[#4E6B52] mb-6 leading-relaxed">
            Direct chat connects buyers directly with cooperative farmers and verified input stores. Please log in to view your negotiations and message threads.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
              className="w-full py-3.5 bg-[#4E8B3F] text-white font-semibold rounded-2xl shadow-sm hover:bg-[#3D7032] transition cursor-pointer"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => navigate("/auth/register")}
              className="w-full py-3 bg-[#EEF8F1] text-[#173A20] font-semibold rounded-2xl hover:bg-[#E0EBE2] transition cursor-pointer border border-[#CCEBD5]"
            >
              Create Free AgroMarket Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter((c) => {
    const name = c.participantName || c.farmerName || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden m-0 p-0">
      {/* Top Notification Permission Banner */}
      {!hasNotificationPermission && (
        <div className="bg-[#FEF2D8] border-b border-[#E2A63C]/30 px-4 py-2 text-xs flex items-center justify-between text-[#8F5E11] z-20 shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#8F5E11] shrink-0" />
            <span>Enable desktop alerts to never miss a buyer offer or farmer response.</span>
          </div>
          <button
            onClick={handleEnableDesktopAlerts}
            className="px-3 py-1 bg-[#E2A63C] text-white font-bold rounded-lg text-xs hover:bg-[#C98E2E] transition shrink-0 cursor-pointer"
          >
            Turn On
          </button>
        </div>
      )}

      {/* Main Dual-Pane Inbox Container: Edge-to-edge, unrounded, zero outer scroll */}
      <div className="flex-1 flex overflow-hidden w-full h-full bg-white">

        {/* =====================================================================
            LEFT PANE: Conversation List
            - Hidden on mobile (<768px) when an active conversation is selected
            - Visible on desktop (pinned 360px - 400px width)
            - Has its own independent vertical scroll
        ===================================================================== */}
        <div
          className={`w-full md:w-[360px] lg:w-[400px] shrink-0 flex flex-col bg-white border-r border-[#CCEBD5] ${activeConvId ? "hidden md:flex" : "flex"
            }`}
        >
          {/* List Header: Pure white background */}
          <div className="h-16 px-4 bg-white border-b border-[#CCEBD5] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#173A20] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="font-bold text-[#173A20] text-base leading-tight">AgroInbox</h1>
                <span className="text-[11px] text-[#4E8B3F] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4E8B3F] inline-block animate-pulse"></span>
                  Active Negotiations
                </span>
              </div>
            </div>
            <button
              onClick={handleEnableDesktopAlerts}
              title="Notification Settings"
              className="p-2 hover:bg-[#EEF8F1] text-[#4E6B52] hover:text-[#173A20] rounded-xl transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar with AgroMarket Themed Pale Mint Styling */}
          <div className="p-3 bg-white border-b border-[#CCEBD5]/60 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4E6B52]" />
              <input
                type="text"
                placeholder="Search conversations or farmers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#EEF8F1]/50 border border-[#CCEBD5] rounded-xl text-[#173A20] placeholder-[#7A9A80] focus:outline-none focus:ring-1 focus:ring-[#4E8B3F] focus:border-[#4E8B3F] transition"
              />
            </div>
          </div>

          {/* Conversation Items: Independent Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#CCEBD5]/40">
            {loadingConvs ? (
              <div className="p-8 text-center text-[#4E6B52] text-sm">
                <div className="w-7 h-7 border-2 border-[#4E8B3F] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF8F1] text-[#4E8B3F] flex items-center justify-center mx-auto mb-3 border border-[#CCEBD5]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-[#173A20]">No active conversations</p>
                <p className="text-xs text-[#4E6B52] mt-1 max-w-xs mx-auto leading-relaxed">
                  Inquire directly from any farm produce or harvest story card to start chatting with growers!
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                const contactName = conv.participantName || conv.farmerName || "Grower Contact";
                const rawAvatar = conv.participantAvatar || conv.farmerAvatar;
                const resolvedAvatar = rawAvatar ? resolveMediaUrl(rawAvatar) : null;
                const hasError = avatarErrors[conv.id];

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer transition select-none ${isSelected
                        ? "bg-[#EEF8F1] border-l-4 border-[#4E8B3F]"
                        : "hover:bg-[#F2F8F4] bg-white"
                      }`}
                  >
                    {/* User Avatar with Image & Fallback Initials */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#173A20] text-white font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden border border-[#CCEBD5]">
                        {resolvedAvatar && !hasError ? (
                          <img
                            src={resolvedAvatar}
                            alt={contactName}
                            onError={() => handleAvatarError(conv.id)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-base text-white font-semibold">
                            {contactName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#4E8B3F] border-2 border-white rounded-full"></span>
                    </div>

                    {/* Metadata & Last Message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm text-[#173A20] truncate">
                          {contactName}
                        </span>
                        {conv.lastMessageTime && (
                          <span className="text-[10.5px] text-[#4E6B52] font-medium shrink-0 ml-1">
                            {conv.lastMessageTime}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-[#4E6B52] truncate">
                          {conv.lastMessage || "Start negotiation"}
                        </p>
                        {Boolean(conv.unreadCount && conv.unreadCount > 0) && (
                          <span className="bg-[#4E8B3F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =====================================================================
            RIGHT PANE: Active Chat Thread
            - Visible on mobile when activeConvId is set; full screen
            - Visible on desktop flex-1
            - Features AgroMarket mint canvas, custom bubbles, and profile navigation
        ===================================================================== */}
        <div
          className={`flex-1 min-w-0 w-full max-w-full flex flex-col bg-[#F9FAF8] overflow-hidden ${!activeConvId ? "hidden md:flex" : "flex"
            }`}
        >
          {activeConv ? (
            <>
              {/* Chat Thread Header: Displays verified grower info and click-to-profile */}
              <div className="h-16 px-3 sm:px-4 bg-white border-b border-[#CCEBD5] flex items-center justify-between shrink-0 z-10 shadow-xs">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {/* Mobile Back Button: Properly padded circular button */}
                  <button
                    onClick={handleBackToList}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-[#EEF8F1] hover:bg-[#DDF2E4] text-[#173A20] md:hidden transition shrink-0 cursor-pointer"
                    title="Back to conversation list"
                  >
                    <ArrowLeft className="w-5 h-5 text-[#173A20]" />
                  </button>

                  {/* Profile Click Target: Avatar + Name navigate to user's public profile */}
                  <div
                    onClick={handleGoToPublicProfile}
                    className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
                    title="View grower's public profile"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#173A20] text-white font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden border border-[#CCEBD5] group-hover:ring-2 group-hover:ring-[#4E8B3F] transition shrink-0">
                      {(() => {
                        const raw = activeConv.participantAvatar || activeConv.farmerAvatar;
                        const resolved = raw ? resolveMediaUrl(raw) : null;
                        const contactName = activeConv.participantName || activeConv.farmerName || "Grower";
                        if (resolved && !avatarErrors[`active-${activeConv.id}`]) {
                          return (
                            <img
                              src={resolved}
                              alt={contactName}
                              onError={() => handleAvatarError(`active-${activeConv.id}`)}
                              className="w-full h-full object-cover"
                            />
                          );
                        }
                        return <span>{contactName.charAt(0).toUpperCase()}</span>;
                      })()}
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold text-[#173A20] text-sm leading-tight truncate group-hover:text-[#4E8B3F] transition flex items-center gap-1.5">
                        <span className="truncate">
                          {activeConv.participantName || activeConv.farmerName || "Verified Partner"}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-[#4E8B3F] shrink-0" />
                      </h2>
                      <p className="text-[11px] text-[#4E8B3F] flex items-center gap-1 font-semibold truncate">
                        <span>●</span>
                        <span>Verified AgroMarket Contact</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#173A20] shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#173A20] bg-[#EEF8F1] px-3 py-1 rounded-full border border-[#CCEBD5] font-medium">
                    <Shield className="w-3.5 h-3.5 text-[#4E8B3F]" />
                    <span>Escrow Protected</span>
                  </div>
                  <button
                    onClick={handleGoToPublicProfile}
                    title="View public profile"
                    className="p-2 hover:bg-[#EEF8F1] text-[#4E6B52] hover:text-[#173A20] rounded-xl transition cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Message Scroll Area (Only this area scrolls!) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9FAF8]">
                {/* Security Reassurance Banner */}
                <div className="max-w-md mx-auto bg-white border border-[#CCEBD5] rounded-2xl p-3 text-center shadow-xs mb-3">
                  <p className="text-[11px] text-[#4E6B52] leading-relaxed">
                    🔒 Messages are protected & linked to AgroMarket Escrow. Never send funds directly outside AgroMarket checkout.
                  </p>
                </div>

                {loadingMessages ? (
                  <div className="text-center py-10">
                    <div className="w-6 h-6 border-2 border-[#4E8B3F] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 text-[#4E6B52]">
                    <p className="text-sm font-semibold text-[#173A20]">Start your harvest negotiation</p>
                    <p className="text-xs text-[#4E6B52] mt-1 max-w-sm mx-auto">
                      Inquire about crop maturity, produce grade, wholesale pricing, or transport arrangements.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        {/* Message Bubbles:
                            - Sender: AgroMarket mint (#EEF8F1) with pine text and border (#C6E7CE)
                            - Receiver: Crisp white (#FFFFFF) with dark slate text and soft border (#E2E8F0)
                        */}
                        <div
                          className={`relative max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                              ? "bg-[#EEF8F1] text-[#173A20] border border-[#C6E7CE] rounded-tr-xs shadow-xs"
                              : "bg-white text-[#1E293B] border border-[#E0EBE2] rounded-tl-xs shadow-xs"
                            }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px]">
                            <span className={isMe ? "text-[#4E8B3F]" : "text-gray-400"}>
                              {msg.timestamp ||
                                new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                            </span>
                            {isMe && (
                              <CheckCheck className="w-3.5 h-3.5 text-[#4E8B3F] inline ml-0.5" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Negotiation Action Chips */}
              <div className="px-3 sm:px-4 py-2 bg-white border-t border-[#CCEBD5]/60 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 w-full max-w-full">
                <button
                  type="button"
                  onClick={() => setInputText("Hello, is this produce batch ready for immediate delivery?")}
                  className="px-3 py-1 bg-[#EEF8F1] hover:bg-[#E0EBE2] text-[#173A20] text-xs font-medium rounded-full whitespace-nowrap transition border border-[#CCEBD5] cursor-pointer shrink-0"
                >
                  🌾 Check Batch Availability
                </button>
                <button
                  type="button"
                  onClick={() => setInputText("What is your wholesale discount price per bag/crate?")}
                  className="px-3 py-1 bg-[#FEF2D8] hover:bg-[#FDE7B6] text-[#8F5E11] text-xs font-medium rounded-full whitespace-nowrap transition border border-[#E2A63C]/30 cursor-pointer shrink-0"
                >
                  💰 Wholesale Price Quote
                </button>
                <button
                  type="button"
                  onClick={() => setInputText("Can you arrange depot delivery through AgroLogistics?")}
                  className="px-3 py-1 bg-[#FAFBF9] hover:bg-[#EEF8F1] text-[#173A20] text-xs font-medium rounded-full whitespace-nowrap transition border border-[#CCEBD5] cursor-pointer shrink-0"
                >
                  🚚 Freight & Transport
                </button>
              </div>

              {/* Message Input Bar: AgroMarket Themed */}
              <form
                onSubmit={handleSendMessage}
                className="p-2.5 sm:p-3 bg-[#F8FAF9] border-t border-[#CCEBD5] flex items-center gap-2 shrink-0 w-full max-w-full box-border pb-[max(0.65rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))]"
              >
                <button
                  type="button"
                  title="Attach sample picture or document"
                  onClick={() => toast.info("Media attachments will be enabled with AgroMarket Cloud Media")}
                  className="p-2 text-[#4E6B52] hover:text-[#173A20] rounded-xl hover:bg-[#EEF8F1] transition shrink-0 cursor-pointer"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  ref={chatInputRef}
                  type="text"
                  placeholder="Type a message or price offer..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={sending}
                  className="flex-1 min-w-0 py-2 sm:py-2.5 px-3.5 sm:px-4 bg-white rounded-full text-sm border border-[#CCEBD5] focus:outline-none focus:ring-2 focus:ring-[#4E8B3F] text-[#173A20] placeholder-[#7A9A80] transition"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className={`w-9 sm:w-10 h-9 sm:h-10 rounded-full flex items-center justify-center transition shrink-0 ${inputText.trim() && !sending
                      ? "bg-[#4E8B3F] text-white hover:bg-[#3D7032] shadow-sm cursor-pointer"
                      : "bg-[#E0EBE2] text-[#7A9A80] cursor-not-allowed"
                    }`}
                >
                  <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
                </button>
              </form>
            </>
          ) : (
            /* Desktop Blank State when no chat is active */
            <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center bg-[#FAFBF9]">
              <div className="w-16 h-16 rounded-3xl bg-[#EEF8F1] flex items-center justify-center text-[#4E8B3F] text-2xl mb-4 border border-[#CCEBD5] shadow-xs">
                <MessageSquare className="w-8 h-8 text-[#4E8B3F]" />
              </div>
              <h2 className="text-xl font-bold text-[#173A20] mb-2">AgroMarket Direct Messenger</h2>
              <p className="text-sm text-[#4E6B52] max-w-sm leading-relaxed mb-6">
                Select a conversation on the left to start negotiating harvest prices, arrange transport logistics, or ask questions about farm produce batches.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#4E6B52] bg-white px-3.5 py-1.5 rounded-full border border-[#CCEBD5]">
                <Lock className="w-3.5 h-3.5 text-[#4E8B3F]" />
                <span>End-to-end negotiated contracts protected by AgroMarket Escrow</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
