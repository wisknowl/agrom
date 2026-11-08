import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Star,
  Package,
  Plus,
  Store,
  Warehouse,
  Snowflake,
  Building2,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchStoreByIdApi, createYieldApi } from '@/api';
import YieldCard from '@/components/YieldCard';
import { resolveMediaUrl, formatXaf } from '@/utils/media';

export const StoreStorefrontPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'sites' | 'about'>('inventory');
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick produce listing modal for store owner
  const [showAddLotModal, setShowAddLotModal] = useState(false);
  const [lotTitle, setLotTitle] = useState('');
  const [lotPrice, setLotPrice] = useState('');
  const [lotBulkPrice, setLotBulkPrice] = useState('');
  const [lotBulkMin, setLotBulkMin] = useState('10');
  const [lotUnit, setLotUnit] = useState('CRATE');
  const [lotStock, setLotStock] = useState('50');
  const [lotCategory, setLotCategory] = useState('Highland Vegetables');
  const [lotSiteId, setLotSiteId] = useState('');
  const [submittingLot, setSubmittingLot] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchStoreByIdApi(id)
      .then((data) => {
        setStore(data);
      })
      .catch(() => {
        setStore(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = Boolean(
    store?.isOwner || (user?.id && store?.userId && user.id === store.userId)
  );

  const handleShareClick = () => {
    const fullUrl = window.location.href;
    if (navigator.share) {
      navigator.share({ title: store?.name || 'AgroStore Depot', url: fullUrl }).catch(() => null);
    } else {
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAddLotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id || !lotTitle.trim()) return;
    setSubmittingLot(true);
    try {
      await createYieldApi({
        title: lotTitle.trim(),
        pricePerUnit: Number(lotPrice || 12000),
        unit: lotUnit,
        stockQuantity: Number(lotStock || 50),
        categoryName: lotCategory,
        isOrganic: false,
        storeId: store.id,
        storeSiteId: lotSiteId || (store.sites?.[0]?.id || undefined),
        isWholesaleBulkAvailable: true,
        bulkPricePerUnit: lotBulkPrice ? Number(lotBulkPrice) : undefined,
        bulkMinQuantity: lotBulkMin ? Number(lotBulkMin) : 10,
        sourceType: 'STORE',
      });
      setShowAddLotModal(false);
      setLotTitle('');
      setLotPrice('');
      setLotBulkPrice('');
      // Refresh store data
      const refreshed = await fetchStoreByIdApi(store.slug || store.id);
      setStore(refreshed);
    } catch (err: any) {
      alert(err.message || 'Could not list wholesale lot');
    } finally {
      setSubmittingLot(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-96 rounded-3xl bg-[#EEF8F1] border border-[#CCEBD5] animate-pulse" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F] mx-auto">
          <Store size={32} />
        </div>
        <h2 className="font-display-italic text-2xl font-bold text-[#173A20]">AgroStore Depot Not Found</h2>
        <p className="text-sm text-[#5C5245]">
          The store or commercial depot you are looking for does not exist or may have been renamed.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-full bg-[#4E8B3F] text-white text-xs font-bold hover:bg-[#3D7030] cursor-pointer"
        >
          ← Return to AgroMarket
        </button>
      </div>
    );
  }

  const storeYields = (store.yields || []).map((y: any) => ({
    ...y,
    price: Number(y.price !== undefined ? y.price : (y.pricePerUnit || 0)),
    pricePerUnit: Number(y.pricePerUnit !== undefined ? y.pricePerUnit : (y.price || 0)),
    image: resolveMediaUrl(y.image || y.mediaUrls?.[0]) || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
    mediaUrls: y.mediaUrls?.length ? y.mediaUrls : [y.image].filter(Boolean),
  }));

  const ownerAvatar =
    store.avatarPhoto ||
    store.user?.avatarUrl ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';

  const sitesList: any[] = Array.isArray(store.sites) ? store.sites : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Floating Nav */}
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#173A20] hover:border-[#4E8B3F] transition cursor-pointer"
          title="Go Back"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              type="button"
              onClick={() => navigate('/store')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-[#173A20] text-xs font-bold hover:bg-[#CCEBD5] transition cursor-pointer"
            >
              <Settings size={14} className="text-[#4E8B3F]" />
              <span>Depot Management</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShareClick}
            className="w-10 h-10 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#173A20] hover:border-[#4E8B3F] transition cursor-pointer relative"
            title="Share Store Depot"
          >
            {copiedLink ? <Check size={16} className="text-[#4E8B3F]" /> : <Share2 size={16} />}
          </button>
        </div>
      </div>

      {/* Hero Cover Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#CCEBD5] shadow-xs bg-[#173A20]">
        <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full bg-[#EEF8F1] overflow-hidden">
          <img
            src={resolveMediaUrl(store.coverPhoto || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000')}
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="shrink-0 relative">
                <img
                  src={resolveMediaUrl(ownerAvatar)}
                  alt="Store depot avatar"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#4E8B3F] shadow-md"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display-italic text-2xl sm:text-3xl font-extrabold text-white drop-shadow-sm">
                    {store.name}
                  </h1>
                  <span className="flex items-center gap-1 bg-[#4E8B3F] text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <ShieldCheck size={12} strokeWidth={2.5} />
                    Verified Depot
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-200 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin size={13} className="text-[#CCEBD5]" />
                    {store.marketZone ? `${store.marketZone}, ` : ''}{store.city}, {store.region}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-[#CCEBD5] font-semibold">
                    {store.storeType?.replace('_', ' ') || 'WHOLESALE DEPOT'}
                  </span>
                  {store.slug && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="font-mono text-xs text-[#CCEBD5]">
                        agrom.market/store/{store.slug}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => setShowAddLotModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4E8B3F] text-white text-xs font-bold hover:bg-[#3D7030] transition shadow-md cursor-pointer"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  <span>List Store Produce</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const merchantId = store.userId || store.user?.id;
                    if (merchantId) {
                      navigate(`/inbox?partnerId=${merchantId}&storeId=${store.id}&title=${encodeURIComponent(store.name)}`);
                    } else {
                      alert('Store merchant contact currently unavailable');
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4E8B3F] text-white text-xs font-bold hover:bg-[#3D7030] transition shadow-md cursor-pointer"
                >
                  <MessageCircle size={14} />
                  <span>Contact Merchant</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Linked Farm Banner (if aggregated with a registered farm) */}
      {store.linkedFarm && (
        <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#CCEBD5] flex items-center justify-center text-[#173A20] font-bold shrink-0">
              <Warehouse size={18} />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#4E8B3F] uppercase tracking-wider">
                Direct Cooperative Supply Link
              </div>
              <div className="text-sm font-bold text-[#173A20]">
                Aggregated from {store.linkedFarm.name}
              </div>
            </div>
          </div>
          <Link
            to={`/farm/${store.linkedFarm.slug || store.linkedFarm.id}`}
            className="flex items-center gap-1 text-xs font-bold text-[#4E8B3F] hover:text-[#173A20] bg-white px-3 py-1.5 rounded-lg border border-[#CCEBD5] transition"
          >
            <span>View Farm Page</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      )}

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-[#CCEBD5] p-3.5 text-center shadow-2xs">
          <div className="text-[11px] font-semibold text-[#5C5245] uppercase tracking-wider flex items-center justify-center gap-1">
            <Warehouse size={13} className="text-[#4E8B3F]" />
            Depot Capacity
          </div>
          <div className="font-display-italic text-lg font-bold text-[#173A20] mt-0.5">
            {store.storageCapacityTons || 5} Tons
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#CCEBD5] p-3.5 text-center shadow-2xs">
          <div className="text-[11px] font-semibold text-[#5C5245] uppercase tracking-wider flex items-center justify-center gap-1">
            <Snowflake size={13} className={store.hasColdStorage ? 'text-blue-600' : 'text-gray-400'} />
            Cold Storage
          </div>
          <div className="font-display-italic text-lg font-bold text-[#173A20] mt-0.5">
            {store.hasColdStorage ? 'Equipped ❄️' : 'Ambient Shed'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#CCEBD5] p-3.5 text-center shadow-2xs">
          <div className="text-[11px] font-semibold text-[#5C5245] uppercase tracking-wider flex items-center justify-center gap-1">
            <Package size={13} className="text-[#4E8B3F]" />
            Active Lots
          </div>
          <div className="font-display-italic text-lg font-bold text-[#173A20] mt-0.5">
            {storeYields.length} Stocked
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#CCEBD5] p-3.5 text-center shadow-2xs">
          <div className="text-[11px] font-semibold text-[#5C5245] uppercase tracking-wider flex items-center justify-center gap-1">
            <Star size={13} className="text-amber-500 fill-amber-500" />
            Depot Rating
          </div>
          <div className="font-display-italic text-lg font-bold text-[#173A20] mt-0.5">
            5.0 ★
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-[#CCEBD5] gap-8">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'inventory'
              ? 'border-[#4E8B3F] text-[#173A20]'
              : 'border-transparent text-[#5C5245] hover:text-[#173A20]'
          }`}
        >
          <Package size={16} />
          <span>Depot Inventory ({storeYields.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sites')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'sites'
              ? 'border-[#4E8B3F] text-[#173A20]'
              : 'border-transparent text-[#5C5245] hover:text-[#173A20]'
          }`}
        >
          <Building2 size={16} />
          <span>Dispatch Hubs & Docks ({sitesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'about'
              ? 'border-[#4E8B3F] text-[#173A20]'
              : 'border-transparent text-[#5C5245] hover:text-[#173A20]'
          }`}
        >
          <Store size={16} />
          <span>About & Trade Credentials</span>
        </button>
      </div>

      {/* Tab 1: Inventory & Lots */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {storeYields.length === 0 ? (
            <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-3xl p-12 text-center space-y-3">
              <Package size={36} className="text-[#4E8B3F] mx-auto" />
              <h3 className="font-display-italic text-lg font-bold text-[#173A20]">
                No Produce Stocked in this Depot Yet
              </h3>
              <p className="text-xs text-[#5C5245] max-w-md mx-auto">
                This commercial store has registered dispatch sites but has not yet listed active produce lots.
              </p>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setShowAddLotModal(true)}
                  className="px-5 py-2 rounded-full bg-[#4E8B3F] text-white text-xs font-bold hover:bg-[#3D7030] transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>List First Wholesale Lot</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {storeYields.map((yieldItem: any) => (
                <YieldCard key={yieldItem.id} item={yieldItem} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Dispatch Sites */}
      {activeTab === 'sites' && (
        <div className="space-y-4">
          {sitesList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#CCEBD5] p-8 text-center text-[#5C5245] text-sm">
              No specific dispatch sheds registered. Pickups operate from the main market zone.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sitesList.map((site: any, idx: number) => (
                <div
                  key={site.id || idx}
                  className="bg-white rounded-2xl border border-[#CCEBD5] p-5 space-y-3 shadow-2xs hover:border-[#4E8B3F] transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F]">
                        {site.facilityType === 'COLD_ROOM' ? <Snowflake size={16} /> : <Warehouse size={16} />}
                      </div>
                      <h4 className="font-bold text-sm text-[#173A20]">{site.name || `Shed #${idx + 1}`}</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF8F1] text-[#173A20] border border-[#CCEBD5]">
                      {site.facilityType?.replace('_', ' ') || 'AMBIENT SHED'}
                    </span>
                  </div>

                  <div className="text-xs text-[#5C5245] space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#4E8B3F]" />
                      <span>{site.location || store.marketZone || store.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Warehouse size={13} className="text-[#4E8B3F]" />
                      <span>Storage Capacity: {site.capacityTons || 2.5} Tons</span>
                    </div>
                    {site.operatingHours && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#5C5245]">
                        <span>Hours: {site.operatingHours}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: About & Verification */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-[#CCEBD5] p-6 space-y-3 shadow-2xs">
              <h3 className="font-bold text-base text-[#173A20]">Depot Overview</h3>
              <p className="text-sm text-[#5C5245] leading-relaxed whitespace-pre-line">
                {store.description ||
                  'Commercial agricultural depot providing bulk storage, aggregation, and wholesale dispatch for local farmers and urban buyers.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#CCEBD5] p-6 space-y-3 shadow-2xs">
              <h3 className="font-bold text-base text-[#173A20]">Physical Location & Pickup Instructions</h3>
              <div className="text-sm text-[#5C5245] space-y-2">
                <p>
                  <strong>Market Zone:</strong> {store.marketZone || 'Central Agricultural Market'}
                </p>
                <p>
                  <strong>City & Region:</strong> {store.city}, {store.region}
                </p>
                {store.address && (
                  <p>
                    <strong>Street / Landmark Address:</strong> {store.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#EEF8F1] rounded-2xl border border-[#CCEBD5] p-5 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#173A20]">
                Trade & Compliance
              </h4>
              <div className="space-y-2 text-xs text-[#241A12]">
                <div className="flex items-center justify-between">
                  <span className="text-[#5C5245]">Agrom Verified:</span>
                  <span className="font-bold text-[#4E8B3F] flex items-center gap-1">
                    <ShieldCheck size={14} /> Yes
                  </span>
                </div>
                {store.tradeLicenseNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#5C5245]">Trade License:</span>
                    <span className="font-mono font-bold text-[#173A20]">{store.tradeLicenseNumber}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#5C5245]">Primary Operator:</span>
                  <span className="font-bold text-[#173A20]">{store.user?.name || 'Verified Merchant'}</span>
                </div>
                {store.user?.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#5C5245]">Phone / WhatsApp:</span>
                    <span className="font-mono font-bold text-[#173A20]">{store.user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Lot Modal (Owner Only) */}
      {showAddLotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#CCEBD5] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <h3 className="font-display-italic text-lg font-bold text-[#173A20]">
                List Produce in {store.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddLotModal(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#173A20] hover:bg-[#CCEBD5] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLotSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#173A20] mb-1">Lot Title / Commodity *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Table Eggs (30-Egg Tray)"
                  value={lotTitle}
                  onChange={(e) => setLotTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-sm focus:border-[#4E8B3F] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#173A20] mb-1">Unit Price (FCFA) *</label>
                  <input
                    type="number"
                    required
                    placeholder="12000"
                    value={lotPrice}
                    onChange={(e) => setLotPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-sm focus:border-[#4E8B3F] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#173A20] mb-1">Packaging Unit</label>
                  <select
                    value={lotUnit}
                    onChange={(e) => setLotUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-sm focus:border-[#4E8B3F] outline-hidden"
                  >
                    <option value="CRATE">CRATE</option>
                    <option value="BAG_50KG">BAG (50KG)</option>
                    <option value="BAG_100KG">BAG (100KG)</option>
                    <option value="KG">KG</option>
                    <option value="TON">TON</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#173A20] mb-1">In-Stock Quantity</label>
                  <input
                    type="number"
                    value={lotStock}
                    onChange={(e) => setLotStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-sm focus:border-[#4E8B3F] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#173A20] mb-1">Category</label>
                  <input
                    type="text"
                    value={lotCategory}
                    onChange={(e) => setLotCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-sm focus:border-[#4E8B3F] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#173A20] mb-1">Bulk Price (FCFA)</label>
                  <input
                    type="number"
                    placeholder="10500"
                    value={lotBulkPrice}
                    onChange={(e) => setLotBulkPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-sm focus:border-[#4E8B3F] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#173A20] mb-1">Min Bulk Quantity</label>
                  <input
                    type="number"
                    value={lotBulkMin}
                    onChange={(e) => setLotBulkMin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-sm focus:border-[#4E8B3F] outline-hidden"
                  />
                </div>
              </div>

              {sitesList.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-[#173A20] mb-1">Dispatch Site</label>
                  <select
                    value={lotSiteId}
                    onChange={(e) => setLotSiteId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-sm focus:border-[#4E8B3F] outline-hidden"
                  >
                    <option value="">Default Site ({sitesList[0]?.name || 'Main Site'})</option>
                    {sitesList.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.location || store.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLotModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#5C5245] hover:bg-[#EEF8F1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLot}
                  className="px-5 py-2 rounded-full bg-[#4E8B3F] text-white text-xs font-bold hover:bg-[#3D7030] cursor-pointer"
                >
                  {submittingLot ? 'Publishing...' : 'Publish Lot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreStorefrontPage;
