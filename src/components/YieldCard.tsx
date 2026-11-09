import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Star,
  MapPin,
  MessageCircle,
  Check,
  ShieldCheck,
  Clock,
  Flame,
  PackageCheck,
  Bell,
} from 'lucide-react';
import { Yield } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { FarmerBadge } from './MeetingLeafLogo';
import { resolveMediaUrl, formatXaf } from '@/utils/media';

interface YieldCardProps {
  item: Yield;
}

export const YieldCard: React.FC<YieldCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addToCart);
  const { toggleYield, isYieldFavorite } = useFavoritesStore();
  const isFavorite = isYieldFavorite(item.id);
  const [justAdded, setJustAdded] = useState(false);

  const displayImage =
    resolveMediaUrl(item.image || item.mediaUrls?.[0]) ||
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800';
  const displayPrice = Number(item.price !== undefined ? item.price : (item.pricePerUnit || 0));

  const farm = item.farm;
  const farmer = item.farmer || (farm as any)?.farmerProfile;
  const farmerUser = farmer?.user || (farm as any)?.user;
  const farmerTargetId = farmerUser?.id || (farm as any)?.userId || item.farmerId;
  const isStoreOrigin = Boolean(item.storeId || item.sourceType === 'STORE');
  const storeDisplay = item.storeName || (item as any).store?.name;
  const storeSlugOrId = (item as any).store?.slug || item.storeId;
  const farmSlugOrId = farm?.slug || farm?.id;
  const provenanceLocation =
    storeDisplay
      ? `${storeDisplay} • Depot`
      : (farm?.name ? `${farm.name} • ${farm.city || farm.region}` : (item.originRegion || farm?.city || 'Cameroon'));
  const creditTier = farmer?.creditTier || 'GOLD';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const qtyToAdd = item.minOrderQuantity && item.minOrderQuantity > 1 ? item.minOrderQuantity : 1;
    addToCart({ ...item, price: displayPrice, image: displayImage }, qtyToAdd);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1100);
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleYield(item.id);
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (farmerTargetId) {
      navigate(`/inbox?userId=${farmerTargetId}`);
    } else {
      navigate('/inbox');
    }
  };

  return (
    <div
      onClick={() => navigate(`/yield/${item.id}`)}
      className="group bg-white rounded-2xl border border-[#CCEBD5] hover:border-[#4E8B3F] transition-all duration-200 overflow-hidden cursor-pointer flex flex-col shadow-[0_2px_10px_rgba(36,26,18,0.04)] hover:shadow-[0_8px_24px_rgba(23,58,32,0.09)]"
    >
      {/* Image Header */}
      <div className="relative h-44 sm:h-48 w-full bg-[#EEF8F1] overflow-hidden">
        <img
          src={displayImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Left Credit Tier Badge */}
        <div className="absolute top-2.5 left-2.5">
          <FarmerBadge
            tier={creditTier}
            label={creditTier === 'PLATINUM' ? 'Platinum' : creditTier === 'GOLD' ? 'Gold' : creditTier}
            size="sm"
          />
        </div>

        {/* Top Right Wishlist Heart */}
        <button
          type="button"
          onClick={handleToggleFav}
          aria-label="Save to wishlist"
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-[#CCEBD5] flex items-center justify-center hover:scale-110 transition"
        >
          <Heart
            size={15}
            className={isFavorite ? 'text-[#B54A34] fill-[#B54A34]' : 'text-[#241A12]/70'}
          />
        </button>

        {/* Bottom Badges on Image */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-1">
          {item.lifecycleStatus === 'GROWING' ? (
            <span className="font-mono-num text-[10px] font-bold uppercase tracking-wider bg-[#E2A63C] text-[#241A12] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              🌱 Pre-Order • Growing
            </span>
          ) : item.lifecycleStatus === 'OFF_CYCLE' ? (
            <span className="font-mono-num text-[10px] font-bold uppercase tracking-wider bg-neutral-800/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              ❄️ Off-Season Cycle
            </span>
          ) : item.isMealCombo ? (
            <span className="font-mono-num text-[10px] font-bold uppercase tracking-wider bg-[#E2A63C] text-[#241A12] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              🍲 Meal Combo
            </span>
          ) : item.isWholesaleBulkAvailable ? (
            <span className="font-mono-num text-[10px] font-bold uppercase tracking-wider bg-[#4E8B3F] text-white px-2.5 py-0.5 rounded-full shadow-sm">
              Wholesale Lot
            </span>
          ) : (
            <span className="font-mono-num text-[10px] font-semibold tracking-wider bg-[#173A20]/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-full">
              🌱 Farm Direct
            </span>
          )}
          {item.isOrganic && (
            <span className="text-[10px] font-semibold bg-[#EEF8F1]/95 text-[#173A20] border border-[#CCEBD5] px-2 py-0.5 rounded-full">
              🌱 Organic
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          <h3 className="font-semibold text-[15px] text-[#241A12] line-clamp-1 group-hover:text-[#173A20] transition-colors">
            {item.title}
          </h3>

          {item.isMealCombo && item.comboItems && item.comboItems.length > 0 && (
            <p className="text-[11px] text-[#4E8B3F] font-medium mt-0.5 line-clamp-1">
              <strong className="text-[#173A20]">Kit:</strong> {item.comboItems.join(' • ')}
            </p>
          )}

          {/* Price Row */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono-num font-bold text-base text-[#173A20]">
              {formatXaf(displayPrice)}
            </span>
            <span className="text-xs text-[#5C5245] font-medium">
              / {String(item.unit || 'UNIT').replace('_', ' ')}
            </span>
            {item.oldPrice && (
              <span className="font-mono-num text-xs text-[#9C9284] line-through ml-auto">
                {formatXaf(item.oldPrice)}
              </span>
            )}
          </div>

          {/* Live Stock Quantity & Lifecycle Seasonality Status */}
          <div className="mt-2 flex items-center flex-wrap gap-1.5">
            {item.lifecycleStatus === 'GROWING' ? (
              <span className="text-[11px] font-semibold text-amber-800 bg-[#E2A63C]/15 border border-[#E2A63C]/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock size={11} className="text-[#E2A63C] shrink-0" />
                <span>Harvest: {item.expectedHarvestWindow || 'Coming Soon'}</span>
              </span>
            ) : item.lifecycleStatus === 'OFF_CYCLE' ? (
              <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span>Next Cycle: {item.nextCycleMonth || 'Next Season'}</span>
              </span>
            ) : (
              // SELLING (Default)
              (item.stockQuantity !== undefined && item.stockQuantity !== null) && (
                item.stockQuantity > 0 ? (
                  item.stockQuantity <= 5 ? (
                    <span className="text-[11px] font-bold font-mono-num text-[#B54A34] bg-[#B54A34]/10 border border-[#B54A34]/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Flame size={11} className="text-[#B54A34] shrink-0" />
                      <span>Only {item.stockQuantity} {String(item.unit || 'units').toLowerCase().replace('_', ' ')} left!</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium font-mono-num text-[#173A20] bg-[#EEF8F1] border border-[#CCEBD5] px-2 py-0.5 rounded-md flex items-center gap-1">
                      <PackageCheck size={11} className="text-[#4E8B3F] shrink-0" />
                      <span><strong className="font-bold">{item.stockQuantity}</strong> {String(item.unit || 'units').toLowerCase().replace('_', ' ')} in stock</span>
                    </span>
                  )
                ) : (
                  <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
                    Sold Out • Restocking
                  </span>
                )
              )
            )}
          </div>

          {/* Provenance / Farm / Store Location */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (isStoreOrigin && storeSlugOrId) {
                navigate(`/store/${storeSlugOrId}`);
              } else if (farmSlugOrId) {
                navigate(`/farm/${farmSlugOrId}`);
              }
            }}
            className="flex items-center gap-1 text-xs text-[#5C5245] hover:text-[#173A20] mt-1.5 cursor-pointer"
            title={isStoreOrigin ? 'View Store Profile' : 'View Farm Storefront'}
          >
            <MapPin size={12} className={isStoreOrigin ? 'text-[#E2A63C] shrink-0' : 'text-[#4E8B3F] shrink-0'} />
            <span className="truncate hover:underline">{provenanceLocation}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2.5 border-t border-[#EEF8F1] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 bg-[#EEF8F1] border border-[#CCEBD5] px-2 py-0.5 rounded-full">
              <Star size={11} className="text-[#E2A63C] fill-[#E2A63C]" />
              <span className="font-mono-num text-xs font-bold text-[#241A12]">
                {item.rating?.toFixed(1) ?? '4.9'}
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#4E8B3F]">
              <ShieldCheck size={12} /> Escrow
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleChat}
              title="Negotiate / Chat with Farmer"
              className="w-8 h-8 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-[#4E8B3F] hover:bg-[#4E8B3F] hover:text-white flex items-center justify-center transition"
            >
              <MessageCircle size={14} />
            </button>

            {item.lifecycleStatus === 'OFF_CYCLE' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`You will be notified when ${item.title} begins its next harvest cycle (${item.nextCycleMonth || 'next season'})!`);
                }}
                title="Join Harvest Waitlist"
                className="h-8 px-2.5 rounded-full font-semibold text-xs inline-flex items-center justify-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#241A12] border border-neutral-300 transition cursor-pointer shrink-0"
              >
                <Bell size={13} className="text-[#5C5245]" />
                <span className="hidden sm:inline">Waitlist</span>
              </button>
            ) : item.lifecycleStatus === 'GROWING' ? (
              <button
                type="button"
                onClick={handleAddToCart}
                title={justAdded ? 'Pre-Order Added' : 'Pre-Order Harvest'}
                className={`h-8 w-8 sm:w-auto px-0 sm:px-3 rounded-full font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 ${justAdded
                  ? 'bg-[#4E8B3F] text-white'
                  : 'bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12]'
                  }`}
              >
                {justAdded ? (
                  <>
                    <Check size={14} strokeWidth={2.6} />
                    <span className="hidden sm:inline">Reserved</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} strokeWidth={2.2} />
                    <span className="hidden sm:inline">Pre-Order</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                title={justAdded ? 'Added to Basket' : 'Add to Basket'}
                className={`h-8 w-8 sm:w-auto px-0 sm:px-3 rounded-full font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 ${justAdded
                  ? 'bg-[#4E8B3F] text-white'
                  : 'bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12]'
                  }`}
              >
                {justAdded ? (
                  <>
                    <Check size={14} strokeWidth={2.6} />
                    <span className="hidden sm:inline">Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} strokeWidth={2.2} />
                    <span className="hidden sm:inline">Basket</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldCard;

