import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Warehouse,
  Sprout,
  Video,
  ExternalLink,
  ShieldCheck,
  Star,
  MapPin,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  Check,
  Sliders,
  Edit3,
  Trash2,
  AlertTriangle,
  Building2,
  ArrowLeft,
  Upload,
  Camera,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import {
  fetchMyFarmsApi,
  fetchFarmByIdApi,
  createProduceApi,
  updateProduceApi,
  deleteProduceApi,
  patchProduceStockApi,
  updateFarmApi,
  deleteFarmApi,
  uploadMediaFileApi,
} from '@/api';
import { Farm, Yield, FarmParcel } from '@/types';
import { FarmerBadge } from '@/components/MeetingLeafLogo';
import { resolveMediaUrl, formatXaf } from '@/utils/media';

const CATEGORIES = [
  'Vegetables & Greens',
  'Tubers & Roots',
  'Plantains & Bananas',
  'Fruits & Citrus',
  'Grains & Cereals',
  'Legumes & Seeds',
  'Poultry & Eggs',
  'Spices & Herbs',
];

const UNITS = [
  'KG',
  'CRATE',
  'BAG_50KG',
  'BAG_100KG',
  'BUNCH',
  'BUCKET',
  'PIECE',
  'TON',
  'LITER',
];

const CAMEROON_REGIONS = [
  'West Region (Foumbot, Bafoussam)',
  'Northwest Region (Bamenda, Santa)',
  'Southwest Region (Buea, Kumba, Penja)',
  'Littoral Region (Douala, Loum, Manjo)',
  'Centre Region (Yaounde, Obala, Mbalmayo)',
  'South Region (Ebolowa, Kribi)',
  'East Region (Bertoua)',
  'Adamawa Region (Ngaoundere)',
  'North Region (Garoua)',
  'Far North Region (Maroua)',
];

