import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ShoppingBag,
  Warehouse,
  Store,
} from 'lucide-react';
import { fetchYieldsApi, fetchCategoriesApi, fetchPublicFarmsApi, fetchPublicStoresApi } from '@/api';
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
  const [marketView, setMarketView] = useState<'produce' | 'farms' | 'stores'>('produce');
  const [yieldsList, setYieldsList] = useState<Yield[]>([]);
  const [farmsList, setFarmsList] = useState<any[]>([]);
  const [storesList, setStoresList] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(STATIC_CATEGORIES);
  const [produceSourceFilter, setProduceSourceFilter] = useState<'all' | 'direct' | 'instore'>('all');
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
        const [yData, cData, fData, sData] = await Promise.all([
          fetchYieldsApi(),
          fetchCategoriesApi().catch(() => []),
          fetchPublicFarmsApi().catch(() => []),
          fetchPublicStoresApi().catch(() => []),
        ]);
        if (!mounted) return;
        setYieldsList(yData);
        setFarmsList(fData);
        setStoresList(sData);
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

  // Filtered Produce Lots
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

    const isStoreProduce = Boolean(item.storeId || item.sourceType === 'STORE');

    const matchesSource =
      produceSourceFilter === 'all' ||
      (produceSourceFilter === 'direct' && !isStoreProduce) ||
      (produceSourceFilter === 'instore' && isStoreProduce);

    return matchesSearch && matchesCategory && matchesSource;
  });

  // Filtered Farms Directory
  const filteredFarms = farmsList.filter((farm) => {
    return (
      searchQuery.trim() === '' ||
      farm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filtered Stores Directory
  const filteredStores = storesList.filter((st) => {
    return (
      searchQuery.trim() === '' ||
      st.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.marketZone?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="px-8 py-5 space-y-4 w-full">
      {/* =====================================================================
          COMPACT CENTERED SEARCH BAR (No Exaggerated Padding)
      ===================================================================== */}
      <section className="space-y-3.5">
        <div className="flex justify-center w-full">
          <div className="relative w-full max-w-xl">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4E8B3F]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fresh harvests, Foumbot tomatoes, Santa potatoes, Penja pepper..."
              className="w-full pl-9 pr-14 py-2 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-xs sm:text-[13px] text-[#241A12] placeholder:text-[#5C5245]/70 focus:outline-none focus:border-[#4E8B3F] focus:bg-white transition"
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

        {/* Market Scope Selector: Harvest Produce | Direct Farms | AgroStores */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Level 1: Market Catalog Mode */}
          <div className="flex items-center gap-1.5 p-1 bg-[#EEF8F1] rounded-full border border-[#CCEBD5]">
            <button
              type="button"
              onClick={() => setMarketView('produce')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${marketView === 'produce'
                ? 'bg-[#173A20] text-white shadow-xs'
                : 'text-[#241A12] hover:text-[#4E8B3F]'
              }`}
            >
              <Sparkles size={13} className="text-[#F5C77E]" />
              <span>Harvest Produce</span>
            </button>

            <button
              type="button"
              onClick={() => setMarketView('farms')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${marketView === 'farms'
                ? 'bg-[#4E8B3F] text-white shadow-xs'
                : 'text-[#241A12] hover:text-[#4E8B3F]'
              }`}
            >
              <Warehouse size={13} />
              <span>AgroFarms ({farmsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setMarketView('stores')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${marketView === 'stores'
                ? 'bg-[#E2A63C] text-[#241A12] shadow-xs'
                : 'text-[#241A12] hover:text-[#B87D18]'
              }`}
            >
              <Store size={13} />
              <span>AgroStores ({storesList.length})</span>
            </button>
          </div>

          {/* Level 2: Produce Sub-Filter (Direct vs In Stores) */}
          {marketView === 'produce' && (
            <>
              <div className="h-4 w-px bg-[#CCEBD5] hidden sm:block" />
              <div className="flex items-center gap-1 p-0.5 bg-[#FAF7F2] rounded-full border border-[#EBE3D5]">
                <button
                  type="button"
                  onClick={() => setProduceSourceFilter('all')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${produceSourceFilter === 'all'
                    ? 'bg-[#241A12] text-white'
                    : 'text-[#5C5245] hover:text-[#241A12]'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setProduceSourceFilter('direct')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${produceSourceFilter === 'direct'
                    ? 'bg-[#4E8B3F] text-white'
                    : 'text-[#5C5245] hover:text-[#4E8B3F]'
                  }`}
                >
                  Direct Farms
                </button>
                <button
                  type="button"
                  onClick={() => setProduceSourceFilter('instore')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${produceSourceFilter === 'instore'
                    ? 'bg-[#E2A63C] text-[#241A12]'
                    : 'text-[#5C5245] hover:text-[#B87D18]'
                  }`}
                >
                  In Stores
                </button>
              </div>
            </>
          )}

          {/* Category Filter Chips for Produce */}
          {marketView === 'produce' && (
            <>
              <div className="h-4 w-px bg-[#CCEBD5] hidden sm:block" />
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap transition cursor-pointer ${active
                          ? 'bg-[#4E8B3F] text-white border-[#4E8B3F] shadow-xs'
                          : 'bg-[#EEF8F1] text-[#241A12] border-[#CCEBD5] hover:border-[#4E8B3F]'
                        }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ===================================================================
            AGROMARKET DYNAMIC CONTENT (Produce | Farms Directory | Stores Directory)
        =================================================================== */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-72 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] animate-pulse"
              />
            ))}
          </div>
        ) : marketView === 'produce' ? (
          filteredYields.length === 0 ? (
            <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-2xl p-10 text-center space-y-2">
              <Sparkles size={36} className="text-[#E2A63C] mx-auto" />
              <h3 className="font-display-italic text-lg text-[#173A20] font-semibold">
                No Harvest Lots Match Your Filter
              </h3>
              <p className="text-xs text-[#5C5245] max-w-sm mx-auto">
                {produceSourceFilter === 'instore'
                  ? 'No store-depot lots currently listed. Farm producers can register an AgroStore to publish wholesale inventory.'
                  : 'Try clearing your search query or switching categories to view fresh farm-direct lots.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setProduceSourceFilter('all');
                }}
                className="mt-2 px-4 py-2 rounded-full bg-[#4E8B3F] text-white text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredYields.map((item) => (
                <YieldCard key={item.id} item={item} />
              ))}
            </div>
          )
        ) : marketView === 'farms' ? (
          filteredFarms.length === 0 ? (
            <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-2xl p-10 text-center space-y-2">
              <Warehouse size={36} className="text-[#4E8B3F] mx-auto" />
              <h3 className="font-display-italic text-lg text-[#173A20] font-semibold">
                No Farms Match Your Search
              </h3>
              <p className="text-xs text-[#5C5245] max-w-sm mx-auto">
                Try searching by different regional corridors or producer names.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFarms.map((farm: any) => (
                <div
                  key={farm.id}
                  onClick={() => navigate(`/farm/${farm.slug || farm.id}`)}
                  className="bg-white rounded-2xl border border-[#CCEBD5] hover:border-[#4E8B3F] overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col"
                >
                  <div className="h-40 bg-[#EEF8F1] relative">
                    <img
                      src={farm.coverPhoto || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800'}
                      alt={farm.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#EEF8F1]/95 text-[#173A20] border border-[#CCEBD5] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {farm.category || 'CROPS'} • {farm.sizeHectares || 2.5} Ha
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="font-bold text-base text-[#173A20] leading-snug">{farm.name}</h4>
                      <p className="text-xs text-[#5C5245] line-clamp-2 mt-1">{farm.description}</p>
                    </div>
                    <div className="pt-2 border-t border-[#EEF8F1] flex items-center justify-between text-xs text-[#5C5245]">
                      <span className="font-semibold">{farm.city}, {farm.region}</span>
                      <span className="text-[#4E8B3F] font-bold">View Farm Storefront →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          filteredStores.length === 0 ? (
            <div className="bg-[#FFF9EE] border border-[#F2DCAA] rounded-2xl p-10 text-center space-y-2">
              <Store size={36} className="text-[#E2A63C] mx-auto" />
              <h3 className="font-display-italic text-lg text-[#241A12] font-semibold">
                No Commercial AgroStores Match Your Search
              </h3>
              <p className="text-xs text-[#5C5245] max-w-sm mx-auto">
                No commercial depot stores found. Registered merchants can open an AgroStore to publish wholesale lots.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStores.map((st: any) => (
                <div
                  key={st.id}
                  onClick={() => navigate(`/store/${st.slug || st.id}`)}
                  className="bg-white rounded-2xl border border-[#F2DCAA] hover:border-[#E2A63C] overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col"
                >
                  <div className="h-40 bg-[#FFF9EE] relative">
                    <img
                      src={st.coverPhoto || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}
                      alt={st.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#FFF9EE]/95 text-[#241A12] border border-[#F2DCAA] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {st.storeType || 'WHOLESALE_DEPOT'} • {st.storageCapacityTons || 10} Tons
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="font-bold text-base text-[#241A12] leading-snug">{st.name}</h4>
                      <p className="text-xs text-[#5C5245] line-clamp-2 mt-1">{st.description || 'Verified commercial depot hub.'}</p>
                    </div>
                    <div className="pt-2 border-t border-[#FFF9EE] flex items-center justify-between text-xs text-[#5C5245]">
                      <span className="font-semibold">{st.marketZone || st.city || 'Depot'}</span>
                      <span className="text-[#B87D18] font-bold">View Store Profile →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
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
