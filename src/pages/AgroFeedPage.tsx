import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Plus,
  ShoppingBag,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Send,
  Star,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import {
  fetchFeedPostsApi,
  toggleLikePostApi,
  addPostCommentApi,
  FALLBACK_YIELDS,
} from '@/api';
import { Post } from '@/types';
import { FarmerBadge } from '@/components/MeetingLeafLogo';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import { formatXaf, isVideoMedia } from '@/utils/media';

export const AgroFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'patronized' ? 'Patronized ⭐' : 'AgroFeed';
  const initialIndex = Number(searchParams.get('postIndex')) || 0;

  const [activeTab, setActiveTab] = useState<'AgroFeed' | 'Patronized ⭐'>(initialTab);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [likedLocal, setLikedLocal] = useState<Record<string, boolean>>({});

  const addToCart = useCartStore((s) => s.addToCart);
  const { togglePost, isPostFavorite } = useFavoritesStore();
  const setCreatePostModalOpen = useRegionalContainerStore((s) => s.setCreatePostModalOpen);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await fetchFeedPostsApi();
      setPosts(data);
      if (initialIndex < data.length) {
        setCurrentIndex(initialIndex);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const filteredPosts =
    activeTab === 'Patronized ⭐'
      ? posts.filter(
        (p) =>
          p.isPatron ||
          p.farmerCreditTier === 'GOLD' ||
          p.farmerCreditTier === 'PLATINUM'
      )
      : posts;

  const activePost = filteredPosts[currentIndex] || filteredPosts[0];
  const linkedYield =
    activePost?.linkedYield ||
    FALLBACK_YIELDS.find((y) => y.id === activePost?.linkedYieldId) ||
    FALLBACK_YIELDS[0];

  const handleLike = async (post: Post) => {
    const prev = Boolean(likedLocal[post.id]);
    setLikedLocal({ ...likedLocal, [post.id]: !prev });
    setPosts((curr) =>
      curr.map((p) =>
        p.id === post.id
          ? { ...p, likesCount: (p.likesCount ?? 0) + (prev ? -1 : 1) }
          : p
      )
    );
    try {
      await toggleLikePostApi(post.id);
    } catch {
      // optimistic UI preserved
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activePost) return;
    const newComment = {
      id: `local-${Date.now()}`,
      userId: 'me',
      userName: 'Agrom Buyer',
      content: commentText.trim(),
      createdAt: 'Just now',
    };
    setPosts((curr) =>
      curr.map((p) =>
        p.id === activePost.id
          ? {
            ...p,
            commentsCount: (p.commentsCount ?? 0) + 1,
            comments: [...(p.comments || []), newComment],
          }
          : p
      )
    );
    setCommentText('');
    try {
      await addPostCommentApi(activePost.id, newComment.content);
    } catch {
      // optimistic UI preserved
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4">
      {/* Top Feed Sub-Header (Mirrors HomeTabBar.tsx with Profile Mint/Canopy colors) */}
      <div className="flex items-center justify-between bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-2.5 rounded-2xl">
        <div className="flex items-center gap-2">
          {(['AgroFeed', 'Patronized ⭐'] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentIndex(0);
                }}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${active
                    ? 'bg-[#4E8B3F] text-white shadow-xs'
                    : 'text-[#241A12]/70 hover:text-[#173A20]'
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setCreatePostModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-[#173A20] hover:bg-[#0E2515] text-[#E2A63C] px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer"
        >
          <Plus size={14} strokeWidth={2.8} />
          <span>Publish Story</span>
        </button>
      </div>

      {/* Main Split-Screen Stage (9:16 Immersive Story Player + Shoppable Yield & Comments Panel) */}
      {loading ? (
        <div className="h-[580px] rounded-3xl bg-[#EEF8F1] border border-[#CCEBD5] animate-pulse" />
      ) : !activePost ? (
        <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-3xl p-12 text-center space-y-3">
          <Star size={44} className="text-[#E2A63C] mx-auto" />
          <h3 className="font-display-italic text-xl text-[#173A20] font-semibold">
            No Harvest Stories Found
          </h3>
          <p className="text-xs text-[#5C5245] max-w-md mx-auto">
            Publish the first harvest story or switch back to the main AgroFeed stream.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT: Immersive 9:16 Story Stage */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden bg-[#173A20] border-2 border-[#CCEBD5] min-h-[520px] sm:min-h-[620px] flex flex-col justify-between shadow-lg">
            {isVideoMedia(activePost.mediaUrl || activePost.media, activePost.isVideo) ? (
              <video
                src={activePost.mediaUrl || activePost.media}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                controls
              />
            ) : (
              <img
                src={activePost.mediaUrl || activePost.media}
                alt={activePost.farmerName}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/45 pointer-events-none" />

            {/* Top Overlay: Producer Info & Story Counter */}
            <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between gap-2">
              <div
                onClick={() => navigate(`/profile/${activePost.userId || activePost.farmerId}`)}
                className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 cursor-pointer"
              >
                <img
                  src={activePost.farmerAvatar}
                  alt={activePost.farmerName}
                  className="w-8 h-8 rounded-full object-cover border border-[#E2A63C]"
                />
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {activePost.farmerName}
                  </div>
                  <div className="text-[10px] text-[#E2A63C] font-mono-num">
                    Verified Producer • {activePost.farmerCreditTier || 'GOLD'}
                  </div>
                </div>
              </div>

              {/* Story Navigation Arrows */}
              <div className="flex items-center gap-1.5">
                <span className="font-mono-num text-xs text-white/90 bg-black/45 px-2.5 py-1 rounded-full">
                  {currentIndex + 1} / {filteredPosts.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((i) => (i > 0 ? i - 1 : filteredPosts.length - 1))
                  }
                  className="w-8 h-8 rounded-full bg-black/55 hover:bg-[#4E8B3F] text-white flex items-center justify-center border border-white/20 transition cursor-pointer"
                  title="Previous Story"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((i) => (i < filteredPosts.length - 1 ? i + 1 : 0))
                  }
                  className="w-8 h-8 rounded-full bg-black/55 hover:bg-[#4E8B3F] text-white flex items-center justify-center border border-white/20 transition cursor-pointer"
                  title="Next Story"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* Bottom Overlay: Story Caption + Right Action Rail + Embedded Shoppable Card */}
            <div className="relative z-10 p-4 sm:p-5 flex items-end justify-between gap-4">
              <div className="flex-1 space-y-3">
                <p className="text-sm text-white leading-relaxed drop-shadow">
                  {activePost.content}
                </p>

                {/* Embedded Shoppable Yield Overlay Card */}
                {linkedYield && (
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#CCEBD5] flex items-center justify-between gap-3 shadow-lg">
                    <div
                      onClick={() => navigate(`/yield/${linkedYield.id}`)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                    >
                      <img
                        src={linkedYield.image}
                        alt={linkedYield.title}
                        className="w-12 h-12 rounded-xl object-cover border border-[#CCEBD5] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#241A12] truncate">
                          {linkedYield.title}
                        </div>
                        <div className="font-mono-num text-xs font-bold text-[#4E8B3F]">
                          {formatXaf(linkedYield.price)} / {linkedYield.unit}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(linkedYield, 1)}
                      className="px-3.5 py-2 rounded-full bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                    >
                      <ShoppingBag size={13} />
                      <span>1-Tap Buy</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Floating Social Action Rail */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleLike(activePost)}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center border transition ${likedLocal[activePost.id]
                        ? 'bg-[#B54A34] border-white text-white'
                        : 'bg-black/50 border-white/25 text-white hover:bg-black/70'
                      }`}
                  >
                    <Heart
                      size={20}
                      className={likedLocal[activePost.id] ? 'fill-white' : ''}
                    />
                  </div>
                  <span className="font-mono-num text-[11px] font-bold text-white">
                    {activePost.likesCount ?? activePost.likes ?? 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePost(activePost.id)}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center border transition ${isPostFavorite(activePost.id)
                        ? 'bg-[#4E8B3F] border-white text-white'
                        : 'bg-black/50 border-white/25 text-white hover:bg-black/70'
                      }`}
                  >
                    <Bookmark
                      size={19}
                      className={isPostFavorite(activePost.id) ? 'fill-white' : ''}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-white">Save</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Interactive Story Companion Panel (Comments, Patron Pass & All Stories Strip) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-3xl border border-[#CCEBD5] p-5 space-y-4 shadow-xs">
            {/* Producer Trust Header */}
            <div className="space-y-3 pb-3.5 border-b border-[#CCEBD5]">
              <div className="flex items-center justify-between gap-2">
                <FarmerBadge
                  tier={activePost.farmerCreditTier || 'GOLD'}
                  label={`Engine 1 Credit Tier • ${activePost.farmerCreditTier || 'GOLD'}`}
                />
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4E8B3F]">
                  <ShieldCheck size={14} /> Smart Escrow Ready
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 bg-[#EEF8F1] border border-[#CCEBD5] p-3 rounded-2xl">
                <div>
                  <div className="text-xs font-bold text-[#173A20]">
                    Become an AgroPatron ⭐ ($2/mo)
                  </div>
                  <div className="text-[11px] text-[#5C5245]">
                    Unlock 8% direct harvest discount & private field updates
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/profile/${activePost.userId || activePost.farmerId || 'farmer-1'}`)
                  }
                  className="px-3 py-1.5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <UserPlus size={13} />
                  <span>Patronize</span>
                </button>
              </div>
            </div>

            {/* Live Buyer & Farmer Comments */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C5245] font-mono-num">
                  Harvest Discussion ({activePost.commentsCount ?? activePost.comments?.length ?? 0})
                </h3>
              </div>

              {(!activePost.comments || activePost.comments.length === 0) ? (
                <div className="p-6 rounded-2xl bg-[#EEF8F1]/60 border border-[#CCEBD5] text-center text-xs text-[#5C5245]">
                  Ask the farmer about harvest freshness, crate weight, or wholesale delivery!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activePost.comments.map((c: any) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#173A20]">
                          {c.userName || c.user?.name || 'Verified Buyer'}
                        </span>
                        <span className="text-[10px] text-[#5C5245] font-mono-num">
                          {c.createdAt || 'Today'}
                        </span>
                      </div>
                      <p className="text-[#241A12] leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-[#CCEBD5]">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask farmer about crate pricing or delivery..."
                className="flex-1 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-2 text-xs text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>

            {/* Quick Story Switcher Thumbnails */}
            <div className="pt-2 border-t border-[#CCEBD5]">
              <div className="text-[11px] font-semibold text-[#5C5245] mb-2">
                Up Next in {activeTab}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {filteredPosts.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition cursor-pointer ${idx === currentIndex
                        ? 'border-[#4E8B3F] scale-[1.03]'
                        : 'border-[#CCEBD5] opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={p.mediaUrl || p.media}
                      alt={p.farmerName}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgroFeedPage;

