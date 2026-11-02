import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Sprout,
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
} from 'lucide-react';
import MeetingLeafLogo from './MeetingLeafLogo';
import EcosystemDrawer from './EcosystemDrawer';
import CreatePostModal from './CreatePostModal';
import AgromPostButton from './AgromPostButton';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import { resolveMediaUrl } from '@/utils/media';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const { user, isAuthenticated } = useAuthStore();
  const {
    getContainer,
    setEcosystemDrawerOpen,
    setCreatePostModalOpen,
    language,
    setLanguage,
  } = useRegionalContainerStore();

  const regionalContainer = getContainer();
  const pathname = location.pathname;

  // Check active tab for the 5 core mobile tabs
  const isFeedActive = pathname.startsWith('/feed');
  const isMarketActive = pathname === '/' || pathname.startsWith('/yield');
  const isCartActive = pathname.startsWith('/cart');
  const isInboxActive = pathname.startsWith('/inbox') || pathname.startsWith('/chat');
  const isProfileActive = pathname === '/profile';

  const desktopSidebarLinks = [
    {
      to: '/feed',
      label: 'AgroFeed',
      icon: <Home size={19} />,
      active: isFeedActive,
    },
    {
      to: '/',
      label: 'AgroMarket',
      icon: <Sprout size={19} />,
      active: isMarketActive,
    },
    {
      to: '/fintech/loans',
      label: 'AgroVestor & Credit',
      icon: <TrendingUp size={19} />,
      active: pathname.startsWith('/fintech'),
    },
    {
      to: '/orders',
      label: 'Smart Escrow',
      icon: <ShieldCheck size={19} />,
      active: pathname.startsWith('/orders'),
    },
    {
      to: '/wallet',
      label: 'AgroWallet',
      icon: <Wallet size={19} />,
      active: pathname.startsWith('/wallet'),
    },
    {
      to: '/farmer/manage',
      label: 'My AgroFarms',
      icon: <Warehouse size={19} />,
      active: pathname === '/farmer/manage' || pathname === '/farmer/new',
    },
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
    <div className="min-h-screen flex flex-col bg-white text-[#241A12]">
      {/* =====================================================================
          TOP COMMAND BAR (Responsive Desktop & Mobile Header)
      ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#CCEBD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Brand Lockup (Agrom) */}
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-2 focus:outline-none">
              <MeetingLeafLogo size={36} showWordmark variant="light" />
            </NavLink>

            {/* Quick Desktop Mode Pills (Using Lucide System Icons) */}
            <nav className="hidden lg:flex items-center gap-1 bg-[#EEF8F1] p-1 rounded-full border border-[#CCEBD5]">
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
                to="/fintech/loans"
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${pathname.startsWith('/fintech')
                  ? 'bg-[#4E8B3F] text-white shadow-xs'
                  : 'text-[#241A12] hover:text-[#4E8B3F]'
                  }`}
              >
                <TrendingUp size={14} strokeWidth={2.2} />
                <span>AgroVestor</span>
              </NavLink>
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

            {/* 3-Bar Ecosystem Drawer Trigger (Matches ProfileHeaderMenu.tsx) */}
            <button
              type="button"
              onClick={() => setEcosystemDrawerOpen(true)}
              aria-label="Open Manage Ecosystem Drawer"
              className="w-9 h-9 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] hover:border-[#4E8B3F] flex items-center justify-center text-[#241A12] transition cursor-pointer"
            >
              <Menu size={19} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN BODY: DESKTOP LEFT RAIL + RESPONSIVE CONTENT VIEWPORT
      ===================================================================== */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex">
        {/* Desktop Left Navigation Rail (Hidden on Mobile < 768px) */}
        <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 border-r border-[#CCEBD5] bg-white p-3.5 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="space-y-1">
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
        </aside>

        {/* Main Content Area (Padded on mobile for bottom navbar) */}
        <main className="flex-1 min-w-0 pb-safe-nav md:pb-10">{children}</main>
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
    </div>
  );
};

export default AppShell;
