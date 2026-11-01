import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  Wallet,
  ShieldCheck,
  Plus,
  Store,
  Truck,
  TrendingUp,
  Crown,
  Settings,
  ShieldAlert,
  Globe,
  Check,
  LogOut,
} from 'lucide-react';
import {
  useRegionalContainerStore,
  REGIONAL_CONTAINERS,
  ContainerRegionId,
} from '@/store/regionalContainerStore';
import { useAuthStore } from '@/store/authStore';

export const EcosystemDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    isEcosystemDrawerOpen,
    setEcosystemDrawerOpen,
    regionId,
    setRegion,
    language,
    setLanguage,
  } = useRegionalContainerStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isEcosystemDrawerOpen) return null;

  const go = (path: string) => {
    setEcosystemDrawerOpen(false);
    navigate(path);
  };

  const menuItems = [
    {
      path: '/wallet',
      icon: <Wallet size={18} className="text-[#4E8B3F]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'AgroWallet & Escrow Vault',
      sub: 'Balance, escrow releases & patron passes',
    },
    {
      path: '/orders',
      icon: <ShieldCheck size={18} className="text-[#4E8B3F]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'Escrow Orders & Settlements',
      sub: 'Live MoMo verification & Engine 3 FSM release',
    },
    {
      path: '/farmer/manage',
      icon: <Plus size={18} className="text-[#4E8B3F]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'Register & Manage AgroFarms',
      sub: 'Crops, Livestock, Poultry, Aquaculture & Yields',
    },
    {
      path: '/wholesaler',
      icon: <Store size={18} className="text-[#E2A63C]" />,
      bg: 'bg-[#FEF6E8]',
      title: 'Buyam-Sellam Wholesale Hub',
      sub: 'Bulk aggregator lots & B2B cooperative trading',
    },
    {
      path: '/fintech/loans',
      icon: <TrendingUp size={18} className="text-[#4E8B3F]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'AgroVestor & Tabi Credit Engine',
      sub: 'FICO 300–850 scoring, input loans & crowdlending',
    },
    {
      path: '/feed?tab=patronized',
      icon: <Crown size={18} className="text-[#E2A63C]" />,
      bg: 'bg-[#FEF6E8]',
      title: 'AgroPatron VIP Feed',
      sub: 'Exclusive stories & 8% discounts from patronized farms',
    },
    {
      path: '/ecosystem',
      icon: <Truck size={18} className="text-[#173A20]" />,
      bg: 'bg-[#EEF8F1]',
      title: 'Agrom 5-Engine Architecture',
      sub: 'How Smart Escrow, Credit Scoring & Logistics work',
    },
    {
      path: '/admin',
      icon: <ShieldAlert size={18} className="text-[#B54A34]" />,
      bg: 'bg-[#FDF3F1]',
      title: 'Governance & Admin Console',
      sub: 'KYC verification, dispute arbitration & feature flags',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A12]/45 backdrop-blur-[2px] transition-opacity"
        onClick={() => setEcosystemDrawerOpen(false)}
      />

      {/* Right-to-Left Sliding Panel (Mirrors ProfileHeaderMenu.tsx) */}
      <div className="relative z-10 w-full max-w-[370px] bg-white h-full shadow-2xl border-l border-[#CCEBD5] flex flex-col justify-between overflow-y-auto">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#CCEBD5]">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#E2A63C]" />
              <span className="font-display-italic text-lg text-[#173A20] font-medium">
                Manage Ecosystem
              </span>
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

          {/* Regional Harvest Container Selector */}
          <div className="mt-4 bg-[#EEF8F1] border border-[#CCEBD5] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#173A20] flex items-center gap-1.5">
                <Globe size={13} className="text-[#4E8B3F]" />
                Regional Harvest Container
              </span>
              <span className="font-mono-num text-[11px] font-semibold text-[#4E8B3F]">
                {REGIONAL_CONTAINERS[regionId].currency}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['CAMEROON', 'EAST_AFRICA', 'GLOBAL'] as ContainerRegionId[]).map((rId) => {
                const c = REGIONAL_CONTAINERS[rId];
                const active = regionId === rId;
                return (
                  <button
                    key={rId}
                    type="button"
                    onClick={() => setRegion(rId)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition cursor-pointer ${active
                      ? 'bg-white border-[#4E8B3F] shadow-xs'
                      : 'bg-white/60 border-[#CCEBD5] hover:bg-white'
                      }`}
                  >
                    <img
                      src={c.imageUrl}
                      alt={c.shortName}
                      className="w-6 h-6 rounded-full object-cover border border-[#CCEBD5] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-[#241A12] truncate">
                        {c.shortName}
                      </div>
                      <div className="text-[9px] text-[#5C5245] truncate">{c.flag} {c.currency}</div>
                    </div>
                    {active && <Check size={11} className="text-[#4E8B3F] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ecosystem Navigation Items */}
          <div className="mt-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#EEF8F1] transition text-left group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full ${item.bg} border border-[#CCEBD5] flex items-center justify-center shrink-0 group-hover:scale-105 transition`}
                >
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[#241A12] group-hover:text-[#173A20]">
                    {item.title}
                  </div>
                  <div className="text-xs text-[#5C5245] truncate">{item.sub}</div>
                </div>
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
                <div className="text-[11px] text-[#5C5245] truncate">{user.email}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setEcosystemDrawerOpen(false);
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

