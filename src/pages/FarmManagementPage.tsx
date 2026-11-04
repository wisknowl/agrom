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
  Sliders,
  Edit3,
  Trash2,
  AlertTriangle,
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
  const [uploadingProduceImage, setUploadingProduceImage] = useState(false);
  const produceImageInputRef = useRef<HTMLInputElement | null>(null);

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
  const [uploadingEditCover, setUploadingEditCover] = useState(false);
  const editCoverInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleProduceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Fast local previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const previewUrl = ev.target.result as string;
          setProduceForm((p) => ({
            ...p,
            mediaUrl: p.mediaUrl || previewUrl,
            mediaUrls: [...p.mediaUrls, previewUrl],
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    setUploadingProduceImage(true);
    try {
      for (const file of files) {
        const res = await uploadMediaFileApi(file);
        if (res?.url) {
          setProduceForm((p) => {
            // Replace local data URI with real backend URL
            const updatedUrls = p.mediaUrls.map((u) => (u.startsWith('data:') ? res.url : u));
            if (!updatedUrls.includes(res.url)) updatedUrls.push(res.url);
            return {
              ...p,
              mediaUrl: p.mediaUrl.startsWith('data:') ? res.url : (p.mediaUrl || res.url),
              mediaUrls: updatedUrls,
            };
          });
        }
      }
    } catch (err) {
      console.warn('Produce photo upload failed', err);
    } finally {
      setUploadingProduceImage(false);
      if (produceImageInputRef.current) produceImageInputRef.current.value = '';
    }
  };

  const handleRemoveProducePhoto = (idxToRemove: number) => {
    setProduceForm((p) => {
      const filtered = p.mediaUrls.filter((_, i) => i !== idxToRemove);
      return {
        ...p,
        mediaUrl: filtered[0] || '',
        mediaUrls: filtered,
      };
    });
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
      {/* Top Header Bar with Navigation and New Farm CTA */}
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
          <span>New Farm</span>
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
                ? 'bg-[#173A20] text-white border-[#173A20] shadow-xs'
                : 'bg-white text-[#241A12] border-[#CCEBD5] hover:border-[#4E8B3F]'
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

          {/* Top Header Actions (View Storefront / Edit / Delete) */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {activeFarm && (
              <button
                type="button"
                onClick={() => navigate(`/farm/${activeFarm.slug || activeFarm.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-[#173A20] text-xs font-bold shadow-xs hover:bg-white transition cursor-pointer"
              >
                <ExternalLink size={13} className="text-[#4E8B3F]" /> Public Storefront
              </button>
            )}
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
            <Sprout size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-mono-num text-xl font-bold text-[#173A20]">
              {farmYields.length}
            </div>
            <div className="text-[11px] text-[#5C5245]">Active Yields</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#CCEBD5] p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#FDF2E9] text-[#8D5B28] flex items-center justify-center">
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
          <div className="w-10 h-10 rounded-xl bg-[#FEF7EE] text-[#E2A63C] flex items-center justify-center">
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
          <div className="w-10 h-10 rounded-xl bg-[#FAF5FF] text-[#7C3AED] flex items-center justify-center">
            <TrendingUp size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-mono-num text-xl font-bold text-[#173A20]">
              {user?.farmerProfile?.creditScore || 501}
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
            onClick={handleOpenAddProduce}
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
              <div className="text-sm font-bold leading-tight">New Farm</div>
              <div className="text-[11px] text-[#5C5245]">Register another parcel</div>
            </div>
          </button>
        </div>
      </div>

      {/* AgroFintech & Input Credit Line (Hub-and-Spoke Module) */}
      <div className="bg-gradient-to-br from-[#FAF5FF] via-white to-[#EEF8F1] rounded-3xl border border-[#E9D5FF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E9D5FF]/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shadow-sm">
              <TrendingUp size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-[#173A20]">
                  Tabi Credit & Seasonal Financing
                </h3>
                <span className="font-mono-num text-[11px] font-bold bg-[#7C3AED] text-white px-2.5 py-0.5 rounded-full">
                  {user?.farmerProfile?.creditTier || 'GOLD A-PRIME'}
                </span>
              </div>
              <p className="text-xs text-[#5C5245]">
                Algorithmic Engine 1 risk underwriting & 10% auto-escrow repayment
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/fintech/loans')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <span>Manage AgroLoans & Terms</span>
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E9D5FF]/80">
            <div className="text-[11px] font-medium text-[#6B7280]">Live Tabi FICO Score</div>
            <div className="font-mono-num text-xl font-bold text-[#7C3AED] mt-0.5">
              {user?.farmerProfile?.creditScore || 765} <span className="text-xs font-normal text-[#9CA3AF]">/ 1000</span>
            </div>
            <div className="text-[10px] text-[#4E8B3F] font-semibold mt-1">● Top 8% of Regional Co-ops</div>
          </div>

          <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E9D5FF]/80">
            <div className="text-[11px] font-medium text-[#6B7280]">Pre-Approved Input Credit</div>
            <div className="font-mono-num text-xl font-bold text-[#173A20] mt-0.5">
              1,500,000 <span className="text-xs font-normal text-[#5C5245]">XAF</span>
            </div>
            <div className="text-[10px] text-[#5C5245] mt-1">Instant MoMo / Orange Money disbursement</div>
          </div>

          <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E9D5FF]/80">
            <div className="text-[11px] font-medium text-[#6B7280]">Auto-Escrow Repayment</div>
            <div className="font-mono-num text-xl font-bold text-[#059669] mt-0.5">
              10% <span className="text-xs font-normal text-[#5C5245]">per harvest sale</span>
            </div>
            <div className="text-[10px] text-[#059669] font-semibold mt-1">✓ Smart Contract Engine 3 Active</div>
          </div>
        </div>
      </div>

      {/* AgroVestor Crop Lot Co-Funding Module */}
      <div className="bg-gradient-to-br from-[#FEF7EE] via-white to-[#FEF7EE] rounded-3xl border border-[#F7D9A4] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#F7D9A4]/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E2A63C] text-white flex items-center justify-center shadow-sm">
              <Award size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-[#173A20]">
                  AgroVestor Co-Funding Campaigns
                </h3>
                <span className="font-mono-num text-[11px] font-bold bg-[#E2A63C] text-white px-2.5 py-0.5 rounded-full">
                  DIASPORA CROWDFUNDING
                </span>
              </div>
              <p className="text-xs text-[#5C5245]">
                Crowdfund seed capital for upcoming parcel cycles in exchange for seasonal harvest share
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/fintech/loans')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E2A63C] hover:bg-[#D4952B] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Launch Co-Funding Campaign</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-[#F7D9A4] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#173A20]">Foumbot Roma Tomato Lot #4</span>
              <span className="text-[#059669] font-bold bg-[#EEF8F1] px-2 py-0.5 rounded-full">75% Funded</span>
            </div>
            <div className="w-full bg-[#FEF7EE] rounded-full h-2 overflow-hidden border border-[#F7D9A4]/50">
              <div className="bg-[#E2A63C] h-full rounded-full" style={{ width: '75%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#5C5245]">
              <span>Raised: 900,000 XAF</span>
              <span>Target: 1,200,000 XAF</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#F7D9A4] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#173A20]">Highland Bell Pepper Expansion</span>
              <span className="text-[#7C3AED] font-bold bg-[#FAF5FF] px-2 py-0.5 rounded-full">Target Reached</span>
            </div>
            <div className="w-full bg-[#FEF7EE] rounded-full h-2 overflow-hidden border border-[#F7D9A4]/50">
              <div className="bg-[#4E8B3F] h-full rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#5C5245]">
              <span>Disbursed to Escrow: 1,800,000 XAF</span>
              <span>Cycle: 90 Days</span>
            </div>
          </div>
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

      {/* Produce Produced on this Farm Header */}
      <div className="bg-white rounded-3xl border border-[#CCEBD5] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#EEF8F1]">
          <div>
            <h2 className="text-base font-bold text-[#173A20]">Produce Produced on this Farm</h2>
            <p className="text-xs text-[#5C5245]">{farmYields.length} items currently listed</p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddProduce}
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
                    : 'bg-white border-[#CCEBD5] hover:border-[#4E8B3F]'
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

              {/* 1. Produce Harvest Photo Upload (Multiple photos supported) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#5C5245]">
                    Harvest Photos * {produceForm.mediaUrls.length > 0 && `(${produceForm.mediaUrls.length} selected)`}
                  </label>
                  {produceForm.mediaUrls.length > 0 && produceForm.mediaUrls.length < 6 && (
                    <button
                      type="button"
                      onClick={() => produceImageInputRef.current?.click()}
                      className="text-[11px] font-bold text-[#4E8B3F] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus size={13} /> Add More Photos
                    </button>
                  )}
                </div>

                <input
                  ref={produceImageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleProduceImageUpload}
                />

                {produceForm.mediaUrls.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {produceForm.mediaUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-2xl overflow-hidden bg-[#EEF8F1] border border-[#CCEBD5] group shadow-2xs"
                        >
                          <img
                            src={resolveMediaUrl(url)}
                            alt={`Produce preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute bottom-1.5 left-1.5 bg-[#173A20]/90 text-[#E2A63C] text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              Cover Photo
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveProducePhoto(idx);
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-[#B54A34] text-white flex items-center justify-center transition cursor-pointer shadow-xs"
                            title="Remove this photo"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}

                      {produceForm.mediaUrls.length < 6 && (
                        <button
                          type="button"
                          onClick={() => produceImageInputRef.current?.click()}
                          className="aspect-square rounded-2xl border-2 border-dashed border-[#CCEBD5] hover:border-[#4E8B3F] bg-[#EEF8F1] hover:bg-[#E5F5E9] flex flex-col items-center justify-center cursor-pointer transition text-[#4E8B3F] group"
                        >
                          <div className="w-8 h-8 rounded-full bg-white border border-[#CCEBD5] group-hover:border-[#4E8B3F] flex items-center justify-center mb-1">
                            <Plus size={16} />
                          </div>
                          <span className="text-[10px] font-bold">Add Photo</span>
                        </button>
                      )}
                    </div>

                    {uploadingProduceImage && (
                      <div className="text-xs font-semibold text-[#4E8B3F] flex items-center gap-1.5 pt-1">
                        <div className="w-3.5 h-3.5 border-2 border-[#4E8B3F] border-t-transparent rounded-full animate-spin" />
                        <span>Uploading photo(s)...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => produceImageInputRef.current?.click()}
                    className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-[#CCEBD5] hover:border-[#4E8B3F] bg-[#EEF8F1] hover:bg-[#E5F5E9] flex flex-col items-center justify-center cursor-pointer transition text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#CCEBD5] group-hover:border-[#4E8B3F] flex items-center justify-center text-[#4E8B3F] mb-2 shadow-2xs">
                      <Camera size={22} />
                    </div>
                    <div className="text-xs font-bold text-[#173A20]">Upload Real Harvest Photos</div>
                    <div className="text-[11px] text-[#5C5245] mt-0.5">Click to choose clear field, crate or crop photos (Multiple allowed)</div>
                    {uploadingProduceImage && (
                      <div className="mt-2 text-xs font-semibold text-[#4E8B3F] flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 border-2 border-[#4E8B3F] border-t-transparent rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

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

              {/* 3. Category & Seasonality in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <AgromDropdown
                  variant="harvest"
                  label="Harvest Seasonality"
                  required
                  options={SEASONS.map((s) => ({
                    id: s.id,
                    label: s.label,
                    icon: getSeasonIcon(s.id),
                  }))}
                  selectedId={produceForm.seasonality}
                  onSelect={(opt) => setProduceForm({ ...produceForm, seasonality: opt.id })}
                />
              </div>

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
                className="w-full py-3.5 rounded-full bg-[#173A20] text-white text-xs font-bold transition shadow-xs cursor-pointer"
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
                  className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs"
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
                  className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editFarmDesc}
                  onChange={(e) => setEditFarmDesc(e.target.value)}
                  className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-3 text-sm text-[#173A20] placeholder-[#5C5245]/50 outline-none focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition shadow-2xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#4E8B3F] text-white text-xs font-bold transition shadow-xs cursor-pointer"
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

