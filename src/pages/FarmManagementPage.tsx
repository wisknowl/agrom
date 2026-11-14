import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Award,
  X,
  Check,
  CheckCircle2,
  Sliders,
  Edit3,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Building2,
  ArrowLeft,
  Upload,
  Camera,
  Tag,
  Clock,
  Salad,
  Leaf,
  Apple,
  Wheat,
  Nut,
  Droplets,
  Flame,
  Egg,
  Beef,
  Fish,
  Sunrise,
  Sunset,
  RefreshCw,
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
import AgromDropdown from '@/components/AgromDropdown';
import { AgromImageUploader } from '@/components/AgromImageUploader';

const CATEGORIES = [
  { id: 'cat-veg', name: 'Vegetables & Greens', emoji: '🥬' },
  { id: 'cat-tub', name: 'Tubers & Roots', emoji: '🥔' },
  { id: 'cat-plt', name: 'Plantains & Bananas', emoji: '🍌' },
  { id: 'cat-fru', name: 'Fruits & Citrus', emoji: '🍊' },
  { id: 'cat-cer', name: 'Grains & Cereals', emoji: '🌽' },
  { id: 'cat-leg', name: 'Legumes & Seeds', emoji: '🥜' },
  { id: 'cat-oil', name: 'Oils & Fats', emoji: '🛢️' },
  { id: 'cat-spi', name: 'Spices & Herbs', emoji: '🌶️' },
  { id: 'cat-egg', name: 'Poultry & Eggs', emoji: '🥚' },
  { id: 'cat-liv', name: 'Livestock & Cattle', emoji: '🐂' },
  { id: 'cat-aqu', name: 'Aquaculture & Fish', emoji: '🐟' },
];

const UNITS = [
  { id: 'KG', label: 'KG' },
  { id: 'CRATE', label: 'Crate' },
  { id: 'BAG_50KG', label: '50kg Bag' },
  { id: 'BAG_100KG', label: '100kg Bag' },
  { id: 'BAG_25KG', label: '25kg Bag' },
  { id: 'BUCKET', label: 'Bucket' },
  { id: 'BASIN', label: 'Basin' },
  { id: 'BUNCH', label: 'Bunch' },
  { id: 'PIECE', label: 'Piece' },
  { id: 'TON', label: 'Tonne' },
  { id: 'LITER', label: 'Liter' },
  { id: 'CARTON', label: 'Carton' },
  { id: 'NET', label: 'Net' },
  { id: 'CUSTOM', label: '+ Custom' },
];

const SEASONS = [
  { id: 'PEAK_HARVEST', label: 'Peak Harvest', badge: '🔥' },
  { id: 'EARLY_HARVEST', label: 'Early Season', badge: '🌱' },
  { id: 'OFF_SEASON', label: 'Off-Season', badge: '⚡' },
  { id: 'YEAR_ROUND', label: 'Year-Round', badge: '🔄' },
];

const SHELF_LIFE_OPTIONS = [
  { days: '3', label: '3 Days (Fast Perishable)' },
  { days: '7', label: '7 Days' },
  { days: '14', label: '14 Days' },
  { days: '30', label: '30+ Days (Storable)' },
];

const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'cat-veg':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#15803D] shrink-0">
          <Salad size={14} strokeWidth={2.4} />
        </div>
      );
    case 'cat-tub':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#FFEDD5] border border-[#FED7AA] flex items-center justify-center text-[#9A3412] shrink-0">
          <Layers size={14} strokeWidth={2.4} />
        </div>
      );
    case 'cat-plt':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#FEF9C3] border border-[#FEF08A] flex items-center justify-center text-[#CA8A04] shrink-0">
          <Leaf size={14} strokeWidth={2.4} />
        </div>
      );
    case 'cat-fru':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#FFEDD5] border border-[#FED7AA] flex items-center justify-center text-[#EA580C] shrink-0">
          <Apple size={14} strokeWidth={2.4} />
        </div>
      );
    case 'cat-cer':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shrink-0">
          <Wheat size={14} strokeWidth={2.4} />
        </div>
      );
    case 'cat-leg':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#FEF9C3] border border-[#FEF08A] flex items-center justify-center text-[#854D0E] shrink-0">
          <Nut size={14} strokeWidth={2.4} />
        </div>
      );
    case 'cat-oil':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shrink-0">
          <Droplets size={14} strokeWidth={2.4} />
        </div>
      );
    case 'cat-spi':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0">
          <Flame size={14} strokeWidth={2.4} />
        </div>
      );
    case 'cat-egg':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#FEF9C3] border border-[#FEF08A] flex items-center justify-center text-[#CA8A04] shrink-0">
          <Egg size={14} strokeWidth={2.4} />
        </div>
      );
    case 'cat-liv':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#FDE68A]/40 border border-[#FDE68A] flex items-center justify-center text-[#78350F] shrink-0">
          <Beef size={14} strokeWidth={2.4} />
        </div>
      );
    case 'cat-aqu':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shrink-0">
          <Fish size={14} strokeWidth={2.4} />
        </div>
      );
    default:
      return (
        <div className="w-6 h-6 rounded-lg bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F] shrink-0">
          <Sprout size={14} strokeWidth={2.4} />
        </div>
      );
  }
};

const getSeasonIcon = (id: string) => {
  switch (id) {
    case 'PEAK_HARVEST':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shrink-0">
          <Flame size={14} strokeWidth={2.4} />
        </div>
      );
    case 'EARLY_HARVEST':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#15803D] shrink-0">
          <Sunrise size={14} strokeWidth={2.4} />
        </div>
      );
    case 'OFF_SEASON':
    case 'LATE_SEASON':
      return (
        <div className="w-6 h-6 rounded-lg bg-[#FFEDD5] border border-[#FED7AA] flex items-center justify-center text-[#B45309] shrink-0">
          <Sunset size={14} strokeWidth={2.4} />
        </div>
      );
    case 'YEAR_ROUND':
    default:
      return (
        <div className="w-6 h-6 rounded-lg bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#173A20] shrink-0">
          <RefreshCw size={13} strokeWidth={2.4} />
        </div>
      );
  }
};

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