export const FarmManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const setCreatePostModalOpen = useRegionalContainerStore((s) => s.setCreatePostModalOpen);

  const [farmsList, setFarmsList] = useState<Farm[]>(user?.farms || []);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(
    user?.farms && user.farms.length > 0 ? user.farms[0].id : null
  );
  const [activeFarm, setActiveFarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Multi-Site / Parcel Addition State
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [savingSite, setSavingSite] = useState(false);
  const [newSiteForm, setNewSiteForm] = useState({
    name: '',
    region: CAMEROON_REGIONS[0],
    division: 'Noun',
    city: 'Foumbot',
    location: '',
    sizeHectares: '1.5',
  });

  // Produce Modals
  const [showAddProduceModal, setShowAddProduceModal] = useState(false);
  const [showEditProduceModal, setShowEditProduceModal] = useState(false);
  const [editingProduceItem, setEditingProduceItem] = useState<any>(null);
  const [produceForm, setProduceForm] = useState({
    title: '',
    description: '',
    categoryName: 'Vegetables & Greens',
    selectedParcelId: '',
    pricePerUnit: '',
    unit: 'KG',
    stockQuantity: '',
    isOrganic: true,
    isWholesaleBulkAvailable: false,
    bulkMinQuantity: '10',
    bulkPricePerUnit: '',
    mediaUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
  });

  // Stock Balancing Modal
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [selectedStockYield, setSelectedStockYield] = useState<any>(null);
  const [stockActionTab, setStockActionTab] = useState<'REPLENISH' | 'SPOILAGE'>('REPLENISH');
  const [stockInputDelta, setStockInputDelta] = useState('');
  const [isAvailableToggle, setIsAvailableToggle] = useState(true);

  // Farm Edit Profile Modal & Cover Upload
  const [showEditFarmModal, setShowEditFarmModal] = useState(false);
  const [editFarmName, setEditFarmName] = useState('');
  const [editFarmDesc, setEditFarmDesc] = useState('');
  const [editFarmCover, setEditFarmCover] = useState('');
  const [uploadingEditCover, setUploadingEditCover] = useState(false);
  const editCoverInputRef = React.useRef<HTMLInputElement | null>(null);

  // Cascading Farm Deletion Modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteAction, setDeleteAction] = useState<'transfer' | 'delete'>('transfer');
  const [deleteTargetFarmId, setDeleteTargetFarmId] = useState<string>('');
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  const loadFarms = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const farms = await fetchMyFarmsApi();
      if (Array.isArray(farms) && farms.length > 0) {
        setFarmsList(farms);
        updateUser({ farms });
        const targetId = selectedFarmId && farms.some((f) => f.id === selectedFarmId)
          ? selectedFarmId
          : farms[0].id;
        setSelectedFarmId(targetId);
        const detailed = await fetchFarmByIdApi(targetId);
        setActiveFarm(detailed || farms[0]);
      } else if (user?.farms && user.farms.length > 0) {
        setFarmsList(user.farms);
        setSelectedFarmId(user.farms[0].id);
        setActiveFarm(user.farms[0]);
      } else {
        setFarmsList([]);
        setActiveFarm(null);
      }
    } catch {
      if (user?.farms && user.farms.length > 0) {
        setFarmsList(user.farms);
        setSelectedFarmId(user.farms[0].id);
        setActiveFarm(user.farms[0]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, selectedFarmId]);

  useEffect(() => {
    loadFarms();
  }, []);

  const handleSelectFarm = async (farmId: string) => {
    setSelectedFarmId(farmId);
    try {
      const detailed = await fetchFarmByIdApi(farmId);
      setActiveFarm(detailed);
    } catch {
      const f = farmsList.find((item) => item.id === farmId);
      if (f) setActiveFarm(f);
    }
  };

  // Active Farm Operational Sites (Parcels)
  const activeParcels: FarmParcel[] = (activeFarm?.parcels && Array.isArray(activeFarm.parcels) && activeFarm.parcels.length > 0)
    ? activeFarm.parcels
    : (activeFarm ? [{
        id: `${activeFarm.id}-hq`,
        name: `${activeFarm.name} (Main Base / HQ)`,
        region: activeFarm.region || 'West Region',
        city: activeFarm.city || 'Foumbot',
        division: activeFarm.division || 'Noun',
        location: activeFarm.location || '',
        sizeHectares: activeFarm.sizeHectares || 1.0,
        isHeadquarters: true,
      }] : []);

  // Multi-Site / Parcel Operations
  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm) return;
    if (!newSiteForm.name.trim() || !newSiteForm.city.trim()) {
      alert('Please enter a site name (e.g. Buea Hatchery) and town/city.');
      return;
    }

    try {
      setSavingSite(true);
      const newParcel: FarmParcel = {
        id: `site-${Date.now()}`,
        name: newSiteForm.name.trim(),
        region: newSiteForm.region.split(' (')[0],
        division: newSiteForm.division.trim() || 'Noun',
        city: newSiteForm.city.trim(),
        location: newSiteForm.location.trim() || `${newSiteForm.city.trim()}, ${newSiteForm.region.split(' (')[0]}`,
        sizeHectares: parseFloat(newSiteForm.sizeHectares) || 1.0,
        isHeadquarters: false,
      };

      const updatedParcels = [...activeParcels, newParcel];
      const updatedTotalSize = (activeFarm.sizeHectares || 0) + (newParcel.sizeHectares || 0);

      const updatedFarm = await updateFarmApi(activeFarm.id, {
        parcels: updatedParcels,
        sizeHectares: updatedTotalSize,
      });

      const updatedFullFarm = {
        ...activeFarm,
        ...updatedFarm,
        parcels: updatedParcels,
        sizeHectares: updatedTotalSize,
      };
      setActiveFarm(updatedFullFarm);

      const updatedList = farmsList.map((f) =>
        f.id === activeFarm.id ? updatedFullFarm : f
      );
      setFarmsList(updatedList);
      updateUser({ farms: updatedList });

      alert(`🌾 Operating Site Registered!\n\n"${newSiteForm.name}" has been added to ${activeFarm.name}. Total enterprise footprint is now ${updatedTotalSize.toFixed(1)} Hectares.`);
      setShowAddSiteModal(false);
      setNewSiteForm({
        name: '',
        region: CAMEROON_REGIONS[0],
        division: 'Noun',
        city: 'Foumbot',
        location: '',
        sizeHectares: '1.5',
      });
    } catch (err: any) {
      alert(err.message || 'Could not register new operating site.');
    } finally {
      setSavingSite(false);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!activeFarm) return;
    const parcelToDelete = activeParcels.find((p) => p.id === siteId);
    if (!parcelToDelete) return;
    if (parcelToDelete.isHeadquarters && activeParcels.length === 1) {
      alert('Cannot delete the primary headquarters site of this enterprise.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove site "${parcelToDelete.name}"?`)) return;

    try {
      const remainingParcels = activeParcels.filter((p) => p.id !== siteId);
      const updatedTotalSize = Math.max(0.5, (activeFarm.sizeHectares || 0) - (parcelToDelete.sizeHectares || 0));

      const updatedFarm = await updateFarmApi(activeFarm.id, {
        parcels: remainingParcels,
        sizeHectares: updatedTotalSize,
      });

      const updatedFullFarm = {
        ...activeFarm,
        ...updatedFarm,
        parcels: remainingParcels,
        sizeHectares: updatedTotalSize,
      };
      setActiveFarm(updatedFullFarm);

      const updatedList = farmsList.map((f) =>
        f.id === activeFarm.id ? updatedFullFarm : f
      );
      setFarmsList(updatedList);
      updateUser({ farms: updatedList });
    } catch (err: any) {
      alert(err.message || 'Could not remove operating site.');
    }
  };

  const handleUploadEditCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast local preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setEditFarmCover(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    setUploadingEditCover(true);
    try {
      const res = await uploadMediaFileApi(file);
      if (res?.url) {
        setEditFarmCover(res.url);
      }
    } catch (err) {
      console.warn('Cover upload failed, using local preview data URI', err);
    } finally {
      setUploadingEditCover(false);
    }
  };

  // Produce Actions
  const handleCreateProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm?.id || !produceForm.title.trim() || !produceForm.pricePerUnit) return;
    try {
      const chosenParcel = activeParcels.find((p) => p.id === produceForm.selectedParcelId) || activeParcels[0];
      const originRegion = chosenParcel
        ? `${chosenParcel.city} • ${chosenParcel.region} (${chosenParcel.name})`
        : `${activeFarm.city || 'Foumbot'}, ${activeFarm.region || 'West Region'}`;

      await createProduceApi({
        farmId: activeFarm.id,
        title: produceForm.title.trim(),
        description: produceForm.description.trim() || `Fresh harvest from ${activeFarm.name}.`,
        categoryName: produceForm.categoryName,
        originRegion,
        pricePerUnit: Number(produceForm.pricePerUnit),
        unit: produceForm.unit,
        stockQuantity: Number(produceForm.stockQuantity || 0),
        minOrderQuantity: 1,
        isOrganic: produceForm.isOrganic,
        isWholesaleBulkAvailable: produceForm.isWholesaleBulkAvailable,
        bulkMinQuantity: produceForm.isWholesaleBulkAvailable ? Number(produceForm.bulkMinQuantity || 10) : undefined,
        bulkPricePerUnit: produceForm.isWholesaleBulkAvailable ? Number(produceForm.bulkPricePerUnit || produceForm.pricePerUnit) : undefined,
        mediaUrls: [produceForm.mediaUrl],
      });
      setShowAddProduceModal(false);
      setProduceForm({
        title: '',
        description: '',
        categoryName: 'Vegetables & Greens',
        selectedParcelId: '',
        pricePerUnit: '',
        unit: 'KG',
        stockQuantity: '',
        isOrganic: true,
        isWholesaleBulkAvailable: false,
        bulkMinQuantity: '10',
        bulkPricePerUnit: '',
        mediaUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
      });
      handleSelectFarm(activeFarm.id);
    } catch (err: any) {
      alert(err.message || 'Failed to list produce');
    }
  };

  const handleSaveEditProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduceItem?.id) return;
    try {
      await updateProduceApi(editingProduceItem.id, {
        title: produceForm.title.trim(),
        description: produceForm.description.trim(),
        pricePerUnit: Number(produceForm.pricePerUnit),
        unit: produceForm.unit,
        stockQuantity: Number(produceForm.stockQuantity || 0),
        isOrganic: produceForm.isOrganic,
        isWholesaleBulkAvailable: produceForm.isWholesaleBulkAvailable,
        bulkMinQuantity: produceForm.isWholesaleBulkAvailable ? Number(produceForm.bulkMinQuantity) : undefined,
        bulkPricePerUnit: produceForm.isWholesaleBulkAvailable ? Number(produceForm.bulkPricePerUnit) : undefined,
        mediaUrls: [produceForm.mediaUrl],
      });
      setShowEditProduceModal(false);
      handleSelectFarm(activeFarm.id);
    } catch (err: any) {
      alert(err.message || 'Could not update produce');
    }
  };

  const handleDeleteProduce = async (yieldId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteProduceApi(yieldId);
      handleSelectFarm(activeFarm.id);
    } catch (err: any) {
      alert(err.message || 'Could not delete produce listing');
    }
  };

  // Stock Balancing
  const openStockModal = (item: any) => {
    setSelectedStockYield(item);
    setStockInputDelta('');
    setStockActionTab('REPLENISH');
    setIsAvailableToggle(item.isAvailable !== false);
    setStockModalVisible(true);
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockYield) return;
    const delta = Number(stockInputDelta) || 0;
    const effectiveDelta = stockActionTab === 'REPLENISH' ? delta : -delta;

    try {
      await patchProduceStockApi(selectedStockYield.id, {
        delta: effectiveDelta,
        isAvailable: isAvailableToggle,
      });
      setStockModalVisible(false);
      handleSelectFarm(activeFarm.id);
    } catch (err: any) {
      alert(err.message || 'Failed to balance stock');
    }
  };

  // Edit Farm Profile
  const openEditFarmModal = () => {
    if (!activeFarm) return;
    setEditFarmName(activeFarm.name || '');
    setEditFarmDesc(activeFarm.description || '');
    setEditFarmCover(activeFarm.coverPhoto || '');
    setShowEditFarmModal(true);
  };

  const handleSaveFarmProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm?.id || !editFarmName.trim()) return;
    try {
      const updated = await updateFarmApi(activeFarm.id, {
        name: editFarmName.trim(),
        description: editFarmDesc.trim(),
        coverPhoto: editFarmCover,
      });
      setActiveFarm((prev: any) => ({ ...prev, ...updated }));
      setShowEditFarmModal(false);
      loadFarms();
    } catch (err: any) {
      alert(err.message || 'Could not save farm profile');
    }
  };

  // Cascading Farm Deletion
  const openDeleteFarmModal = () => {
    if (!activeFarm) return;
    const otherFarms = farmsList.filter((f) => f.id !== activeFarm.id);
    setDeleteConfirmName('');
    if (otherFarms.length > 0) {
      setDeleteAction('transfer');
      setDeleteTargetFarmId(otherFarms[0].id);
    } else {
      setDeleteAction('delete');
      setDeleteTargetFarmId('');
    }
    setDeleteModalVisible(true);
  };

  const handleExecuteDeleteFarm = async () => {
    if (!activeFarm) return;
    if (deleteConfirmName.trim().toLowerCase() !== activeFarm.name.trim().toLowerCase()) {
      alert('Please type the exact farm name to confirm deletion.');
      return;
    }

    try {
      await deleteFarmApi(activeFarm.id, deleteAction === 'transfer' ? deleteTargetFarmId : undefined);
      const remaining = farmsList.filter((f) => f.id !== activeFarm.id);
      setFarmsList(remaining);
      updateUser({ farms: remaining });
      setDeleteModalVisible(false);
      if (remaining.length > 0) {
        handleSelectFarm(remaining[0].id);
      } else {
        setActiveFarm(null);
      }
    } catch (err: any) {
      alert(err.message || 'Could not delete farm enterprise');
    }
  };

  // 1. GUEST MODE
  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-[#CCEBD5] p-6 sm:p-8 text-center space-y-5 shadow-[0_8px_30px_rgba(23,58,32,0.06)]">
          <div className="w-16 h-16 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center mx-auto text-[#4E8B3F]">
            <Warehouse size={30} strokeWidth={2.2} />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-[11px] font-semibold text-[#4E8B3F]">
              Farmer Workspace Gateway
            </span>
            <h1 className="font-display-italic text-2xl sm:text-[26px] font-semibold text-[#173A20]">
              Sign in to your Farm Management Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#5C5245] max-w-md mx-auto leading-relaxed">
              Agrom provides verified highland smallholders and cooperatives with digital storefronts, multi-site parcel management, direct marketplace yield listings, and Smart Escrow settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="w-full py-3 px-5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-sm font-bold shadow-xs transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth/register')}
              className="w-full py-3 px-5 rounded-full bg-[#EEF8F1] hover:bg-[#E1F3E7] border border-[#CCEBD5] text-[#173A20] text-sm font-bold transition cursor-pointer"
            >
              Register Account
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-[#4E8B3F] hover:underline cursor-pointer"
            >
              ← Explore Fresh Harvests on AgroMarket
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. LOGGED IN — NO FARM REGISTERED YET
  if (!loading && (!activeFarm || farmsList.length === 0)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-[#CCEBD5] p-6 sm:p-8 text-center space-y-5 shadow-[0_8px_30px_rgba(23,58,32,0.06)]">
          <div className="w-16 h-16 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center mx-auto text-[#4E8B3F]">
            <Sprout size={32} strokeWidth={2.2} />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display-italic text-2xl font-bold text-[#173A20]">
              No Registered Farm Yet
            </h1>
            <p className="text-xs sm:text-sm text-[#5C5245] max-w-md mx-auto leading-relaxed">
              Create your first farm page to start listing produce batches, publishing field stories on AgroFeed, and accessing algorithmic Tabi Credit limits.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/farmer/new')}
            className="w-full py-3.5 px-6 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-sm font-bold shadow-sm transition inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Register AgroFarm Enterprise</span>
          </button>
        </div>
      </div>
    );
  }

  const farmYields = activeFarm?.yields || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Bar with Navigation and + New Farm CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#CCEBD5]/60">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-white border border-[#CCEBD5] flex items-center justify-center text-[#241A12] hover:bg-[#EEF8F1] transition cursor-pointer"
              title="Back to Profile"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="font-display-italic text-xl sm:text-2xl font-bold text-[#173A20]">
              Farm Management Workspace
            </h1>
          </div>
          <p className="text-xs text-[#5C5245] ml-10 mt-0.5">
            Manage your agricultural parcels, produce catalog, stock balancing, and public storefront
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/farmer/new')}
          className="self-start sm:self-auto py-2 px-4 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>+ New Farm</span>
        </button>
      </div>

      {/* Multi-Farm Switcher Bar - always visible when farms exist */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-1.5 text-xs text-[#5C5245] mr-1 shrink-0">
          <Warehouse size={14} className="text-[#4E8B3F]" />
          <span className="font-semibold">Parcels:</span>
        </div>
        {farmsList.map((f) => {
          const active = f.id === selectedFarmId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => handleSelectFarm(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${active
                  ? 'bg-[#173A20] text-[#E2A63C] border-[#173A20] shadow-xs'
                  : 'bg-white text-[#241A12] border-[#CCEBD5] hover:border-[#4E8B3F]'
                }`}
            >
              <span>{f.name}</span>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-[#E2A63C]" />}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => navigate('/farmer/new')}
          className="px-3.5 py-2 rounded-full text-xs font-bold bg-[#EEF8F1] border border-dashed border-[#4E8B3F] text-[#4E8B3F] hover:bg-[#E1F3E7] whitespace-nowrap transition cursor-pointer flex items-center gap-1.5"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>Add Another Farm</span>
        </button>
      </div>

      {/* Active Farm Banner Card */}
      <div className="relative rounded-3xl overflow-hidden border border-[#CCEBD5] shadow-xs bg-[#173A20]">
        <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full bg-[#EEF8F1] overflow-hidden">
          <img
            src={resolveMediaUrl(activeFarm?.coverPhoto)}
            alt={activeFarm?.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Top Header Actions (Edit / Delete) */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={openEditFarmModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold hover:bg-black/70 transition cursor-pointer"
            >
              <Edit3 size={13} /> Edit Profile
            </button>
            <button
              type="button"
              onClick={openDeleteFarmModal}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/25 text-white flex items-center justify-center hover:bg-[#dc2626] transition cursor-pointer"
              title="Delete Farm"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Bottom Farm Details Overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <FarmerBadge tier={user?.farmerProfile?.creditTier || 'GOLD'} size="sm" />
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#4E8B3F] text-white px-2 py-0.5 rounded-full">
                <ShieldCheck size={12} /> Verified Producer
              </span>
            </div>

            <h1 className="font-display text-xl sm:text-2xl font-bold truncate">
              {activeFarm?.name}
            </h1>

            <div className="flex items-center gap-2 text-xs text-white/85">
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} className="text-[#4E8B3F]" />
                {activeFarm?.city}, {activeFarm?.region}
              </span>
              <span>•</span>
              <span>
                📍 {activeFarm?.parcels?.length || 1} Site(s) ({activeFarm?.sizeHectares || 2.5} Ha)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-[#CCEBD5] p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#EEF8F1] text-[#4E8B3F] flex items-center justify-center">
            <Package size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-mono-num text-xl font-bold text-[#173A20]">
              {farmYields.length}
            </div>
            <div className="text-[11px] text-[#5C5245]">Active Yields</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#CCEBD5] p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#FEF2D8] text-[#B87D1E] flex items-center justify-center">
            <Layers size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-mono-num text-xl font-bold text-[#173A20]">
              {activeFarm?.sizeHectares || 2.5} ha
            </div>
            <div className="text-[11px] text-[#5C5245]">Total Land Area</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#CCEBD5] p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#FEF2D8] text-[#E2A63C] flex items-center justify-center">
            <Star size={20} className="fill-[#E2A63C]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-mono-num text-xl font-bold text-[#173A20]">
              {activeFarm?.rating?.toFixed(1) || '4.9'}
            </div>
            <div className="text-[11px] text-[#5C5245]">Buyer Rating</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#CCEBD5] p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#EEF8F1] text-[#4E8B3F] flex items-center justify-center">
            <TrendingUp size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-mono-num text-xl font-bold text-[#173A20]">
              {user?.farmerProfile?.creditScore || 765}
            </div>
            <div className="text-[11px] text-[#5C5245]">Tabi Credit Score</div>
          </div>
        </div>
      </div>

      {/* Farm Management Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173A20]">
            Farm Management Actions
          </h2>
          <span className="text-[10px] font-mono-num font-bold bg-[#EEF8F1] text-[#4E8B3F] border border-[#CCEBD5] px-2.5 py-0.5 rounded-full">
            WORKSPACE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* List Harvest */}
          <button
            type="button"
            onClick={() => setShowAddProduceModal(true)}
            className="p-4 rounded-2xl bg-[#4E8B3F] hover:bg-[#3D7030] text-white flex items-center gap-3 transition shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Package size={20} strokeWidth={2.3} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold leading-tight">+ List Harvest</div>
              <div className="text-[11px] text-white/80">Publish produce to market</div>
            </div>
          </button>

          {/* Record Story */}
          <button
            type="button"
            onClick={() => setCreatePostModalOpen(true)}
            className="p-4 rounded-2xl bg-[#E2A63C] hover:bg-[#C68F30] text-[#241A12] flex items-center gap-3 transition shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center shrink-0">
              <Video size={20} strokeWidth={2.2} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold leading-tight">Record Story</div>
              <div className="text-[11px] text-[#241A12]/75">Publish video to AgroFeed</div>
            </div>
          </button>

          {/* Preview Public Storefront */}
          <button
            type="button"
            onClick={() => navigate(`/farmer/${activeFarm.id}`)}
            className="p-4 rounded-2xl bg-white hover:bg-[#EEF8F1] border border-[#CCEBD5] text-[#173A20] flex items-center gap-3 transition shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EEF8F1] text-[#4E8B3F] flex items-center justify-center shrink-0">
              <ExternalLink size={18} strokeWidth={2.2} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold leading-tight">Storefront</div>
              <div className="text-[11px] text-[#5C5245]">Preview public page →</div>
            </div>
          </button>

          {/* Register Another Farm */}
          <button
            type="button"
            onClick={() => navigate('/farmer/new')}
            className="p-4 rounded-2xl bg-[#EEF8F1] hover:bg-[#E1F3E7] border border-[#CCEBD5] text-[#173A20] flex items-center gap-3 transition shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white text-[#4E8B3F] border border-[#CCEBD5] flex items-center justify-center shrink-0">
              <Plus size={20} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold leading-tight">+ New Farm</div>
              <div className="text-[11px] text-[#5C5245]">Register another parcel</div>
            </div>
          </button>
        </div>
      </div>

      {/* Operating Sites & Plots Footprint Section */}
      <div className="bg-white rounded-3xl border border-[#CCEBD5] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#EEF8F1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F]">
              <MapPin size={16} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#173A20]">
                Operating Sites & Plots ({activeParcels.length})
              </h2>
              <p className="text-xs text-[#5C5245]">
                Multi-site footprint across Cameroon agricultural production zones
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddSiteModal(true)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EEF8F1] hover:bg-[#E1F3E7] border border-[#CCEBD5] text-[#4E8B3F] text-xs font-bold transition cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>+ Add Operating Site</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeParcels.map((parcel, idx) => (
            <div
              key={parcel.id || idx}
              className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#CCEBD5] flex items-start justify-between gap-3 hover:border-[#4E8B3F] transition shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    parcel.isHeadquarters
                      ? 'bg-[#173A20] text-[#E2A63C]'
                      : 'bg-[#EEF8F1] text-[#4E8B3F] border border-[#CCEBD5]'
                  }`}
                >
                  <MapPin size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#173A20]">{parcel.name}</span>
                    {parcel.isHeadquarters ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#173A20] text-[#E2A63C] text-[10px] font-bold">
                        HQ Base
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-[#4E8B3F] text-[10px] font-semibold">
                        Branch Plot
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#5C5245]">
                    {parcel.city}, {parcel.region} {parcel.division ? `(${parcel.division})` : ''}
                  </div>
                  {parcel.location && (
                    <div className="text-[11px] text-[#5C5245]/80 flex items-center gap-1">
                      <span>📍</span>
                      <span>{parcel.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end justify-between shrink-0 self-stretch">
                <div className="text-right">
                  <div className="font-mono-num text-sm font-bold text-[#173A20]">
                    {parcel.sizeHectares || 1.0}
                  </div>
                  <div className="text-[10px] font-bold text-[#5C5245] uppercase">Hectares</div>
                </div>

                {!parcel.isHeadquarters && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSite(parcel.id)}
                    className="p-1 rounded-lg text-[#5C5245] hover:text-[#B54A34] hover:bg-[#FDF3F1] transition cursor-pointer"
                    title="Remove site"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Produce Produced on this Farm Header */}
      <div className="bg-white rounded-3xl border border-[#CCEBD5] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#EEF8F1]">
          <div>
            <h2 className="text-base font-bold text-[#173A20]">Produce Produced on this Farm</h2>
            <p className="text-xs text-[#5C5245]">{farmYields.length} items currently listed</p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddProduceModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add Produce</span>
          </button>
        </div>

        {farmYields.length === 0 ? (
          <div className="py-10 text-center space-y-2 bg-[#EEF8F1] rounded-2xl border border-[#CCEBD5]">
            <Package size={32} className="text-[#4E8B3F] mx-auto" />
            <h3 className="font-bold text-sm text-[#173A20]">No Produce Listed Yet</h3>
            <p className="text-xs text-[#5C5245] max-w-xs mx-auto">
              Add your freshly harvested tomatoes, potatoes, plantains or livestock to start selling directly to households and Buyam-Sellam buyers.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {farmYields.map((y: any) => {
              const stock = y.stockQuantity ?? 0;
              const isOut = stock <= 0;
              const isPaused = y.isAvailable === false;
              return (
                <div
                  key={y.id}
                  className="p-3.5 sm:p-4 rounded-2xl border border-[#CCEBD5] hover:border-[#4E8B3F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={y.image || y.mediaUrls?.[0]}
                      alt={y.title}
                      className="w-16 h-16 rounded-xl object-cover border border-[#CCEBD5] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#241A12] truncate">{y.title}</h3>
                        {y.isOrganic && (
                          <span className="text-[10px] font-semibold bg-[#EEF8F1] text-[#4E8B3F] border border-[#CCEBD5] px-2 py-0.2 rounded-full">
                            Organic
                          </span>
                        )}
                      </div>
                      <div className="font-mono-num text-xs font-bold text-[#173A20] mt-0.5">
                        {formatXaf(y.price || y.pricePerUnit)} / {y.unit}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#5C5245] mt-1">
                        <span
                          className={`font-mono-num font-semibold ${isOut ? 'text-[#dc2626]' : 'text-[#4E8B3F]'
                            }`}
                        >
                          {isOut ? 'Out of Stock' : `${stock} ${y.unit} in stock`}
                        </span>
                        {isPaused && (
                          <span className="bg-[#FEF2D8] text-[#B87D1E] px-2 py-0.2 rounded-full font-bold text-[10px]">
                            Paused
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Item Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openStockModal(y)}
                      className="px-3 py-1.5 rounded-full bg-[#EEF8F1] hover:bg-[#E1F3E7] border border-[#CCEBD5] text-[#4E8B3F] text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Sliders size={13} />
                      <span>Balance Stock</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduceItem(y);
                        const matchedParcel = activeParcels.find((p) =>
                          y.originRegion && (y.originRegion.includes(p.name) || y.originRegion.includes(p.city))
                        );
                        setProduceForm({
                          title: y.title,
                          description: y.description || '',
                          categoryName: y.categoryName || 'Vegetables & Greens',
                          selectedParcelId: matchedParcel?.id || activeParcels[0]?.id || '',
                          pricePerUnit: String(y.price || y.pricePerUnit),
                          unit: y.unit || 'KG',
                          stockQuantity: String(y.stockQuantity || 0),
                          isOrganic: Boolean(y.isOrganic),
                          isWholesaleBulkAvailable: Boolean(y.isWholesaleBulkAvailable),
                          bulkMinQuantity: String(y.bulkMinQuantity || 10),
                          bulkPricePerUnit: String(y.bulkPricePerUnit || y.price),
                          mediaUrl: y.image || y.mediaUrls?.[0] || '',
                        });
                        setShowEditProduceModal(true);
                      }}
                      className="w-8 h-8 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#241A12] hover:border-[#4E8B3F] transition cursor-pointer"
                      title="Edit Produce"
                    >
                      <Edit3 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduce(y.id, y.title)}
                      className="w-8 h-8 rounded-full bg-white border border-[#dc2626]/30 text-[#dc2626] hover:bg-[#FDF3F1] flex items-center justify-center transition cursor-pointer"
                      title="Delete Produce"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Registered Farms Portfolio (Matches mobile FarmManagementScreen) */}
      {farmsList.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#CCEBD5] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EEF8F1]">
            <div className="flex items-center gap-2">
              <Warehouse size={16} className="text-[#4E8B3F]" />
              <h2 className="text-base font-bold text-[#173A20]">
                Your Farm Portfolio ({farmsList.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/farmer/new')}
              className="text-xs font-bold text-[#4E8B3F] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>Register New Farm</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {farmsList.map((farm) => {
              const isSelected = farm.id === selectedFarmId;
              return (
                <div
                  key={farm.id}
                  onClick={() => handleSelectFarm(farm.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${isSelected
                      ? 'bg-[#EEF8F1] border-[#4E8B3F] shadow-xs'
                      : 'bg-[#FAFAF8] border-[#CCEBD5] hover:border-[#4E8B3F]'
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={resolveMediaUrl(farm.coverPhoto)}
                      alt={farm.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#CCEBD5]"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#173A20] truncate">{farm.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#4E8B3F] shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-[#5C5245] truncate">
                        {farm.city}, {farm.region} • {farm.sizeHectares || 1.0} Ha
                      </div>
                      <div className="text-[11px] text-[#4E8B3F] font-semibold">
                        {farm.parcels?.length || 1} Operating Site(s)
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isSelected ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#4E8B3F] text-white text-[10px] font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-white border border-[#CCEBD5] text-[#5C5245] text-[10px] font-semibold hover:border-[#4E8B3F]">
                        Switch
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: ADD / EDIT PRODUCE
      ===================================================================== */}
      {(showAddProduceModal || showEditProduceModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => {
              setShowAddProduceModal(false);
              setShowEditProduceModal(false);
            }}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-[#CCEBD5] p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <h3 className="font-bold text-base text-[#173A20]">
                {showEditProduceModal ? 'Edit Produce Listing' : 'List New Harvest Produce'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddProduceModal(false);
                  setShowEditProduceModal(false);
                }}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={showEditProduceModal ? handleSaveEditProduce : handleCreateProduce}
              className="space-y-3.5"
            >
              {/* Site / Parcel Selection for this Produce */}
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1.5">
                  Harvest Operating Site / Parcel
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                  {activeParcels.map((parcel) => {
                    const isSelected = (produceForm.selectedParcelId || activeParcels[0]?.id) === parcel.id;
                    return (
                      <button
                        key={parcel.id}
                        type="button"
                        onClick={() => setProduceForm((p) => ({ ...p, selectedParcelId: parcel.id }))}
                        className={`p-2.5 rounded-xl border text-left shrink-0 transition cursor-pointer min-w-[140px] max-w-[200px] ${
                          isSelected
                            ? 'bg-[#EEF8F1] border-[#4E8B3F] ring-1 ring-[#4E8B3F] shadow-2xs'
                            : 'bg-white border-[#CCEBD5] hover:border-[#4E8B3F]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-[#173A20] truncate">{parcel.name}</span>
                          {parcel.isHeadquarters && (
                            <span className="text-[9px] px-1 py-0.2 rounded-full bg-[#173A20] text-[#E2A63C] font-mono-num font-bold">
                              HQ
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#5C5245] truncate">
                          {parcel.city}, {parcel.region}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Produce Name *
                </label>
                <input
                  type="text"
                  required
                  value={produceForm.title}
                  onChange={(e) => setProduceForm({ ...produceForm, title: e.target.value })}
                  placeholder="e.g. Fresh Foumbot Roma Tomatoes"
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">Category</label>
                  <select
                    value={produceForm.categoryName}
                    onChange={(e) => setProduceForm({ ...produceForm, categoryName: e.target.value })}
                    className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3 py-2 text-xs text-[#241A12]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                    Price (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    value={produceForm.pricePerUnit}
                    onChange={(e) => setProduceForm({ ...produceForm, pricePerUnit: e.target.value })}
                    placeholder="8500"
                    className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">Unit</label>
                  <select
                    value={produceForm.unit}
                    onChange={(e) => setProduceForm({ ...produceForm, unit: e.target.value })}
                    className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3 py-2 text-xs text-[#241A12]"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                    Harvest Stock Available *
                  </label>
                  <input
                    type="number"
                    required
                    value={produceForm.stockQuantity}
                    onChange={(e) => setProduceForm({ ...produceForm, stockQuantity: e.target.value })}
                    placeholder="45"
                    className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={produceForm.mediaUrl}
                  onChange={(e) => setProduceForm({ ...produceForm, mediaUrl: e.target.value })}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={produceForm.description}
                  onChange={(e) => setProduceForm({ ...produceForm, description: e.target.value })}
                  placeholder="Harvest sorting, quality grade, packaging..."
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {showEditProduceModal ? 'Save Produce Changes' : '+ Publish Produce to Marketplace'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: STOCK BALANCING (REPLENISH / SPOILAGE)
      ===================================================================== */}
      {stockModalVisible && selectedStockYield && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setStockModalVisible(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-[#CCEBD5] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <div>
                <h3 className="font-bold text-base text-[#173A20]">Stock Balancing & Audit</h3>
                <p className="text-xs text-[#5C5245]">{selectedStockYield.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setStockModalVisible(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-between">
              <span className="text-xs text-[#5C5245]">Current Harvest Stock</span>
              <span className="font-mono-num font-bold text-lg text-[#173A20]">
                {selectedStockYield.stockQuantity ?? 0} {selectedStockYield.unit}
              </span>
            </div>

            {/* Replenish vs Spoilage tabs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStockActionTab('REPLENISH')}
                className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${stockActionTab === 'REPLENISH'
                    ? 'bg-[#4E8B3F] text-white border-[#4E8B3F]'
                    : 'bg-white text-[#241A12] border-[#CCEBD5]'
                  }`}
              >
                + Replenish Stock
              </button>
              <button
                type="button"
                onClick={() => setStockActionTab('SPOILAGE')}
                className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${stockActionTab === 'SPOILAGE'
                    ? 'bg-[#B54A34] text-white border-[#B54A34]'
                    : 'bg-white text-[#241A12] border-[#CCEBD5]'
                  }`}
              >
                - Log Spoilage / Damage
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  {stockActionTab === 'REPLENISH' ? 'Quantity to Add' : 'Quantity to Deduct'} (
                  {selectedStockYield.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={stockInputDelta}
                  onChange={(e) => setStockInputDelta(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#EEF8F1] border border-[#CCEBD5]">
                <span className="text-xs font-semibold text-[#241A12]">
                  Live on AgroMarket Marketplace
                </span>
                <input
                  type="checkbox"
                  checked={isAvailableToggle}
                  onChange={(e) => setIsAvailableToggle(e.target.checked)}
                  className="w-4 h-4 accent-[#4E8B3F]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#173A20] text-[#E2A63C] text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Confirm Inventory Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: EDIT FARM PROFILE
      ===================================================================== */}
      {showEditFarmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowEditFarmModal(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-[#CCEBD5] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <h3 className="font-bold text-base text-[#173A20]">Edit Farm Profile</h3>
              <button
                type="button"
                onClick={() => setShowEditFarmModal(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFarmProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">Farm Name</label>
                <input
                  type="text"
                  required
                  value={editFarmName}
                  onChange={(e) => setEditFarmName(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#5C5245]">Banner Photo</label>
                  <button
                    type="button"
                    onClick={() => editCoverInputRef.current?.click()}
                    disabled={uploadingEditCover}
                    className="text-[11px] font-bold text-[#4E8B3F] hover:underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    <Upload size={12} />
                    <span>{uploadingEditCover ? 'Uploading...' : 'Upload Image'}</span>
                  </button>
                </div>

                <input
                  ref={editCoverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadEditCover}
                />

                {editFarmCover && (
                  <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden mb-2 border border-[#CCEBD5]">
                    <img src={resolveMediaUrl(editFarmCover)} alt="Farm Banner" className="w-full h-full object-cover" />
                  </div>
                )}

                <input
                  type="text"
                  value={editFarmCover}
                  onChange={(e) => setEditFarmCover(e.target.value)}
                  placeholder="Or paste banner image URL"
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editFarmDesc}
                  onChange={(e) => setEditFarmDesc(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#4E8B3F] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Save Farm Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: ADD OPERATING SITE / PARCEL
      ===================================================================== */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowAddSiteModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-[#CCEBD5] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F]">
                  <MapPin size={16} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#173A20]">Add Operating Site / Plot</h3>
                  <p className="text-xs text-[#5C5245]">{activeFarm?.name || 'Expand Farm Footprint'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSiteModal(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSite} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Site / Plot Nickname *
                </label>
                <input
                  type="text"
                  required
                  value={newSiteForm.name}
                  onChange={(e) => setNewSiteForm({ ...newSiteForm, name: e.target.value })}
                  placeholder="e.g. Buea Hatchery, Mutengene Broiler Pen, Limbe Depot"
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                    Region *
                  </label>
                  <select
                    value={newSiteForm.region}
                    onChange={(e) => setNewSiteForm({ ...newSiteForm, region: e.target.value })}
                    className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3 py-2 text-xs text-[#241A12]"
                  >
                    {CAMEROON_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                    Division (e.g. Noun, Fako, Wouri)
                  </label>
                  <input
                    type="text"
                    value={newSiteForm.division}
                    onChange={(e) => setNewSiteForm({ ...newSiteForm, division: e.target.value })}
                    placeholder="e.g. Fako"
                    className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                    Town / City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSiteForm.city}
                    onChange={(e) => setNewSiteForm({ ...newSiteForm, city: e.target.value })}
                    placeholder="e.g. Buea"
                    className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                    Parcel Footprint (Hectares) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={newSiteForm.sizeHectares}
                    onChange={(e) => setNewSiteForm({ ...newSiteForm, sizeHectares: e.target.value })}
                    placeholder="1.5"
                    className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Street / Farm Landmark / GPS Coordinates (Optional)
                </label>
                <input
                  type="text"
                  value={newSiteForm.location}
                  onChange={(e) => setNewSiteForm({ ...newSiteForm, location: e.target.value })}
                  placeholder="e.g. Mile 17 corridor, Mount Cameroon slope, Road to Bokova"
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] text-xs text-[#173A20] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#4E8B3F]" />
                  <span>Multi-Site Traceability</span>
                </div>
                <p className="text-[11px] text-[#5C5245] leading-relaxed">
                  Adding this site lets you select it as the origin point when publishing fresh harvests to AgroMarket, giving buyers full soil-to-hand transparency.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSiteModal(false)}
                  className="py-3 rounded-full bg-white border border-[#CCEBD5] text-[#241A12] text-xs font-bold hover:bg-[#EEF8F1] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSite}
                  className="py-3 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {savingSite ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Site...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={15} strokeWidth={2.5} />
                      <span>Register Site</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: CASCADING FARM DELETION
      ===================================================================== */}
      {deleteModalVisible && activeFarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setDeleteModalVisible(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-[#CCEBD5] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <div className="flex items-center gap-2 text-[#dc2626]">
                <AlertTriangle size={18} />
                <h3 className="font-bold text-base">Delete Farm Enterprise</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalVisible(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#5C5245] leading-relaxed">
              Are you sure you want to delete <strong>{activeFarm.name}</strong>?
            </p>

            {farmsList.length > 1 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#241A12]">
                  Active Listings & Stories:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteAction('transfer')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${deleteAction === 'transfer'
                        ? 'bg-[#EEF8F1] border-[#4E8B3F] text-[#173A20]'
                        : 'bg-white border-[#CCEBD5] text-[#5C5245]'
                      }`}
                  >
                    Transfer to another farm
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteAction('delete')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${deleteAction === 'delete'
                        ? 'bg-[#FDF3F1] border-[#dc2626] text-[#dc2626]'
                        : 'bg-white border-[#CCEBD5] text-[#5C5245]'
                      }`}
                  >
                    Permanently delete
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                Type <strong>{activeFarm.name}</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={activeFarm.name}
                className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
              />
            </div>

            <button
              type="button"
              onClick={handleExecuteDeleteFarm}
              disabled={deleteConfirmName.trim().toLowerCase() !== activeFarm.name.trim().toLowerCase()}
              className="w-full py-3 rounded-full bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Permanently Remove Farm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmManagementPage;

