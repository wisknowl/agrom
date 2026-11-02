import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  Star,
  MessageCircle,
  Heart,
  Check,
  Truck,
  Sparkles,
  Warehouse,
  Store,
  Layers,
  Clock,
} from 'lucide-react';
import { fetchYieldByIdApi } from '@/api';
import { Yield } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import { FarmerBadge } from '@/components/MeetingLeafLogo';
import { formatXaf, resolveMediaUrl } from '@/utils/media';

export const YieldDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Yield | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const addToCart = useCartStore((s) => s.addToCart);
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const cartTotal = useCartStore((s) => s.getTotal());
  const regionalContainer = useRegionalContainerStore((s) => s.getContainer());
  const { toggleYield, isYieldFavorite } = useFavoritesStore();

  useEffect(() => {
    if (id) {
      fetchYieldByIdApi(id).then((data) => {
        setItem(data);
        setQuantity(data.minOrderQuantity && data.minOrderQuantity > 1 ? data.minOrderQuantity : 1);
      });
    }
  }, [id]);

  if (!item) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="h-96 rounded-3xl bg-[#EEF8F1] border border-[#CCEBD5] animate-pulse" />
      </div>
    );
  }

  const isBulkActive =
    Boolean(item.isWholesaleBulkAvailable) &&
    Boolean(item.bulkMinQuantity) &&
    quantity >= (item.bulkMinQuantity || 10);

  const unitPrice = isBulkActive && item.bulkPricePerUnit ? item.bulkPricePerUnit : item.price;
  const totalPrice = unitPrice * quantity;
  const creditTier = item.farmer?.creditTier || 'GOLD';

  // Parse Agro Info badges from description
  let cleanDescription = item.description || '';
  const agroDetails: Record<string, string> = {};
  const agroMatch = cleanDescription.match(/\[Agro Info:\s*([^\]]+)\]/i);
  if (agroMatch) {
    const parts = agroMatch[1].split('•');
    parts.forEach((p) => {
      const [k, v] = p.split(':').map((s) => s.trim());
      if (k && v) {
        agroDetails[k.toLowerCase()] = v;
      }
    });
    cleanDescription = cleanDescription.replace(agroMatch[0], '').trim();
  }

  const mediaList =
    item.mediaUrls && item.mediaUrls.length > 0
      ? item.mediaUrls.map((u) => resolveMediaUrl(u) || u)
      : item.image
        ? [resolveMediaUrl(item.image) || item.image]
        : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'];

  const farmer = item.farmer || (item.farm as any)?.farmerProfile;
  const farmerUser = farmer?.user || (item.farm as any)?.user;
  const farmerTargetId = farmerUser?.id || (item.farm as any)?.userId || item.farmerId;

  const handleAdd = () => {
    addToCart({ ...item, price: unitPrice }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const minAllowedQty = isBulkActive ? (item.bulkMinQuantity || 10) : (item.minOrderQuantity || 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-xs font-semibold text-[#173A20] hover:border-[#4E8B3F] transition cursor-pointer"
      >
        <ArrowLeft size={15} />
        <span>Back to AgroMarket</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-[#CCEBD5] p-4 sm:p-6 shadow-xs">
        {/* Left Image Stage & Producer Info */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#EEF8F1] border border-[#CCEBD5]">
            <img
              src={mediaList[activeImageIdx] || mediaList[0]}
              alt={item.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-3 left-3">
              <FarmerBadge tier={creditTier} label={`${creditTier} Producer`} size="md" />
            </div>
            <button
              type="button"
              onClick={() => toggleYield(item.id)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 border border-[#CCEBD5] flex items-center justify-center cursor-pointer shadow-xs"
            >
              <Heart
                size={18}
                className={
                  isYieldFavorite(item.id)
                    ? 'fill-[#B54A34] text-[#B54A34]'
                    : 'text-[#241A12]'
                }
              />
            </button>
          </div>

          {/* Multiple Image Thumbnails */}
          {mediaList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {mediaList.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                    activeImageIdx === idx
                      ? 'border-[#E2A63C] ring-2 ring-[#E2A63C]/30'
                      : 'border-[#CCEBD5] hover:border-[#4E8B3F]'
                  }`}
                >
                  <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Producer & Farm Origin Section (Reconciled with Mobile) */}
          <div className="p-4 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#173A20] uppercase tracking-wide">Producer & Farm Origin</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4E8B3F] bg-white px-2 py-0.5 rounded-full border border-[#CCEBD5]">
                <ShieldCheck size={13} />
                <span>Verified Smallholder</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={
                  resolveMediaUrl(item.farm?.coverPhoto || item.farmer?.coverPhoto || farmerUser?.avatarUrl) ||
                  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500'
                }
                alt={item.farm?.name || 'Farm'}
                className="w-12 h-12 rounded-xl object-cover border border-[#CCEBD5] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[#173A20] truncate">
                  {item.farm?.name || item.farmer?.farmName || 'Highland Cooperative'}
                </div>
                <div className="text-xs text-[#5C5245] truncate">
                  📍 {item.farm?.city || 'Foumbot'}, {item.farm?.region || 'West Region'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-[#CCEBD5]/60">
              <button
                type="button"
                onClick={() => navigate(`/inbox?userId=${farmerTargetId}`)}
                className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#CCEBD5] hover:border-[#4E8B3F] text-xs font-semibold text-[#173A20] inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <MessageCircle size={14} className="text-[#4E8B3F]" />
                <span>Chat with Farmer</span>
              </button>
              {(item.farmId || item.farm?.id) && (
                <button
                  type="button"
                  onClick={() => navigate(`/farm/${item.farmId || item.farm?.id}`)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#173A20] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 hover:bg-[#122e19] transition cursor-pointer"
                >
                  <Store size={14} className="text-[#E2A63C]" />
                  <span>Visit Farm Page</span>
                </button>
              )}
            </div>
          </div>

          {/* Smart Escrow Protection Notice */}
          <div className="bg-[#FEF7EE] border border-[#F7D9A4] rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck size={22} className="text-[#E2A63C] shrink-0 mt-0.5" />
            <div className="text-xs text-[#241A12] space-y-0.5">
              <div className="font-bold text-[#8D5B28]">
                Smart Escrow Protection
              </div>
              <p className="text-[#5C5245] leading-relaxed">
                Your payment is held safely in escrow and only released to the farm after you inspect and confirm fresh harvest delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Right Details & Order Controls */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-xs font-semibold text-[#4E8B3F]">
                {typeof item.category === 'object' ? item.category?.name : item.category || 'Fresh Harvest'}
              </span>
              {item.isOrganic && (
                <span className="px-3 py-1 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-xs font-semibold text-[#173A20]">
                  🌱 Certified Organic
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-mono-num font-bold text-[#241A12] ml-auto">
                <Star size={14} className="fill-[#E2A63C] text-[#E2A63C]" />
                {item.rating?.toFixed(1) || '4.9'}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#241A12]">
              {item.title}
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-[#5C5245]">
              <MapPin size={14} className="text-[#4E8B3F]" />
              <span>{item.originRegion || item.farm?.location || 'Cameroon Highlands'}</span>
              <span>•</span>
              <span className="font-mono-num text-[#4E8B3F] font-semibold">
                {item.stockQuantity || 48} {item.unit}s available today
              </span>
            </div>

            <p className="text-sm text-[#241A12]/90 leading-relaxed pt-1">
              {cleanDescription || 'Freshly harvested produce directly from verified highland farms.'}
            </p>

            {/* Harvest Specifications Grid (Reconciled with Mobile) */}
            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-bold text-[#173A20] uppercase tracking-wide">Harvest Specifications</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-[#EEF8F1] border border-[#CCEBD5]">
                  <div className="text-[10px] text-[#5C5245] font-medium">Packaging Unit</div>
                  <div className="text-xs font-bold text-[#173A20]">{item.unit}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#EEF8F1] border border-[#CCEBD5]">
                  <div className="text-[10px] text-[#5C5245] font-medium">Min Order (MOQ)</div>
                  <div className="text-xs font-bold text-[#173A20]">{item.minOrderQuantity || 1} {item.unit}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FEF7EE] border border-[#F7D9A4]">
                  <div className="text-[10px] text-[#8D5B28] font-medium">Harvest Season</div>
                  <div className="text-xs font-bold text-[#8D5B28]">{agroDetails['season'] || item.seasonality || 'Peak Harvest'}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#EEF8F1] border border-[#CCEBD5]">
                  <div className="text-[10px] text-[#5C5245] font-medium">Shelf-Life</div>
                  <div className="text-xs font-bold text-[#173A20]">{agroDetails['shelf life'] || (item.shelfLifeDays ? `${item.shelfLifeDays} days` : '7–14 days')}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#EEF8F1] border border-[#CCEBD5]">
                  <div className="text-[10px] text-[#5C5245] font-medium">Farming Standard</div>
                  <div className="text-xs font-bold text-[#4E8B3F]">{item.isOrganic ? '🌱 Certified Organic' : '✓ GAP Verified'}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#EEF8F1] border border-[#CCEBD5]">
                  <div className="text-[10px] text-[#5C5245] font-medium">Available Stock</div>
                  <div className="text-xs font-bold text-[#173A20]">{item.stockQuantity || 48} {item.unit}s</div>
                </div>
              </div>
            </div>

            {/* Retail vs Wholesale Pricing Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div
                onClick={() => setQuantity(item.minOrderQuantity || 1)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  !isBulkActive
                    ? 'bg-[#EEF8F1] border-[#4E8B3F] ring-1 ring-[#4E8B3F]'
                    : 'bg-white border-[#CCEBD5] hover:border-[#4E8B3F]'
                }`}
              >
                <div className="text-xs font-semibold text-[#5C5245]">Standard Retail Price</div>
                <div className="font-mono-num text-xl font-bold text-[#173A20] mt-0.5">
                  {formatXaf(item.price)}{' '}
                  <span className="text-xs font-normal">/ {item.unit}</span>
                </div>
              </div>

              {item.isWholesaleBulkAvailable && item.bulkPricePerUnit && (
                <div
                  onClick={() => setQuantity(item.bulkMinQuantity || 10)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                    isBulkActive
                      ? 'bg-[#FEF7EE] border-[#E2A63C] ring-1 ring-[#E2A63C]'
                      : 'bg-white border-[#CCEBD5] hover:border-[#E2A63C]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8D5B28]">
                      Buyam-Sellam Wholesale
                    </span>
                    <span className="text-[10px] font-mono-num bg-[#E2A63C] text-[#241A12] font-bold px-2 py-0.5 rounded-full">
                      Min {item.bulkMinQuantity} {item.unit}s
                    </span>
                  </div>
                  <div className="font-mono-num text-xl font-bold text-[#173A20] mt-0.5">
                    {formatXaf(item.bulkPricePerUnit)}{' '}
                    <span className="text-xs font-normal">/ {item.unit}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-[#CCEBD5]">
            <div className="flex items-center justify-between bg-[#FEF7EE] border border-[#F7D9A4] p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(minAllowedQty, q - 1))}
                  className="w-9 h-9 rounded-full bg-white border border-[#F7D9A4] font-bold text-base text-[#8D5B28] hover:border-[#E2A63C] cursor-pointer shadow-2xs"
                >
                  -
                </button>
                <span className="font-mono-num font-bold text-base text-[#8D5B28] min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-full bg-white border border-[#F7D9A4] font-bold text-base text-[#8D5B28] hover:border-[#E2A63C] cursor-pointer shadow-2xs"
                >
                  +
                </button>
                <span className="text-xs text-[#8D5B28] font-medium">{item.unit}(s)</span>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-[#5C5245]">Total Lot Value</div>
                <div className="font-mono-num font-bold text-lg text-[#173A20]">
                  {formatXaf(totalPrice)}
                </div>
              </div>
            </div>

            {/* Clean, un-cramped Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <button
                type="button"
                onClick={handleAdd}
                className="sm:col-span-6 py-3.5 px-4 rounded-full bg-[#E2A63C] hover:bg-[#C68F30] border border-[#C68F30]/40 text-[#241A12] font-bold text-sm inline-flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                {added ? <Check size={18} strokeWidth={2.5} /> : <ShoppingBag size={18} strokeWidth={2.2} />}
                <span>{added ? 'Added to Basket!' : 'Add to Basket'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart({ ...item, price: unitPrice }, quantity);
                  navigate('/cart');
                }}
                className="sm:col-span-4 py-3.5 px-4 rounded-full bg-[#173A20] hover:bg-[#122e19] text-white font-bold text-sm inline-flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <ShieldCheck size={16} className="text-[#E2A63C]" />
                <span>Escrow Buy</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/inbox?userId=${farmerTargetId}`)}
                className="sm:col-span-2 py-3.5 px-3 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] hover:border-[#4E8B3F] text-[#173A20] font-semibold text-xs inline-flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <MessageCircle size={15} className="text-[#4E8B3F]" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Regional Basket Bar when items exist */}
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

export default YieldDetailPage;


