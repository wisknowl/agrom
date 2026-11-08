import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  Home,
  Sprout,
  Wallet,
  ShieldCheck,
  Warehouse,
  Store,
  MessageSquare,
  User,
  ChevronRight,
  LogOut,
  /*
  TrendingUp,
  Crown,
  Truck,
  */
} from 'lucide-react';
import MeetingLeafLogo from './MeetingLeafLogo';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import { useAuthStore } from '@/store/authStore';

export const EcosystemDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    isEcosystemDrawerOpen,
    setEcosystemDrawerOpen,
    language,
    setLanguage,
  } = useRegionalContainerStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isEcosystemDrawerOpen) return null;

  const hasFarms = Boolean(user?.farms && user.farms.length > 0);
  const hasStores = Boolean(user?.stores && user.stores.length > 0);

  const go = (path: string) => {
    setEcosystemDrawerOpen(false);
    navigate(path);
  };

  const menuItems = [
    {
      path: '/',
      icon: <Sprout size={18} className="text-[#4E8B3F]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'AgroMarket',
    },
    {
      path: '/feed',
      icon: <Home size={18} className="text-[#4E8B3F]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'AgroFeed',
    },
    {
      path: '/orders',
      icon: <ShieldCheck size={18} className="text-[#4E8B3F]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'My Orders & Escrow',
    },
    {
      path: '/wallet',
      icon: <Wallet size={18} className="text-[#4E8B3F]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'AgroWallet',
    },
    ...(hasFarms || user?.role === 'FARMER'
      ? [
        {
          path: '/farmer/manage',
          icon: <Warehouse size={18} className="text-[#4E8B3F]" />,
          bg: 'bg-[#EEF8F1]',
          title: 'My AgroFarms',
        },
      ]
      : []),
    ...(hasStores || user?.role === 'WHOLESALER'
      ? [
        {
          path: '/store',
          icon: <Store size={18} className="text-[#E2A63C]" />,
          bg: 'bg-[#FEF6E8]',
          title: 'My AgroStores',
        },
      ]
      : []),
    /*
    {
      path: '/fintech/loans',
      icon: <TrendingUp size={18} className="text-[#4E8B3F]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'AgroVestor & Credit',
    },
    {
      path: '/feed?tab=patronized',
      icon: <Crown size={18} className="text-[#E2A63C]" />,
      bg: 'bg-[#FEF6E8]',
      title: 'AgroPatron Feed',
    },
    {
      path: '/ecosystem',
      icon: <Truck size={18} className="text-[#173A20]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'Platform Architecture',
    },
    */
    {
      path: '/inbox',
      icon: <MessageSquare size={18} className="text-[#4E8B3F]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'AgroInbox',
    },
    {
      path: '/profile',
      icon: <User size={18} className="text-[#4E8B3F]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'My Profile',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A12]/45 backdrop-blur-[2px] transition-opacity"
        onClick={() => setEcosystemDrawerOpen(false)}
      />

      {/* Right-to-Left Sliding Panel */}
      <div className="relative z-10 w-full max-w-[360px] bg-white h-full shadow-2xl border-l border-[#CCEBD5] flex flex-col justify-between overflow-y-auto">
        <div className="p-5">
          {/* Header (No 'Manage Ecosystem' text, no star icon) */}
          <div className="flex items-center justify-between pb-4 border-b border-[#CCEBD5] mb-3">
            <div
              onClick={() => {
                setEcosystemDrawerOpen(false);
                navigate('/');
              }}
              className="cursor-pointer"
            >
              <MeetingLeafLogo size={32} showWordmark variant="light" />
            </div>

            <div className="flex items-center gap-2">
              {/* Inline EN/FR Language Pill */}
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                className="inline-flex items-center gap-1.5 bg-[#EEF8F1] border border-[#CCEBD5] px-2.5 py-1 rounded-full text-xs font-mono-num font-bold text-[#241A12] hover:border-[#4E8B3F] transition cursor-pointer"
              >
                <span>{language === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'}</span>
              </button>

              <button
                type="button"
                onClick={() => setEcosystemDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#241A12] hover:bg-[#E1F3E7] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Prominent Mobile CTA: Publish Your AgroProduce (Navigates to /publish with Growth-to-Harvest & Vibration Animation, No Star Icon) */}
          <button
            type="button"
            onClick={() => go('/publish')}
            className="w-full flex items-center justify-center py-3 rounded-xl text-white font-bold text-xs shadow-xs mb-3 transition cursor-pointer btn-growth-harvest-animated border"
          >
            <span>Publish Your AgroProduce</span>
          </button>

          {/* Intelligent Navigation Items matching Sidebar */}
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#EEF8F1] transition text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg ${item.bg} border border-[#CCEBD5] flex items-center justify-center shrink-0 group-hover:scale-105 transition`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold text-[#241A12] group-hover:text-[#173A20] truncate">
                    {item.title}
                  </span>
                </div>
                <ChevronRight size={16} className="text-[#8F8475] shrink-0 ml-2 group-hover:text-[#173A20]" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer Auth / Settings */}
        <div className="p-5 border-t border-[#CCEBD5] bg-[#EEF8F1]/60">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#241A12] truncate">{user.name}</div>
                <div className="text-[11px] text-[#5C5245] truncate">{user.email || user.phone}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setEcosystemDrawerOpen(false);
                  navigate('/');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#B54A34] bg-white border border-[#B54A34]/30 hover:bg-[#FDF3F1] transition cursor-pointer"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go('/auth/login')}
                className="flex-1 py-2.5 rounded-full bg-[#4E8B3F] text-white text-xs font-semibold hover:bg-[#3D7030] transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => go('/auth/register')}
                className="flex-1 py-2.5 rounded-full bg-white border border-[#CCEBD5] text-[#173A20] text-xs font-semibold hover:bg-[#EEF8F1] transition cursor-pointer"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EcosystemDrawer;

