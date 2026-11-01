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
} from 'lucide-react';
import { Yield } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { FarmerBadge } from './MeetingLeafLogo';
import { formatXaf } from '@/utils/media';

interface YieldCardProps {
  item: Yield;
}

export const YieldCard: React.FC<YieldCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addToCart);
  const { toggleYield, isYieldFavorite } = useFavoritesStore();
  const isFavorite = isYieldFavorite(item.id);
  const [justAdded, setJustAdded] = useState(false);

  const farm = item.farm;
  const farmer = item.farmer || (farm as any)?.farmerProfile;
  const farmerUser = farmer?.user || (farm as any)?.user;
  const farmerTargetId = farmerUser?.id || (farm as any)?.userId || item.farmerId;
  const provenanceLocation =
    item.originRegion ||
    (farm?.name ? `${farm.name} • ${farm.city || farm.region}` : farm?.city || 'Cameroon');
  const creditTier = farmer?.creditTier || 'GOLD';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(item, 1);
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
          src={item.image}
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
          {item.isWholesaleBulkAvailable ? (
            <span className="font-mono-num text-[10px] font-bold uppercase tracking-wider bg-[#4E8B3F] text-white px-2.5 py-0.5 rounded-full shadow-sm">
              Wholesale Lot
            </span>
          ) : (
            <span />
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

          {/* Price Row */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono-num font-bold text-base text-[#173A20]">
              {formatXaf(item.price)}
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

          {/* Provenance / Farm Location */}
          <div className="flex items-center gap-1 text-xs text-[#5C5245] mt-1.5">
            <MapPin size={12} className="text-[#4E8B3F] shrink-0" />
            <span className="truncate">{provenanceLocation}</span>
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

            <button
              type="button"
              onClick={handleAddToCart}
              className={`h-8 px-3 rounded-full font-semibold text-xs inline-flex items-center gap-1.5 transition cursor-pointer ${justAdded
                  ? 'bg-[#4E8B3F] text-white'
                  : 'bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12]'
                }`}
            >
              {justAdded ? (
                <>
                  <Check size={13} strokeWidth={2.6} />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={13} strokeWidth={2.2} />
                  <span>Basket</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldCard;

