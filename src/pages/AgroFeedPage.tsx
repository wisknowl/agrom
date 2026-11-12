import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Bookmark,
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  Send,
  Star,
  ShieldCheck,
  UserPlus,
  Share2,
  Volume2,
  VolumeX,
  Play,
  X,
} from 'lucide-react';
import {
  fetchFeedPostsApi,
  toggleLikePostApi,
  addPostCommentApi,
} from '@/api';
import { Post } from '@/types';
import { FarmerBadge } from '@/components/MeetingLeafLogo';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import { formatXaf, isVideoMedia, resolveMediaUrl } from '@/utils/media';

export const AgroFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'patronized' ? 'Patronized ⭐' : 'AgroFeed';
  const initialIndex = Number(searchParams.get('postIndex')) || 0;

  const [activeTab, setActiveTab] = useState<'AgroFeed' | 'Patronized ⭐'>(initialTab);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const [pausedMap, setPausedMap] = useState<Record<number, boolean>>({});
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [likedLocal, setLikedLocal] = useState<Record<string, boolean>>({});

  const addToCart = useCartStore((s) => s.addToCart);
  const { togglePost, isPostFavorite } = useFavoritesStore();
  const lastPostCreatedAt = useRegionalContainerStore((s) => s.lastPostCreatedAt);

  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await fetchFeedPostsApi();
      setPosts(data);
      if (initialIndex < data.length) {
        setCurrentIndex(initialIndex);
      } else {
        setCurrentIndex(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [lastPostCreatedAt]);

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

  // Jump to initialIndex after feed finishes loading
  useEffect(() => {
    if (loading || filteredPosts.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;
    const h = el.clientHeight;
    if (h > 0 && initialIndex > 0 && initialIndex < filteredPosts.length) {
      el.scrollTo({ top: initialIndex * h, behavior: 'auto' });
    }
  }, [loading, filteredPosts.length, initialIndex]);

  // Auto-play active video & pause off-screen videos
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([idxStr, video]) => {
      if (!video) return;
      const idx = Number(idxStr);
      if (idx === currentIndex && !pausedMap[idx]) {
        video.muted = muted;
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => { });
        });
      } else {
        video.pause();
      }
    });
  }, [currentIndex, muted, pausedMap, filteredPosts.length]);

  const scrollToSlide = (idx: number) => {
    const el = scrollRef.current;
    if (!el || filteredPosts.length === 0) return;
    const clamped = Math.max(0, Math.min(idx, filteredPosts.length - 1));
    el.scrollTo({ top: clamped * el.clientHeight, behavior: 'smooth' });
  };

  // Keyboard ArrowUp/ArrowDown navigation on desktop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToSlide(currentIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToSlide(currentIndex - 1);
      } else if (e.key === 'Escape' && isCommentsOpen) {
        setIsCommentsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentIndex, filteredPosts.length, isCommentsOpen]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !el.clientHeight) return;
    const nextIdx = Math.round(el.scrollTop / el.clientHeight);
    if (nextIdx !== currentIndex && nextIdx >= 0 && nextIdx < filteredPosts.length) {
      setCurrentIndex(nextIdx);
    }
  };

  const handleTogglePlay = (idx: number, videoEl: HTMLVideoElement) => {
    if (videoEl.paused) {
      setPausedMap((curr) => ({ ...curr, [idx]: false }));
      videoEl.play().catch(() => { });
    } else {
      setPausedMap((curr) => ({ ...curr, [idx]: true }));
      videoEl.pause();
    }
  };

  const handleLike = async (post: Post) => {
    const prev = Boolean(likedLocal[post.id]);
    setLikedLocal((curr) => ({ ...curr, [post.id]: !prev }));
    setPosts((curr) =>
      curr.map((p) =>
        p.id === post.id
          ? { ...p, likesCount: Math.max(0, (p.likesCount ?? 0) + (prev ? -1 : 1)) }
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
            comments: [newComment, ...(p.comments || [])],
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

  const handleShare = (post: Post) => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: `${post.farmerName || 'Agrom Producer'} • AgroFeed`,
          text: post.content,
          url,
        })
        .catch(() => { });
    } else {
      navigator.clipboard?.writeText(url);
      alert('Feed link copied to clipboard!');
    }
  };

  const navigateToProducer = (post: Post) => {
    const targetFarmId = post.farmId || post.farm?.id || post.linkedYield?.farmId;
    if (targetFarmId) {
      navigate(`/farm/${targetFarmId}`);
    } else if (post.userId || post.farmerId) {
      navigate(`/profile/${post.userId || post.farmerId}`);
    }
  };

  const renderActionButtons = (post: Post, isDesktopRail: boolean) => {
    const isLiked = Boolean(likedLocal[post.id]);
    const isSaved = isPostFavorite(post.id);

    return (
      <div className="flex flex-col items-center gap-3.5 shrink-0">
        {isDesktopRail && (
          <button
            type="button"
            onClick={() => navigateToProducer(post)}
            className="relative mb-1 cursor-pointer group"
            title={post.farmerName}
          >
            <img
              src={resolveMediaUrl(post.farmerAvatar)}
              alt={post.farmerName}
              className="w-11 h-11 rounded-full object-cover border-2 border-[#4E8B3F] group-hover:border-[#E2A63C] transition shadow-md"
            />
          </button>
        )}

        <button
          type="button"
          onClick={() => handleLike(post)}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition ${isLiked
                ? 'bg-[#B54A34] border-white text-white shadow-md'
                : isDesktopRail
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                  : 'bg-black/50 border-white/25 text-white hover:bg-black/70'
              }`}
          >
            <Heart size={20} className={isLiked ? 'fill-white' : ''} />
          </div>
          <span className="font-mono-num text-[11px] font-bold text-white">
            {post.likesCount ?? post.likes ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsCommentsOpen((open) => !open)}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition ${isCommentsOpen
                ? 'bg-[#4E8B3F] border-white text-white shadow-md'
                : isDesktopRail
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                  : 'bg-black/50 border-white/25 text-white hover:bg-black/70'
              }`}
          >
            <MessageCircle size={20} />
          </div>
          <span className="font-mono-num text-[11px] font-bold text-white">
            {post.commentsCount ?? post.comments?.length ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => togglePost(post.id)}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition ${isSaved
                ? 'bg-[#4E8B3F] border-white text-white shadow-md'
                : isDesktopRail
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                  : 'bg-black/50 border-white/25 text-white hover:bg-black/70'
              }`}
          >
            <Bookmark size={19} className={isSaved ? 'fill-white' : ''} />
          </div>
          <span className="text-[10px] font-semibold text-white">Save</span>
        </button>

        <button
          type="button"
          onClick={() => handleShare(post)}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition ${isDesktopRail
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                : 'bg-black/50 border-white/25 text-white hover:bg-black/70'
              }`}
          >
            <Share2 size={18} />
          </div>
          <span className="text-[10px] font-semibold text-white">Share</span>
        </button>
      </div>
    );
  };

  const renderCommentsContent = (post: Post) => (
    <>
      {/* Producer Trust & Patron Strip */}
      <div className="px-4 py-3 border-b border-[#CCEBD5] space-y-2.5 shrink-0 bg-[#FAFDF9]">
        <div className="flex items-center justify-between gap-2">
          <FarmerBadge
            tier={post.farmerCreditTier || 'GOLD'}
            label={`Credit Tier • ${post.farmerCreditTier || 'GOLD'}`}
          />
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4E8B3F]">
            <ShieldCheck size={13} /> Escrow Ready
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 bg-[#EEF8F1] border border-[#CCEBD5] p-2.5 rounded-2xl">
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#173A20] truncate">
              AgroPatron ⭐ ($2/mo)
            </div>
            <div className="text-[10.5px] text-[#5C5245] truncate">
              8% harvest discount & VIP updates
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigateToProducer(post)}
            className="px-3 py-1.5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-[11px] font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <UserPlus size={12} />
            <span>Patronize</span>
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {!post.comments || post.comments.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#EEF8F1]/60 border border-[#CCEBD5] text-center text-xs text-[#5C5245]">
            Ask {post.farmerName || 'the farmer'} about harvest freshness, crate weight, or wholesale delivery!
          </div>
        ) : (
          post.comments.map((c: any) => (
            <div
              key={c.id}
              className="p-3 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#173A20]">
                  {c.userName || c.user?.name || 'Verified Buyer'}
                </span>
                <span className="text-[10px] text-[#5C5245] font-mono-num">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Just now'}
                </span>
              </div>
              <p className="text-[#241A12] leading-relaxed">{c.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      <form
        onSubmit={handleAddComment}
        className="flex items-center gap-2 p-3 bg-[#EEF8F1] border-t border-[#CCEBD5] shrink-0"
      >
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add comment..."
          className="flex-1 rounded-full bg-white border border-[#CCEBD5] px-4 py-2 text-xs text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
        />
        <button
          type="submit"
          className="w-9 h-9 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Send size={14} />
        </button>
      </form>
    </>
  );

  return (
    <div className="h-full w-full flex overflow-hidden bg-[#0E1610] relative">
      {/* MAIN TIKTOK VERTICAL REEL VIEWPORT */}
      <div className="flex-1 h-full relative overflow-hidden">
        {/* Top Floating TikTok-Style Mode Tabs + Mute */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 pb-6 bg-gradient-to-b from-black/65 via-black/25 to-transparent pointer-events-none">
          <div className="w-9 hidden sm:block" />

          <div className="flex items-center gap-1 bg-black/45 backdrop-blur-md p-1 rounded-full border border-white/20 pointer-events-auto">
            {(['AgroFeed', 'Patronized ⭐'] as const).map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentIndex(0);
                    scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${active
                      ? 'bg-[#4E8B3F] text-white shadow-xs'
                      : 'text-white/75 hover:text-white'
                    }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition cursor-pointer pointer-events-auto"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* Desktop Right-Edge Up/Down Slide Controls */}
        {!loading && filteredPosts.length > 1 && (
          <div className="hidden md:flex flex-col items-center gap-2 absolute right-4 top-1/2 -translate-y-1/2 z-20">
            <button
              type="button"
              onClick={() => scrollToSlide(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-[#4E8B3F] disabled:opacity-30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition cursor-pointer shadow-md"
              title="Previous reel"
            >
              <ChevronUp size={18} />
            </button>
            <span className="font-mono-num text-[11px] font-bold text-white/80 bg-black/45 px-2 py-0.5 rounded-full">
              {currentIndex + 1}/{filteredPosts.length}
            </span>
            <button
              type="button"
              onClick={() => scrollToSlide(currentIndex + 1)}
              disabled={currentIndex === filteredPosts.length - 1}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-[#4E8B3F] disabled:opacity-30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition cursor-pointer shadow-md"
              title="Next reel"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        )}

        {/* Loading / Empty / Snap-Scroll Stage */}
        {loading ? (
          <div className="h-full w-full flex items-center justify-center p-4">
            <div className="w-full h-full md:w-auto md:aspect-[9/16] md:rounded-2xl bg-[#173A20] border border-white/10 animate-pulse" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center p-6">
            <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-3xl p-10 text-center space-y-3 max-w-md">
              <Star size={40} className="text-[#E2A63C] mx-auto" />
              <h3 className="font-display-italic text-xl text-[#173A20] font-semibold">
                No Harvest Stories Found
              </h3>
              <p className="text-xs text-[#5C5245]">
                Publish the first harvest story or switch back to the main AgroFeed stream.
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
          >
            {filteredPosts.map((post, idx) => {
              const mediaUri = resolveMediaUrl(post.mediaUrl || post.media);
              const isVid = isVideoMedia(mediaUri, post.isVideo);
              const linkedYield = post.linkedYield || null;
              const isPaused = Boolean(pausedMap[idx]);

              return (
                <div
                  key={post.id || idx}
                  className="h-full w-full snap-start snap-always flex items-center justify-center md:py-3 md:px-14 relative overflow-hidden"
                >
                  <div className="h-full w-full md:w-auto md:max-w-full flex items-end justify-center gap-4">
                    {/* Vertical Reel Card: Full edge-to-edge on mobile, crisp 9:16 full-height card on desktop */}
                    <div className="relative h-full w-full md:w-auto md:aspect-[9/16] md:max-w-[calc(100%-68px)] md:rounded-2xl overflow-hidden bg-black shadow-2xl border-0 md:border md:border-white/15">
                      {/* 1. Ambient Blurred Backdrop (TikTok/Reels algorithm: eliminates black voids on 16:9, landscape, or square media) */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
                        {isVid ? (
                          <video
                            src={mediaUri}
                            className="w-full h-full object-cover blur-3xl opacity-40 scale-125"
                            loop
                            playsInline
                            muted
                            aria-hidden="true"
                          />
                        ) : (
                          <img
                            src={mediaUri}
                            alt=""
                            className="w-full h-full object-cover blur-3xl opacity-40 scale-125"
                            aria-hidden="true"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/45" />
                      </div>

                      {/* 2. Main Sharp Media (Preserves native aspect ratio: 9:16, 16:9 landscape, 1:1 square without cropping) */}
                      <div className="relative z-10 w-full h-full flex items-center justify-center">
                        {isVid ? (
                          <video
                            ref={(el) => {
                              videoRefs.current[idx] = el;
                            }}
                            src={mediaUri}
                            className="max-h-full max-w-full w-auto h-auto object-contain cursor-pointer"
                            loop
                            playsInline
                            muted={muted}
                            preload="metadata"
                            onClick={(e) => handleTogglePlay(idx, e.currentTarget)}
                          />
                        ) : (
                          <img
                            src={mediaUri}
                            alt={post.farmerName || 'AgroFeed post'}
                            className="max-h-full max-w-full w-auto h-auto object-contain"
                            loading="lazy"
                          />
                        )}
                      </div>

                      {/* Center Play indicator when manually paused */}
                      {isVid && isPaused && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                          <div className="w-16 h-16 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center border border-white/25">
                            <Play size={28} className="fill-white ml-1" />
                          </div>
                        </div>
                      )}

                      {/* Bottom Scrim */}
                      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                      {/* Bottom-Left Overlay: Producer + Caption + 1-Tap Buy */}
                      <div className="absolute inset-x-0 bottom-0 z-10 p-4 pr-16 md:pr-4 flex flex-col gap-2.5">
                        <div
                          onClick={() => navigateToProducer(post)}
                          className="inline-flex items-center gap-2.5 self-start bg-black/45 backdrop-blur-md pl-1.5 pr-3 py-1 rounded-full border border-white/20 cursor-pointer"
                        >
                          <img
                            src={resolveMediaUrl(post.farmerAvatar)}
                            alt={post.farmerName}
                            className="w-8 h-8 rounded-full object-cover border border-[#E2A63C]"
                          />
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">
                              {post.farmerName}
                            </div>
                            <div className="text-[10px] text-[#E2A63C] font-mono-num">
                              Verified • {post.farmerCreditTier || 'GOLD'}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-white leading-snug drop-shadow line-clamp-3">
                          {post.content}
                        </p>

                        {linkedYield && (
                          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-[#CCEBD5] flex items-center justify-between gap-2.5 shadow-lg">
                            <div
                              onClick={() => navigate(`/yield/${linkedYield.id}`)}
                              className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                            >
                              <img
                                src={resolveMediaUrl(linkedYield.image)}
                                alt={linkedYield.title}
                                className="w-11 h-11 rounded-xl object-cover border border-[#CCEBD5] shrink-0"
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
                              className="px-3 py-2 rounded-full bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12] text-xs font-bold inline-flex items-center gap-1 shrink-0 transition cursor-pointer"
                            >
                              <ShoppingBag size={13} />
                              <span>1-Tap Buy</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* MOBILE Floating Action Rail (inside bottom-right of video) */}
                      <div className="absolute right-3 bottom-5 z-20 md:hidden">
                        {renderActionButtons(post, false)}
                      </div>
                    </div>

                    {/* DESKTOP TikTok Action Rail (immediately beside the 9:16 video card) */}
                    <div className="hidden md:flex pb-2">
                      {renderActionButtons(post, true)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DESKTOP COMMENTS DRAWER (Slides open beside the video like TikTok Web) */}
      {isCommentsOpen && activePost && (
        <aside className="hidden lg:flex flex-col w-[380px] xl:w-[410px] shrink-0 h-full bg-white border-l border-[#CCEBD5] shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3.5 bg-[#EEF8F1] border-b border-[#CCEBD5] shrink-0">
            <h3 className="font-bold text-sm text-[#173A20] font-mono-num">
              Comments ({activePost.commentsCount ?? activePost.comments?.length ?? 0})
            </h3>
            <button
              type="button"
              onClick={() => setIsCommentsOpen(false)}
              className="w-8 h-8 rounded-full bg-white border border-[#CCEBD5] flex items-center justify-center text-[#241A12] hover:bg-[#E1F3E7] cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          {renderCommentsContent(activePost)}
        </aside>
      )}

      {/* MOBILE / TABLET COMMENTS BOTTOM SHEET (Slides up like TikTok Mobile above bottom navbar) */}
      {isCommentsOpen && activePost && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/55"
            onClick={() => setIsCommentsOpen(false)}
          />
          <div className="relative z-10 w-full h-[68dvh] bg-white rounded-t-3xl border-t border-[#CCEBD5] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-[#CCEBD5] mx-auto mt-2.5 shrink-0" />
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#CCEBD5] shrink-0">
              <h3 className="font-bold text-sm text-[#173A20] font-mono-num">
                Comments ({activePost.commentsCount ?? activePost.comments?.length ?? 0})
              </h3>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            {renderCommentsContent(activePost)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgroFeedPage;
