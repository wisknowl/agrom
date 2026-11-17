import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Send,
  Search,
  MoreVertical,
  CheckCheck,
  ArrowLeft,
  Paperclip,
  Smile,
  Shield,
  Bell,
  Lock,
  MessageSquare
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
import {
  requestBrowserNotificationPermission,
  sendBrowserNotification,
  playNotificationChime
} from "../utils/notification";

export const InboxPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
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

  // Handle URL param ?userId=... to start a conversation with specific user
  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (targetUserId && isAuthenticated && user?.id !== targetUserId) {
      initiateConversationWithUser(targetUserId);
    }
  }, [searchParams, isAuthenticated]);

  const loadConversations = async () => {
    try {
      setLoadingConvs(true);
      const list = await fetchUserConversationsApi();
      setConversations(list || []);

      // On desktop, auto-select first conversation if none selected
      if (window.innerWidth >= 768 && list && list.length > 0 && !activeConvId) {
        setActiveConvId(list[0].id);
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
      }
    } catch (err: any) {
      toast.error("Failed to start conversation. Please try again.");
    }
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

  // Message Polling (WhatsApp real-time simulation)
  useEffect(() => {
    if (!activeConvId || !isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const fresh = await fetchConversationMessagesApi(activeConvId);
        if (!fresh) return;
        setMessages((prev) => {
          if (fresh.length > prev.length) {
            // New incoming message check
            const lastMsg = fresh[fresh.length - 1];
            if (lastMsg && lastMsg.senderId !== user?.id) {
              playNotificationChime();
              const activeConv = conversations.find((c) => c.id === activeConvId);
              const senderName = activeConv?.participantName || activeConv?.farmerName || "AgroMarket";
              sendBrowserNotification(`New message from ${senderName}`, {
                body: lastMsg.content,
                icon: activeConv?.participantAvatar || activeConv?.farmerAvatar || "/agromarket-logo.png"
              });
            }
            return fresh;
          }
          return prev;
        });
      } catch (err) {
        // silent
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
      toast.success("Desktop notifications enabled! You'll get instant alerts when growers reply.");
      sendBrowserNotification("AgroMarket Notifications Activated", {
        body: "You will receive desktop alerts whenever you receive a message or order update."
      });
    } else {
      toast.info("Notifications were not permitted. Check your browser site settings.");
    }
  };

  // Guard for Guests
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#F8FAF9]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E0EBE2] text-center shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EEF8F1] flex items-center justify-center text-[#4E8B3F] text-3xl mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#173A20] mb-2">Direct AgroMarket Messaging</h2>
          <p className="text-sm text-[#4E6B52] mb-6 leading-relaxed">
            Direct chat connects buyers directly with cooperative farmers and verified input stores. Please log in to view your negotiations and message threads.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
              className="w-full py-3.5 bg-[#4E8B3F] text-white font-semibold rounded-2xl shadow-md hover:bg-[#3D7032] transition"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => navigate("/auth/register")}
              className="w-full py-3 bg-[#EEF8F1] text-[#173A20] font-semibold rounded-2xl hover:bg-[#E0EBE2] transition"
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
    <div className="h-[calc(100vh-68px)] flex flex-col bg-[#F0F2F5] overflow-hidden">
      {/* Optional Top Notification Permission Banner */}
      {!hasNotificationPermission && (
        <div className="bg-[#FEF2D8] border-b border-[#E2A63C]/30 px-4 py-2 text-xs flex items-center justify-between text-[#8F5E11] z-20">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#8F5E11] flex-shrink-0" />
            <span>Enable desktop alerts to never miss a buyer offer or farmer response.</span>
          </div>
          <button
            onClick={handleEnableDesktopAlerts}
            className="px-3 py-1 bg-[#E2A63C] text-white font-bold rounded-lg text-xs hover:bg-[#C98E2E] transition flex-shrink-0 cursor-pointer"
          >
            Turn On
          </button>
        </div>
      )}

      {/* Main WhatsApp-Style Container */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto shadow-xl bg-white md:my-3 md:rounded-2xl border border-gray-200">
        
        {/* LEFT PANE: Conversation List */}
        {/* On mobile: Hidden if an active conversation is open. On desktop: always visible */}
        <div
          className={`w-full md:w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col bg-white border-r border-[#E0EBE2] ${
            activeConvId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="h-16 px-4 bg-[#F8FAF9] border-b border-[#E0EBE2] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#173A20] text-white font-bold flex items-center justify-center">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="font-bold text-[#173A20] text-base leading-tight">AgroInbox</h1>
                <span className="text-[11px] text-[#4E8B3F] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4E8B3F] inline-block animate-pulse"></span>
                  Connected
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <button
                onClick={handleEnableDesktopAlerts}
                title="Notifications Settings"
                className="p-2 hover:bg-gray-200 rounded-full transition cursor-pointer"
              >
                <Bell className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3 bg-white border-b border-[#E0EBE2]/60">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats or farmers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#F0F2F5] rounded-xl border-none focus:outline-none focus:ring-1 focus:ring-[#4E8B3F]"
              />
            </div>
          </div>

          {/* Conversation Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loadingConvs ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <div className="w-8 h-8 border-2 border-[#4E8B3F] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-600">No active conversations</p>
                <p className="text-xs text-gray-400 mt-1">
                  Inquire directly from any farm produce or harvest story card to chat with growers!
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                const contactName = conv.participantName || conv.farmerName || "Grower";
                const avatar = conv.participantAvatar || conv.farmerAvatar;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition select-none ${
                      isSelected
                        ? "bg-[#EEF8F1] border-l-4 border-[#4E8B3F]"
                        : "hover:bg-[#F8FAF9]"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#173A20] text-white font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          contactName.charAt(0)
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm text-[#173A20] truncate">
                          {contactName}
                        </span>
                        {conv.lastMessageTime && (
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {conv.lastMessageTime}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 truncate">
                          {conv.lastMessage || "Start negotiation"}
                        </p>
                        {Boolean(conv.unreadCount && conv.unreadCount > 0) && (
                          <span className="bg-[#4E8B3F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
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

        {/* RIGHT PANE: Chat Thread */}
        {/* On mobile: full screen when activeConvId is set. On desktop: flex-1 */}
        <div
          className={`flex-1 flex flex-col bg-[#EFEAE2] ${
            !activeConvId ? "hidden md:flex" : "flex"
          }`}
        >
          {activeConv ? (
            <>
              {/* WhatsApp Thread Header */}
              <div className="h-16 px-4 bg-[#F8FAF9] border-b border-[#E0EBE2] flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button: WhatsApp style (<) */}
                  <button
                    onClick={() => setActiveConvId(null)}
                    className="p-2 -ml-2 text-gray-600 hover:text-black md:hidden rounded-full hover:bg-gray-200 transition cursor-pointer"
                    title="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-10 h-10 rounded-full bg-[#173A20] text-white font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden">
                    {activeConv.participantAvatar || activeConv.farmerAvatar ? (
                      <img
                        src={activeConv.participantAvatar || activeConv.farmerAvatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (activeConv.participantName || activeConv.farmerName || "G").charAt(0)
                    )}
                  </div>

                  <div>
                    <h2 className="font-bold text-[#173A20] text-sm leading-tight">
                      {activeConv.participantName || activeConv.farmerName || "Grower Contact"}
                    </h2>
                    <p className="text-[11px] text-[#4E8B3F] flex items-center gap-1 font-medium">
                      Verified AgroMarket Member
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="hidden sm:flex items-center gap-1 text-xs text-[#173A20] bg-[#EEF8F1] px-2.5 py-1 rounded-full border border-[#4E8B3F]/30">
                    <Shield className="w-3.5 h-3.5 text-[#4E8B3F]" />
                    <span>Escrow Protected</span>
                  </div>
                  <button className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Feed Area */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{
                  backgroundImage: `radial-gradient(#4E8B3F 0.5px, transparent 0.5px)`,
                  backgroundSize: "24px 24px",
                  backgroundColor: "#F7F9F7"
                }}
              >
                {/* Security Announcement Banner */}
                <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border border-[#E0EBE2] rounded-2xl p-3 text-center shadow-sm mb-4">
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    🔒 Messages are encrypted & connected to AgroMarket Escrow. Never share passwords or send money outside AgroMarket.
                  </p>
                </div>

                {loadingMessages ? (
                  <div className="text-center py-10">
                    <div className="w-6 h-6 border-2 border-[#4E8B3F] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <p className="text-sm">Start your negotiation or harvest inquiry.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Ask about batch quality, delivery options, or harvest readiness.
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
                        <div
                          className={`relative max-w-[82%] sm:max-w-[70%] px-3.5 py-2 rounded-2xl text-sm shadow-sm leading-relaxed ${
                            isMe
                              ? "bg-[#D9FDD3] text-[#111B21] rounded-tr-none"
                              : "bg-white text-[#111B21] rounded-tl-none border border-gray-100"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500">
                            <span>
                              {msg.timestamp ||
                                new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                            </span>
                            {isMe && (
                              <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] inline ml-0.5" />
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
              <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setInputText("Hello, is this produce batch still available for delivery?")}
                  className="px-3 py-1 bg-[#EEF8F1] hover:bg-[#E0EBE2] text-[#173A20] text-xs rounded-full whitespace-nowrap transition border border-[#4E8B3F]/20 cursor-pointer"
                >
                  🌾 Inquire Availability
                </button>
                <button
                  type="button"
                  onClick={() => setInputText("What is your best bulk discount price per bag?")}
                  className="px-3 py-1 bg-[#FEF2D8] hover:bg-[#FDE7B6] text-[#8F5E11] text-xs rounded-full whitespace-nowrap transition border border-[#E2A63C]/30 cursor-pointer"
                >
                  💰 Ask Wholesale Price
                </button>
                <button
                  type="button"
                  onClick={() => setInputText("Can you arrange transport to Douala/Yaoundé via AgroLogistics?")}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full whitespace-nowrap transition cursor-pointer"
                >
                  🚚 Delivery Options
                </button>
              </div>

              {/* WhatsApp Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-[#F0F2F5] border-t border-gray-200 flex items-center gap-2"
              >
                <button
                  type="button"
                  title="Attach sample picture or contract"
                  onClick={() => toast.info("Image attachment will be enabled with AgroMarket Cloud Media")}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200 transition cursor-pointer"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  ref={chatInputRef}
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={sending}
                  className="flex-1 py-2.5 px-4 bg-white rounded-full text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#4E8B3F] text-gray-800 placeholder-gray-400"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0 ${
                    inputText.trim() && !sending
                      ? "bg-[#4E8B3F] text-white hover:bg-[#3D7032] shadow-md cursor-pointer"
                      : "bg-gray-300 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
                </button>
              </form>
            </>
          ) : (
            /* Desktop Blank State when no chat is selected */
            <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center bg-[#F8FAF9]">
              <div className="w-20 h-20 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#4E8B3F] text-3xl mb-4 shadow-sm">
                💬
              </div>
              <h2 className="text-xl font-bold text-[#173A20] mb-2">AgroMarket Messenger</h2>
              <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6">
                Select a conversation on the left to start negotiating harvest prices, arrange transport logistics, or ask questions about farm produce batches.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Lock className="w-3.5 h-3.5 text-[#4E8B3F]" />
                <span>End-to-end negotiated contracts safeguarded by Escrow</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
