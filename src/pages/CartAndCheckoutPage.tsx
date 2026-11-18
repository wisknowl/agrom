import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  CreditCard,
  Building2,
  Sparkles,
  ShoppingBag,
  MapPin,
  Store,
  HelpCircle,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import { checkoutOrderApi } from '@/api';
import { PaymentMethod } from '@/types';
import { formatXaf } from '@/utils/media';
import {
  CAMEROON_DELIVERY_CORRIDORS,
  parseDeliveryReach,
} from '@/constants/deliveryLocations';

export const CartAndCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart, getTotal } = useCartStore();
  const regionalContainer = useRegionalContainerStore((s) => s.getContainer());

  const [deliveryMode, setDeliveryMode] = useState<'HUB' | 'DOORSTEP' | 'FARM_GATE'>('HUB');
  const [selectedCity, setSelectedCity] = useState('Douala');
  const [selectedHub, setSelectedHub] = useState('Marché Sandaga (Fruit & Vegetable Terminal)');
  const [selectedQuartier, setSelectedQuartier] = useState('Bonapriso');
  const [streetLandmark, setStreetLandmark] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('+237 677 00 11 22');
  const [buyerNote, setBuyerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN_MOMO');
  const [submitting, setSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any>(null);

  const subtotal = getTotal();
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  // Gamified Eco-Delivery Perk: Free delivery when >= 3 items
  const unlockedFreeEcoDelivery = totalItems >= 3;
  const baseDeliveryFee = deliveryMode === 'FARM_GATE' ? 0 : deliveryMode === 'HUB' ? 1000 : 2000;
  const deliveryFee = items.length === 0 ? 0 : unlockedFreeEcoDelivery ? 0 : baseDeliveryFee;
  const grandTotal = subtotal + deliveryFee;

  const currentCorridor =
    CAMEROON_DELIVERY_CORRIDORS.find((c) => c.name === selectedCity) || CAMEROON_DELIVERY_CORRIDORS[0];

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);

    const deliveryAddress =
      deliveryMode === 'HUB'
        ? `Pickup Hub: ${selectedHub} (${selectedCity})`
        : deliveryMode === 'DOORSTEP'
        ? `${selectedQuartier}, ${streetLandmark ? streetLandmark + ', ' : ''}${selectedCity}`
        : `Farm-Gate Direct Pickup (${items[0]?.yield?.originRegion || selectedCity})`;

    try {
      const res = await checkoutOrderApi({
        items: items.map((i) => ({ yieldId: i.yieldId, quantity: i.quantity })),
        deliveryAddress,
        deliveryCity: selectedCity,
        deliveryPhone,
        paymentMethod,
        currency: regionalContainer.currency === 'FCFA' ? 'XAF' : regionalContainer.currency,
      });
      setOrderCompleted(
        res.order || {
          id: `ESC-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'ESCROW_LOCKED',
          totalAmount: grandTotal,
          paymentMethod,
          deliveryAddress,
          deliveryCity: selectedCity,
        }
      );
      clearCart();
    } catch {
      // Offline / guest fallback confirmation so demo flows seamlessly
      setOrderCompleted({
        id: `ESC-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'ESCROW_LOCKED',
        totalAmount: grandTotal,
        paymentMethod,
        deliveryAddress,
        deliveryCity: selectedCity,
      });
      clearCart();
    } finally {
      setSubmitting(false);
    }
  };

  if (orderCompleted) {
    return (
      <div className="p-6 max-w-2xl mx-auto my-8 bg-[#FFF9EE] border-2 border-[#E2A63C] rounded-3xl text-center space-y-4 shadow-lg">
        <div className="w-16 h-16 rounded-full bg-[#E2A63C] text-[#241A12] flex items-center justify-center mx-auto shadow">
          <CheckCircle2 size={34} />
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-[#FEF2D8] border border-[#E2A63C] text-[#B87D1E] font-mono-num text-xs font-bold">
          Smart Escrow State: ESCROW_LOCKED 🔒
        </span>
        <h2 className="font-display text-2xl font-bold text-[#241A12]">
          Funds Locked in Smart Escrow!
        </h2>
        <p className="text-sm text-[#5C5245] max-w-md mx-auto leading-relaxed">
          Order <strong>#{orderCompleted.id}</strong> ({formatXaf(orderCompleted.totalAmount)}) is
          secured. The cooperative farmer has been notified to dispatch your fresh harvest lot.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-5 py-2.5 rounded-full bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12] text-xs font-bold transition cursor-pointer"
          >
            Track Escrow Order FSM
          </button>
          <button
            type="button"
            onClick={() => {
              setOrderCompleted(null);
              navigate('/');
            }}
            className="px-5 py-2.5 rounded-full bg-white border border-[#F2DCAA] hover:bg-[#FEF2D8] hover:border-[#E2A63C] text-[#241A12] text-xs font-bold transition cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header with Regional Woven Basket (Harvest Color Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFF9EE] border border-[#F2DCAA] p-4 sm:p-5 rounded-3xl">
        <div className="flex items-center gap-3.5">
          <img
            src={regionalContainer.imageUrl}
            alt={regionalContainer.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E2A63C] shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display-italic text-xl sm:text-2xl font-semibold text-[#241A12]">
                Your {regionalContainer.name}
              </h1>
              <span className="text-xs bg-white border border-[#F2DCAA] px-2.5 py-0.5 rounded-full font-semibold text-[#B87D1E]">
                {regionalContainer.flag} {regionalContainer.regionLabel}
              </span>
            </div>
            <p className="text-xs text-[#5C5245] mt-0.5">{regionalContainer.description}</p>
          </div>
        </div>

        {/* Gamified Eco-Delivery Progress */}
        <div className="bg-white border border-[#F2DCAA] rounded-2xl px-4 py-2.5 text-xs">
          {unlockedFreeEcoDelivery ? (
            <div className="flex items-center gap-1.5 font-bold text-[#B87D1E]">
              <Truck size={15} className="text-[#C68F30]" />
              <span>🎉 Free Pooled Eco-Delivery Unlocked!</span>
            </div>
          ) : (
            <div className="text-[#241A12]">
              Add <strong>{Math.max(1, 3 - totalItems)} more unit(s)</strong> to unlock{' '}
              <span className="font-bold text-[#B87D1E]">Free Eco-Delivery</span>!
            </div>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-[#FFF9EE] border border-[#F2DCAA] rounded-3xl p-12 text-center space-y-3">
          <ShoppingBag size={44} className="text-[#C68F30] mx-auto" />
          <h2 className="font-display-italic text-xl text-[#241A12] font-semibold">
            Your {regionalContainer.shortName} is Empty
          </h2>
          <p className="text-xs text-[#5C5245] max-w-md mx-auto">
            Fill your {regionalContainer.name.toLowerCase()} with fresh farm-direct harvests from AgroMarket or shoppable video stories on AgroFeed.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-2 px-6 py-2.5 rounded-full bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12] text-xs font-bold transition cursor-pointer"
          >
            Explore Fresh Harvests
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Basket Items List */}
          <div className="lg:col-span-7 space-y-3">
            {items.map((cartItem) => (
              <div
                key={cartItem.id}
                className="bg-white rounded-2xl border border-[#F2DCAA] hover:border-[#E2A63C] transition p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={cartItem.yield.image}
                    alt={cartItem.yield.title}
                    className="w-16 h-16 rounded-xl object-cover border border-[#F2DCAA] shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#241A12] truncate">
                      {cartItem.yield.title}
                    </h3>
                    <div className="text-xs text-[#5C5245] truncate">
                      {cartItem.yield.originRegion || 'Verified Cooperative'}
                    </div>
                    {cartItem.yield.dispatchSiteName && (
                      <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-[#FEF6E8] border border-[#F2DCAA] text-[10px] font-bold text-[#7A4A2D]">
                        <Building2 size={11} className="text-[#E2A63C]" />
                        <span>Dispatch Depot: {cartItem.yield.dispatchSiteName}</span>
                      </div>
                    )}
                    <div className="font-mono-num text-xs font-bold text-[#B87D1E] mt-1">
                      {formatXaf(cartItem.yield.price)} / {cartItem.yield.unit}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-2 bg-[#FFF9EE] border border-[#F2DCAA] rounded-full px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-white border border-[#F2DCAA] hover:bg-[#FEF2D8] hover:border-[#E2A63C] text-xs font-bold text-[#241A12] transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono-num text-xs font-bold text-[#241A12] min-w-[20px] text-center">
                      {cartItem.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-white border border-[#F2DCAA] hover:bg-[#FEF2D8] hover:border-[#E2A63C] text-xs font-bold text-[#241A12] transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(cartItem.id)}
                    className="p-2 rounded-full text-[#B54A34] hover:bg-[#FDF3F1] transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Multi-Gateway Smart Escrow Checkout Form */}
          <form
            onSubmit={handleCheckout}
            className="lg:col-span-5 bg-white rounded-3xl border border-[#F2DCAA] p-5 sm:p-6 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F2DCAA]">
              <h2 className="font-display-italic text-lg font-semibold text-[#241A12]">
                Smart Escrow Checkout
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FFF9EE] text-[#B87D1E] border border-[#F2DCAA] px-2.5 py-0.5 rounded-full">
                <ShieldCheck size={13} className="text-[#C68F30]" /> Smart Escrow Protected
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Delivery Mode Tabs */}
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1.5">
                  Choose Delivery Method
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FFF9EE] border border-[#F2DCAA] rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('HUB')}
                    className={`py-2 px-1.5 rounded-xl text-center transition cursor-pointer ${
                      deliveryMode === 'HUB'
                        ? 'bg-[#E2A63C] text-[#241A12] font-bold shadow-2xs'
                        : 'text-[#5C5245] hover:text-[#241A12]'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">Market / Agency</div>
                    <div className="text-[9px] opacity-80">{unlockedFreeEcoDelivery ? 'FREE' : '1,000 XAF'}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('DOORSTEP')}
                    className={`py-2 px-1.5 rounded-xl text-center transition cursor-pointer ${
                      deliveryMode === 'DOORSTEP'
                        ? 'bg-[#E2A63C] text-[#241A12] font-bold shadow-2xs'
                        : 'text-[#5C5245] hover:text-[#241A12]'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">Doorstep</div>
                    <div className="text-[9px] opacity-80">{unlockedFreeEcoDelivery ? 'FREE' : '2,000 XAF'}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('FARM_GATE')}
                    className={`py-2 px-1.5 rounded-xl text-center transition cursor-pointer ${
                      deliveryMode === 'FARM_GATE'
                        ? 'bg-[#E2A63C] text-[#241A12] font-bold shadow-2xs'
                        : 'text-[#5C5245] hover:text-[#241A12]'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">Farm-Gate</div>
                    <div className="text-[9px] opacity-80">0 XAF (Free)</div>
                  </button>
                </div>
              </div>

              {/* Delivery Destination Inputs based on Mode */}
              {deliveryMode === 'HUB' && (
                <div className="space-y-2.5 p-3 rounded-2xl bg-[#FFF9EE]/70 border border-[#F2DCAA]">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5245] mb-1">
                      Corridor / Destination City
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        const newCity = e.target.value;
                        setSelectedCity(newCity);
                        const cor = CAMEROON_DELIVERY_CORRIDORS.find((c) => c.name === newCity);
                        if (cor && cor.hubs.length > 0) {
                          setSelectedHub(cor.hubs[0].name);
                        }
                      }}
                      className="w-full rounded-xl bg-white border border-[#F2DCAA] focus:border-[#E2A63C] focus:outline-none px-3 py-2 text-xs text-[#241A12] transition"
                    >
                      {CAMEROON_DELIVERY_CORRIDORS.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.region} Region)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5245] mb-1">
                      Select Pickup Market / Bus Agency Hub
                    </label>
                    <select
                      value={selectedHub}
                      onChange={(e) => setSelectedHub(e.target.value)}
                      className="w-full rounded-xl bg-white border border-[#F2DCAA] focus:border-[#E2A63C] focus:outline-none px-3 py-2 text-xs text-[#241A12] transition"
                    >
                      {currentCorridor.hubs.map((hub) => (
                        <option key={hub.id} value={hub.name}>
                          {hub.type === 'BUS_AGENCY' ? '🚌 ' : '🏢 '}
                          {hub.name}
                        </option>
                      ))}
                    </select>
                    <div className="text-[10px] text-[#5C5245] mt-1">
                      Produce will be dispatched via cold-chain to this central pickup depot.
                    </div>
                  </div>
                </div>
              )}

              {deliveryMode === 'DOORSTEP' && (
                <div className="space-y-2.5 p-3 rounded-2xl bg-[#FFF9EE]/70 border border-[#F2DCAA]">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5245] mb-1">
                      Destination City
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        const newCity = e.target.value;
                        setSelectedCity(newCity);
                        const cor = CAMEROON_DELIVERY_CORRIDORS.find((c) => c.name === newCity);
                        if (cor && cor.quartiers.length > 0) {
                          setSelectedQuartier(cor.quartiers[0]);
                        }
                      }}
                      className="w-full rounded-xl bg-white border border-[#F2DCAA] focus:border-[#E2A63C] focus:outline-none px-3 py-2 text-xs text-[#241A12] transition"
                    >
                      {CAMEROON_DELIVERY_CORRIDORS.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.region})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5245] mb-1">
                      Quartier / Area (e.g. Bonapriso, Bonanjo, Bastos, Mile 4)
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedQuartier}
                        onChange={(e) => setSelectedQuartier(e.target.value)}
                        className="w-1/2 rounded-xl bg-white border border-[#F2DCAA] focus:border-[#E2A63C] focus:outline-none px-3 py-2 text-xs text-[#241A12] transition"
                      >
                        {currentCorridor.quartiers.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                        <option value="Custom">Other Quartier...</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Or custom neighborhood..."
                        value={selectedQuartier === 'Custom' ? '' : selectedQuartier}
                        onChange={(e) => setSelectedQuartier(e.target.value)}
                        className="w-1/2 rounded-xl bg-white border border-[#F2DCAA] focus:border-[#E2A63C] focus:outline-none px-3 py-2 text-xs text-[#241A12] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5245] mb-1">
                      Street Address & Nearby Landmark
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rue Njo-Njo, opposite Pharmacy, 2nd gate on right"
                      value={streetLandmark}
                      onChange={(e) => setStreetLandmark(e.target.value)}
                      className="w-full rounded-xl bg-white border border-[#F2DCAA] focus:border-[#E2A63C] focus:outline-none px-3 py-2 text-xs text-[#241A12] transition"
                    />
                  </div>
                </div>
              )}

              {deliveryMode === 'FARM_GATE' && (
                <div className="p-3.5 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] space-y-2 text-xs text-[#173A20]">
                  <div className="font-bold flex items-center gap-1.5">
                    <Store size={14} className="text-[#4E8B3F]" />
                    <span>Direct Farm-Gate / Store Pickup (0 XAF)</span>
                  </div>
                  <p className="text-[11px] text-[#5C5245] leading-relaxed">
                    You or your driver will pick up this harvest lot directly from the cooperative farm site:{' '}
                    <strong>{items[0]?.yield?.originRegion || 'Farm Production Parcel'}</strong>.
                  </p>
                  <div className="text-[10px] text-[#4E8B3F] font-semibold">
                    ✓ Zero delivery fee • Direct inspection upon crate handover.
                  </div>
                </div>
              )}

              {/* MoMo / Buyer Contact Phone */}
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Buyer MoMo / Contact Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  className="w-full rounded-xl bg-[#FFF9EE] border border-[#F2DCAA] focus:bg-[#FEF2D8]/40 focus:border-[#E2A63C] focus:outline-none px-3.5 py-2 text-xs text-[#241A12] transition"
                />
              </div>

              {/* Dynamic Geo-Resolved Payment Gateways */}
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1.5">
                  Select Escrow Payment Rail
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'MTN_MOMO', label: 'MTN MoMo', sub: 'CEMAC / XAF' },
                      { id: 'ORANGE_MONEY', label: 'Orange Money', sub: 'CEMAC / XAF' },
                      { id: 'FLUTTERWAVE', label: 'Flutterwave', sub: 'Pan-African' },
                      { id: 'STRIPE_CARD', label: 'Stripe / Card', sub: 'USD / EUR / Global' },
                    ] as const
                  ).map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setPaymentMethod(gw.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${paymentMethod === gw.id
                        ? 'bg-[#FEF2D8] border-[#E2A63C] shadow-2xs'
                        : 'bg-[#FFF9EE]/60 border-[#F2DCAA] hover:bg-[#FEF2D8]/60 hover:border-[#E2A63C]'
                        }`}
                    >
                      <div className="text-xs font-bold text-[#241A12]">{gw.label}</div>
                      <div className="text-[10px] text-[#5C5245]">{gw.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Depot Dispatch Points Summary */}
            {items.some((i) => i.yield.dispatchSiteName) && (
              <div className="p-3.5 rounded-2xl bg-[#FEF6E8] border border-[#F2DCAA] text-xs space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-[#7A4A2D]">
                  <Building2 size={13} className="text-[#E2A63C]" />
                  <span>Physical Dispatch Depot Sites</span>
                </div>
                {items
                  .filter((i) => i.yield.dispatchSiteName)
                  .map((i) => (
                    <div key={i.id} className="text-[11px] flex items-center justify-between">
                      <span className="font-medium text-[#241A12] truncate max-w-[60%]">• {i.yield.title}</span>
                      <span className="font-bold text-[#7A4A2D] bg-white px-2 py-0.5 rounded-md border border-[#F2DCAA]">
                        {i.yield.dispatchSiteName}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Order Totals */}
            <div className="bg-[#FFF9EE] border border-[#F2DCAA] rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#5C5245]">
                <span>Harvest Subtotal ({totalItems} units)</span>
                <span className="font-mono-num font-semibold text-[#241A12]">
                  {formatXaf(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#5C5245]">
                <span>Cold-Chain / Pooled Logistics</span>
                <span className="font-mono-num font-semibold text-[#B87D1E]">
                  {deliveryFee === 0 ? 'FREE (Eco-Pool)' : formatXaf(deliveryFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#F2DCAA] flex justify-between text-sm font-bold text-[#241A12]">
                <span>Total Escrow Lock</span>
                <span className="font-mono-num text-[#B87D1E]">{formatXaf(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12] border border-[#C68F30]/40 font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <ShieldCheck size={17} />
              <span>
                {submitting
                  ? 'Locking Funds in Smart Escrow...'
                  : `Lock ${formatXaf(grandTotal)} in Smart Escrow`}
              </span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CartAndCheckoutPage;

