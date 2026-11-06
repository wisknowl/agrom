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
} from 'lucide-react';
import MeetingLeafLogo from './MeetingLeafLogo';
import EcosystemDrawer from './EcosystemDrawer';
import CreatePostModal from './CreatePostModal';
import AgromPostButton from './AgromPostButton';
import DownloadAppModal from './DownloadAppModal';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import { resolveMediaUrl } from '@/utils/media';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isPublishDropdownOpen, setIsPublishDropdownOpen] = useState(false);
  const publishDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    getContainer,
    setEcosystemDrawerOpen,
    setCreatePostModalOpen,
    language,
    setLanguage,
  } = useRegionalContainerStore();

  const regionalContainer = getContainer();
  const pathname = location.pathname;

  // Close publish dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        publishDropdownRef.current &&
        !publishDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPublishDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    {
      to: '/ecosystem',
      label: 'Platform Architecture',
      icon: <Compass size={19} />,
      active: pathname.startsWith('/ecosystem'),
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-white text-[#241A12] overflow-hidden">
      {/* =====================================================================
          TOP COMMAND BAR (Responsive Desktop & Mobile Header - Never scrolls away)
      ===================================================================== */}
      <header className="h-16 shrink-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#CCEBD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Brand Lockup (Agrom) */}
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-2 focus:outline-none">
              <MeetingLeafLogo size={36} showWordmark variant="light" />
            </NavLink>

            {/* Quick Desktop Mode & Publisher Pills (AgroMarket, AgroFeed, Publish Your AgroProduce ▾) */}
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

              {/* Universal CTA Dropdown: Publish Your AgroProduce ▾ (Hover & Click Supported) */}
              <div
                className="relative"
                ref={publishDropdownRef}
                onMouseEnter={() => setIsPublishDropdownOpen(true)}
                onMouseLeave={() => setIsPublishDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsPublishDropdownOpen(!isPublishDropdownOpen)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs cursor-pointer border ${isPublishDropdownOpen
                    ? 'bg-[#173A20] text-white border-[#173A20]'
                    : 'bg-[#4E8B3F] hover:bg-[#3D7030] text-white border-[#4E8B3F]'
                    }`}
                >
                  <Sparkles size={13} className="text-[#F5C77E] animate-pulse" />
                  <span>Publish Your AgroProduce</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isPublishDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Animated Dropdown Menu with SVG/CSS Mini Interactive Walkthroughs */}
                {isPublishDropdownOpen && (
                  <div className="absolute left-0 top-full pt-1.5 w-96 z-50">
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
                            {/* Micro-animated Farm SVG Visual */}
                            <div className="w-14 h-14 rounded-lg bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                              <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                                {/* Field plot lines */}
                                <path d="M4 36C12 32 20 40 28 35C36 30 44 37 44 37" stroke="#CCEBD5" strokeWidth="2" strokeDasharray="3 2" />
                                <path d="M4 42C14 38 24 44 34 39C40 36 44 41 44 41" stroke="#CCEBD5" strokeWidth="2" />
                                {/* Animated Growing Sprout */}
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
                          className="group p-3 rounded-xl border border-[#F2DCAA] bg-gradient-to-br from-[#FFFDF8] to-white hover:border-[#E2A63C] hover:shadow-md transition cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            {/* Micro-animated Store/Depot SVG Visual */}
                            <div className="w-14 h-14 rounded-lg bg-[#FFF9EE] border border-[#F2DCAA] flex items-center justify-center shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                              <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                                {/* Depot building frame */}
                                <rect x="8" y="14" width="32" height="26" rx="2" stroke="#E2A63C" strokeWidth="2" fill="#FEF2D8" fillOpacity="0.4" />
                                <path d="M6 14L24 6L42 14" stroke="#E2A63C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                {/* Warehouse roll-up door */}
                                <rect x="18" y="24" width="12" height="16" fill="#E2A63C" fillOpacity="0.3" />
                                <line x1="18" y1="28" x2="30" y2="28" stroke="#E2A63C" strokeWidth="1" />
                                <line x1="18" y1="32" x2="30" y2="32" stroke="#E2A63C" strokeWidth="1" />
                                <line x1="18" y1="36" x2="30" y2="36" stroke="#E2A63C" strokeWidth="1" />
                                {/* Temperature sensor badge */}
                                <circle cx="34" cy="20" r="3" fill="#4E8B3F" />
                              </svg>
                              <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-[#E2A63C] bg-white/90 px-1 rounded">
                                Depot
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-xs text-[#241A12] group-hover:text-[#B87D18] transition">
                                  Commercial AgroStore
                                </h4>
                                <ChevronRight size={14} className="text-[#5C5245] group-hover:text-[#E2A63C] group-hover:translate-x-0.5 transition" />
                              </div>
                              <p className="text-[11px] text-[#5C5245] line-clamp-2 mt-0.5 leading-relaxed">
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
            </nav>
          </div>

          {/* Right: Actions, Regional Basket, Story Button, Profile, Ecosystem Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* + Story Button (TikTok-Style Agrom Colors) */}
            <AgromPostButton
              label="Story"
              compact
              onClick={() => setCreatePostModalOpen(true)}
            />

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

            {/* Desktop Regional Basket Button */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className={`hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition cursor-pointer ${isCartActive
                ? 'bg-[#FEF2D8] border-[#E2A63C] text-[#241A12] shadow-2xs'
                : 'bg-[#FFF9EE] border-[#F2DCAA] hover:bg-[#FEF2D8] hover:border-[#E2A63C] text-[#241A12]'
                }`}
            >
              <img
                src={regionalContainer.imageUrl}
                alt={regionalContainer.shortName}
                className="w-5 h-5 rounded-full object-cover border border-[#E2A63C]"
              />
              <span className="text-xs font-semibold">{regionalContainer.shortName}</span>
              <span className="font-mono-num text-[11px] font-bold bg-[#E2A63C] text-[#241A12] px-1.5 py-0.2 rounded-full">
                {cartItemCount}
              </span>
            </button>

            {/* User Profile Pill (Desktop) */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="hidden md:inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] hover:border-[#4E8B3F] transition cursor-pointer"
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
              <span className="text-xs font-semibold text-[#241A12] max-w-[110px] truncate">
                {isAuthenticated && user?.name ? user.name.split(' ')[0] : 'Sign In'}
              </span>
            </button>

            {/* Desktop Mobile App Download Trigger (Replaces 3-bar menu on desktop) */}
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 bg-[#EEF8F1] border border-[#CCEBD5] hover:border-[#4E8B3F] px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#241A12] transition cursor-pointer"
              title="Download Agrom Mobile App"
            >
              <Smartphone size={15} className="text-[#4E8B3F]" />
              <span className="hidden xl:inline text-[11px] font-bold">Get App</span>
            </button>

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
