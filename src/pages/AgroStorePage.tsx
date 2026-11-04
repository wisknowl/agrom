import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Package,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles,
  Filter,
  CheckCircle2,
  Plus,
  X,
  Link as LinkIcon,
  TrendingUp,
  Settings,
  Edit3,
  Calendar,
  Truck,
  Layers,
  Check,
  Warehouse,
  Snowflake,
} from 'lucide-react';
import { Yield } from '@/types';
import {
  fetchYieldsApi,
  fetchMyStoresApi,
  updateStoreApi,
  createYieldApi,
} from '@/api';
import { resolveMediaUrl } from '@/utils/media';
import { useAuthStore } from '@/store/authStore';

export const AgroStorePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'inventory' | 'tenders' | 'settings'>('inventory');
  const [yields, setYields] = useState<Yield[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Stores State
  const [myStores, setMyStores] = useState<any[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>('');
  const [isAddLotModalOpen, setIsAddLotModalOpen] = useState(false);
  const [savingStore, setSavingStore] = useState(false);
  const [savingLot, setSavingLot] = useState(false);

  // New Store Lot Form with Depot Site Selector
  const [lotForm, setLotForm] = useState({
    title: '',
    description: '',
    categoryName: 'Highland Vegetables',
    pricePerUnit: '15000',
    unit: 'CRATE',
    stockQuantity: '50',
    bulkMinQuantity: '10',
    bulkPricePerUnit: '13500',
    mediaUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
    dispatchSiteId: '',
  });

  // Store Settings Form (for active store)
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    city: '',
    marketZone: '',
    tradeLicenseNumber: '',
    storageCapacityTons: 5.0,
    linkedFarmId: '',
  });

  // Bid submission state
  const [submittingBidTenderId, setSubmittingBidTenderId] = useState<string | null>(null);

  const userFarms = user?.farms || [];

  // Active Store Resolution
  const activeStore = myStores.find((s) => s.id === activeStoreId) || myStores[0] || null;

  // Active Store Sites parsed
  const activeSites: Array<{ id: string; name: string; facilityType: string; capacityTons: number }> =
    activeStore?.sites
      ? typeof activeStore.sites === 'string'
        ? JSON.parse(activeStore.sites)
        : activeStore.sites
      : [];

  // Load User's Stores
  useEffect(() => {
    let mounted = true;
    async function loadStores() {
      setLoading(true);
      try {
        const storesData = await fetchMyStoresApi();
        if (mounted) {
          setMyStores(storesData);
          if (storesData.length > 0) {
            const firstStore = storesData[0];
            setActiveStoreId(firstStore.id);
            setSettingsForm({
              name: firstStore.name || '',
              city: firstStore.city || '',
              marketZone: firstStore.marketZone || '',
              tradeLicenseNumber: firstStore.tradeLicenseNumber || '',
              storageCapacityTons: firstStore.storageCapacityTons || 5.0,
              linkedFarmId: firstStore.linkedFarmId || '',
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load stores:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadStores();
    return () => {
      mounted = false;
    };
  }, []);

  // Sync Settings Form when Active Store Changes
  useEffect(() => {
    if (activeStore) {
      setSettingsForm({
        name: activeStore.name || '',
        city: activeStore.city || '',
        marketZone: activeStore.marketZone || '',
        tradeLicenseNumber: activeStore.tradeLicenseNumber || '',
        storageCapacityTons: activeStore.storageCapacityTons || 5.0,
        linkedFarmId: activeStore.linkedFarmId || '',
      });
      // Default lot dispatch site to first site of active store
      if (activeSites.length > 0 && !lotForm.dispatchSiteId) {
        setLotForm((prev) => ({ ...prev, dispatchSiteId: activeSites[0].id }));
      }
    }
  }, [activeStoreId, activeStore]);

  // Load Yields for Active Store
  useEffect(() => {
    let mounted = true;
    async function loadStoreInventory() {
      if (!activeStore?.id) {
        setYields([]);
        return;
      }
      try {
        // Fetch yields isolated to active store
        const storeYields = await fetchYieldsApi({ storeId: activeStore.id });
        if (mounted) {
          setYields(storeYields);
        }
      } catch (err) {
        console.warn('Failed to load store inventory:', err);
      }
    }
    loadStoreInventory();
    return () => {
      mounted = false;
    };
  }, [activeStoreId]);

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore) return;
    if (!settingsForm.name.trim()) {
      alert('Please enter your store or depot name');
      return;
    }
    try {
      setSavingStore(true);
      const updated = await updateStoreApi(activeStore.id, {
        name: settingsForm.name.trim(),
        city: settingsForm.city.trim(),
        marketZone: settingsForm.marketZone.trim() || undefined,
        tradeLicenseNumber: settingsForm.tradeLicenseNumber.trim() || undefined,
        storageCapacityTons: Number(settingsForm.storageCapacityTons || 1),
        linkedFarmId: settingsForm.linkedFarmId || undefined,
      });
      setMyStores((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
      alert('🎉 Store Management profile updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to update store');
    } finally {
      setSavingStore(false);
    }
  };

  const handlePublishLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore) {
      alert('Please register or select a store before publishing wholesale lots.');
      return;
    }
    if (!lotForm.title.trim()) {
      alert('Please enter a lot title');
      return;
    }

    const selectedSite = activeSites.find((s) => s.id === lotForm.dispatchSiteId) || activeSites[0];
    const dispatchSiteLabel = selectedSite
      ? selectedSite.name
      : `${activeStore.marketZone || activeStore.city} Central Depot`;

    try {
      setSavingLot(true);
      const newLot = await createYieldApi({
        title: lotForm.title.trim(),
        description:
          lotForm.description.trim() ||
          `Wholesale lot dispatched from ${activeStore.name} (${dispatchSiteLabel})`,
        originRegion: `${activeStore.city} • ${dispatchSiteLabel}`,
        pricePerUnit: Number(lotForm.pricePerUnit),
        unit: lotForm.unit,
        stockQuantity: Number(lotForm.stockQuantity || 1),
        minOrderQuantity: Number(lotForm.bulkMinQuantity || 1),
        isWholesaleBulkAvailable: true,
        bulkMinQuantity: Number(lotForm.bulkMinQuantity || 5),
        bulkPricePerUnit: Number(lotForm.bulkPricePerUnit || lotForm.pricePerUnit),
        mediaUrls: [lotForm.mediaUrl],
        sourceType: 'STORE',
        storeId: activeStore.id,
        storeSiteId: selectedSite?.id,
        dispatchSiteName: dispatchSiteLabel,
      });

      setYields((prev) => [newLot, ...prev]);
      setIsAddLotModalOpen(false);
      setActiveTab('inventory');
      alert(`🎉 Depot lot "${lotForm.title}" dispatched from [${dispatchSiteLabel}] and published to AgroMarket!`);
    } catch (err: any) {
      alert(err.message || 'Failed to publish depot lot');
    } finally {
      setSavingLot(false);
    }
  };

  const handleBidSubmit = (tenderId: string, tenderTitle: string) => {
    setSubmittingBidTenderId(tenderId);
    setTimeout(() => {
      setSubmittingBidTenderId(null);
      alert(`✅ Supply Bid submitted for "${tenderTitle}"! The institutional buyer will review your depot credentials.`);
    }, 600);
  };

  // Filter yields for active store
  const filteredInventory = yields.filter((y) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      y.title.toLowerCase().includes(q) ||
      (y.originRegion && y.originRegion.toLowerCase().includes(q)) ||
      (y.dispatchSiteName && y.dispatchSiteName.toLowerCase().includes(q))
    );
  });

  const linkedFarmObj = userFarms.find((f: any) => f.id === activeStore?.linkedFarmId);

  const TENDERS = [
    {
      id: 'tender-1',
      title: '50 Crates Highland Roma Tomatoes Weekly',
      buyer: 'Grand Central Catering & Hospitality Group',
      city: 'Yaoundé • Bastos Commercial Hub',
      volume: '50 Crates / Week (Recurring 3 Months)',
      targetPrice: '14,000 FCFA / Crate',
      escrowGuarantee: '100% Escrow Deposited',
      verified: true,
      description:
        'Continuous weekly procurement of uniform, sorted Roma tomatoes for restaurant operations. Delivery required every Tuesday morning at Bastos depot.',
    },
    {
      id: 'tender-2',
      title: '200 Bunches Plantain for Export Depot',
      buyer: 'Atlantic Agrilogistics Co-op Export Terminal',
      city: 'Douala • Port Zone Cold Facility',
      volume: '200 Bunches (Batch 1)',
      targetPrice: '3,800 FCFA / Bunch',
      escrowGuarantee: 'Letter of Credit + Escrow',
      verified: true,
      description:
        'Export-grade large green plantains (Bâtard / Big Ebanga) required for container shipment. Must be free of stem rot with certified phytosanitary inspection.',
    },
    {
      id: 'tender-3',
      title: '1,500 KG Yellow Corn / Maize (Moisture < 13%)',
      buyer: 'Savannah Feed Mills & Grain Aggregation Hub',
      city: 'Bafoussam • Mifi Central Depot',
      volume: '1.5 Tonnes in 50kg Bags',
      targetPrice: '300 FCFA / KG',
      escrowGuarantee: 'Direct Smart Escrow FSM',
      verified: false,
      description:
        'Clean dry grain with zero aflatoxin contamination. Quick moisture testing on delivery and immediate Escrow release upon batch sign-off.',
    },
  ];

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* =====================================================================
            TOP WORKSPACE HEADER & STORE SWITCHER
        ===================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#CCEBD5]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FEF6E8] border border-[#F2DCAA] text-[#7A4A2D] text-xs font-mono-num font-bold">
              <Store size={13} className="text-[#E2A63C]" />
              Merchant Workspace
            </div>
            <h1 className="font-display-italic text-2xl sm:text-3xl text-[#173A20] font-semibold">
              Store Management
            </h1>
            <p className="text-xs sm:text-sm text-[#5C5245]">
              Manage merchant depot inventory, multi-site dispatch points, wholesale lots & institutional supply contracts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/store/new')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EEF8F1] hover:bg-[#E1F3E7] border border-[#CCEBD5] text-xs font-bold text-[#173A20] transition cursor-pointer"
            >
              <Plus size={14} className="text-[#4E8B3F]" />
              <span>+ Register New Store</span>
            </button>

            {activeStore && (
              <button
                type="button"
                onClick={() => setIsAddLotModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus size={15} strokeWidth={2.4} />
                <span>+ Add Store Lot</span>
              </button>
            )}
          </div>
        </div>

        {/* =====================================================================
            STORE SWITCHER CHIPS (MULTI-STORE CAPABILITY)
        ===================================================================== */}
        {myStores.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-[#8F8475] uppercase shrink-0">Stores:</span>
            {myStores.map((st) => {
              const isActive = st.id === (activeStore?.id || activeStoreId);
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setActiveStoreId(st.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${isActive
                      ? 'bg-[#173A20] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#241A12] border border-[#EBE3D5] hover:bg-[#EEF8F1]'
                    }`}
                >
                  <Warehouse size={13} className={isActive ? 'text-[#E2A63C]' : 'text-[#8F8475]'} />
                  <span>{st.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-[#EBE3D5] text-[#5C5245]'
                      }`}
                  >
                    {st.city}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => navigate('/store/new')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-[#CCEBD5] text-xs font-bold text-[#4E8B3F] hover:bg-[#EEF8F1] transition shrink-0 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Another Store</span>
            </button>
          </div>
        )}

        {/* =====================================================================
            EMPTY STATE: NO STORES REGISTERED YET
        ===================================================================== */}
        {!loading && myStores.length === 0 && (
          <div className="text-center py-12 px-6 bg-[#FAF7F2] rounded-3xl border border-dashed border-[#CCEBD5] space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#EEF8F1] text-[#173A20] flex items-center justify-center mx-auto shadow-xs">
              <Store size={32} className="text-[#4E8B3F]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#241A12]">Register Your First AgroStore Depot</h2>
              <p className="text-xs text-[#5C5245] leading-relaxed">
                Connect your urban depot, storage cold rooms, or market warehouse to dispatch wholesale lots directly to buyers on AgroMarket.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/store/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Launch Store Registration Wizard</span>
            </button>
          </div>
        )}

        {/* =====================================================================
            STORE PROFILE CARD
        ===================================================================== */}
        {activeStore && (
          <div className="bg-[#FAF7F2] border border-[#EBE3D5] rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#173A20] text-white flex items-center justify-center shrink-0">
                  <Store size={24} className="text-[#E2A63C]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#241A12]">
                      {activeStore.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-[10px] font-bold text-[#173A20]">
                      <CheckCircle2 size={11} className="text-[#4E8B3F]" />
                      Verified Commercial Depot
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#5C5245]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} className="text-[#E2A63C]" />
                      {activeStore.city} {activeStore.marketZone ? `• ${activeStore.marketZone}` : ''}
                    </span>
                    <span className="text-[#CCEBD5]">•</span>
                    <span>Capacity: {activeStore.storageCapacityTons || 5.0} Tons Storage</span>
                    <span className="text-[#CCEBD5]">•</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#173A20]">
                      <Warehouse size={12} className="text-[#4E8B3F]" />
                      {activeSites.length} Depot Sites
                    </span>
                    <span className="text-[#CCEBD5]">•</span>
                    {linkedFarmObj ? (
                      <span className="inline-flex items-center gap-1 text-[#173A20] font-semibold">
                        <LinkIcon size={12} className="text-[#4E8B3F]" />
                        Linked Farm: {linkedFarmObj.name}
                      </span>
                    ) : (
                      <span className="text-[#8F8475]">Standalone Merchant Store</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Metrics Strip */}
              <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-[#EBE3D5] shrink-0">
                <div className="text-center px-3">
                  <div className="font-mono-num font-bold text-base text-[#173A20]">{filteredInventory.length}</div>
                  <div className="text-[10px] text-[#8F8475] uppercase font-semibold">Store Lots</div>
                </div>
                <div className="text-center px-3 border-x border-[#EBE3D5]">
                  <div className="font-mono-num font-bold text-base text-[#E2A63C]">{activeStore.storageCapacityTons || 5.0} T</div>
                  <div className="text-[10px] text-[#8F8475] uppercase font-semibold">Storage Cap</div>
                </div>
                <div className="text-center px-3">
                  <div className="font-mono-num font-bold text-base text-[#4E8B3F]">{TENDERS.length}</div>
                  <div className="text-[10px] text-[#8F8475] uppercase font-semibold">Open Tenders</div>
                </div>
              </div>
            </div>

            {/* Operating Sites Badges */}
            {activeSites.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#EBE3D5] flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-[#8F8475] uppercase">Dispatch Sites:</span>
                {activeSites.map((site) => (
                  <span
                    key={site.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#CCEBD5] text-xs font-semibold text-[#173A20]"
                  >
                    {site.facilityType === 'COLD_ROOM' ? (
                      <Snowflake size={12} className="text-blue-500" />
                    ) : (
                      <Warehouse size={12} className="text-[#E2A63C]" />
                    )}
                    {site.name} ({site.capacityTons}T)
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            PRIMARY TABS
        ===================================================================== */}
        {activeStore && (
          <div className="flex items-center justify-between border-b border-[#CCEBD5] pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${activeTab === 'inventory'
                    ? 'bg-[#173A20] text-white shadow-xs'
                    : 'bg-[#EEF8F1] text-[#241A12] hover:bg-[#E1F3E7]'
                  }`}
              >
                <Package size={15} />
                <span>Depot Inventory & Lots ({filteredInventory.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tenders')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${activeTab === 'tenders'
                    ? 'bg-[#173A20] text-white shadow-xs'
                    : 'bg-[#EEF8F1] text-[#241A12] hover:bg-[#E1F3E7]'
                  }`}
              >
                <ShieldCheck size={15} />
                <span>Supply Tenders & Bids ({TENDERS.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${activeTab === 'settings'
                    ? 'bg-[#173A20] text-white shadow-xs'
                    : 'bg-[#EEF8F1] text-[#241A12] hover:bg-[#E1F3E7]'
                  }`}
              >
                <Settings size={15} />
                <span>Store Profile & Farm Link</span>
              </button>
            </div>

            {activeTab === 'inventory' && (
              <div className="hidden sm:block">
                <input
                  type="text"
                  placeholder="Search store inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#CCEBD5] bg-white text-xs text-[#241A12] placeholder-[#8F8475] focus:outline-none focus:border-[#4E8B3F] w-48 lg:w-60"
                />
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 1: DEPOT INVENTORY & LOTS
        ===================================================================== */}
        {activeStore && activeTab === 'inventory' && (
          <div className="space-y-4">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#CCEBD5] space-y-3">
                <Store size={36} className="mx-auto text-[#8F8475]" />
                <h3 className="text-sm font-bold text-[#241A12]">No Active Store Lots in {activeStore.name}</h3>
                <p className="text-xs text-[#5C5245] max-w-sm mx-auto">
                  Publish wholesale crates, sorted bags, or bulk harvest lots with direct dispatch depot designation.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddLotModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4E8B3F] text-white text-xs font-bold hover:bg-[#3D7030] transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Publish First Store Lot</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.map((item) => {
                  const img = item.image || (item.mediaUrls && item.mediaUrls[0]) || '';
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#CCEBD5] overflow-hidden hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {img && (
                          <div className="h-40 w-full bg-[#FAF7F2] relative overflow-hidden">
                            <img
                              src={resolveMediaUrl(img)}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2.5 left-2.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#173A20]/85 text-white text-[10px] font-mono-num font-bold">
                                WHOLESALE LOT
                              </span>
                            </div>
                            <div className="absolute bottom-2.5 right-2.5">
                              <span className="px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                                Stock: {item.stockQuantity} {item.unit}s
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="p-4 space-y-2">
                          <div className="text-[11px] text-[#5C5245] flex items-center gap-1">
                            <MapPin size={12} className="text-[#E2A63C]" />
                            {item.originRegion || activeStore.city}
                          </div>

                          {item.dispatchSiteName && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEF6E8] border border-[#F2DCAA] text-[10px] font-bold text-[#7A4A2D]">
                              <Warehouse size={10} className="text-[#E2A63C]" />
                              Dispatch: {item.dispatchSiteName}
                            </div>
                          )}

                          <h3 className="text-sm font-bold text-[#241A12] line-clamp-1">{item.title}</h3>
                          <p className="text-xs text-[#5C5245] line-clamp-2">{item.description}</p>

                          <div className="pt-2 flex items-baseline justify-between">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-[#8F8475]">Wholesale Price</div>
                              <div className="font-mono-num font-bold text-sm text-[#173A20]">
                                {(item.bulkPricePerUnit || item.pricePerUnit || item.price).toLocaleString()} FCFA
                                <span className="text-xs font-normal text-[#5C5245]"> / {item.unit}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] uppercase font-bold text-[#8F8475]">Min Order</div>
                              <div className="text-xs font-bold text-[#241A12]">
                                {item.bulkMinQuantity || item.minOrderQuantity || 5} {item.unit}s
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-[#FAF7F2] border-t border-[#EBE3D5] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => navigate(`/yield/${item.id}`)}
                          className="text-xs font-bold text-[#4E8B3F] hover:underline cursor-pointer"
                        >
                          View Public Listing →
                        </button>
                        <span className="text-[11px] font-bold text-[#173A20] bg-[#EEF8F1] px-2 py-0.5 rounded-md border border-[#CCEBD5]">
                          Active in Market
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 2: OPEN SUPPLY TENDERS
        ===================================================================== */}
        {activeTab === 'tenders' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#FEF6E8] border border-[#F2DCAA] rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-[#E2A63C] shrink-0" />
                <p className="text-xs text-[#7A4A2D] font-medium leading-relaxed">
                  Institutional buyers submit verified purchase tenders with pre-funded Escrow. Review specifications and submit supply fulfillment bids directly from your depot.
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {TENDERS.map((tender) => (
                <div
                  key={tender.id}
                  className="bg-white border border-[#CCEBD5] rounded-2xl p-5 hover:shadow-xs transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-[#241A12]">{tender.title}</h3>
                        {tender.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEF8F1] text-[10px] font-bold text-[#173A20] border border-[#CCEBD5]">
                            <CheckCircle2 size={11} className="text-[#4E8B3F]" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#5C5245] mt-0.5 flex items-center gap-2">
                        <span className="font-semibold">{tender.buyer}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="text-[#E2A63C]" />
                          {tender.city}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-num font-bold text-[#173A20] bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EBE3D5]">
                        Target: {tender.targetPrice}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#5C5245] leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3D5]">
                    {tender.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3 text-xs text-[#5C5245]">
                      <span><strong>Volume:</strong> {tender.volume}</span>
                      <span>•</span>
                      <span className="text-[#4E8B3F] font-semibold">🔒 {tender.escrowGuarantee}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBidSubmit(tender.id, tender.title)}
                      disabled={submittingBidTenderId === tender.id}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#173A20] hover:bg-[#224A2E] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                    >
                      {submittingBidTenderId === tender.id ? (
                        <span>Submitting Bid...</span>
                      ) : (
                        <>
                          <Truck size={14} className="text-[#E2A63C]" />
                          <span>Submit Supply Bid</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: STORE PROFILE & FARM LINK
        ===================================================================== */}
        {activeStore && activeTab === 'settings' && (
          <div className="bg-white border border-[#CCEBD5] rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#241A12]">Store Profile & Logistics Architecture</h2>
              <p className="text-xs text-[#5C5245]">
                Configure merchant identity, commercial depot city, optional farm linking, and storage capacity.
              </p>
            </div>

            <form onSubmit={handleUpdateStore} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-[#241A12] mb-1">
                  AgroStore / Depot Name *
                </label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  placeholder="e.g., Marché Sandaga Wholesale Depot"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-xs font-medium text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">
                    Operating City *
                  </label>
                  <input
                    type="text"
                    value={settingsForm.city}
                    onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                    placeholder="e.g., Douala or Yaoundé"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-xs font-medium text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">
                    Market Zone / Area
                  </label>
                  <input
                    type="text"
                    value={settingsForm.marketZone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, marketZone: e.target.value })}
                    placeholder="e.g., Marché Sandaga Dock"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-xs font-medium text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">
                    Trade / Merchant License #
                  </label>
                  <input
                    type="text"
                    value={settingsForm.tradeLicenseNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tradeLicenseNumber: e.target.value })}
                    placeholder="e.g., CM-DLA-2026-B-1049"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-xs font-medium text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">
                    Depot Storage Capacity (Tons)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={settingsForm.storageCapacityTons}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storageCapacityTons: parseFloat(e.target.value) || 0 })}
                    placeholder="5.0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] text-xs font-medium text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                  />
                </div>
              </div>

              {/* Farm Linking Option */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3D5] space-y-2">
                <div className="flex items-center gap-2">
                  <LinkIcon size={14} className="text-[#4E8B3F]" />
                  <span className="text-xs font-bold text-[#173A20]">Link to AgroFarm (Optional)</span>
                </div>
                <p className="text-[11px] text-[#5C5245] leading-relaxed">
                  If you operate an AgroFarm, you can link it here to give buyers verified single-origin provenance on your depot stock. If you are an independent urban merchant, select "Standalone Commercial Depot".
                </p>
                <select
                  value={settingsForm.linkedFarmId}
                  onChange={(e) => setSettingsForm({ ...settingsForm, linkedFarmId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#CCEBD5] bg-white text-xs font-medium text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                >
                  <option value="">Standalone Commercial Depot (No Farm Linked)</option>
                  {userFarms.map((farm: any) => (
                    <option key={farm.id} value={farm.id}>
                      🚜 {farm.name} ({farm.city || 'Cameroon'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={savingStore}
                className="px-5 py-2.5 rounded-xl bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
              >
                {savingStore ? 'Saving Profile...' : 'Save Store Profile'}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* =====================================================================
          MODAL: ADD STORE LOT (WITH DISPATCH DEPOT SITE SELECTOR)
      ===================================================================== */}
      {isAddLotModalOpen && activeStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#CCEBD5] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-[#4E8B3F]" />
                <div>
                  <h3 className="text-base font-bold text-[#173A20]">Publish Depot Wholesale Lot</h3>
                  <p className="text-[11px] text-[#5C5245]">Dispatched from {activeStore.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddLotModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] hover:bg-[#E1F3E7] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePublishLot} className="space-y-3.5">
              {/* Dispatch Depot Site Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#241A12] mb-1">
                  Dispatch Depot Site *
                </label>
                {activeSites.length > 0 ? (
                  <select
                    value={lotForm.dispatchSiteId || (activeSites[0]?.id ?? '')}
                    onChange={(e) => setLotForm({ ...lotForm, dispatchSiteId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] bg-[#FAF7F2] text-xs font-bold text-[#173A20] focus:outline-none focus:border-[#4E8B3F]"
                    required
                  >
                    {activeSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        🏢 {site.name} ({site.facilityType === 'COLD_ROOM' ? '❄️ Cold Room' : site.facilityType === 'GRAIN_SILO' ? '🌾 Silo' : '📦 Dry Warehouse'}) - Cap: {site.capacityTons}T
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={`${activeStore.marketZone || activeStore.city} Central Depot`}
                    disabled
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CCEBD5] bg-gray-50 text-xs text-[#5C5245]"
                  />
                )}
                <p className="text-[10px] text-[#8F8475] mt-1">
                  Buyers will see this physical depot location during checkout for pickup or logistics dispatch.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241A12] mb-1">
                  Harvest / Lot Title *
                </label>
                <input
                  type="text"
                  value={lotForm.title}
                  onChange={(e) => setLotForm({ ...lotForm, title: e.target.value })}
                  placeholder="e.g., Graded Highland Tomatoes - 25 Crate Lot"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#CCEBD5] text-xs text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">Package Unit</label>
                  <select
                    value={lotForm.unit}
                    onChange={(e) => setLotForm({ ...lotForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CCEBD5] bg-white text-xs text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                  >
                    <option value="CRATE">Crate</option>
                    <option value="BAG_50KG">50kg Bag</option>
                    <option value="BAG_100KG">100kg Bag</option>
                    <option value="BUNCH">Bunch</option>
                    <option value="KG">KG</option>
                    <option value="TON">Tonne</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={lotForm.stockQuantity}
                    onChange={(e) => setLotForm({ ...lotForm, stockQuantity: e.target.value })}
                    placeholder="50"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CCEBD5] text-xs text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">Price / Unit (FCFA)</label>
                  <input
                    type="number"
                    value={lotForm.pricePerUnit}
                    onChange={(e) => setLotForm({ ...lotForm, pricePerUnit: e.target.value })}
                    placeholder="15000"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CCEBD5] text-xs text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">Bulk Price / Unit</label>
                  <input
                    type="number"
                    value={lotForm.bulkPricePerUnit}
                    onChange={(e) => setLotForm({ ...lotForm, bulkPricePerUnit: e.target.value })}
                    placeholder="13500"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CCEBD5] text-xs text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241A12] mb-1">Lot Photo URL</label>
                <input
                  type="url"
                  value={lotForm.mediaUrl}
                  onChange={(e) => setLotForm({ ...lotForm, mediaUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#CCEBD5] text-xs text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241A12] mb-1">Lot Notes / Provenance</label>
                <textarea
                  value={lotForm.description}
                  onChange={(e) => setLotForm({ ...lotForm, description: e.target.value })}
                  placeholder="Grading quality, harvest origin, packaging condition..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#CCEBD5] text-xs text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLotModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#CCEBD5] text-xs font-bold text-[#5C5245] hover:bg-[#FAF7F2] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLot}
                  className="px-5 py-2 rounded-xl bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {savingLot ? 'Publishing...' : 'Publish to AgroMarket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgroStorePage;