const INITIAL_PRODUCE_FORM = {
  title: '',
  description: '',
  categoryName: 'Vegetables & Greens',
  selectedParcelId: '',
  pricePerUnit: '',
  unit: 'KG',
  customUnit: '',
  lifecycleStatus: 'SELLING' as 'SELLING' | 'GROWING' | 'OFF_CYCLE',
  expectedHarvestWindow: '',
  nextCycleMonth: '',
  harvestDate: new Date().toISOString().split('T')[0],
  seasonality: 'PEAK_HARVEST',
  shelfLifeDays: '7',
  stockQuantity: '',
  minOrderQuantity: '1',
  isOrganic: true,
  isWholesaleBulkAvailable: false,
  bulkMinQuantity: '10',
  bulkPricePerUnit: '',
  mediaUrl: '',
  mediaUrls: [] as string[],
};

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
  const [activeTab, setActiveTab] = useState<'produce' | 'sites'>('produce');
  const [produceSearchQuery, setProduceSearchQuery] = useState('');

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

  // Produce Modals & Form State
  const [showAddProduceModal, setShowAddProduceModal] = useState(false);
  const [showEditProduceModal, setShowEditProduceModal] = useState(false);
  const [editingProduceItem, setEditingProduceItem] = useState<any>(null);
  const [savingProduce, setSavingProduce] = useState(false);

  const [produceForm, setProduceForm] = useState(INITIAL_PRODUCE_FORM);

  const handleOpenAddProduce = () => {
    setEditingProduceItem(null);
    setShowEditProduceModal(false);
    setProduceForm({
      ...INITIAL_PRODUCE_FORM,
      selectedParcelId: activeParcels[0]?.id || '',
    });
    setShowAddProduceModal(true);
  };

  const handleCloseProduceModal = () => {
    setShowAddProduceModal(false);
    setShowEditProduceModal(false);
    setEditingProduceItem(null);
    setProduceForm(INITIAL_PRODUCE_FORM);
  };

  const handleOpenEditProduce = (y: any) => {
    setShowAddProduceModal(false);
    setEditingProduceItem(y);
    const matchedParcel = activeParcels.find((p) =>
      y.originRegion && (y.originRegion.includes(p.name) || y.originRegion.includes(p.city))
    );
    const isKnownUnit = UNITS.some((u) => u.id === y.unit);
    const existingUrls = (y.mediaUrls && y.mediaUrls.length > 0 ? y.mediaUrls : [y.image].filter(Boolean)) as string[];
    setProduceForm({
      title: y.title || '',
      description: y.description || '',
      categoryName: y.categoryName || y.category?.name || 'Vegetables & Greens',
      selectedParcelId: matchedParcel?.id || activeParcels[0]?.id || '',
      pricePerUnit: String(y.price || y.pricePerUnit || ''),
      unit: isKnownUnit ? y.unit : 'CUSTOM',
      customUnit: isKnownUnit ? '' : (y.unit || ''),
      lifecycleStatus: (y.lifecycleStatus as any) || 'SELLING',
      expectedHarvestWindow: y.expectedHarvestWindow || '',
      nextCycleMonth: y.nextCycleMonth || '',
      harvestDate: y.harvestDate ? y.harvestDate.split('T')[0] : new Date().toISOString().split('T')[0],
      seasonality: y.seasonality || 'PEAK_HARVEST',
      shelfLifeDays: String(y.shelfLifeDays || '7'),
      stockQuantity: String(y.stockQuantity || 0),
      minOrderQuantity: String(y.minOrderQuantity || 1),
      isOrganic: Boolean(y.isOrganic),
      isWholesaleBulkAvailable: Boolean(y.isWholesaleBulkAvailable),
      bulkMinQuantity: String(y.bulkMinQuantity || 10),
      bulkPricePerUnit: String(y.bulkPricePerUnit || y.price || y.pricePerUnit || ''),
      mediaUrl: existingUrls[0] || '',
      mediaUrls: existingUrls,
    });
    setShowEditProduceModal(true);
  };

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
  const [editPrimaryProduce, setEditPrimaryProduce] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [savingFarmProfile, setSavingFarmProfile] = useState(false);

  // Cascading Farm Deletion Modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteAction, setDeleteAction] = useState<'transfer' | 'delete'>('transfer');
  const [deleteTargetFarmId, setDeleteTargetFarmId] = useState<string>('');
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteSingleFarmAgreed, setDeleteSingleFarmAgreed] = useState(false);
  const [isDeletingFarm, setIsDeletingFarm] = useState(false);

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

  // Produce Actions
  const handleCreateProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm?.id || !produceForm.title.trim() || !produceForm.pricePerUnit) return;
    try {
      setSavingProduce(true);
      const chosenParcel = activeParcels.find((p) => p.id === produceForm.selectedParcelId) || activeParcels[0];
      const originRegion = chosenParcel
        ? `${chosenParcel.name} (${chosenParcel.city}, ${chosenParcel.region})`
        : `${activeFarm.city || 'Foumbot'}, ${activeFarm.region || 'West Region'}`;

      const categoryObj = CATEGORIES.find((c) => c.name === produceForm.categoryName) || CATEGORIES[0];
      const effectiveUnit = produceForm.unit === 'CUSTOM'
        ? (produceForm.customUnit.trim() || 'KG')
        : produceForm.unit;

      const fallbackImage = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800';

      await createProduceApi({
        farmId: activeFarm.id,
        categoryId: categoryObj.id,
        categoryName: categoryObj.name,
        title: produceForm.title.trim(),
        description: produceForm.description.trim() || `Fresh harvest directly from ${activeFarm.name}.`,
        originRegion,
        pricePerUnit: Number(produceForm.pricePerUnit),
        unit: effectiveUnit,
        customUnit: produceForm.unit === 'CUSTOM' ? produceForm.customUnit.trim() : undefined,
        lifecycleStatus: produceForm.lifecycleStatus,
        expectedHarvestWindow: produceForm.lifecycleStatus === 'GROWING' ? produceForm.expectedHarvestWindow : undefined,
        nextCycleMonth: produceForm.lifecycleStatus === 'OFF_CYCLE' ? produceForm.nextCycleMonth : undefined,
        harvestDate: produceForm.harvestDate ? new Date(produceForm.harvestDate).toISOString() : undefined,
        seasonality: produceForm.seasonality,
        shelfLifeDays: produceForm.shelfLifeDays ? Number(produceForm.shelfLifeDays) : undefined,
        stockQuantity: Number(produceForm.stockQuantity || 0),
        minOrderQuantity: Number(produceForm.minOrderQuantity || 1),
        isOrganic: produceForm.isOrganic,
        isWholesaleBulkAvailable: produceForm.isWholesaleBulkAvailable,
        bulkMinQuantity: produceForm.isWholesaleBulkAvailable ? Number(produceForm.bulkMinQuantity || 10) : undefined,
        bulkPricePerUnit: produceForm.isWholesaleBulkAvailable ? Number(produceForm.bulkPricePerUnit || produceForm.pricePerUnit) : undefined,
        mediaUrls: produceForm.mediaUrls.length > 0 ? produceForm.mediaUrls : [produceForm.mediaUrl || fallbackImage],
      });
      handleCloseProduceModal();
      handleSelectFarm(activeFarm.id);
    } catch (err: any) {
      alert(err.message || 'Failed to list produce');
    } finally {
      setSavingProduce(false);
    }
  };

  const handleSaveEditProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduceItem?.id) return;
    try {
      setSavingProduce(true);
      const categoryObj = CATEGORIES.find((c) => c.name === produceForm.categoryName) || CATEGORIES[0];
      const effectiveUnit = produceForm.unit === 'CUSTOM'
        ? (produceForm.customUnit.trim() || 'KG')
        : produceForm.unit;

      const chosenParcel = activeParcels.find((p) => p.id === produceForm.selectedParcelId) || activeParcels[0];
      const originRegion = chosenParcel
        ? `${chosenParcel.name} (${chosenParcel.city}, ${chosenParcel.region})`
        : `${activeFarm?.city || 'Foumbot'}, ${activeFarm?.region || 'West Region'}`;

      await updateProduceApi(editingProduceItem.id, {
        title: produceForm.title.trim(),
        description: produceForm.description.trim(),
        categoryId: categoryObj.id,
        categoryName: categoryObj.name,
        originRegion,
        pricePerUnit: Number(produceForm.pricePerUnit),
        unit: effectiveUnit,
        customUnit: produceForm.unit === 'CUSTOM' ? produceForm.customUnit.trim() : undefined,
        lifecycleStatus: produceForm.lifecycleStatus,
        expectedHarvestWindow: produceForm.lifecycleStatus === 'GROWING' ? produceForm.expectedHarvestWindow : undefined,
        nextCycleMonth: produceForm.lifecycleStatus === 'OFF_CYCLE' ? produceForm.nextCycleMonth : undefined,
        harvestDate: produceForm.harvestDate ? new Date(produceForm.harvestDate).toISOString() : undefined,
        seasonality: produceForm.seasonality,
        shelfLifeDays: produceForm.shelfLifeDays ? Number(produceForm.shelfLifeDays) : undefined,
        stockQuantity: Number(produceForm.stockQuantity || 0),
        minOrderQuantity: Number(produceForm.minOrderQuantity || 1),
        isOrganic: produceForm.isOrganic,
        isWholesaleBulkAvailable: produceForm.isWholesaleBulkAvailable,
        bulkMinQuantity: produceForm.isWholesaleBulkAvailable ? Number(produceForm.bulkMinQuantity) : undefined,
        bulkPricePerUnit: produceForm.isWholesaleBulkAvailable ? Number(produceForm.bulkPricePerUnit) : undefined,
        mediaUrls: produceForm.mediaUrls.length > 0 ? produceForm.mediaUrls : (produceForm.mediaUrl ? [produceForm.mediaUrl] : undefined),
      });
      handleCloseProduceModal();
      handleSelectFarm(activeFarm?.id || '');
    } catch (err: any) {
      alert(err.message || 'Could not update produce');
    } finally {
      setSavingProduce(false);
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

  const handleToggleProduceAvailability = async (item: any) => {
    const nextVal = item.isAvailable === false ? true : false;
    try {
      await patchProduceStockApi(item.id, {
        delta: 0,
        isAvailable: nextVal,
      });
      setActiveFarm((prev: any) => {
        if (!prev) return prev;
        const updatedYields = (prev.yields || []).map((y: any) =>
          y.id === item.id ? { ...y, isAvailable: nextVal } : y
        );
        return { ...prev, yields: updatedYields };
      });
    } catch (err: any) {
      alert(err.message || 'Failed to update produce availability');
    }
  };

  const handleSetProduceLifecycle = async (item: any, newStatus: 'SELLING' | 'GROWING' | 'OFF_CYCLE') => {
    let windowVal = item.expectedHarvestWindow;
    let nextMonthVal = item.nextCycleMonth;

    if (newStatus === 'GROWING' && !item.expectedHarvestWindow) {
      const resp = window.prompt('Enter expected harvest window (e.g. Dec 15 - Dec 28 or Within 3 Weeks):', 'Within 30 Days');
      if (resp === null) return;
      windowVal = resp.trim() || 'Coming Soon';
    } else if (newStatus === 'OFF_CYCLE' && !item.nextCycleMonth) {
      const resp = window.prompt('Enter next target planting or harvest month (e.g. March 2027):', 'Next Season');
      if (resp === null) return;
      nextMonthVal = resp.trim() || 'Next Season';
    }

    try {
      await patchProduceStockApi(item.id, {
        lifecycleStatus: newStatus,
        expectedHarvestWindow: windowVal,
        nextCycleMonth: nextMonthVal,
        isAvailable: newStatus !== 'OFF_CYCLE',
      });
      setActiveFarm((prev: any) => {
        if (!prev) return prev;
        const updatedYields = (prev.yields || []).map((y: any) =>
          y.id === item.id
            ? {
              ...y,
              lifecycleStatus: newStatus,
              expectedHarvestWindow: windowVal,
              nextCycleMonth: nextMonthVal,
              isAvailable: newStatus !== 'OFF_CYCLE',
            }
            : y
        );
        return { ...prev, yields: updatedYields };
      });
    } catch (err: any) {
      alert(err.message || 'Failed to update produce lifecycle status');
    }
  };

  // Edit Farm Profile
  const openEditFarmModal = () => {
    if (!activeFarm) return;
    setEditFarmName(activeFarm.name || '');
    setEditFarmDesc(activeFarm.description || '');
    setEditFarmCover(activeFarm.coverPhoto || '');
    setEditPrimaryProduce(
      Array.isArray(activeFarm.primaryProduce)
        ? [...activeFarm.primaryProduce]
        : []
    );
    setEditTagInput('');
    setShowEditFarmModal(true);
  };

  const handleAddEditTag = () => {
    const trimmed = editTagInput.trim();
    if (trimmed && !editPrimaryProduce.includes(trimmed)) {
      setEditPrimaryProduce([...editPrimaryProduce, trimmed]);
      setEditTagInput('');
    }
  };

  const handleRemoveEditTag = (tagToRemove: string) => {
    setEditPrimaryProduce(editPrimaryProduce.filter((t) => t !== tagToRemove));
  };

  const handleSaveFarmProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm?.id || !editFarmName.trim()) return;
    setSavingFarmProfile(true);
    try {
      const updated = await updateFarmApi(activeFarm.id, {
        name: editFarmName.trim(),
        description: editFarmDesc.trim(),
        coverPhoto: editFarmCover,
        primaryProduce: editPrimaryProduce,
      });
      setActiveFarm((prev: any) => ({ ...prev, ...updated }));
      setShowEditFarmModal(false);
      loadFarms();
    } catch (err: any) {
      alert(err.message || 'Could not save farm profile');
    } finally {
      setSavingFarmProfile(false);
    }
  };

  // 2-Step Cascading Farm Deletion
  const openDeleteFarmModal = () => {
    if (!activeFarm) return;
    const otherFarms = farmsList.filter((f) => f.id !== activeFarm.id);
    setDeleteStep(1);
    setDeleteSingleFarmAgreed(false);
    setDeleteConfirmName('');
    if (otherFarms.length > 0) {
      setDeleteAction('transfer');
      setDeleteTargetFarmId(otherFarms[0].id);
    } else {
      setDeleteAction('delete');
      setDeleteTargetFarmId('');
    }
    setShowEditFarmModal(false);
    setDeleteModalVisible(true);
  };

  const handleExecuteDeleteFarm = async () => {
    if (!activeFarm) return;
    if (deleteConfirmName.trim().toLowerCase() !== activeFarm.name.trim().toLowerCase()) {
      alert('Please type the exact farm name to confirm deletion.');
      return;
    }

    setIsDeletingFarm(true);
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
      alert(err.message || 'Failed to delete farm');
    } finally {
      setIsDeletingFarm(false);
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
  const filteredProduce = farmYields.filter((item: any) =>
    !produceSearchQuery.trim() || item.title?.toLowerCase().includes(produceSearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-[11px] py-6 space-y-6">
      {/* Top Header Bar with Navigation and Storefront & New Farm CTA */}
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
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {activeFarm && (
            <button
              type="button"
              onClick={() => navigate(`/farmer/${activeFarm.slug || activeFarm.id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#EEF8F1] hover:bg-[#CCEBD5] border border-[#CCEBD5] text-xs font-bold text-[#173A20] transition cursor-pointer"
              title="Preview Public Storefront"
            >
              <ExternalLink size={14} className="text-[#4E8B3F]" />
              <span>View Public Storefront</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/farmer/new')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#EEF8F1] hover:bg-[#CCEBD5] border border-[#CCEBD5] text-xs font-bold text-[#173A20] transition cursor-pointer"
          >
            <Plus size={14} className="text-[#4E8B3F]" />
            <span>New Farm</span>
          </button>
        </div>
      </div>

      {/* Multi-Farm Switcher Bar - always visible when farms exist */}
      {farmsList.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-1.5 text-xs text-[#5C5245] mr-1 shrink-0">
            <Warehouse size={14} className="text-[#4E8B3F]" />
            <span className="font-semibold uppercase text-xs">Farms:</span>
          </div>
          {farmsList.map((f) => {
            const active = f.id === selectedFarmId;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleSelectFarm(f.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${active
                  ? 'bg-[#173A20] text-white border-[#173A20] shadow-xs'
                  : 'bg-[#EEF8F1] text-[#173A20] border-[#CCEBD5] hover:bg-[#CCEBD5]'
                  }`}
              >
                <span>{f.name}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => navigate('/farmer/new')}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#EEF8F1] border border-dashed border-[#4E8B3F] text-[#4E8B3F] hover:bg-[#E1F3E7] whitespace-nowrap transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Add Another Farm</span>
          </button>
        </div>
      )}

      {/* Active Farm Card (Parity with Store Card: image on left, details middle, stats right) */}
      {activeFarm && (() => {
        const farmImg = resolveMediaUrl(activeFarm.avatarPhoto || activeFarm.coverPhoto);
        return (
          <div className="bg-white border border-[#CCEBD5] rounded-3xl overflow-hidden shadow-xs flex flex-col md:flex-row items-center">
            {/* Left farm image: compact height on mobile (reduced by 1/4), crisp square on desktop */}
            <div className="w-full h-36 sm:h-44 md:h-36 md:w-32 lg:w-36 shrink-0 bg-[#EEF8F1] border-b md:border-b-0 md:border-r border-[#CCEBD5] relative overflow-hidden">
              {farmImg ? (
                <img
                  src={farmImg}
                  alt={activeFarm.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#4E8B3F] p-4">
                  <Sprout size={36} />
                </div>
              )}
            </div>

            {/* Farm Details and Metrics */}
            <div className="flex-1 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-[#173A20]">
                    {activeFarm.name}
                  </h2>
                  <div className="flex items-center gap-1.5 ml-1">
                    <button
                      type="button"
                      onClick={openEditFarmModal}
                      className="w-7 h-7 rounded-full bg-[#EEF8F1] hover:bg-[#CCEBD5] border border-[#CCEBD5] flex items-center justify-center text-[#173A20] transition cursor-pointer"
                      title="Edit Farm Profile"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={openDeleteFarmModal}
                      className="w-7 h-7 rounded-full bg-white hover:bg-[#FDF3F1] border border-[#dc2626]/30 flex items-center justify-center text-[#dc2626] transition cursor-pointer"
                      title="Delete Farm"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#5C5245]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} className="text-[#4E8B3F]" />
                    {activeFarm.city}, {activeFarm.region}
                  </span>
                  <span className="text-[#CCEBD5]">•</span>
                  <span>Category: {activeFarm.category || 'CROPS'}</span>
                  <span className="text-[#CCEBD5]">•</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#173A20]">
                    <Warehouse size={12} className="text-[#4E8B3F]" />
                    {activeParcels.length} Operating Site(s)
                  </span>
                </div>
              </div>

              {/* Quick Metrics (Right side of card) */}
              <div className="flex items-center gap-3 sm:gap-6 bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 rounded-2xl shrink-0">
                <div className="text-center">
                  <div className="text-sm font-bold font-mono-num text-[#173A20]">
                    {farmYields.length}
                  </div>
                  <div className="text-[10px] text-[#5C5245] uppercase font-semibold">Active Yields</div>
                </div>
                <div className="w-px h-7 bg-[#CCEBD5]" />
                <div className="text-center">
                  <div className="text-sm font-bold font-mono-num text-[#173A20]">
                    {activeFarm.sizeHectares || 2.5} ha
                  </div>
                  <div className="text-[10px] text-[#5C5245] uppercase font-semibold">Total Land</div>
                </div>
                <div className="w-px h-7 bg-[#CCEBD5]" />
                <div className="text-center">
                  <div className="text-sm font-bold font-mono-num text-[#173A20]">
                    {activeFarm.rating?.toFixed(1) || '5.0'} ★
                  </div>
                  <div className="text-[10px] text-[#5C5245] uppercase font-semibold">Buyer Rating</div>
                </div>
                <div className="w-px h-7 bg-[#CCEBD5]" />
                <div className="text-center">
                  <div className="text-sm font-bold font-mono-num text-[#173A20]">
                    {user?.farmerProfile?.creditScore || activeFarm?.creditScore || 517}
                  </div>
                  <div className="text-[10px] text-[#5C5245] uppercase font-semibold">Credit Score</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =====================================================================
          PRIMARY TABS (PRODUCE, SITES) - Clean border-bottom tab bar (No enclosing box)
      ===================================================================== */}
      {activeFarm && (
        <div className="border-b border-[#CCEBD5]/70 flex items-center">
          <button
            type="button"
            onClick={() => setActiveTab('produce')}
            className="flex-1 sm:flex-none sm:px-8 py-3 flex items-center justify-center gap-2 relative cursor-pointer hover:text-[#4E8B3F] transition"
          >
            <Package
              size={17}
              className={activeTab === 'produce' ? 'text-[#4E8B3F]' : 'text-[#241A12]/45'}
            />
            <span
              className={`text-xs sm:text-sm ${activeTab === 'produce' ? 'font-bold text-[#4E8B3F]' : 'font-medium text-[#241A12]/60'
                }`}
            >
              Produce & Harvests ({farmYields.length})
            </span>
            {activeTab === 'produce' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#4E8B3F] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sites')}
            className="flex-1 sm:flex-none sm:px-8 py-3 flex items-center justify-center gap-2 relative cursor-pointer hover:text-[#4E8B3F] transition"
          >
            <Warehouse
              size={17}
              className={activeTab === 'sites' ? 'text-[#4E8B3F]' : 'text-[#241A12]/45'}
            />
            <span
              className={`text-xs sm:text-sm ${activeTab === 'sites' ? 'font-bold text-[#4E8B3F]' : 'font-medium text-[#241A12]/60'
                }`}
            >
              Operating Sites & Plots ({activeParcels.length})
            </span>
            {activeTab === 'sites' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#4E8B3F] rounded-full" />
            )}
          </button>
        </div>
      )}

      {/* Produce Action Bar (List Harvest + Search input if >= 10 items) */}
      {activeFarm && activeTab === 'produce' && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-xs text-[#5C5245]">
            <span className="font-bold text-[#173A20]">{farmYields.length}</span> harvest batches published
          </div>

          <div className="flex items-center gap-2">
            {farmYields.length >= 10 && (
              <input
                type="text"
                placeholder="Search produce..."
                value={produceSearchQuery}
                onChange={(e) => setProduceSearchQuery(e.target.value)}
                className="px-3.5 py-1.5 rounded-full border border-[#CCEBD5] bg-white text-xs text-[#241A12] placeholder-[#5C5245] focus:outline-none focus:border-[#4E8B3F] w-40 lg:w-56 shadow-2xs"
              />
            )}
            <button
              type="button"
              onClick={handleOpenAddProduce}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
            >
              <Plus size={14} strokeWidth={2.4} />
              <span>List Harvest</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 1: PRODUCE & HARVESTS (Desktop 2-Col Grid)
      ===================================================================== */}
      {activeFarm && activeTab === 'produce' && (
        <div className="space-y-4">
          {filteredProduce.length === 0 ? (
            <div className="text-center py-12 bg-[#EEF8F1] rounded-3xl border border-dashed border-[#CCEBD5] space-y-3">
              <Package size={36} className="mx-auto text-[#4E8B3F]" />
              <h3 className="text-sm font-bold text-[#173A20]">No Active Produce in {activeFarm.name}</h3>
              <p className="text-xs text-[#5C5245] max-w-sm mx-auto">
                Publish freshly harvested tomatoes, potatoes, plantains or livestock to start selling directly to households and Buyam-Sellam buyers.
              </p>
              <button
                type="button"
                onClick={handleOpenAddProduce}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#4E8B3F] text-white text-xs font-bold hover:bg-[#3D7030] transition cursor-pointer"
              >
                <Plus size={14} />
                <span>List First Harvest</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredProduce.map((y: any) => {
                const stock = y.stockQuantity ?? 0;
                const isOut = stock <= 0;
                const isPaused = y.isAvailable === false;
                const img = y.image || y.mediaUrls?.[0];
                return (
                  <div
                    key={y.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#CCEBD5] hover:border-[#4E8B3F] flex flex-col justify-between gap-3.5 transition shadow-2xs hover:shadow-sm"
                  >
                    {/* Top Row: Produce info on the left, Edit/Stock/Delete actions cleanly on the right */}
                    <div className="flex items-start justify-between gap-2.5">
                      {/* Left side: Thumbnail + details */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {img ? (
                          <img
                            src={resolveMediaUrl(img)}
                            alt={y.title}
                            className="w-16 h-16 rounded-xl object-cover border border-[#CCEBD5] shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F] shrink-0">
                            <Sprout size={24} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-sm text-[#241A12] truncate max-w-[150px] sm:max-w-none">{y.title}</h3>
                            {y.isOrganic && (
                              <span className="text-[10px] font-semibold bg-[#EEF8F1] text-[#4E8B3F] border border-[#CCEBD5] px-2 py-0.2 rounded-full shrink-0">
                                Organic
                              </span>
                            )}
                          </div>
                          <div className="font-mono-num text-xs font-bold text-[#173A20] mt-0.5">
                            {formatXaf(y.price || y.pricePerUnit)} / {y.unit}
                          </div>
                          {y.lifecycleStatus === 'GROWING' ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-[#E2A63C]/15 border border-[#E2A63C]/30 px-2 py-0.5 rounded-md mt-1 w-fit">
                              <Clock size={11} className="text-[#E2A63C] shrink-0" />
                              <span>Harvest: {y.expectedHarvestWindow || 'Coming Soon'}</span>
                              <span className="font-mono-num font-semibold text-[#173A20] ml-1">({stock} {y.unit})</span>
                            </div>
                          ) : y.lifecycleStatus === 'OFF_CYCLE' ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md mt-1 w-fit">
                              <span>Off-Season • Next: {y.nextCycleMonth || 'Next Season'}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-[11px] text-[#5C5245] mt-1 flex-wrap">
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
                          )}
                        </div>
                      </div>

                      {/* Right side: Action buttons (Balance Stock, Edit, Delete) */}
                      <div className="flex items-center gap-1.5 shrink-0 self-start">
                        <button
                          type="button"
                          onClick={() => openStockModal(y)}
                          className="px-2.5 py-1.5 rounded-full bg-[#EEF8F1] hover:bg-[#E1F3E7] border border-[#CCEBD5] text-[#4E8B3F] text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                          title="Balance Stock"
                        >
                          <Sliders size={13} />
                          <span className="hidden sm:inline">Balance Stock</span>
                          <span className="sm:hidden font-mono-num font-bold">{stock}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditProduce(y)}
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

                    {/* Bottom Row: 3-State Lifecycle Segmented Control spread evenly across full width */}
                    <div className="w-full pt-2.5 border-t border-[#EEF8F1]">
                      <div className="w-full grid grid-cols-3 p-1 rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] text-[11px] gap-1">
                        <button
                          type="button"
                          onClick={() => handleSetProduceLifecycle(y, 'SELLING')}
                          className={`w-full py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition cursor-pointer select-none ${(y.lifecycleStatus === 'SELLING' || !y.lifecycleStatus) && !isPaused
                              ? 'bg-[#4E8B3F] text-white shadow-xs font-bold'
                              : 'text-[#173A20] hover:bg-white/60'
                            }`}
                          title="Selling: Immediate orders accepted"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${(y.lifecycleStatus === 'SELLING' || !y.lifecycleStatus) && !isPaused
                                ? 'bg-white'
                                : 'bg-[#4E8B3F]'
                              }`}
                          />
                          <span className="truncate">Selling</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetProduceLifecycle(y, 'GROWING')}
                          className={`w-full py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition cursor-pointer select-none ${y.lifecycleStatus === 'GROWING'
                              ? 'bg-[#E2A63C] text-[#241A12] shadow-xs font-bold'
                              : 'text-[#5C5245] hover:bg-white/60'
                            }`}
                          title="Growing: Pre-orders open with harvest window"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${y.lifecycleStatus === 'GROWING' ? 'bg-[#241A12]' : 'bg-[#E2A63C]'
                              }`}
                          />
                          <span className="truncate">Growing</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetProduceLifecycle(y, 'OFF_CYCLE')}
                          className={`w-full py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition cursor-pointer select-none ${y.lifecycleStatus === 'OFF_CYCLE'
                              ? 'bg-neutral-600 text-white shadow-xs font-bold'
                              : 'text-[#5C5245] hover:bg-white/60'
                            }`}
                          title="Off-Cycle: Waitlist notification active"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${y.lifecycleStatus === 'OFF_CYCLE' ? 'bg-white' : 'bg-neutral-400'
                              }`}
                          />
                          <span className="truncate">Off-Cycle</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: OPERATING SITES & PLOTS
      ===================================================================== */}
      {activeFarm && activeTab === 'sites' && (
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
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add Operating Site</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeParcels.map((parcel, idx) => (
              <div
                key={parcel.id || idx}
                className="p-4 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] flex items-start justify-between gap-3 hover:border-[#4E8B3F] transition shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${parcel.isHeadquarters
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
      )}



      {/* =====================================================================
          MODAL 1: ADD / EDIT PRODUCE (AgroProduce)
      ===================================================================== */}
      {(showAddProduceModal || showEditProduceModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={handleCloseProduceModal}
          />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl border border-[#CCEBD5] p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#CCEBD5]/70">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F] shadow-2xs">
                  <Sprout size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#173A20]">
                    AgroProduce
                  </h3>
                  <p className="text-xs text-[#5C5245]">
                    {showEditProduceModal ? `Edit ${editingProduceItem?.title || 'Listing'}` : (activeFarm?.name || 'Publish fresh harvest to AgroMarket')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseProduceModal}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] hover:bg-[#CCEBD5] flex items-center justify-center text-[#241A12] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={showEditProduceModal ? handleSaveEditProduce : handleCreateProduce}
              className="space-y-4"
            >
              {/* 0. Harvest / Dispatch Operating Site Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#5C5245]">
                    Harvest / Dispatch Operating Site *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddSiteModal(true)}
                    className="text-[11px] font-bold text-[#4E8B3F] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus size={11} strokeWidth={2.5} />
                    <span>Add Plot</span>
                  </button>
                </div>
                <AgromDropdown
                  options={activeParcels.map((parcel) => ({
                    id: parcel.id,
                    label: parcel.name || parcel.city,
                    sublabel: `${parcel.city}, ${parcel.region} • ${parcel.sizeHectares || 1.0} Ha`,
                    badge: parcel.isHeadquarters ? 'HQ' : undefined,
                    icon: (
                      <div className="w-6 h-6 rounded-lg bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F] shrink-0">
                        <MapPin size={14} strokeWidth={2.4} />
                      </div>
                    ),
                  }))}
                  selectedId={produceForm.selectedParcelId || activeParcels[0]?.id || ''}
                  onSelect={(opt) => setProduceForm((p) => ({ ...p, selectedParcelId: opt.id }))}
                  placeholder="Select operating site"
                />
              </div>

              {/* 1. Produce Harvest Photo Upload (Reusable Component) */}
              <AgromImageUploader
                label="Harvest Photos"
                required
                title="Upload Real Harvest Photos"
                subtitle="Click to choose clear field, crate or crop photos (Multiple allowed)"
                images={produceForm.mediaUrls}
                maxImages={6}
                onChange={(imgs) => setProduceForm({ ...produceForm, mediaUrls: imgs })}
              />

              {/* 2. Produce Title */}
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Produce Name *
                </label>
                <input
                  type="text"
                  required
                  value={produceForm.title}
                  onChange={(e) => setProduceForm({ ...produceForm, title: e.target.value })}
                  placeholder="e.g. Fresh Foumbot Vine Roma Tomatoes, Santa Seed Potatoes..."
                  className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs"
                />
              </div>

              {/* 3. Category & Operational Lifecycle in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <AgromDropdown
                  label="Agricultural Category"
                  required
                  options={CATEGORIES.map((cat) => ({
                    id: cat.name,
                    label: cat.name,
                    icon: getCategoryIcon(cat.id),
                  }))}
                  selectedId={produceForm.categoryName}
                  onSelect={(opt) => setProduceForm({ ...produceForm, categoryName: opt.id })}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#5C5245]">
                    Operational Lifecycle Stage *
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5]">
                    <button
                      type="button"
                      onClick={() => setProduceForm({ ...produceForm, lifecycleStatus: 'SELLING' })}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer select-none ${produceForm.lifecycleStatus === 'SELLING'
                          ? 'bg-[#4E8B3F] text-white shadow-2xs'
                          : 'text-[#173A20] hover:bg-white/60'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${produceForm.lifecycleStatus === 'SELLING' ? 'bg-white' : 'bg-[#4E8B3F]'}`} />
                      <span>Selling</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProduceForm({ ...produceForm, lifecycleStatus: 'GROWING' })}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer select-none ${produceForm.lifecycleStatus === 'GROWING'
                          ? 'bg-[#E2A63C] text-[#241A12] shadow-2xs'
                          : 'text-[#5C5245] hover:bg-white/60'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${produceForm.lifecycleStatus === 'GROWING' ? 'bg-[#241A12]' : 'bg-[#E2A63C]'}`} />
                      <span>Growing</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProduceForm({ ...produceForm, lifecycleStatus: 'OFF_CYCLE' })}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer select-none ${produceForm.lifecycleStatus === 'OFF_CYCLE'
                          ? 'bg-neutral-700 text-white shadow-2xs'
                          : 'text-[#5C5245] hover:bg-white/60'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${produceForm.lifecycleStatus === 'OFF_CYCLE' ? 'bg-white' : 'bg-neutral-400'}`} />
                      <span>Off-Cycle</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Lifecycle Date & Timeline Specifics */}
              {produceForm.lifecycleStatus === 'SELLING' && (
                <div className="p-3.5 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] space-y-1">
                  <label className="block text-xs font-semibold text-[#173A20]">
                    Harvest Date (Freshness Proof) *
                  </label>
                  <input
                    type="date"
                    required
                    value={produceForm.harvestDate}
                    onChange={(e) => setProduceForm({ ...produceForm, harvestDate: e.target.value })}
                    className="w-full rounded-xl bg-white border border-[#CCEBD5] px-3.5 py-2.5 text-xs text-[#173A20] font-mono-num outline-none focus:border-[#4E8B3F]"
                  />
                  <p className="text-[11px] text-[#5C5245]">
                    Confirms when crops were picked from fields for buyers looking for fresh harvests.
                  </p>
                </div>
              )}

              {produceForm.lifecycleStatus === 'GROWING' && (
                <div className="p-3.5 rounded-2xl bg-[#FEF2D8]/50 border border-[#F2DCAA] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#173A20]">
                      Expected Harvest Window *
                    </label>
                    <span className="text-[10px] font-bold text-[#E2A63C] uppercase tracking-wider">
                      Pre-Order Window
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={produceForm.expectedHarvestWindow}
                    onChange={(e) => setProduceForm({ ...produceForm, expectedHarvestWindow: e.target.value })}
                    placeholder="e.g. Dec 15 - Dec 28, or Mid-December"
                    className="w-full rounded-xl bg-white border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12] outline-none focus:border-[#4E8B3F]"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {['Within 2 Weeks', 'Within 30 Days', 'Mid Next Month', 'End of Month'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setProduceForm({ ...produceForm, expectedHarvestWindow: preset })}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-white border border-[#CCEBD5] text-[#173A20] hover:border-[#4E8B3F] transition cursor-pointer select-none"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {produceForm.lifecycleStatus === 'OFF_CYCLE' && (
                <div className="p-3.5 rounded-2xl bg-neutral-100 border border-neutral-300/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#173A20]">
                      Next Target Planting / Harvest Month *
                    </label>
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                      Waitlist Active
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={produceForm.nextCycleMonth}
                    onChange={(e) => setProduceForm({ ...produceForm, nextCycleMonth: e.target.value })}
                    placeholder="e.g. March 2027 or Rainy Season Cycle"
                    className="w-full rounded-xl bg-white border border-neutral-300 px-3.5 py-2 text-xs text-[#241A12] outline-none focus:border-[#4E8B3F]"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {['January', 'March', 'June', 'September', 'November'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setProduceForm({ ...produceForm, nextCycleMonth: `${m} Cycle` })}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-white border border-neutral-300 text-[#173A20] hover:border-[#4E8B3F] transition cursor-pointer select-none"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Price & Unit of Measure in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                    Harvest Unit Price (FCFA) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      value={produceForm.pricePerUnit}
                      onChange={(e) => setProduceForm({ ...produceForm, pricePerUnit: e.target.value })}
                      placeholder="e.g. 8500"
                      className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 pr-16 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs font-mono-num font-semibold"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-white border border-[#CCEBD5] text-xs font-mono-num font-bold text-[#4E8B3F]">
                      FCFA
                    </div>
                  </div>
                </div>

                <AgromDropdown
                  label="Produce Unit of Measure"
                  required
                  options={UNITS.map((u) => ({
                    id: u.id,
                    label: u.label,
                    sublabel: u.id === 'CUSTOM' ? 'Specify custom local measure' : undefined,
                    icon:
                      u.id === 'CUSTOM' ? (
                        <div className="w-6 h-6 rounded-lg bg-[#FAF5FF] border border-[#E9D5FF] flex items-center justify-center text-[#7C3AED] shrink-0">
                          <Sparkles size={14} strokeWidth={2.4} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F] shrink-0">
                          <Package size={14} strokeWidth={2.4} />
                        </div>
                      ),
                  }))}
                  selectedId={produceForm.unit}
                  onSelect={(opt) => setProduceForm({ ...produceForm, unit: opt.id })}
                />
              </div>

              {/* Custom Unit Input if selected */}
              {produceForm.unit === 'CUSTOM' && (
                <div className="p-3.5 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] space-y-1">
                  <label className="block text-[11px] font-bold text-[#173A20]">
                    Custom Local Measure / Packaging *
                  </label>
                  <input
                    type="text"
                    required
                    value={produceForm.customUnit}
                    onChange={(e) => setProduceForm({ ...produceForm, customUnit: e.target.value })}
                    placeholder="e.g. Tas, Panier, Botte, Debe, Filet..."
                    className="w-full rounded-xl bg-white border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12] outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition"
                  />
                </div>
              )}

              {/* Live Price Tag Preview */}
              <div className="px-3.5 py-2.5 rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] flex items-center gap-2 text-xs">
                <Tag size={13} className="text-[#4E8B3F]" />
                <span className="text-[#5C5245]">Listing Display:</span>
                <span className="font-mono-num font-bold text-[#173A20]">
                  {produceForm.pricePerUnit ? `${Number(produceForm.pricePerUnit).toLocaleString()} FCFA` : '--- FCFA'}
                </span>
                <span className="text-[#4E8B3F] font-semibold">
                  / {produceForm.unit === 'CUSTOM' ? (produceForm.customUnit || 'Custom Unit') : (UNITS.find((u) => u.id === produceForm.unit)?.label || produceForm.unit)}
                </span>
              </div>

              {/* 5. Stock Quantity & Minimum Order Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={produceForm.stockQuantity}
                    onChange={(e) => setProduceForm({ ...produceForm, stockQuantity: e.target.value })}
                    placeholder={`e.g. 100 (${produceForm.unit === 'CUSTOM' ? produceForm.customUnit || 'units' : produceForm.unit})`}
                    className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs font-mono-num"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                    Min Order Quantity (MOQ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={produceForm.minOrderQuantity}
                    onChange={(e) => setProduceForm({ ...produceForm, minOrderQuantity: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs font-mono-num"
                  />
                </div>
              </div>

              {/* 6. Estimated Shelf-Life after Harvest */}
              <AgromDropdown
                label="Shelf-Life after Harvest"
                options={SHELF_LIFE_OPTIONS.map((opt) => ({
                  id: opt.days,
                  label: opt.label,
                  icon: (
                    <div className="w-6 h-6 rounded-lg bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F] shrink-0">
                      <Clock size={14} strokeWidth={2.4} />
                    </div>
                  ),
                }))}
                selectedId={produceForm.shelfLifeDays}
                onSelect={(opt) => setProduceForm({ ...produceForm, shelfLifeDays: opt.id })}
              />

              {/* 7. Wholesale / Buyam-Sellam Bulk Pricing */}
              <div className="p-3.5 rounded-2xl border border-[#CCEBD5] bg-[#EEF8F1] space-y-3 shadow-2xs">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={produceForm.isWholesaleBulkAvailable}
                    onChange={(e) => setProduceForm({ ...produceForm, isWholesaleBulkAvailable: e.target.checked })}
                    className="w-4 h-4 rounded-md accent-[#4E8B3F] cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#173A20]">Wholesale / Buyam-Sellam Bulk Pricing</div>
                    <div className="text-[11px] text-[#5C5245]">Offer tiered wholesale discounts for bulk traders and market vendors</div>
                  </div>
                </label>

                {produceForm.isWholesaleBulkAvailable && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#CCEBD5]/60">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5C5245] mb-1">
                        Min Bulk Quantity ({produceForm.unit === 'CUSTOM' ? produceForm.customUnit || 'Units' : produceForm.unit})
                      </label>
                      <input
                        type="number"
                        min="2"
                        value={produceForm.bulkMinQuantity}
                        onChange={(e) => setProduceForm({ ...produceForm, bulkMinQuantity: e.target.value })}
                        placeholder="e.g. 10"
                        className="w-full rounded-xl bg-white border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12] outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#5C5245] mb-1">
                        Bulk Unit Price (FCFA)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={produceForm.bulkPricePerUnit}
                        onChange={(e) => setProduceForm({ ...produceForm, bulkPricePerUnit: e.target.value })}
                        placeholder="e.g. 7200"
                        className="w-full rounded-xl bg-white border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12] outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 8. Certified Organic / Cameroon GAP */}
              <div
                onClick={() => setProduceForm({ ...produceForm, isOrganic: !produceForm.isOrganic })}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${produceForm.isOrganic ? 'bg-[#EEF8F1] border-[#4E8B3F]' : 'bg-[#EEF8F1]/40 border-[#CCEBD5]'
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${produceForm.isOrganic ? 'bg-[#4E8B3F] text-white' : 'border border-[#CCEBD5] bg-white'
                    }`}
                >
                  {produceForm.isOrganic && <Check size={14} strokeWidth={3} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#173A20]">Natural & Certified Organic / Cameroon GAP</div>
                  <div className="text-[11px] text-[#5C5245]">Grown with organic compost, zero synthetic pesticides, hygienic harvest handling</div>
                </div>
              </div>

              {/* 9. Harvest Notes & Description */}
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Harvest Notes & Quality Description
                </label>
                <textarea
                  rows={3}
                  value={produceForm.description}
                  onChange={(e) => setProduceForm({ ...produceForm, description: e.target.value })}
                  placeholder="e.g. Vine-ripened Roma tomatoes picked at daybreak from rich volcanic soil in Foumbot. Sorted Grade-A crate with zero bruising."
                  className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition resize-none shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={savingProduce}
                className="w-full py-3.5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-sm font-bold transition shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {savingProduce ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing to Marketplace...</span>
                  </>
                ) : (
                  <>
                    <Sprout size={16} />
                    <span>{showEditProduceModal ? 'Save Produce Changes' : 'Publish to AgroMarket'}</span>
                  </>
                )}
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

            <form onSubmit={handleSaveStock} className="space-y-4">
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
                  className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs font-mono-num"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5]">
                <span className="text-xs font-semibold text-[#241A12]">
                  Live on AgroMarket
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
                className="w-full py-3.5 rounded-full bg-[#173A20] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Confirm Inventory Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: EDIT FARM PROFILE (Full parity with mobile app)
      ===================================================================== */}
      {showEditFarmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowEditFarmModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-[#CCEBD5] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <div>
                <h3 className="font-bold text-base text-[#173A20]">Edit Farm Profile</h3>
                <p className="text-xs text-[#5C5245]">Update public storefront banner, bio and produce specialties</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditFarmModal(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] cursor-pointer hover:bg-[#CCEBD5] transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFarmProfile} className="space-y-4">
              {/* Storefront Cover Banner (16:9 Standard) - Strictly Uploads, No URL input */}
              <AgromImageUploader
                singleBanner
                aspectRatio="video"
                label="Storefront Cover Banner (16:9 Standard)"
                title="Upload Storefront Banner (16:9)"
                subtitle="Click to upload a clear landscape photo of your farm"
                images={editFarmCover ? [editFarmCover] : []}
                onChange={(imgs) => setEditFarmCover(imgs[0] || '')}
              />

              {/* Farm Enterprise Name */}
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Farm Enterprise Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFarmName}
                  onChange={(e) => setEditFarmName(e.target.value)}
                  placeholder="e.g. Mount Cameroon Highlands Farm"
                  className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs"
                />
              </div>

              {/* Farm Story & Ethics */}
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Farm Story & Ethics
                </label>
                <textarea
                  rows={3}
                  value={editFarmDesc}
                  onChange={(e) => setEditFarmDesc(e.target.value)}
                  placeholder="Tell buyers about your soil, organic standards, and farming journey..."
                  className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs resize-none"
                />
              </div>

              {/* Produce Specialties (Glance Tags) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#5C5245]">
                  Produce Specialties (Glance Tags)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTagInput}
                    onChange={(e) => setEditTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEditTag();
                      }
                    }}
                    placeholder="e.g. Foumbot Tomatoes, Penja Pepper"
                    className="flex-1 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-2.5 text-xs text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:border-[#4E8B3F]"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditTag}
                    className="px-4 py-2.5 rounded-2xl bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {editPrimaryProduce.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => handleRemoveEditTag(tag)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-xs font-semibold text-[#173A20] hover:bg-[#FDF3F1] hover:text-[#dc2626] transition cursor-pointer"
                      title="Click to remove tag"
                    >
                      <span>{tag}</span>
                      <X size={12} />
                    </span>
                  ))}
                </div>
                {editPrimaryProduce.length === 0 && (
                  <p className="text-[11px] text-[#5C5245]/80">
                    No manual tags added. Your public card will automatically display tags based on your active listed produce.
                  </p>
                )}
              </div>

              {/* Danger Zone: Delete Farm */}
              <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] space-y-2">
                <h4 className="text-xs font-bold text-[#991B1B]">Danger Zone</h4>
                <p className="text-[11px] text-[#7F1D1D] leading-relaxed">
                  Permanently remove this farm enterprise from your AgroMarket portfolio. Any active produce listed under this farm will be detached.
                </p>
                <button
                  type="button"
                  onClick={openDeleteFarmModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete Farm Enterprise</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingFarmProfile}
                  className="w-full py-3.5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>{savingFarmProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
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
                  className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs"
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
                    className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs cursor-pointer"
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
                    className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs"
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
                    className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs"
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
                    className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs font-mono-num"
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
                  className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs"
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
          MODAL 4: 2-STEP CASCADING FARM DELETION & MIGRATION (Parity with mobile)
      ===================================================================== */}
      {deleteModalVisible && activeFarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => !isDeletingFarm && setDeleteModalVisible(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-[#CCEBD5] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
                  <Trash2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#991B1B]">
                    Delete {activeFarm.name}
                  </h3>
                  <p className="text-xs text-[#5C5245]">
                    {deleteStep === 1 ? 'Choose asset destination' : 'Final confirmation'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isDeletingFarm && setDeleteModalVisible(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] cursor-pointer hover:bg-[#CCEBD5] transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* STEP 1: ASSET DESTINATION */}
            {deleteStep === 1 && (
              <div className="space-y-4">
                {/* Compact Assets Summary Row */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] text-xs">
                  <span className="font-medium text-[#5C5245]">Farm Assets:</span>
                  <div className="flex items-center gap-3 font-semibold text-[#173A20]">
                    <span>{farmYields.length} Produce</span>
                    <span className="text-[#CCEBD5]">•</span>
                    <span>{activeFarm.posts?.length || 0} Stories</span>
                    <span className="text-[#CCEBD5]">•</span>
                    <span>{activeFarm.reviewsCount || 0} Reviews</span>
                  </div>
                </div>

                {/* MULTI-FARM: Clean, simple choices */}
                {farmsList.filter((f) => f.id !== activeFarm.id).length > 0 ? (
                  <div className="space-y-2.5">
                    {/* Option 1: Transfer */}
                    <div
                      onClick={() => setDeleteAction('transfer')}
                      className={`p-3 rounded-2xl border-2 transition cursor-pointer space-y-2 ${deleteAction === 'transfer'
                          ? 'bg-[#EEF8F1] border-[#4E8B3F]'
                          : 'bg-white border-[#CCEBD5] hover:border-[#4E8B3F]/50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#173A20]">
                          <input
                            type="radio"
                            name="deleteAction"
                            checked={deleteAction === 'transfer'}
                            onChange={() => setDeleteAction('transfer')}
                            className="accent-[#4E8B3F]"
                          />
                          <span>Transfer produce & stories to another farm</span>
                        </label>
                        <span className="px-2 py-0.5 rounded-full bg-[#4E8B3F] text-white text-[10px] font-bold">
                          Recommended
                        </span>
                      </div>

                      {deleteAction === 'transfer' && (
                        <div className="pl-6 pt-1">
                          <label className="block text-[11px] font-semibold text-[#5C5245] mb-1">
                            Destination Farm:
                          </label>
                          <select
                            value={deleteTargetFarmId}
                            onChange={(e) => setDeleteTargetFarmId(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full p-2.5 rounded-xl border border-[#CCEBD5] bg-white text-xs font-semibold text-[#173A20] outline-none"
                          >
                            <option value="">Select a destination farm...</option>
                            {farmsList
                              .filter((f) => f.id !== activeFarm.id)
                              .map((other) => (
                                <option key={other.id} value={other.id}>
                                  {other.name} ({other.city || other.region})
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Option 2: Delete All */}
                    <div
                      onClick={() => setDeleteAction('delete')}
                      className={`p-3 rounded-2xl border-2 transition cursor-pointer ${deleteAction === 'delete'
                          ? 'bg-[#FEF2F2] border-[#DC2626]'
                          : 'bg-white border-[#CCEBD5] hover:border-[#DC2626]/50'
                        }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#991B1B]">
                        <input
                          type="radio"
                          name="deleteAction"
                          checked={deleteAction === 'delete'}
                          onChange={() => setDeleteAction('delete')}
                          className="accent-[#DC2626]"
                        />
                        <span>Permanently delete all produce & stories</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  /* SINGLE FARM CASE: Simple and direct */
                  <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deleteSingleFarmAgreed}
                      onChange={(e) => setDeleteSingleFarmAgreed(e.target.checked)}
                      className="mt-0.5 accent-[#DC2626]"
                    />
                    <span className="text-xs font-semibold text-[#7F1D1D]">
                      Permanently delete this farm and all its produce and stories.
                    </span>
                  </label>
                )}

                {/* Footer Buttons for Step 1 */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#CCEBD5]">
                  <button
                    type="button"
                    onClick={() => setDeleteModalVisible(false)}
                    className="px-4 py-2 rounded-full bg-[#EEF8F1] hover:bg-[#CCEBD5] text-xs font-bold text-[#173A20] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    disabled={
                      farmsList.filter((f) => f.id !== activeFarm.id).length === 0
                        ? !deleteSingleFarmAgreed
                        : deleteAction === 'transfer' && !deleteTargetFarmId
                    }
                    className="px-5 py-2.5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: FINAL DESTRUCTION CONFIRMATION */}
            {deleteStep === 2 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#DC2626] font-bold text-xs">
                    <AlertTriangle size={15} />
                    <span>Critical Enterprise Deletion</span>
                  </div>
                  <p className="text-xs text-[#7F1D1D] leading-relaxed">
                    You are preparing to delete <strong>"{activeFarm.name}"</strong>. This enterprise profile and public storefront will be permanently delisted from AgroMarket.
                  </p>
                  {deleteAction === 'transfer' && deleteTargetFarmId ? (
                    <p className="text-[11px] text-[#059669] font-medium pt-0.5">
                      ✓ Produce and stories will be migrated to "{farmsList.find((f) => f.id === deleteTargetFarmId)?.name}".
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#DC2626] font-medium pt-0.5">
                      ⚠ All {farmYields.length} produce batches and stories will be permanently erased.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5245] mb-1.5">
                    To proceed, type the exact farm name <strong className="text-[#991B1B]">"{activeFarm.name}"</strong> below:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder={activeFarm.name}
                    className={`w-full rounded-2xl bg-[#EEF8F1] border px-4 py-2.5 text-xs text-[#241A12] outline-none transition ${deleteConfirmName.trim().toLowerCase() === activeFarm.name.trim().toLowerCase()
                        ? 'border-[#059669] bg-[#ECFDF5]'
                        : 'border-[#CCEBD5] focus:border-[#DC2626]'
                      }`}
                  />
                  {deleteConfirmName.length > 0 &&
                    deleteConfirmName.trim().toLowerCase() !== activeFarm.name.trim().toLowerCase() && (
                      <p className="text-[11px] text-[#DC2626] font-medium pt-1">
                        Names do not match yet.
                      </p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#CCEBD5]">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    disabled={isDeletingFarm}
                    className="px-4 py-2 rounded-full bg-[#EEF8F1] hover:bg-[#CCEBD5] text-xs font-bold text-[#173A20] transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteDeleteFarm}
                    disabled={
                      isDeletingFarm ||
                      deleteConfirmName.trim().toLowerCase() !== activeFarm.name.trim().toLowerCase()
                    }
                    className="px-5 py-2.5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isDeletingFarm ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        <span>Delete Farm</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmManagementPage;

