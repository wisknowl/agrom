import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Send,
  Share2,
  ShoppingBag,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { addPostCommentApi, toggleLikePostApi } from '@/api';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { formatXaf, isVideoMedia, resolveMediaUrl } from '@/utils/media';

interface FarmPostsTikTokViewerProps {
  posts: any[];
  initialIndex: number;
  farmName: string;
  ownerAvatar: string;
  farmYields: any[];
  isOwner?: boolean;
  onDeletePost?: (post: any) => void;
  onClose: () => void;
  onPostsChange?: (updatedPosts: any[]) => void;
}

export const FarmPostsTikTokViewer: React.FC<FarmPostsTikTokViewerProps> = ({
  posts: initialPosts,
  initialIndex,
  farmName,
  ownerAvatar,
  farmYields,
  isOwner = false,
  onDeletePost,
  onClose,
  onPostsChange,
}) => {
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addToCart);
  const { togglePost, isPostFavorite } = useFavoritesStore();

  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [activeIndex, setActiveIndex] = useState(
    Math.max(0, Math.min(initialIndex, initialPosts.length - 1))
  );
  const [muted, setMuted] = useState(false);
  const [likedLocal, setLikedLocal] = useState<Record<string, boolean>>({});
  const [commentsOpenForId, setCommentsOpenForId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Lock page scroll while full-screen viewer is mounted
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (commentsOpenForId) {
          setCommentsOpenForId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, commentsOpenForId]);

  // Jump immediately to clicked post on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const h = el.clientHeight || window.innerHeight;
    el.scrollTo({ top: initialIndex * h, behavior: 'auto' });
  }, [initialIndex]);

  // Auto-play active slide video and pause others
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([idxStr, video]) => {
      if (!video) return;
      const idx = Number(idxStr);
      if (idx === activeIndex) {
        video.muted = muted;
        video.play().catch(() => {
          // Browsers may block unmuted autoplay; fallback to muted autoplay
          video.muted = true;
          video.play().catch(() => {});
        });
      } else {
        video.pause();
      }
    });
  }, [activeIndex, muted]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !el.clientHeight) return;
    const nextIdx = Math.round(el.scrollTop / el.clientHeight);
    if (nextIdx !== activeIndex && nextIdx >= 0 && nextIdx < posts.length) {
      setActiveIndex(nextIdx);
    }
  };

  const scrollToSlide = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(idx, posts.length - 1));
    el.scrollTo({ top: clamped * el.clientHeight, behavior: 'smooth' });
  };

  const handleLike = async (post: any) => {
    const prev = Boolean(likedLocal[post.id]);
    setLikedLocal((curr) => ({ ...curr, [post.id]: !prev }));
    const nextPosts = posts.map((p) =>
      p.id === post.id
        ? { ...p, likesCount: Math.max(0, (p.likesCount ?? p.likes ?? 0) + (prev ? -1 : 1)) }
        : p
    );
    setPosts(nextPosts);
    onPostsChange?.(nextPosts);
    try {
      await toggleLikePostApi(post.id);
    } catch {
      // optimistic UI preserved
    }
  };

  const handleAddComment = async (e: React.FormEvent, post: any) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      id: `local-${Date.now()}`,
      userId: 'me',
      userName: 'Agrom Buyer',
      content: commentText.trim(),
      createdAt: 'Just now',
    };
    const nextPosts = posts.map((p) =>
      p.id === post.id
        ? {
            ...p,
            commentsCount: (p.commentsCount ?? p.comments?.length ?? 0) + 1,
            comments: [newComment, ...(p.comments || [])],
          }
        : p
    );
    setPosts(nextPosts);
    onPostsChange?.(nextPosts);
    setCommentText('');
    try {
      await addPostCommentApi(post.id, newComment.content);
    } catch {
      // optimistic UI preserved
    }
  };

  const handleShare = (post: any) => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${farmName} • AgroPost`, text: post.content, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      alert('Farm post link copied to clipboard!');
    }
  };

  const activeCommentsPost = commentsOpenForId
    ? posts.find((p) => p.id === commentsOpenForId)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Fixed Top Navigation Header with Back Arrow */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-4 pb-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto min-w-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to farm profile"
            className="w-10 h-10 rounded-full bg-black/55 hover:bg-black/80 backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <img
              src={resolveMediaUrl(ownerAvatar)}
              alt={farmName}
              className="w-8 h-8 rounded-full object-cover border border-[#E2A63C] shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{farmName}</div>
              <div className="text-[10px] text-white/75 font-mono-num">
                Post {activeIndex + 1} of {posts.length}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {isOwner && onDeletePost && posts[activeIndex] && (
            <button
              type="button"
              onClick={() => onDeletePost(posts[activeIndex])}
              aria-label="Delete post"
              title="Delete this post"
              className="w-9 h-9 rounded-full bg-black/55 hover:bg-[#DC2626] backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="w-9 h-9 rounded-full bg-black/55 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Desktop vertical scroll helpers */}
          {posts.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollToSlide(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="w-9 h-9 rounded-full bg-black/55 hover:bg-[#4E8B3F] disabled:opacity-40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition cursor-pointer"
                title="Previous post"
              >
                <ChevronUp size={17} />
              </button>
              <button
                type="button"
                onClick={() => scrollToSlide(activeIndex + 1)}
                disabled={activeIndex === posts.length - 1}
                className="w-9 h-9 rounded-full bg-black/55 hover:bg-[#4E8B3F] disabled:opacity-40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition cursor-pointer"
                title="Next post"
              >
                <ChevronDown size={17} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TikTok Vertical Snap-Scrolling Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {posts.map((post, idx) => {
          const mediaUri = resolveMediaUrl(post.mediaUrl || post.media);
          const isVid = isVideoMedia(mediaUri, post.isVideo);
          const linkedYield =
            post.linkedYield ||
            (post.linkedYieldId
              ? farmYields.find((y: any) => y.id === post.linkedYieldId)
              : null);
          const isSaved = isPostFavorite(post.id);
          const isLiked = Boolean(likedLocal[post.id]);

          return (
            <div
              key={post.id || idx}
              className="relative h-[100dvh] w-full snap-start snap-always flex items-center justify-center bg-black overflow-hidden"
            >
              {/* Centered 9:16 stage on desktop, full edge-to-edge on mobile */}
              <div className="relative w-full h-full sm:max-w-md sm:h-[94dvh] sm:rounded-3xl overflow-hidden bg-[#173A20] flex items-center justify-center">
                {isVid ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[idx] = el;
                    }}
                    src={mediaUri}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    muted={muted}
                    onClick={(e) => {
                      const vid = e.currentTarget;
                      if (vid.paused) {
                        vid.play().catch(() => {});
                      } else {
                        vid.pause();
                      }
                    }}
                  />
                ) : (
                  <img
                    src={mediaUri}
                    alt={post.content || farmName}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Bottom contrast scrim */}
                <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

                {/* Bottom Caption & Shoppable Card + Right Floating Rail */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-4 pb-6 flex items-end justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-3">
                    <p className="text-sm text-white leading-relaxed drop-shadow-md">
                      {post.content}
                    </p>

                    {linkedYield && (
                      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-[#CCEBD5] flex items-center justify-between gap-2.5 shadow-xl">
                        <div
                          onClick={() => {
                            onClose();
                            navigate(`/yield/${linkedYield.id}`);
                          }}
                          className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                        >
                          <img
                            src={resolveMediaUrl(linkedYield.image || linkedYield.mediaUrls?.[0])}
                            alt={linkedYield.title}
                            className="w-11 h-11 rounded-xl object-cover border border-[#CCEBD5] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#173A20] truncate">
                              {linkedYield.title}
                            </div>
                            <div className="font-mono-num text-xs font-bold text-[#4E8B3F]">
                              {formatXaf(linkedYield.price ?? linkedYield.pricePerUnit)} / {linkedYield.unit}
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

                  {/* Right Vertical Action Rail */}
                  <div className="flex flex-col items-center gap-3.5 shrink-0 pb-1">
                    <button
                      type="button"
                      onClick={() => handleLike(post)}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center border transition ${
                          isLiked
                            ? 'bg-[#B54A34] border-white text-white'
                            : 'bg-black/50 border-white/25 text-white hover:bg-black/75'
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
                      onClick={() => setCommentsOpenForId(post.id)}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-black/50 border border-white/25 text-white hover:bg-black/75 flex items-center justify-center transition">
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
                        className={`w-11 h-11 rounded-full flex items-center justify-center border transition ${
                          isSaved
                            ? 'bg-[#4E8B3F] border-white text-white'
                            : 'bg-black/50 border-white/25 text-white hover:bg-black/75'
                        }`}
                      >
                        <Bookmark size={20} className={isSaved ? 'fill-white' : ''} />
                      </div>
                      <span className="text-[10px] font-semibold text-white">Save</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShare(post)}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-black/50 border border-white/25 text-white hover:bg-black/75 flex items-center justify-center transition">
                        <Share2 size={18} />
                      </div>
                      <span className="text-[10px] font-semibold text-white">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Comments Drawer */}
      {activeCommentsPost && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setCommentsOpenForId(null)}
          />
          <div className="relative z-10 w-full sm:max-w-md max-h-[70dvh] bg-white rounded-t-3xl sm:rounded-3xl border border-[#CCEBD5] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#EEF8F1] border-b border-[#CCEBD5]">
              <h4 className="font-bold text-sm text-[#173A20]">
                Comments ({activeCommentsPost.commentsCount ?? activeCommentsPost.comments?.length ?? 0})
              </h4>
              <button
                type="button"
                onClick={() => setCommentsOpenForId(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#CCEBD5] flex items-center justify-center text-[#241A12] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {(!activeCommentsPost.comments || activeCommentsPost.comments.length === 0) ? (
                <p className="text-xs text-[#5C5245] text-center py-8">
                  No comments yet. Ask {farmName} about freshness or crate delivery!
                </p>
              ) : (
                activeCommentsPost.comments.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5]"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#173A20]">
                      <span>{c.user?.name || c.userName || 'Agrom Buyer'}</span>
                      <span className="font-normal text-[#5C5245]">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                    <p className="text-xs text-[#241A12] mt-1">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => handleAddComment(e, activeCommentsPost)}
              className="p-3 bg-[#EEF8F1] border-t border-[#CCEBD5] flex items-center gap-2"
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full bg-white border border-[#CCEBD5] px-4 py-2 text-xs text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-[#4E8B3F] text-white flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmPostsTikTokViewer;

