import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { fetchYieldsApi, fetchCategoriesApi } from '@/api';
import { Yield } from '@/types';
import YieldCard from '@/components/YieldCard';
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
  const [categories, setCategories] = useState<string[]>(STATIC_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const cartItemCount = useCartStore((s) => s.getItemCount());
  const cartTotal = useCartStore((s) => s.getTotal());
  const regionalContainer = useRegionalContainerStore((s) => s.getContainer());

  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      setLoading(true);
      try {
        const [yData, cData] = await Promise.all([
          fetchYieldsApi(),
          fetchCategoriesApi(),
        ]);
        if (!mounted) return;
        setYieldsList(yData);
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

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-6xl mx-auto">
      {/* =====================================================================
          AGROMARKET SEARCH BAR & MINT FILTER CHIPS
      ===================================================================== */}
      <section className="space-y-4">
        <div className="bg-[#EEF8F1] border border-[#CCEBD5] p-3 rounded-2xl">
          <div className="relative">
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
            AGROMARKET RESPONSIVE PRODUCT GRID
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

      {/* Floating Regional Basket Bar when items exist (Harvest Color Design) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="group flex items-center gap-3 bg-[#FFF9EE] hover:bg-[#FEF2D8] text-[#241A12] pl-2.5 pr-3.5 py-2 rounded-full border-2 border-[#F2DCAA] hover:border-[#E2A63C] shadow-[0_8px_24px_rgba(198,143,48,0.2)] transition cursor-pointer"
          >
            <img
              src={regionalContainer.imageUrl}
              alt={regionalContainer.shortName}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#E2A63C]"
            />
            <div className="text-left">
              <div className="text-[11px] font-bold text-[#B87D1E] leading-none">
                {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'} in {regionalContainer.shortName}
              </div>
              <div className="font-mono-num text-xs font-bold text-[#241A12] mt-0.5">
                {formatXaf(cartTotal)} • Checkout
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#E2A63C] group-hover:bg-[#C68F30] text-[#241A12] flex items-center justify-center ml-0.5 transition">
              <ShoppingBag size={14} strokeWidth={2.4} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingMarketPage;
