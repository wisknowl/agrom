import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Sprout,
  Store,
  MessageSquare,
  User,
  Menu,
  Plus,
  Warehouse,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Compass,
  PlaySquare,
  Globe,
  Smartphone,
  LogOut,
  ChevronDown,
  ChevronRight,
  BookmarkCheck,
  ShoppingBag,
  Sparkles,
  Search,
  X,
  MapPin,
  Check,
} from 'lucide-react';
import MeetingLeafLogo from './MeetingLeafLogo';
import EcosystemDrawer from './EcosystemDrawer';
import CreatePostModal from './CreatePostModal';
import DownloadAppModal from './DownloadAppModal';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useSearchStore } from '@/store/searchStore';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import { resolveMediaUrl } from '@/utils/media';
import { fetchMyStoresApi } from '@/api';

const CAMEROON_REGIONS = [
  { id: '', name: 'All Cameroon', hubs: 'Nationwide harvest catalog', highlight: 'All 10 Regions' },
  { id: 'West Region', name: 'West Region', hubs: 'Foumbot, Bafoussam, Dschang', highlight: 'Tomatoes, Cabbage, Maize' },
  { id: 'Littoral', name: 'Littoral Region', hubs: 'Douala, Penja, Loum, Nkongsamba', highlight: 'Penja Pepper, Plantain, Port Depot' },
  { id: 'Centre', name: 'Centre Region', hubs: 'Yaoundé, Mbalmayo, Obala, Bafia', highlight: 'Cassava, Citrus, Wholesale Markets' },
  { id: 'Northwest', name: 'North West Region', hubs: 'Bamenda, Santa, Ndop Plain', highlight: 'Irish Potatoes, Arabica Coffee, Rice' },
  { id: 'Southwest', name: 'South West Region', hubs: 'Buea, Limbe, Kumba, Muyuka', highlight: 'Oil Palm, Plantains, Yams' },
  { id: 'South', name: 'South Region', hubs: 'Ebolowa, Sangmélima, Kribi', highlight: 'Cocoa, Cassava, Border Trade' },
  { id: 'East', name: 'East Region', hubs: 'Bertoua, Batouri, Abong-Mbang', highlight: 'Groundnuts, Manioc, Honey' },
  { id: 'Adamawa', name: 'Adamawa Region', hubs: 'Ngaoundéré, Meiganga, Tibati', highlight: 'Cattle Herds, Dairy, Sweet Potatoes' },
  { id: 'North', name: 'North Region', hubs: 'Garoua, Guider, Figuil', highlight: 'Cotton, Sorghum, Peanuts' },
  { id: 'Far North', name: 'Far North Region', hubs: 'Maroua, Kousseri, Yagoua', highlight: 'Onions, Millet, Livestock' },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isPublishDropdownOpen, setIsPublishDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const publishDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const regionDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const {
    searchQuery,
    setSearchQuery,
    selectedRegion,
    setSelectedRegion,
    isSearchDropdownOpen,
    setIsSearchDropdownOpen,
  } = useSearchStore();
  const {
    getContainer,
    setEcosystemDrawerOpen,
    setCreatePostModalOpen,
    language,
    setLanguage,
  } = useRegionalContainerStore();

  const regionalContainer = getContainer();
  const pathname = location.pathname;

  // Sync user stores to guarantee real-time creator role visibility
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchMyStoresApi()
        .then((myStores) => {
          if (Array.isArray(myStores)) {
            const currentCount = user.stores?.length ?? -1;
            if (currentCount !== myStores.length) {
              updateUser({ stores: myStores });
            }
          }
        })
        .catch((err) => console.warn('Could not sync user stores in AppShell:', err));
    }
  }, [isAuthenticated, user?.id, updateUser]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        publishDropdownRef.current &&
        !publishDropdownRef.current.contains(target)
      ) {
        setIsPublishDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(target)
      ) {
        setIsSearchDropdownOpen(false);
      }
      if (
        regionDropdownRef.current &&
        !regionDropdownRef.current.contains(target)
      ) {
        setIsRegionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSearchDropdownOpen]);

  // Determine user ownership & creator roles
  const hasFarms = Boolean(user?.farms && user.farms.length > 0);
  const hasStores = Boolean(user?.stores && user.stores.length > 0);
  const isCreator = hasFarms || hasStores || user?.role === 'FARMER' || user?.role === 'WHOLESALER';

  // AgroMarket Root URL ('/') gives full-width expansive browsing without the left rail
  const isMarketRoot = pathname === '/';

  // Check active tab for navigation
  const isFeedActive = pathname.startsWith('/feed');
  const isMarketActive = pathname === '/' || pathname.startsWith('/yield');
  const isStoreActive = pathname.startsWith('/store') || pathname.startsWith('/agro-store');
  const isFarmActive = pathname.startsWith('/farmer/manage') || pathname === '/farmer/new';
  const isCartActive = pathname.startsWith('/cart');
  const isInboxActive = pathname.startsWith('/inbox') || pathname.startsWith('/chat');
  const isProfileActive = pathname === '/profile';

  // Intelligent desktop sidebar links conditioned on role & ownership
  const desktopSidebarLinks = [
    {
      to: '/',
      label: 'AgroMarket',
      icon: <Sprout size={19} />,
      active: isMarketActive,
    },
    {
      to: '/feed',
      label: 'AgroFeed',
      icon: <Home size={19} />,
      active: isFeedActive,
    },
    // Shopper-core links
    {
      to: '/orders',
      label: 'My Orders & Escrow',
      icon: <ShieldCheck size={19} />,
      active: pathname.startsWith('/orders'),
    },
    {
      to: '/wallet',
      label: 'AgroWallet',
      icon: <Wallet size={19} />,
      active: pathname.startsWith('/wallet'),
    },
    // Creator-specific links (only displayed if user owns or manages farm/store)
    ...(hasFarms || user?.role === 'FARMER'
      ? [
        {
          to: '/farmer/manage',
          label: 'My AgroFarms',
          icon: <Warehouse size={19} />,
          active: isFarmActive,
        },
      ]
      : []),
    ...(hasStores || user?.role === 'WHOLESALER'
      ? [
        {
          to: '/store',
          label: 'My AgroStores',
          icon: <Store size={19} />,
          active: isStoreActive,
        },
      ]
      : []),
    /*
    ...(isCreator
      ? [
        {
          to: '/fintech/loans',
          label: 'AgroVestor & Credit',
          icon: <TrendingUp size={19} />,
          active: pathname.startsWith('/fintech'),
        },
      ]
      : []),
    */
    {
      to: '/inbox',
      label: 'AgroInbox',
      icon: <MessageSquare size={19} />,
      active: isInboxActive,
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: <User size={19} />,
      active: isProfileActive,
    },
    /*
    {
      to: '/ecosystem',
      label: 'Platform Architecture',
      icon: <Compass size={19} />,
      active: pathname.startsWith('/ecosystem'),
    },
    */
  ];

  return (
    <div className="h-screen flex flex-col bg-white text-[#241A12] overflow-hidden">
      {/* =====================================================================
          TOP COMMAND BAR (Responsive Desktop & Mobile Header - Never scrolls away)
      ===================================================================== */}
      <header className="h-16 shrink-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#CCEBD5]">
        <div className="max-w-[1440px] mx-auto px-[11px] h-16 flex items-center justify-between gap-2.5">
          {/* Left: Brand Lockup (Agrom) + Navigation Pills */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            <NavLink to="/" className="flex items-center gap-0 focus:outline-none">
              <MeetingLeafLogo size={36} showWordmark variant="light" />
            </NavLink>

            {/* Quick Desktop Mode Pills (AgroMarket & AgroFeed) */}
            <nav className="hidden lg:flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-[#EEF8F1] p-1 rounded-full border border-[#CCEBD5]">
                <NavLink
                  to="/"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${isMarketActive
                    ? 'bg-[#4E8B3F] text-white shadow-xs'
                    : 'text-[#241A12] hover:text-[#4E8B3F]'
                    }`}
                >
                  <Sprout size={14} strokeWidth={2.2} />
                  <span>AgroMarket</span>
                </NavLink>
                <NavLink
                  to="/feed"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${isFeedActive
                    ? 'bg-[#4E8B3F] text-white shadow-xs'
                    : 'text-[#241A12] hover:text-[#4E8B3F]'
                    }`}
                >
                  <PlaySquare size={14} strokeWidth={2.2} />
                  <span>AgroFeed</span>
                </NavLink>
              </div>
            </nav>
          </div>

          {/* Center: Redesigned Desktop Search Input with interactive Quick Dropdown */}
          <div className="hidden md:flex flex-1 max-w-xl mx-2 relative" ref={searchDropdownRef}>
            <div className="relative w-full flex items-center bg-[#F9FBF9] hover:bg-white focus-within:bg-white border border-[#CCEBD5] focus-within:border-[#4E8B3F] rounded-xl overflow-hidden shadow-2xs transition">
              <div className="h-11 w-11 shrink-0 bg-[#4E8B3F] flex items-center justify-center text-white pointer-events-none">
                <Search size={18} strokeWidth={2.4} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchDropdownOpen(true)}
                placeholder="Search harvests, produce lots, farms, stores or regions..."
                className="w-full h-11 px-3 bg-transparent text-xs sm:text-sm font-medium text-[#241A12] placeholder-[#8F8475] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="pr-3 flex items-center text-[#8F8475] hover:text-[#241A12]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Quick Search Dropdown */}
            {isSearchDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#CCEBD5] rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#5C5245] mb-2 px-1">
                  Quick Search & Filters
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    { label: 'Fresh Harvests', query: 'harvest' },
                    { label: 'In Stores', query: 'store' },
                    { label: 'Direct Farms', query: 'farm' },
                    { label: 'Roma Tomatoes', query: 'tomato' },
                    { label: 'Hass Avocado', query: 'avocado' },
                    { label: 'White Maize', query: 'maize' },
                    { label: 'Douala', query: 'Douala' },
                    { label: 'Foumbot', query: 'Foumbot' },
                    { label: 'Bafoussam', query: 'Bafoussam' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setSearchQuery(item.query);
                        setIsSearchDropdownOpen(false);
                        if (pathname !== '/') navigate('/');
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EEF8F1] hover:bg-[#DDF2E4] text-[#173A20] border border-[#CCEBD5] transition cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-[#EEF8F1] pt-2 px-1 flex items-center justify-between text-[11px] text-[#8F8475]">
                  <span>Press enter to search in AgroMarket</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchDropdownOpen(false);
                      if (pathname !== '/') navigate('/');
                    }}
                    className="text-[#4E8B3F] font-bold hover:underline"
                  >
                    View All Produce →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions (Publish CTA, Story +, Language, Shrunk Basket, Profile with Get App) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Universal CTA Dropdown: Publish Your AgroProduce ▾ (Hover & Click Supported) */}
            <div
              className="relative hidden lg:block"
              ref={publishDropdownRef}
              onMouseEnter={() => setIsPublishDropdownOpen(true)}
              onMouseLeave={() => setIsPublishDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsPublishDropdownOpen(!isPublishDropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border text-white btn-growth-harvest-animated ${isPublishDropdownOpen
                  ? 'ring-2 ring-[#173A20]'
                  : ''
                  }`}
              >
                <span>Publish Your AgroProduce</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isPublishDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Animated Dropdown Menu with SVG/CSS Mini Interactive Walkthroughs */}
              {isPublishDropdownOpen && (
                <div className="absolute right-0 top-full pt-1.5 w-96 z-50">
                  <div className="rounded-2xl bg-white border border-[#CCEBD5] shadow-2xl p-3.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="mb-2.5 px-1 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5245]">
                        Choose Creator Channel
                      </span>
                      <span className="text-[10px] bg-[#EEF8F1] text-[#173A20] font-bold px-2 py-0.5 rounded-full border border-[#CCEBD5]">
                        Agrom Direct
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Lane 1: Regional AgroFarm */}
                      <div
                        onClick={() => {
                          setIsPublishDropdownOpen(false);
                          if (hasFarms) {
                            navigate('/farmer/manage');
                          } else {
                            navigate('/farmer/new');
                          }
                        }}
                        className="group p-3 rounded-xl border border-[#CCEBD5] bg-gradient-to-br from-[#F5FAF6] to-white hover:border-[#4E8B3F] hover:shadow-md transition cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-lg bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                              <path d="M4 36C12 32 20 40 28 35C36 30 44 37 44 37" stroke="#CCEBD5" strokeWidth="2" strokeDasharray="3 2" />
                              <path d="M4 42C14 38 24 44 34 39C40 36 44 41 44 41" stroke="#CCEBD5" strokeWidth="2" />
                              <circle cx="24" cy="28" r="6" fill="#4E8B3F" fillOpacity="0.2" className="animate-ping" style={{ animationDuration: '3s' }} />
                              <path d="M24 34V22" stroke="#4E8B3F" strokeWidth="2.5" strokeLinecap="round" />
                              <path d="M24 22C24 16 17 17 17 17C17 22 24 22 24 22Z" fill="#4E8B3F" />
                              <path d="M24 20C24 15 31 16 31 16C31 20 24 20 24 20Z" fill="#66B354" />
                            </svg>
                            <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-[#4E8B3F] bg-white/90 px-1 rounded">
                              Farm
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-[#173A20] group-hover:text-[#4E8B3F] transition">
                                Regional AgroFarm
                              </h4>
                              <ChevronRight size={14} className="text-[#5C5245] group-hover:text-[#4E8B3F] group-hover:translate-x-0.5 transition" />
                            </div>
                            <p className="text-[11px] text-[#5C5245] line-clamp-2 mt-0.5 leading-relaxed">
                              Sell field harvests, crop yields, and direct seasonal crates straight from your registered farm parcel.
                            </p>
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4E8B3F] bg-[#EEF8F1] px-2 py-0.5 rounded-full border border-[#CCEBD5]">
                                {hasFarms ? 'Manage Your Farm →' : '+ Register New Farm'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lane 2: Commercial AgroStore & Depot */}
                      <div
                        onClick={() => {
                          setIsPublishDropdownOpen(false);
                          if (hasStores) {
                            navigate('/store');
                          } else {
                            navigate('/store/new');
                          }
                        }}
                        className="group p-3 rounded-xl border border-[#CCEBD5] bg-gradient-to-br from-[#F5FAF6] to-white hover:border-[#4E8B3F] hover:shadow-md transition cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-lg bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                              <rect x="8" y="14" width="32" height="26" rx="2" stroke="#4E8B3F" strokeWidth="2" fill="#E3F4E8" fillOpacity="0.4" />
                              <path d="M6 14L24 6L42 14" stroke="#4E8B3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              <rect x="18" y="24" width="12" height="16" fill="#4E8B3F" fillOpacity="0.25" />
                              <line x1="18" y1="28" x2="30" y2="28" stroke="#4E8B3F" strokeWidth="1" />
                              <line x1="18" y1="32" x2="30" y2="32" stroke="#4E8B3F" strokeWidth="1" />
                              <line x1="18" y1="36" x2="30" y2="36" stroke="#4E8B3F" strokeWidth="1" />
                              <circle cx="34" cy="20" r="3" fill="#4E8B3F" />
                            </svg>
                            <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-[#4E8B3F] bg-white/90 px-1 rounded border border-[#CCEBD5]">
                              Depot
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-[#173A20] group-hover:text-[#4E8B3F] transition">
                                Commercial AgroStore
                              </h4>
                              <ChevronRight size={14} className="text-[#52796F] group-hover:text-[#4E8B3F] group-hover:translate-x-0.5 transition" />
                            </div>
                            <p className="text-[11px] text-[#52796F] line-clamp-2 mt-0.5 leading-relaxed">
                              Wholesale lots, aggregation hub inventory, cold-storage depots, and multi-crate distribution points.
                            </p>
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B87D18] bg-[#FFF9EE] px-2 py-0.5 rounded-full border border-[#F2DCAA]">
                                {hasStores ? 'Manage Your Store →' : '+ Register New Store'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cameroon Regions Selector (Perfect Circle with Location Pin) */}
            <div className="relative" ref={regionDropdownRef}>
              <button
                type="button"
                onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer ${selectedRegion
                  ? 'bg-[#173A20] border-[#173A20] text-white'
                  : 'bg-[#EEF8F1] hover:bg-[#DDF2E4] border-[#CCEBD5] text-[#173A20]'
                  }`}
                title={selectedRegion ? `Cameroon Region: ${selectedRegion}` : 'Select Cameroon Region'}
              >
                <MapPin size={18} strokeWidth={2.4} />
                {selectedRegion && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#E2A63C] rounded-full border-2 border-white" />
                )}
              </button>

              {/* Regional Dropdown Menu */}
              {isRegionDropdownOpen && (
                <div className="absolute right-0 top-full pt-1.5 w-80 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="rounded-2xl bg-white border border-[#CCEBD5] shadow-2xl p-3 text-[#241A12]">
                    <div className="px-2 py-1.5 mb-2 border-b border-[#EEF8F1] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#4E8B3F]" />
                        <span className="text-xs font-bold text-[#173A20] uppercase tracking-wider">
                          Cameroon Regions
                        </span>
                      </div>
                      <span className="text-[10px] bg-[#EEF8F1] text-[#4E8B3F] font-bold px-2 py-0.5 rounded-full border border-[#CCEBD5]">
                        CEMAC Hub
                      </span>
                    </div>

                    <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
                      {CAMEROON_REGIONS.map((reg) => {
                        const isActive =
                          (!reg.id && !selectedRegion) ||
                          (Boolean(reg.id) && selectedRegion.toLowerCase().includes(reg.id.toLowerCase()));
                        return (
                          <button
                            key={reg.name}
                            type="button"
                            onClick={() => {
                              setSelectedRegion(reg.id);
                              setIsRegionDropdownOpen(false);
                              if (pathname !== '/') navigate('/');
                            }}
                            className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between cursor-pointer ${isActive
                              ? 'bg-[#EEF8F1] border border-[#CCEBD5] text-[#173A20]'
                              : 'hover:bg-[#FAFDF9] text-[#241A12] border border-transparent'
                              }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${isActive ? 'text-[#173A20]' : 'text-[#241A12]'}`}>
                                  {reg.name}
                                </span>
                                {isActive && (
                                  <span className="text-[10px] bg-[#4E8B3F] text-white px-1.5 py-0.2 rounded-full font-bold">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#5C5245] truncate mt-0.5">
                                {reg.hubs}
                              </p>
                              <p className="text-[10px] text-[#4E8B3F] font-semibold truncate">
                                {reg.highlight}
                              </p>
                            </div>
                            {isActive ? (
                              <Check size={16} className="text-[#4E8B3F] shrink-0" strokeWidth={2.5} />
                            ) : (
                              <ChevronRight size={14} className="text-[#5C5245]/40 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedRegion && (
                      <div className="mt-2 pt-2 border-t border-[#EEF8F1]">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRegion('');
                            setIsRegionDropdownOpen(false);
                          }}
                          className="w-full text-center py-1.5 text-xs font-bold text-[#4E8B3F] hover:bg-[#EEF8F1] rounded-lg transition cursor-pointer"
                        >
                          Reset to All Cameroon
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher (Desktop) */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#EEF8F1] border border-[#CCEBD5] px-2.5 py-1.5 rounded-full text-xs font-mono-num font-bold text-[#241A12] hover:border-[#4E8B3F] transition cursor-pointer"
              title="Switch Language (EN / FR)"
            >
              <Globe size={13} className="text-[#4E8B3F]" />
              <span>{language === 'en' ? 'EN' : 'FR'}</span>
            </button>

            {/* Desktop Regional Basket Button (shrunk: icon + badge, no text) */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition cursor-pointer ${isCartActive
                ? 'bg-[#FEF2D8] border-[#E2A63C] shadow-2xs'
                : 'bg-[#FFF9EE] border-[#F2DCAA] hover:bg-[#FEF2D8] hover:border-[#E2A63C]'
                }`}
              title={`${regionalContainer.shortName} (${cartItemCount})`}
            >
              <img
                src={regionalContainer.imageUrl}
                alt={regionalContainer.shortName}
                className="w-5 h-5 rounded-full object-cover"
              />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 font-mono-num text-[10px] font-bold bg-[#E2A63C] text-[#241A12] px-1 rounded-full border border-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Profile Pill with Hover Dropdown (incorporating Get App) */}
            <div
              className="relative hidden md:block"
              ref={profileDropdownRef}
              onMouseEnter={() => setIsProfileDropdownOpen(true)}
              onMouseLeave={() => setIsProfileDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] hover:border-[#4E8B3F] transition cursor-pointer"
              >
                {isAuthenticated && (user?.avatarUrl || user?.avatar) ? (
                  <img
                    src={resolveMediaUrl(user.avatarUrl || user.avatar)}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover border border-[#4E8B3F]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F]">
                    <User size={13} strokeWidth={2.4} />
                  </div>
                )}
                <span className="text-xs font-semibold text-[#241A12] max-w-[100px] truncate">
                  {isAuthenticated && user?.name ? user.name.split(' ')[0] : 'Sign In'}
                </span>
                <ChevronDown size={13} className={`text-[#5C5245] transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Hover Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full pt-1.5 w-64 z-50">
                  <div className="rounded-2xl bg-white border border-[#CCEBD5] shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150 text-[#241A12]">
                    {/* User summary header */}
                    <div className="p-2 border-b border-[#EEF8F1] mb-2">
                      {isAuthenticated && user ? (
                        <div>
                          <div className="font-bold text-xs text-[#173A20] truncate">{user.name}</div>
                          <div className="text-[11px] text-[#5C5245] truncate">{user.email || user.phone || 'Agrom Member'}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-xs text-[#173A20]">Welcome to Agrom</div>
                          <div className="text-[11px] text-[#5C5245]">Sign in to access your wallet & orders</div>
                        </div>
                      )}
                    </div>

                    {/* Navigation links */}
                    <div className="space-y-1 mb-2">
                      {isAuthenticated ? (
                        <>
                          <button
                            type="button"
                            onClick={() => { setIsProfileDropdownOpen(false); navigate('/profile'); }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#241A12] hover:bg-[#EEF8F1] hover:text-[#4E8B3F] transition text-left cursor-pointer"
                          >
                            <User size={14} className="text-[#4E8B3F]" />
                            <span>My Profile</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsProfileDropdownOpen(false); navigate('/orders'); }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#241A12] hover:bg-[#EEF8F1] hover:text-[#4E8B3F] transition text-left cursor-pointer"
                          >
                            <ShieldCheck size={14} className="text-[#4E8B3F]" />
                            <span>My Orders & Escrow</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsProfileDropdownOpen(false); navigate('/wallet'); }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#241A12] hover:bg-[#EEF8F1] hover:text-[#4E8B3F] transition text-left cursor-pointer"
                          >
                            <Wallet size={14} className="text-[#4E8B3F]" />
                            <span>AgroWallet</span>
                          </button>
                          {hasFarms && (
                            <button
                              type="button"
                              onClick={() => { setIsProfileDropdownOpen(false); navigate('/farmer/manage'); }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#241A12] hover:bg-[#EEF8F1] hover:text-[#4E8B3F] transition text-left cursor-pointer"
                            >
                              <Warehouse size={14} className="text-[#4E8B3F]" />
                              <span>My AgroFarms</span>
                            </button>
                          )}
                          {hasStores && (
                            <button
                              type="button"
                              onClick={() => { setIsProfileDropdownOpen(false); navigate('/store'); }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#241A12] hover:bg-[#EEF8F1] hover:text-[#4E8B3F] transition text-left cursor-pointer"
                            >
                              <Store size={14} className="text-[#E2A63C]" />
                              <span>My AgroStores</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setIsProfileDropdownOpen(false); navigate('/auth/login'); }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#4E8B3F] hover:bg-[#3D7030] transition text-center shadow-xs cursor-pointer"
                        >
                          Sign In / Register
                        </button>
                      )}
                    </div>

                    {/* Integrated Mobile App Download Item */}
                    <div className="pt-2 border-t border-[#EEF8F1]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsDownloadModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#173A20] bg-[#EEF8F1] hover:bg-[#DDF2E4] transition cursor-pointer"
                      >
                        <Smartphone size={14} className="text-[#4E8B3F]" />
                        <span>Get App</span>
                      </button>
                    </div>

                    {/* Logout if authenticated */}
                    {isAuthenticated && (
                      <div className="mt-2 pt-2 border-t border-[#EEF8F1]">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3-Bar Ecosystem Drawer Trigger (Only in Responsive Mobile View) */}
            <button
              type="button"
              onClick={() => setEcosystemDrawerOpen(true)}
              aria-label="Open Manage Ecosystem Drawer"
              className="md:hidden w-9 h-9 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] hover:border-[#4E8B3F] flex items-center justify-center text-[#241A12] transition cursor-pointer"
            >
              <Menu size={19} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN BODY: DESKTOP LEFT RAIL + RESPONSIVE CONTENT VIEWPORT
      ===================================================================== */}
      <div className={`flex-1 w-full mx-auto flex min-h-0 overflow-hidden ${isMarketRoot ? 'max-w-none' : 'max-w-[1440px]'}`}>
        {/* Desktop Left Navigation Rail:
            - Kept for non-market pages (orders, profile, inbox, farm/store management, etc.)
            - Hidden on AgroMarket root ('/') so buyers get an expansive full-width shopping experience
            - Hidden on Mobile (< 768px) where bottom/drawer navigation is used
        */}
        {!isMarketRoot && (
          <aside className="hidden md:flex flex-col justify-between w-60 lg:w-64 shrink-0 border-r border-[#CCEBD5] bg-white p-3.5 h-full overflow-hidden">
            <div className="space-y-1 overflow-y-auto flex-1 pr-1 pb-2">
              {desktopSidebarLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition group ${item.active
                    ? 'bg-[#EEF8F1] border border-[#CCEBD5] text-[#173A20]'
                    : 'text-[#241A12] hover:bg-[#EEF8F1]/60 border border-transparent'
                    }`}
                >
                  <span
                    className={`${item.active
                      ? 'text-[#4E8B3F]'
                      : 'text-[#5C5245] group-hover:text-[#4E8B3F]'
                      }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-[13.5px] leading-tight truncate ${item.active ? 'font-bold text-[#173A20]' : 'font-semibold text-[#241A12]'
                      }`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>

            {/* Sidebar Footer with User Status & Logout Button */}
            <div className="pt-3 border-t border-[#CCEBD5] shrink-0">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3D5]">
                    {user.avatarUrl || user.avatar ? (
                      <img
                        src={resolveMediaUrl(user.avatarUrl || user.avatar)}
                        alt={user.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover border border-[#4E8B3F] shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F] shrink-0">
                        <User size={15} strokeWidth={2.4} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#241A12] truncate">
                        {user.name || 'Agrom User'}
                      </div>
                      <div className="text-[10px] text-[#5C5245] truncate">
                        {user.email || user.role || 'Member'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#B54A34] bg-[#FDF3F1] hover:bg-[#FAE5E1] border border-[#B54A34]/20 transition cursor-pointer"
                  >
                    <LogOut size={15} strokeWidth={2.2} />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/auth/login')}
                  className="w-full py-2 rounded-xl text-xs font-bold text-[#173A20] bg-[#EEF8F1] hover:bg-[#CCEBD5] border border-[#CCEBD5] transition cursor-pointer text-center"
                >
                  Sign In / Join
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Main Content Area (Scrolls independently while header & sidebar remain pinned) */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto pb-safe-nav md:pb-10">{children}</main>
      </div>

      {/* =====================================================================
          MOBILE WEB FIXED BOTTOM NAVBAR (< 768px)
          100% Parity with Frontend/components/navigation/CustomTabBar.tsx
      ===================================================================== */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#CCEBD5] px-2 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(36,26,18,0.06)]"
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* 1. AgroFeed */}
          <button
            type="button"
            onClick={() => navigate('/feed')}
            className="flex-1 flex flex-col items-center justify-center py-0.5 cursor-pointer"
          >
            <div
              className={`w-12 h-7 rounded-full flex items-center justify-center mb-0.5 border transition ${isFeedActive
                ? 'bg-[#EEF8F1] border-[#4E8B3F]/25 text-[#4E8B3F]'
                : 'border-transparent text-[#241A12]/50'
                }`}
            >
              <Home size={21} strokeWidth={isFeedActive ? 2.4 : 1.9} />
            </div>
            <span
              className={`text-[11.5px] tracking-tight ${isFeedActive ? 'font-bold text-[#4E8B3F]' : 'font-medium text-[#241A12]/60'
                }`}
            >
              AgroFeed
            </span>
          </button>

          {/* 2. AgroMarket */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 flex flex-col items-center justify-center py-0.5 cursor-pointer"
          >
            <div
              className={`w-12 h-7 rounded-full flex items-center justify-center mb-0.5 border transition ${isMarketActive
                ? 'bg-[#EEF8F1] border-[#4E8B3F]/25 text-[#4E8B3F]'
                : 'border-transparent text-[#241A12]/50'
                }`}
            >
              <Sprout size={21} strokeWidth={isMarketActive ? 2.4 : 1.9} />
            </div>
            <span
              className={`text-[11.5px] tracking-tight ${isMarketActive ? 'font-bold text-[#4E8B3F]' : 'font-medium text-[#241A12]/60'
                }`}
            >
              AgroMarket
            </span>
          </button>

          {/* 3. Regional Basket (Center Tab with Circular Woven Basket Image & Badge) */}
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="flex-1 flex flex-col items-center justify-center py-0.5 cursor-pointer group"
          >
            <div
              className={`relative w-12 h-7 rounded-full flex items-center justify-center mb-0.5 border transition ${isCartActive
                ? 'bg-[#FEF2D8] border-[#E2A63C]'
                : 'bg-[#FFF9EE] border-[#F2DCAA] group-hover:bg-[#FEF2D8] group-hover:border-[#E2A63C]'
                }`}
            >
              <div
                className={`w-6 h-6 rounded-full overflow-hidden border ${isCartActive ? 'border-2 border-[#E2A63C]' : 'border-[#E2A63C]/70'
                  }`}
              >
                <img
                  src={regionalContainer.imageUrl}
                  alt={regionalContainer.shortName}
                  className="w-full h-full object-cover"
                />
              </div>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 right-0.5 bg-[#E2A63C] text-[#241A12] font-mono-num font-bold text-[10px] min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center border-2 border-white">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </div>
            <span
              className={`text-[11.5px] tracking-tight ${isCartActive ? 'font-bold text-[#B87D1E]' : 'font-medium text-[#241A12]/70 group-hover:text-[#B87D1E]'
                }`}
            >
              {regionalContainer.shortName}
            </span>
          </button>

          {/* 4. Inbox */}
          <button
            type="button"
            onClick={() => navigate('/inbox')}
            className="flex-1 flex flex-col items-center justify-center py-0.5 cursor-pointer"
          >
            <div
              className={`w-12 h-7 rounded-full flex items-center justify-center mb-0.5 border transition ${isInboxActive
                ? 'bg-[#EEF8F1] border-[#4E8B3F]/25 text-[#4E8B3F]'
                : 'border-transparent text-[#241A12]/50'
                }`}
            >
              <MessageSquare size={21} strokeWidth={isInboxActive ? 2.4 : 1.9} />
            </div>
            <span
              className={`text-[11.5px] tracking-tight ${isInboxActive ? 'font-bold text-[#4E8B3F]' : 'font-medium text-[#241A12]/60'
                }`}
            >
              Inbox
            </span>
          </button>

          {/* 5. Profile */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex-1 flex flex-col items-center justify-center py-0.5 cursor-pointer"
          >
            <div
              className={`w-12 h-7 rounded-full flex items-center justify-center mb-0.5 border transition ${isProfileActive
                ? 'bg-[#EEF8F1] border-[#4E8B3F]/25 text-[#4E8B3F]'
                : 'border-transparent text-[#241A12]/50'
                }`}
            >
              <User size={21} strokeWidth={isProfileActive ? 2.4 : 1.9} />
            </div>
            <span
              className={`text-[11.5px] tracking-tight ${isProfileActive ? 'font-bold text-[#4E8B3F]' : 'font-medium text-[#241A12]/60'
                }`}
            >
              Profile
            </span>
          </button>
        </div>
      </nav>

      {/* Modals & Drawers */}
      <EcosystemDrawer />
      <CreatePostModal />
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
};

export default AppShell;
