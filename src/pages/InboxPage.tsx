import React, { useState, useEffect } from 'react';
import {
  Send,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Handshake,
} from 'lucide-react';
import {
  fetchUserConversationsApi,
  fetchConversationMessagesApi,
  sendMessageApi,
} from '@/api';
import { Conversation, Message } from '@/types';
import { FarmerBadge } from '@/components/MeetingLeafLogo';

export const InboxPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetchUserConversationsApi().then((data) => {
      setConversations(data);
      if (data.length > 0) {
        setActiveConv(data[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchConversationMessagesApi(activeConv.id).then(setMessages);
    }
  }, [activeConv?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConv) return;
    const text = input.trim();
    const optimistic: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConv.id,
      senderId: 'me',
      receiverId: activeConv.participantId || 'farmer-1',
      content: text,
      isRead: true,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    try {
      await sendMessageApi(activeConv.participantId || 'farmer-1', text);
    } catch {
      // optimistic message shown
    }
  };

  const sendQuickOffer = (offerText: string) => {
    setInput(offerText);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-[#CCEBD5] overflow-hidden min-h-[580px] shadow-xs">
        {/* Left Pane: Conversations List */}
        <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-[#CCEBD5] flex flex-col">
          <div className="p-4 bg-[#EEF8F1] border-b border-[#CCEBD5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-[#4E8B3F]" />
              <h1 className="font-display-italic text-lg font-semibold text-[#173A20]">
                AgroInbox
              </h1>
            </div>
            <span className="text-[11px] font-mono-num font-bold bg-white border border-[#CCEBD5] text-[#4E8B3F] px-2.5 py-0.5 rounded-full">
              Direct Farm Chat
            </span>
          </div>

          <div className="divide-y divide-[#EEF8F1] overflow-y-auto flex-1">
            {conversations.map((conv) => {
              const selected = activeConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConv(conv)}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition cursor-pointer ${selected ? 'bg-[#EEF8F1]' : 'hover:bg-[#EEF8F1]/50'
                    }`}
                >
                  <img
                    src={
                      conv.participantAvatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
                    }
                    alt={conv.participantName}
                    className="w-11 h-11 rounded-full object-cover border border-[#4E8B3F] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs sm:text-sm text-[#241A12] truncate">
                        {conv.participantName || conv.farmerName}
                      </span>
                      <span className="text-[10px] font-mono-num text-[#5C5245] shrink-0">
                        {conv.lastMessageTime || 'Today'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C5245] truncate mt-0.5">{conv.lastMessage}</p>
                    <div className="mt-1">
                      <FarmerBadge tier={conv.creditTier || 'GOLD'} size="sm" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Active Chat & Trade Offer Negotiation */}
        <div className="md:col-span-8 flex flex-col justify-between bg-white">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#CCEBD5] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConv.participantAvatar}
                    alt={activeConv.participantName}
                    className="w-10 h-10 rounded-full object-cover border border-[#4E8B3F]"
                  />
                  <div>
                    <div className="font-bold text-sm text-[#241A12]">
                      {activeConv.participantName}
                    </div>
                    <div className="text-[11px] text-[#4E8B3F] flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified Cooperative • Escrow Trade Enabled
                    </div>
                  </div>
                </div>
                <FarmerBadge tier={activeConv.creditTier || 'GOLD'} />
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-[#EEF8F1]/35 max-h-[380px]">
                {messages.map((m) => {
                  const isMe = m.senderId === 'me';
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm space-y-1 ${isMe
                            ? 'bg-[#173A20] text-white rounded-br-xs'
                            : 'bg-white border border-[#CCEBD5] text-[#241A12] rounded-bl-xs'
                          }`}
                      >
                        <p className="leading-relaxed">{m.content}</p>
                        <div
                          className={`text-[10px] font-mono-num text-right ${isMe ? 'text-[#E2A63C]' : 'text-[#5C5245]'
                            }`}
                        >
                          {m.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Trade Offer Chips + Input */}
              <div className="p-3.5 border-t border-[#CCEBD5] bg-white space-y-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() =>
                      sendQuickOffer(
                        '🤝 Wholesale Offer: Can we lock 15 crates at 7,200 FCFA/crate in Smart Escrow?'
                      )
                    }
                    className="px-3 py-1 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-[11px] font-semibold text-[#173A20] whitespace-nowrap hover:border-[#4E8B3F] cursor-pointer"
                  >
                    🤝 Propose 15-Crate Wholesale Offer
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      sendQuickOffer('🚚 Is morning cold-chain transport available to Douala tomorrow?')
                    }
                    className="px-3 py-1 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-[11px] font-semibold text-[#173A20] whitespace-nowrap hover:border-[#4E8B3F] cursor-pointer"
                  >
                    🚚 Check Delivery Schedule
                  </button>
                </div>

                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type message or wholesale price offer..."
                    className="flex-1 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-2.5 text-xs sm:text-sm text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                  />
                  <button
                    type="submit"
                    className="w-10 h-10 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;

