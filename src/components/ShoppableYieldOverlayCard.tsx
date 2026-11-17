import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, Bell, Sprout, Sparkles } from 'lucide-react';
import { AgroYield } from '../types';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { toast } from '../store/toastStore';
import { joinProduceWaitlistApi } from '../api';
import { resolveMediaUrl } from '../utils/media';
import { playNotificationChime } from '../utils/notification';

interface ShoppableYieldOverlayCardProps {
  yieldItem: AgroYield;
  onBeforeNavigate?: () => void;
}

export const ShoppableYieldOverlayCard: React.FC<ShoppableYieldOverlayCardProps> = ({
  yieldItem,
  onBeforeNavigate
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const addToCart = useCartStore((state) => state.addToCart);

  const isOwnProduce = Boolean(
    user &&
    (yieldItem.farmerId === user.id ||
      (yieldItem as any).farmer?.id === user.id ||
      (user.farms &&
        user.farms.some(
          (f: any) => f.id === yieldItem.farmId || f.id === (yieldItem as any).farm?.id
        )))
  );

  const isGrowing = yieldItem.lifecycleStatus === 'GROWING';
  const isOffCycle = yieldItem.lifecycleStatus === 'OFF_CYCLE';

  const rawPrice = yieldItem.price ?? (yieldItem as any).pricePerUnit ?? 0;
  const numericPrice = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice) || 0;
  const unitLabel = yieldItem.unit || 'Unit';
  const imageUri = resolveMediaUrl(
    yieldItem.image || (yieldItem.mediaUrls && yieldItem.mediaUrls[0]) || ''
  );

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBeforeNavigate) onBeforeNavigate();
    navigate(`/yield/${yieldItem.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(yieldItem, 1);
    toast.success(`Added ${yieldItem.title} to your basket!`, 'Added to Basket');
  };

  const handleWaitlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      if (onBeforeNavigate) onBeforeNavigate();
      navigate(`/yield/${yieldItem.id}`);
      return;
    }

    try {
      await joinProduceWaitlistApi(yieldItem.id);
      playNotificationChime();
      toast.success(
        `You joined the waitlist for ${yieldItem.title}! We'll notify you when harvest begins.`,
        'Waitlist Subscribed'
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to join harvest waitlist.');
    }
  };

  const handleManageCrop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBeforeNavigate) onBeforeNavigate();
    navigate('/farmer/manage');
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white/95 backdrop-blur-md rounded-full py-1.5 px-3 border border-[#CCEBD5] shadow-lg flex items-center justify-between gap-2.5 max-w-[320px] transition hover:shadow-xl hover:bg-white cursor-pointer select-none"
    >
      {/* Produce Info & Circular Thumbnail */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#FAFBF9] border border-[#CCEBD5] shrink-0 flex items-center justify-center">
          {imageUri ? (
            <img
              src={imageUri}
              alt={yieldItem.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <Sparkles size={14} className="text-[#E2A63C]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#173A20] truncate max-w-[130px]">
              {yieldItem.title}
            </span>
            {isGrowing && (
              <span className="bg-[#FEF2D8] text-[#B87D1E] text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                Growing
              </span>
            )}
            {isOffCycle && (
              <span className="bg-[#F3F4F6] text-[#6B7280] text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                Off-Season
              </span>
            )}
          </div>

          <div className="text-xs font-bold font-mono text-[#4E8B3F] leading-tight">
            {numericPrice.toLocaleString()} XAF
            <span className="text-[10px] text-gray-500 font-normal"> / {unitLabel}</span>
          </div>

          {isGrowing && yieldItem.expectedHarvestWindow ? (
            <div className="text-[9.5px] text-[#B87D1E] font-medium truncate leading-tight">
              Harvest: {yieldItem.expectedHarvestWindow}
            </div>
          ) : isOffCycle && yieldItem.nextCycleMonth ? (
            <div className="text-[9.5px] text-gray-500 font-medium truncate leading-tight">
              Next: {yieldItem.nextCycleMonth}
            </div>
          ) : null}
        </div>
      </div>

      {/* Action Button: Matched to Mobile Parity */}
      {isOwnProduce ? (
        <button
          type="button"
          onClick={handleManageCrop}
          className="flex items-center gap-1 bg-[#EEF8F1] hover:bg-[#CCEBD5] text-[#173A20] text-[10.5px] font-bold px-2.5 py-1.5 rounded-full border border-[#CCEBD5] transition shrink-0 cursor-pointer"
          title="Manage your produce in Farm Management"
        >
          <Sprout size={12} className="text-[#4E8B3F]" />
          <span>Your Crop</span>
        </button>
      ) : isOffCycle ? (
        <button
          type="button"
          onClick={handleWaitlist}
          className="flex items-center gap-1 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#241A12] text-[10.5px] font-bold px-2.5 py-1.5 rounded-full border border-[#E5E7EB] transition shrink-0 cursor-pointer"
          title="Join harvest waitlist"
        >
          <Bell size={12} className="text-[#5C5245]" />
          <span>Waitlist</span>
        </button>
      ) : isGrowing ? (
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex items-center gap-1 bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12] text-[10.5px] font-bold px-2.5 py-1.5 rounded-full shadow-xs transition shrink-0 cursor-pointer"
          title="Pre-order harvest"
        >
          <Clock size={12} />
          <span>Pre-Order</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex items-center gap-1 bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12] text-[10.5px] font-bold px-2.5 py-1.5 rounded-full shadow-xs transition shrink-0 cursor-pointer"
          title="Add to basket"
        >
          <ShoppingBag size={12} />
          <span>Add</span>
        </button>
      )}
    </div>
  );
};

export default ShoppableYieldOverlayCard;

