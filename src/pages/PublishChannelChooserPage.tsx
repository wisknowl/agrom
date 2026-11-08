import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Warehouse,
  Store,
  ChevronRight,
  Sprout,
  Truck,
  CheckCircle2,
  Boxes,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchMyStoresApi } from '@/api';

export const PublishChannelChooserPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  // Sync user stores to ensure creator choices are accurate
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
        .catch((err) => console.warn('Could not sync user stores in PublishChannelChooserPage:', err));
    }
  }, [isAuthenticated, user?.id, updateUser]);

  const hasFarms = Boolean(user?.farms && user.farms.length > 0);
  const hasStores = Boolean(user?.stores && user.stores.length > 0);

  const handleSelectFarm = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    if (hasFarms) {
      navigate('/farmer/manage');
    } else {
      navigate('/farmer/new');
    }
  };

  const handleSelectStore = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    if (hasStores) {
      navigate('/store');
    } else {
      navigate('/store/new');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAF9] text-[#241A12] pb-16">
      {/* Top Header Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#CCEBD5] sticky top-0 z-30 px-[11px] py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] hover:border-[#4E8B3F] flex items-center justify-center text-[#173A20] transition cursor-pointer"
            aria-label="Go Back"
          >
            <ArrowLeft size={18} strokeWidth={2.4} />
          </button>

          <div className="text-center">
            <h1 className="text-sm font-bold text-[#173A20]">Publish Produce</h1>
            <p className="text-[11px] text-[#5C5245]">Select Creator Channel</p>
          </div>

          <span className="text-[10px] font-bold text-[#4E8B3F] bg-[#EEF8F1] border border-[#CCEBD5] px-2.5 py-1 rounded-full">
            Agrom Direct
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-[11px] pt-5 space-y-4">
        {/* Hero Banner with Growth-to-Harvest Gradient */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#173A20] to-[#2D6124] text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-[#4E8B3F]/20 pointer-events-none blur-2xl" />
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-1 rounded-full text-[#F5C77E]">
              Producer Onboarding
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight">
              Where is your produce originating from?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg">
              Agrom separates farm-direct field yields from wholesale market depot inventory to ensure buyers get authentic regional provenance and escrow verification.
            </p>
          </div>
        </div>

        {/* Channel 1: Regional AgroFarm */}
        <div
          onClick={handleSelectFarm}
          className="group bg-white rounded-3xl border-2 border-[#CCEBD5] hover:border-[#4E8B3F] p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Animated Farm Sprout Visual */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
              <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 48 48" fill="none">
                <path d="M4 36C12 32 20 40 28 35C36 30 44 37 44 37" stroke="#CCEBD5" strokeWidth="2" strokeDasharray="3 2" />
                <path d="M4 42C14 38 24 44 34 39C40 36 44 41 44 41" stroke="#CCEBD5" strokeWidth="2" />
                <circle cx="24" cy="28" r="7" fill="#4E8B3F" fillOpacity="0.2" className="animate-ping" style={{ animationDuration: '3s' }} />
                <path d="M24 35V22" stroke="#4E8B3F" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M24 22C24 15 16 16 16 16C16 22 24 22 24 22Z" fill="#4E8B3F" />
                <path d="M24 20C24 14 32 15 32 15C32 20 24 20 24 20Z" fill="#66B354" />
              </svg>
              <span className="absolute bottom-1 right-1 text-[8px] font-bold text-[#4E8B3F] bg-white/95 px-1.5 py-0.2 rounded-full border border-[#CCEBD5]">
                Farm
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#173A20] group-hover:text-[#4E8B3F] transition flex items-center gap-2">
                    <span>Regional AgroFarm</span>
                    <span className="text-[10px] bg-[#EEF8F1] text-[#4E8B3F] px-2 py-0.5 rounded-full border border-[#CCEBD5] font-semibold">
                      Field Producer
                    </span>
                  </h3>
                  <p className="text-xs text-[#5C5245] mt-1 leading-relaxed">
                    Direct harvest lots, crop yields, and seasonal crates harvested straight from your agricultural parcel.
                  </p>
                </div>
                <ChevronRight size={18} className="text-[#8F8475] group-hover:text-[#4E8B3F] group-hover:translate-x-1 transition shrink-0 ml-2" />
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'Field Story updates to AgroFeed',
                  'Cooperative trust rating',
                  'Direct harvest crate orders',
                  'Multi-site parcel footprint',
                ].map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#173A20] bg-[#EEF8F1] px-2.5 py-1 rounded-lg border border-[#CCEBD5]"
                  >
                    <CheckCircle2 size={12} className="text-[#4E8B3F]" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>

              {/* Action Pill */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#4E8B3F] group-hover:bg-[#3D7030] px-4 py-2 rounded-xl transition shadow-xs">
                  <Sprout size={14} />
                  <span>{hasFarms ? 'Manage Your Farm Lots →' : '+ Register Your Farm Parcel'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Channel 2: Commercial AgroStore & Depot */}
        <div
          onClick={handleSelectStore}
          className="group bg-white rounded-3xl border-2 border-[#CCEBD5] hover:border-[#4E8B3F] p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Animated Depot / Warehouse Visual */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
              <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="14" width="32" height="26" rx="2" stroke="#4E8B3F" strokeWidth="2" fill="#E3F4E8" fillOpacity="0.4" />
                <path d="M6 14L24 6L42 14" stroke="#4E8B3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="18" y="24" width="12" height="16" fill="#4E8B3F" fillOpacity="0.25" />
                <line x1="18" y1="28" x2="30" y2="28" stroke="#4E8B3F" strokeWidth="1" />
                <line x1="18" y1="32" x2="30" y2="32" stroke="#4E8B3F" strokeWidth="1" />
                <line x1="18" y1="36" x2="30" y2="36" stroke="#4E8B3F" strokeWidth="1" />
                <circle cx="34" cy="20" r="3" fill="#4E8B3F" />
              </svg>
              <span className="absolute bottom-1 right-1 text-[8px] font-bold text-[#4E8B3F] bg-white/95 px-1.5 py-0.2 rounded-full border border-[#CCEBD5]">
                Depot
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#173A20] group-hover:text-[#4E8B3F] transition flex items-center gap-2">
                    <span>Commercial AgroStore & Depot</span>
                    <span className="text-[10px] bg-[#EEF8F1] text-[#173A20] px-2 py-0.5 rounded-full border border-[#CCEBD5] font-semibold">
                      Wholesale & Hub
                    </span>
                  </h3>
                  <p className="text-xs text-[#52796F] mt-1 leading-relaxed">
                    Bulk aggregated produce, wholesale crates, cold-storage inventory, and multi-site dispatch warehouses.
                  </p>
                </div>
                <ChevronRight size={18} className="text-[#52796F] group-hover:text-[#4E8B3F] group-hover:translate-x-1 transition shrink-0 ml-2" />
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'Wholesale lots & bulk crate tiers',
                  'Multi-site dispatch locations',
                  'Cold room & dry storage tracking',
                  'Commercial depot contracts',
                ].map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#173A20] bg-[#EEF8F1] px-2.5 py-1 rounded-lg border border-[#CCEBD5]"
                  >
                    <CheckCircle2 size={12} className="text-[#4E8B3F]" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>

              {/* Action Pill */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#4E8B3F] group-hover:bg-[#3D7030] px-4 py-2 rounded-xl transition shadow-xs">
                  <Store size={14} />
                  <span>{hasStores ? 'Manage Your Store Lots →' : '+ Register Commercial Depot'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Helpful Explainer Callout */}
        <div className="rounded-2xl p-4 bg-[#EEF8F1] border border-[#CCEBD5] flex items-start gap-3">
          <HelpCircle size={18} className="text-[#4E8B3F] shrink-0 mt-0.5" />
          <div className="text-xs text-[#5C5245] leading-relaxed">
            <span className="font-bold text-[#173A20]">Can I operate both? </span>
            Yes. Many agricultural entrepreneurs operate production parcels in rural corridors (e.g. Foumbot or Santa) while managing a central distribution depot in Douala or Yaoundé. Both channels are unified under your Agrom profile.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishChannelChooserPage;

