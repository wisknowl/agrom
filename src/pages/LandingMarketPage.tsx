import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Play,
  ShieldCheck,
  TrendingUp,
  Sprout,
  ArrowRight,
  SlidersHorizontal,
  Heart,
  ShoppingBag,
  Compass,
} from 'lucide-react';
import { fetchYieldsApi, fetchCategoriesApi, fetchFeedPostsApi } from '@/api';
import { Yield, Post } from '@/types';
import YieldCard from '@/components/YieldCard';
import { FarmerBadge } from '@/components/MeetingLeafLogo';
import { useCartStore } from '@/store/cartStore';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import { formatXaf } from '@/utils/media';

const STATIC_CATEGORIES = [
  'All',
  'Vegetables',
  'Tubers & Roots',
  'Poultry & Eggs',
  'Fruits',
  'Spices & Herbs',
];

export const LandingMarketPage: React.FC = () => {
  const navigate = useNavigate();
  const [yieldsList, setYieldsList] = useState<Yield[]>([]);
  const [stories, setStories] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>(STATIC_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [wholesaleOnly, setWholesaleOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const cartItemCount = useCartStore((s) => s.getItemCount());
  const cartTotal = useCartStore((s) => s.getTotal());
  const regionalContainer = useRegionalContainerStore((s) => s.getContainer());

  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      setLoading(true);
      try {
        const [yData, cData, pData] = await Promise.all([
          fetchYieldsApi(),
          fetchCategoriesApi(),
          fetchFeedPostsApi(),
        ]);
        if (!mounted) return;
        setYieldsList(yData);
        setStories(pData.slice(0, 6));
        if (cData && cData.length > 0) {
          const names = ['All', ...cData.map((c: any) => c.name)];
          setCategories(Array.from(new Set(names)));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredYields = yieldsList.filter((item) => {
    const catName =
      typeof item.category === 'object' ? item.category?.name || '' : item.category || '';
    const farmName = item.farm?.name || item.farmerName || '';
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.originRegion && item.originRegion.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      catName.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      item.title.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesWholesale = !wholesaleOnly || Boolean(item.isWholesaleBulkAvailable);

    return matchesSearch && matchesCategory && matchesWholesale;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-6xl mx-auto">
      {/* =====================================================================
          1. AGROM.APP HYBRID HERO BANNER (Canopy + Fresh Mint Design System)
      ===================================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-[#173A20] text-[#F6EEDD] p-6 sm:p-8 border border-[#4E8B3F]/40 shadow-lg">
        {/* Subtle Furrow SVG Background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path
            d="M-50,80 C300,30 900,150 1250,60"
            stroke="#EEF8F1"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M-50,180 C300,130 900,250 1250,160"
            stroke="#EEF8F1"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M-50,280 C300,230 900,350 1250,260"
            stroke="#E2A63C"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E2515] border border-[#4E8B3F]/50 text-xs font-medium text-[#EEF8F1]">
              <span className="w-2 h-2 rounded-full bg-[#4E8B3F] animate-pulse" />
              <span>Agrom • Direct Agri-Commerce & Agri-Fintech</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
              From farm to hand.{' '}
              <span className="font-display-italic font-normal text-[#E2A63C]">
                Du champ à la main.
              </span>
            </h1>

            <p className="text-sm sm:text-[15px] text-[#EEF8F1]/90 max-w-xl leading-relaxed">
              Source directly from verified highland cooperatives, watch live field harvests on{' '}
              <strong className="text-white">AgroFeed</strong>, trade with{' '}
              <strong className="text-[#E2A63C]">Engine 3 Smart Escrow</strong>, and build algorithmic{' '}
              <strong className="text-white">Tabi Credit Scores</strong>.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/feed')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12] text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
              >
                <Play size={15} className="fill-[#241A12]" />
                <span>Watch Live AgroFeed</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/fintech/loans')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#EEF8F1]/15 hover:bg-[#EEF8F1]/25 border border-[#CCEBD5]/40 text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                <TrendingUp size={15} className="text-[#E2A63C]" />
                <span>Tabi Credit & AgroVestor</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/ecosystem')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold text-[#EEF8F1] hover:text-[#E2A63C] transition cursor-pointer"
              >
                <Compass size={15} />
                <span>Explore 5 Engines</span>
              </button>
            </div>
          </div>

          {/* Right: 3 Live Pillar Cards in Mint/Canopy style */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-2.5">
            <div
              onClick={() => navigate('/orders')}
              className="bg-[#0E2515]/90 hover:bg-[#0E2515] border border-[#4E8B3F]/40 rounded-2xl p-3.5 cursor-pointer transition"
            >
              <ShieldCheck size={20} className="text-[#4E8B3F] mb-2" />
              <div className="font-mono-num text-base sm:text-lg font-bold text-white">100%</div>
              <div className="text-[11px] text-[#EEF8F1]/80 leading-snug mt-0.5">
                Smart Escrow Protected
              </div>
            </div>

            <div
              onClick={() => navigate('/fintech/loans')}
              className="bg-[#0E2515]/90 hover:bg-[#0E2515] border border-[#E2A63C]/40 rounded-2xl p-3.5 cursor-pointer transition"
            >
              <TrendingUp size={20} className="text-[#E2A63C] mb-2" />
              <div className="font-mono-num text-base sm:text-lg font-bold text-[#E2A63C]">
                300–850
              </div>
              <div className="text-[11px] text-[#EEF8F1]/80 leading-snug mt-0.5">
                Tabi FICO Credit Engine
              </div>
            </div>

            <div
              onClick={() => navigate('/wholesaler')}
              className="bg-[#0E2515]/90 hover:bg-[#0E2515] border border-[#4E8B3F]/40 rounded-2xl p-3.5 cursor-pointer transition"
            >
              <Sprout size={20} className="text-[#4E8B3F] mb-2" />
              <div className="font-mono-num text-base sm:text-lg font-bold text-white">Direct</div>
              <div className="text-[11px] text-[#EEF8F1]/80 leading-snug mt-0.5">
                Farm & Buyam-Sellam Lots
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. LIVE AGROFEED HARVEST STORIES REEL (Bridge between Mobile Landing & Web)
      ===================================================================== */}
      {stories.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4E8B3F]" />
              <h2 className="font-display-italic text-lg sm:text-xl text-[#173A20] font-semibold">
                Live AgroFeed Harvest Stories
              </h2>
              <span className="hidden sm:inline-block text-xs bg-[#EEF8F1] text-[#4E8B3F] border border-[#CCEBD5] px-2.5 py-0.5 rounded-full font-semibold">
                Shoppable 1-Tap Video Feed
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/feed')}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#4E8B3F] hover:text-[#173A20] transition cursor-pointer"
            >
              <span>Open Full AgroFeed</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-1">
            {stories.map((post, idx) => (
              <div
                key={post.id}
                onClick={() => navigate(`/feed?postIndex=${idx}`)}
                className="group relative w-44 sm:w-52 shrink-0 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#CCEBD5] hover:border-[#4E8B3F] bg-[#173A20] cursor-pointer shadow-xs transition"
              >
                <img
                  src={post.mediaUrl || post.media}
                  alt={post.farmerName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                {/* Top Farmer Pill */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 bg-black/45 backdrop-blur-xs px-2 py-1 rounded-full max-w-[80%]">
                    <img
                      src={post.farmerAvatar}
                      alt={post.farmerName}
                      className="w-4 h-4 rounded-full object-cover border border-[#E2A63C]"
                    />
                    <span className="text-[10px] font-semibold text-white truncate">
                      {post.farmerName}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#4E8B3F] text-white flex items-center justify-center shadow">
                    <Play size={10} className="fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Caption & Likes */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <p className="text-xs font-medium line-clamp-2 leading-snug mb-1.5">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono-num text-[#EEF8F1]">
                    <span className="inline-flex items-center gap-1">
                      <Heart size={11} className="fill-[#E2A63C] text-[#E2A63C]" />
                      {post.likesCount ?? post.likes ?? 0}
                    </span>
                    {post.linkedYield && (
                      <span className="bg-[#E2A63C] text-[#241A12] font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {formatXaf(post.linkedYield.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          3. AGROMARKET SEARCH BAR & MINT FILTER CHIPS
      ===================================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#EEF8F1] border border-[#CCEBD5] p-3.5 rounded-2xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4E8B3F]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fresh harvests, Foumbot tomatoes, Santa potatoes, Penja pepper..."
              className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-white border border-[#CCEBD5] text-sm text-[#241A12] placeholder:text-[#9C9284] focus:outline-none focus:border-[#4E8B3F]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#4E8B3F] hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Wholesale Bulk Toggle */}
          <button
            type="button"
            onClick={() => setWholesaleOnly(!wholesaleOnly)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition shrink-0 cursor-pointer ${wholesaleOnly
                ? 'bg-[#173A20] text-[#E2A63C] border-[#173A20]'
                : 'bg-white text-[#241A12] border-[#CCEBD5] hover:border-[#4E8B3F]'
              }`}
          >
            <SlidersHorizontal size={14} />
            <span>Wholesale Bulk Only</span>
          </button>
        </div>

        {/* Category Filter Chips (Profile Mint/Cultivated Palette) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border whitespace-nowrap transition cursor-pointer ${active
                    ? 'bg-[#4E8B3F] text-white border-[#4E8B3F] shadow-xs'
                    : 'bg-[#EEF8F1] text-[#241A12] border-[#CCEBD5] hover:border-[#4E8B3F]'
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ===================================================================
            4. AGROMARKET RESPONSIVE PRODUCT GRID
        =================================================================== */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-72 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] animate-pulse"
              />
            ))}
          </div>
        ) : filteredYields.length === 0 ? (
          <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-2xl p-10 text-center space-y-2">
            <Sparkles size={36} className="text-[#E2A63C] mx-auto" />
            <h3 className="font-display-italic text-lg text-[#173A20] font-semibold">
              No Harvest Lots Match Your Filter
            </h3>
            <p className="text-xs text-[#5C5245] max-w-sm mx-auto">
              Try clearing your search query or switching categories to view fresh farm-direct lots.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setWholesaleOnly(false);
              }}
              className="mt-2 px-4 py-2 rounded-full bg-[#4E8B3F] text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredYields.map((item) => (
              <YieldCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Floating Regional Basket Bar when items exist */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="flex items-center gap-3 bg-[#173A20] hover:bg-[#0E2515] text-white pl-2.5 pr-4 py-2 rounded-full border-2 border-[#E2A63C] shadow-xl transition cursor-pointer"
          >
            <img
              src={regionalContainer.imageUrl}
              alt={regionalContainer.shortName}
              className="w-8 h-8 rounded-full object-cover border border-[#E2A63C]"
            />
            <div className="text-left">
              <div className="text-[11px] font-bold text-[#E2A63C] leading-none">
                {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'} in {regionalContainer.shortName}
              </div>
              <div className="font-mono-num text-xs font-bold text-white mt-0.5">
                {formatXaf(cartTotal)} • Checkout
              </div>
            </div>
            <ShoppingBag size={16} className="text-[#E2A63C] ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingMarketPage;

