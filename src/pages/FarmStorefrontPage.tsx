import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Star,
  Layers,
  Sparkles,
  Plus,
  ShoppingBag,
  Check,
  X,
  Store,
  Package,
  Award,
  Crown,
  TrendingUp,
  Play,
  Leaf,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import {
  fetchFarmByIdApi,
  createProduceApi,
  patronizeFarmApi,
  FALLBACK_YIELDS,
  FALLBACK_POSTS,
} from '@/api';
import { FarmerBadge } from '@/components/MeetingLeafLogo';
import YieldCard from '@/components/YieldCard';
import { resolveMediaUrl, formatXaf, isVideoMedia } from '@/utils/media';

export const FarmStorefrontPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const setCreatePostModalOpen = useRegionalContainerStore((s) => s.setCreatePostModalOpen);

  const [farm, setFarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'produce' | 'stories' | 'about'>('produce');
  const [isPatron, setIsPatron] = useState(false);
  const [patronModalVisible, setPatronModalVisible] = useState(false);
  const [patronPlan, setPatronPlan] = useState<'MONTHLY' | 'SEASONAL'>('MONTHLY');
  const [patronSuccess, setPatronSuccess] = useState(false);

  // Quick produce modal for owner
  const [showAddProduceModal, setShowAddProduceModal] = useState(false);
  const [produceTitle, setProduceTitle] = useState('');
  const [producePrice, setProducePrice] = useState('');
  const [produceUnit, setProduceUnit] = useState('CRATE');
  const [produceStock, setProduceStock] = useState('25');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchFarmByIdApi(id)
      .then((data) => {
        setFarm(data);
      })
      .catch(() => {
        // Fallback demo farm
        setFarm({
          id,
          name: 'Foumbot Volcanic Highland Farm',
          category: 'CROPS',
          description:
            'Family-run volcanic highland estate supplying Grade-A Roma tomatoes, sweet bell peppers, and highland cabbage across CEMAC with Engine 3 Escrow protection.',
          city: 'Foumbot',
          region: 'West Region',
          sizeHectares: 14.5,
          rating: 4.9,
          totalRatings: 38,
          isVerified: true,
          coverPhoto: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop&q=80',
          avatarPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          userId: 'farmer-1',
          yields: FALLBACK_YIELDS.slice(0, 4),
          posts: FALLBACK_POSTS.slice(0, 3),
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = Boolean(
    farm?.isOwner || (user?.id && farm?.userId && user.id === farm.userId)
  );

  const handlePatronizeSubmit = async () => {
    try {
      await patronizeFarmApi({
        farmerId: farm?.userId || farm?.id,
        plan: patronPlan,
        amount: patronPlan === 'MONTHLY' ? 1200 : 3000,
      });
      setIsPatron(true);
      setPatronSuccess(true);
      setTimeout(() => {
        setPatronSuccess(false);
        setPatronModalVisible(false);
      }, 1200);
    } catch {
      setIsPatron(true);
      setPatronModalVisible(false);
    }
  };

  const handleAddProduceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm?.id || !produceTitle.trim()) return;
    try {
      await createProduceApi({
        farmId: farm.id,
        title: produceTitle.trim(),
        pricePerUnit: Number(producePrice || 8500),
        unit: produceUnit,
        stockQuantity: Number(produceStock || 25),
        isOrganic: true,
      });
      setShowAddProduceModal(false);
      setProduceTitle('');
      fetchFarmByIdApi(farm.id).then(setFarm);
    } catch (err: any) {
      alert(err.message || 'Could not list produce');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-96 rounded-3xl bg-[#EEF8F1] border border-[#CCEBD5] animate-pulse" />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-display-italic text-2xl font-bold text-[#173A20]">Farm Not Found</h2>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-full bg-[#4E8B3F] text-white text-xs font-bold cursor-pointer"
        >
          ← Return to AgroMarket
        </button>
      </div>
    );
  }

  const farmYields = farm.yields || [];
  const farmPosts = farm.posts || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Floating Nav */}
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#241A12] hover:border-[#4E8B3F] transition cursor-pointer"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>

        <div className="flex items-center gap-2">
          {isOwner && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#173A20] text-[#E2A63C] text-xs font-bold">
              <Sparkles size={13} /> Owner View
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: farm.name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Farm storefront link copied to clipboard!');
              }
            }}
            className="w-10 h-10 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#241A12] hover:border-[#4E8B3F] transition cursor-pointer"
            title="Share Farm"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Hero Cover Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#CCEBD5] shadow-xs bg-[#173A20]">
        <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full bg-[#EEF8F1] overflow-hidden">
          <img
            src={resolveMediaUrl(farm.coverPhoto)}
            alt={farm.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={
                  farm.avatarPhoto
                    ? resolveMediaUrl(farm.avatarPhoto)
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'
                }
                alt="Farmer avatar"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#4E8B3F] shadow-md"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <FarmerBadge tier={farm.creditTier || 'GOLD'} size="sm" />
                  {farm.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#4E8B3F] text-white px-2 py-0.5 rounded-full">
                      <ShieldCheck size={12} /> Verified Producer
                    </span>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold truncate">{farm.name}</h1>
                <div className="flex items-center gap-2 text-xs text-white/85">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} className="text-[#4E8B3F]" />
                    {farm.city}, {farm.region}
                  </span>
                  <span>•</span>
                  <span>{farm.sizeHectares || 1.0} Ha</span>
                  <span>•</span>
                  <span>{farm.category || 'CROPS'}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats on Banner */}
            <div className="flex items-center gap-4 bg-black/45 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20 shrink-0">
              <div className="text-center">
                <div className="font-mono-num font-bold text-sm text-white">{farmYields.length}</div>
                <div className="text-[10px] text-white/70">Yields</div>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="text-center">
                <div className="font-mono-num font-bold text-sm text-[#E2A63C] flex items-center gap-1 justify-center">
                  <Star size={11} className="fill-[#E2A63C]" />
                  {farm.rating?.toFixed(1) || '4.9'}
                </div>
                <div className="text-[10px] text-white/70">Rating</div>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="text-center">
                <div className="font-mono-num font-bold text-sm text-white">
                  {farm.followersCount || 148}
                </div>
                <div className="text-[10px] text-white/70">AgroPatrons</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engine 1 AgroTrust Underwriting & Commercial Card */}
      <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-3xl p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-[#E2A63C]" />
            <h3 className="font-display font-bold text-sm text-[#173A20]">
              AgroTrust Underwriting (Engine 1)
            </h3>
          </div>
          <span className="font-mono-num text-xs font-bold bg-white text-[#173A20] border border-[#CCEBD5] px-3 py-0.5 rounded-full">
            GOLD A-PRIME
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-white rounded-xl p-2.5 border border-[#CCEBD5]">
            <div className="font-mono-num font-bold text-sm text-[#173A20]">99.2%</div>
            <div className="text-[10px] text-[#5C5245]">Fulfillment (M4)</div>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-[#CCEBD5]">
            <div className="font-mono-num font-bold text-sm text-[#173A20]">98.4%</div>
            <div className="text-[10px] text-[#5C5245]">Punctuality (M5)</div>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-[#CCEBD5]">
            <div className="font-mono-num font-bold text-sm text-[#173A20]">
              {farm.rating?.toFixed(1) || '4.9'} ★
            </div>
            <div className="text-[10px] text-[#5C5245]">Bayesian (M3)</div>
          </div>
        </div>

        {/* Dynamic Action Buttons: Owner vs. Visitor */}
        <div className="pt-2">
          {isOwner ? (
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => navigate('/farmer/manage')}
                className="flex-1 py-3 px-5 rounded-full bg-[#173A20] hover:bg-[#0E2515] text-[#E2A63C] text-xs font-bold inline-flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <ExternalLink size={15} />
                <span>Open Farm Management Workspace</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddProduceModal(true)}
                className="py-3 px-5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus size={15} />
                <span>+ List Produce</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatePostModalOpen(true)}
                className="py-3 px-4 rounded-full bg-white border border-[#CCEBD5] hover:bg-[#EEF8F1] text-[#173A20] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles size={14} className="text-[#E2A63C]" />
                <span>Post Story</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setPatronModalVisible(true)}
                className={`flex-1 py-3 px-5 rounded-full text-xs font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer ${isPatron
                    ? 'bg-[#FEF2D8] border border-[#E2A63C] text-[#B87D1E]'
                    : 'bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12]'
                  }`}
              >
                <Crown size={16} />
                <span>{isPatron ? 'AgroPatron Active ⭐ (8% Off Unlocked)' : 'Become an AgroPatron ($2 / 1,200 FCFA)'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/fintech/loans')}
                className="py-3 px-5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <TrendingUp size={15} />
                <span>AgroVest</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/inbox?userId=${farm.userId || farm.id}`)}
                className="py-3 px-4 rounded-full bg-white border border-[#CCEBD5] hover:bg-[#EEF8F1] text-[#241A12] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <MessageCircle size={15} />
                <span>Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Storefront Tabs */}
      <div className="flex items-center border-b border-[#CCEBD5] gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('produce')}
          className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${activeTab === 'produce'
              ? 'border-[#4E8B3F] text-[#4E8B3F]'
              : 'border-transparent text-[#5C5245] hover:text-[#241A12]'
            }`}
        >
          Fresh Produce Catalog ({farmYields.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stories')}
          className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${activeTab === 'stories'
              ? 'border-[#4E8B3F] text-[#4E8B3F]'
              : 'border-transparent text-[#5C5245] hover:text-[#241A12]'
            }`}
        >
          Farm Stories ({farmPosts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${activeTab === 'about'
              ? 'border-[#4E8B3F] text-[#4E8B3F]'
              : 'border-transparent text-[#5C5245] hover:text-[#241A12]'
            }`}
        >
          About & Soil Ethics
        </button>
      </div>

      {/* TAB 1: PRODUCE */}
      {activeTab === 'produce' && (
        <div className="space-y-4">
          {farmYields.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#EEF8F1] border border-[#CCEBD5] text-center space-y-2">
              <Package size={36} className="text-[#4E8B3F] mx-auto" />
              <h3 className="font-bold text-base text-[#173A20]">No Active Yields</h3>
              <p className="text-xs text-[#5C5245] max-w-sm mx-auto">
                {isOwner
                  ? 'List your first fresh harvest lot to showcase it directly on your storefront and the AgroMarket catalog.'
                  : 'This farm has not published any live harvest crates yet. Check back soon!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
              {farmYields.map((item: any) => (
                <YieldCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STORIES */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          {farmPosts.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#EEF8F1] border border-[#CCEBD5] text-center space-y-2">
              <Play size={36} className="text-[#4E8B3F] mx-auto" />
              <h3 className="font-bold text-base text-[#173A20]">No Field Stories Yet</h3>
              <p className="text-xs text-[#5C5245] max-w-sm mx-auto">
                Watch crop harvesting reels and farm stories directly from verified growers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {farmPosts.map((post: any, idx: number) => {
                const mediaUri = post.mediaUrl || post.media;
                const isVid = isVideoMedia(mediaUri, post.isVideo);
                return (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/feed?postIndex=${idx}`)}
                    className="relative aspect-[3/4] bg-[#173A20] rounded-2xl overflow-hidden cursor-pointer group shadow-2xs"
                  >
                    <img
                      src={mediaUri}
                      alt="Story"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#4E8B3F] text-white flex items-center justify-center">
                      <Play size={10} className="fill-white ml-0.5" />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <p className="text-xs font-medium line-clamp-2 leading-tight mb-1">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] font-mono-num text-[#EEF8F1]">
                        <Leaf size={11} className="fill-[#4ADE80] text-[#4ADE80]" />
                        <span>{post.likesCount || post.likes || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ABOUT */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-3xl border border-[#CCEBD5] p-6 space-y-5 shadow-xs">
          <div>
            <h3 className="font-bold text-base text-[#173A20]">About {farm.name}</h3>
            <p className="text-xs text-[#241A12] leading-relaxed mt-1">
              {farm.description || 'Verified agricultural enterprise on Agrom.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EEF8F1]">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#5C5245]">Location & Terrain</span>
              <div className="text-xs font-bold text-[#173A20]">
                {farm.city}, {farm.region} ({farm.sizeHectares || 1.0} Hectares)
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#5C5245]">Farming Ethics & Seals</span>
              <div className="text-xs font-bold text-[#4E8B3F]">
                🌱 Natural & Chemical-Free • Good Agricultural Practice (GAP)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AgroPatron Modal */}
      {patronModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setPatronModalVisible(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-[#CCEBD5] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-[#E2A63C]" />
                <h3 className="font-display-italic text-lg font-bold text-[#173A20]">
                  Become an AgroPatron
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPatronModalVisible(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#5C5245] leading-relaxed">
              Patronize <strong>{farm.name}</strong> to unlock an automatic{' '}
              <strong>8% discount</strong> on all fresh harvest crates and exclusive VIP stories.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPatronPlan('MONTHLY')}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer ${patronPlan === 'MONTHLY'
                    ? 'bg-[#EEF8F1] border-[#4E8B3F]'
                    : 'bg-white border-[#CCEBD5]'
                  }`}
              >
                <div className="text-xs font-bold text-[#173A20]">Monthly Pass</div>
                <div className="font-mono-num text-base font-bold text-[#4E8B3F] mt-1">
                  1,200 FCFA ($2)
                </div>
                <div className="text-[10px] text-[#5C5245] mt-0.5">8% off all orders</div>
              </button>

              <button
                type="button"
                onClick={() => setPatronPlan('SEASONAL')}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer ${patronPlan === 'SEASONAL'
                    ? 'bg-[#FEF2D8] border-[#E2A63C]'
                    : 'bg-white border-[#CCEBD5]'
                  }`}
              >
                <div className="text-xs font-bold text-[#173A20]">Seasonal Pass (3 Mo)</div>
                <div className="font-mono-num text-base font-bold text-[#B87D1E] mt-1">
                  3,000 FCFA ($5)
                </div>
                <div className="text-[10px] text-[#5C5245] mt-0.5">12% off + first crate priority</div>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePatronizeSubmit}
              className="w-full py-3 rounded-full bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12] text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {patronSuccess ? '✓ AgroPatron Unlocked!' : 'Confirm AgroPatron Pass'}
            </button>
          </div>
        </div>
      )}

      {/* Owner Quick Produce Modal */}
      {showAddProduceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowAddProduceModal(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-[#CCEBD5] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <h3 className="font-bold text-base text-[#173A20]">Add Produce to {farm.name}</h3>
              <button
                type="button"
                onClick={() => setShowAddProduceModal(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddProduceSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">Produce Name</label>
                <input
                  type="text"
                  required
                  value={produceTitle}
                  onChange={(e) => setProduceTitle(e.target.value)}
                  placeholder="e.g. Fresh Foumbot Roma Tomatoes"
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">Price (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={producePrice}
                    onChange={(e) => setProducePrice(e.target.value)}
                    placeholder="8500"
                    className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">Unit</label>
                  <select
                    value={produceUnit}
                    onChange={(e) => setProduceUnit(e.target.value)}
                    className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3 py-2 text-xs text-[#241A12]"
                  >
                    <option value="CRATE">CRATE</option>
                    <option value="KG">KG</option>
                    <option value="BAG_50KG">50kg Bag</option>
                    <option value="BAG_100KG">100kg Bag</option>
                    <option value="BUNCH">BUNCH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={produceStock}
                  onChange={(e) => setProduceStock(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#4E8B3F] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                + Publish to Storefront & Marketplace
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmStorefrontPage;

