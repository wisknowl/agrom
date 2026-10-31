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
} from 'lucide-react';
import { fetchYieldByIdApi } from '@/api';
import { Yield } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { FarmerBadge } from '@/components/MeetingLeafLogo';
import { formatXaf } from '@/utils/media';

export const YieldDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Yield | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = useCartStore((s) => s.addToCart);
  const { toggleYield, isYieldFavorite } = useFavoritesStore();

  useEffect(() => {
    if (id) {
      fetchYieldByIdApi(id).then((data) => {
        setItem(data);
        setQuantity(data.minOrderQuantity || 1);
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

  const handleAdd = () => {
    addToCart({ ...item, price: unitPrice }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

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
        {/* Left Image Stage */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#EEF8F1] border border-[#CCEBD5]">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3">
              <FarmerBadge tier={creditTier} label={`${creditTier} Producer`} size="md" />
            </div>
            <button
              type="button"
              onClick={() => toggleYield(item.id)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 border border-[#CCEBD5] flex items-center justify-center cursor-pointer"
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

          {/* Escrow Protection Notice */}
          <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck size={22} className="text-[#4E8B3F] shrink-0 mt-0.5" />
            <div className="text-xs text-[#241A12] space-y-0.5">
              <div className="font-bold text-[#173A20]">
                Engine 3 Multi-Party Smart Escrow Protection
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

            <p className="text-sm text-[#241A12]/90 leading-relaxed pt-1">{item.description}</p>

            {/* Retail vs Wholesale Pricing Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div
                onClick={() => setQuantity(1)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  !isBulkActive
                    ? 'bg-[#EEF8F1] border-[#4E8B3F]'
                    : 'bg-white border-[#CCEBD5]'
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
                      ? 'bg-[#FEF6E8] border-[#E2A63C]'
                      : 'bg-white border-[#CCEBD5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A5F1C]">
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
            <div className="flex items-center justify-between bg-[#EEF8F1] border border-[#CCEBD5] p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full bg-white border border-[#CCEBD5] font-bold text-base text-[#241A12] hover:border-[#4E8B3F] cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono-num font-bold text-base text-[#241A12] min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-full bg-white border border-[#CCEBD5] font-bold text-base text-[#241A12] hover:border-[#4E8B3F] cursor-pointer"
                >
                  +
                </button>
                <span className="text-xs text-[#5C5245] font-medium">{item.unit}(s)</span>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-[#5C5245]">Total Lot Value</div>
                <div className="font-mono-num font-bold text-lg text-[#173A20]">
                  {formatXaf(totalPrice)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-3.5 px-5 rounded-full bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12] font-bold text-sm inline-flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {added ? <Check size={18} /> : <ShoppingBag size={18} />}
                <span>{added ? 'Added to Regional Basket!' : 'Add to Harvest Basket'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart({ ...item, price: unitPrice }, quantity);
                  navigate('/cart');
                }}
                className="py-3.5 px-5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ShieldCheck size={17} />
                <span>Escrow Checkout</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/inbox?userId=${item.farmerId}`)}
                className="py-3.5 px-4 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] hover:border-[#4E8B3F] text-[#173A20] font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle size={16} className="text-[#4E8B3F]" />
                <span>Negotiate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldDetailPage;

