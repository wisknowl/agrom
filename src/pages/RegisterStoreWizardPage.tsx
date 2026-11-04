import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Store,
  Building2,
  MapPin,
  ShieldCheck,
  Check,
  CheckCircle2,
  Plus,
  Trash2,
  Camera,
  Upload,
  Link as LinkIcon,
  Warehouse,
  ThermometerSnowflake,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { createStoreApi, checkStoreSlugApi, uploadMediaFileApi } from '@/api';

const STORE_TYPES = [
  { key: 'WHOLESALE_DEPOT', label: 'Wholesale Depot', sub: 'High-volume crate aggregation & bulk buyer contracts' },
  { key: 'RETAIL_HUB', label: 'Urban Food Hub', sub: 'Consumer crates, market stalls & neighbourhood supply' },
  { key: 'COOPERATIVE_SHED', label: 'Cooperative Shed', sub: 'Farmer union collection & distribution depot' },
  { key: 'COLD_STORAGE', label: 'Cold Storage Terminal', sub: 'Temperature-controlled preservation for perishables' },
];

const CAMEROON_REGIONS = [
  'Littoral Region (Douala, Loum, Manjo)',
  'Centre Region (Yaoundé, Obala, Mbalmayo)',
  'West Region (Foumbot, Bafoussam, Dschang)',
  'Northwest Region (Bamenda, Santa, Ndop)',
  'Southwest Region (Buea, Kumba, Penja, Limbe)',
  'South Region (Ebolowa, Kribi)',
  'East Region (Bertoua, Batouri)',
  'Adamawa Region (Ngaoundéré)',
  'North Region (Garoua)',
  'Far North Region (Maroua)',
];

const SAMPLE_COVERS = [
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1000&auto=format&fit=crop&q=80',
];

export const RegisterStoreWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Step 1: Store & Depot Identity
  const [name, setName] = useState('');
  const [storeType, setStoreType] = useState('WHOLESALE_DEPOT');
  const [description, setDescription] = useState('');

  // Real-time Slug Availability State
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    slug: string;
    candidate: string;
  }>({
    checking: false,
    available: null,
    slug: '',
    candidate: '',
  });

  useEffect(() => {
    if (!name.trim()) {
      setSlugStatus({ checking: false, available: null, slug: '', candidate: '' });
      return;
    }

    setSlugStatus((prev) => ({ ...prev, checking: true }));
    const timer = setTimeout(async () => {
      try {
        const res = await checkStoreSlugApi(name.trim());
        setSlugStatus({
          checking: false,
          available: res.available,
          slug: res.slug,
          candidate: res.candidate,
        });
      } catch {
        setSlugStatus((prev) => ({ ...prev, checking: false }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [name]);

  // Step 2: Commercial Location & Market Hub
  const [region, setRegion] = useState(CAMEROON_REGIONS[0]);
  const [division, setDivision] = useState('Wouri');
  const [city, setCity] = useState('Douala');
  const [marketZone, setMarketZone] = useState('Marché Sandaga, Quai 4');
  const [address, setAddress] = useState('');

  // Step 3: Multi-Site Operating Depots & Facilities
  const [sites, setSites] = useState<
    Array<{
      id: string;
      name: string;
      location: string;
      capacityTons: string;
      facilityType: string;
      operatingHours: string;
    }>
  >([
    {
      id: 'site-1',
      name: 'Dock 4 Cold Room',
      location: 'Marché Sandaga - Quai 4 Cold Section',
      capacityTons: '8.0',
      facilityType: 'COLD_ROOM',
      operatingHours: '05:00 - 18:00 (Mon - Sat)',
    },
    {
      id: 'site-2',
      name: 'Exterior Dry Warehouse',
      location: 'Marché Sandaga - Hangar B Loading Shed',
      capacityTons: '15.0',
      facilityType: 'AMBIENT_SHED',
      operatingHours: '06:00 - 19:00 (Mon - Sat)',
    },
  ]);

  // Step 4: Storage Specs, Farm Linkage & Cover
  const [storageCapacityTons, setStorageCapacityTons] = useState('20.0');
  const [hasColdStorage, setHasColdStorage] = useState(true);
  const [tradeLicenseNumber, setTradeLicenseNumber] = useState('');
  const [linkedFarmId, setLinkedFarmId] = useState('');
  const [coverPhoto, setCoverPhoto] = useState(SAMPLE_COVERS[0]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const userFarms = user?.farms || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setCoverPhoto(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    setUploadingCover(true);
    try {
      const uploadRes = await uploadMediaFileApi(file);
      if (uploadRes?.url) {
        setCoverPhoto(uploadRes.url);
      }
    } catch (err) {
      console.warn('Cover upload failed, using local preview:', err);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleAddSite = () => {
    setSites([
      ...sites,
      {
        id: `site-${Date.now()}`,
        name: `Depot Site ${sites.length + 1}`,
        location: `${city} • ${marketZone || 'Market Zone'}`,
        capacityTons: '5.0',
        facilityType: 'AMBIENT_SHED',
        operatingHours: '06:00 - 18:00 (Mon - Sat)',
      },
    ]);
  };

  const handleRemoveSite = (id: string) => {
    if (sites.length <= 1) {
      alert('Your store must have at least one operating depot site.');
      return;
    }
    setSites(sites.filter((s) => s.id !== id));
  };

  const handleUpdateSite = (id: string, field: string, value: string) => {
    setSites(
      sites.map((s) => {
        if (s.id === id) {
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Store name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!city.trim()) newErrors.city = 'City is required';
    if (!marketZone.trim()) newErrors.marketZone = 'Market zone or stall is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};
    if (sites.length === 0) newErrors.sites = 'At least one depot site is required';
    const hasEmptyName = sites.some((s) => !s.name.trim());
    if (hasEmptyName) newErrors.sites = 'All depot sites must have a name';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((s) => Math.min(4, s + 1) as any);
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1) as any);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const newStore = await createStoreApi({
        name: name.trim(),
        storeType,
        description: description.trim() || undefined,
        region,
        division: division.trim() || undefined,
        city: city.trim(),
        marketZone: marketZone.trim(),
        address: address.trim() || undefined,
        storageCapacityTons: parseFloat(storageCapacityTons) || 5.0,
        hasColdStorage,
        tradeLicenseNumber: tradeLicenseNumber.trim() || undefined,
        linkedFarmId: linkedFarmId || undefined,
        sites: sites.map((s) => ({
          id: s.id,
          name: s.name.trim(),
          location: s.location.trim(),
          capacityTons: parseFloat(s.capacityTons) || 2.5,
          facilityType: s.facilityType,
          operatingHours: s.operatingHours.trim(),
        })),
        coverPhoto,
      });

      alert(`🎉 Congratulations! Store "${newStore.name}" is successfully registered.`);
      navigate('/store');
    } catch (err: any) {
      alert(err.message || 'Failed to register store');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Progress Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#CCEBD5]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/store')}
              className="w-9 h-9 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#173A20] hover:bg-[#CCEBD5] transition cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FEF6E8] border border-[#F2DCAA] text-[11px] font-mono-num font-bold text-[#7A4A2D]">
                <Store size={12} className="text-[#E2A63C]" />
                Store Creation Wizard
              </div>
              <h1 className="font-display-italic text-2xl font-bold text-[#173A20]">
                Register New AgroStore & Depot
              </h1>
            </div>
          </div>

          {/* Stepper Progress Badges */}
          <div className="hidden sm:flex items-center gap-2">
            {[
              { num: 1, label: 'Identity' },
              { num: 2, label: 'Location' },
              { num: 3, label: 'Depot Sites' },
              { num: 4, label: 'Specs & Review' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${step === s.num
                  ? 'bg-[#173A20] text-white shadow-xs'
                  : step > s.num
                    ? 'bg-[#EEF8F1] text-[#4E8B3F] border border-[#CCEBD5]'
                    : 'bg-[#FAF7F2] text-[#8F8475] border border-[#EBE3D5]'
                  }`}
              >
                <span>{step > s.num ? '✓' : s.num}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================================
            STEP 1: IDENTITY & STORE TYPE
        ===================================================================== */}
        {step === 1 && (
          <div className="space-y-6 bg-[#FAF7F2] border border-[#EBE3D5] rounded-3xl p-6 sm:p-8">
            <div>
              <h2 className="text-lg font-bold text-[#241A12]">1. Store & Depot Identity</h2>
              <p className="text-xs sm:text-sm text-[#5C5245]">
                Define your commercial storefront identity, trading classification, and operational overview.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#241A12] mb-1">
                  AgroStore / Depot Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="e.g., Marché Sandaga Wholesale Hub, Mokolo Highland Aggregation Depot"
                  className={`w-full px-4 py-3 rounded-2xl border bg-white text-sm font-semibold text-[#241A12] placeholder-[#8F8475] focus:outline-none focus:border-[#4E8B3F] ${errors.name ? 'border-red-500' : 'border-[#CCEBD5]'
                    }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name}</p>}

                {/* Real-time Slug Availability Indicator */}
                {name.trim().length > 1 && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                    {slugStatus.checking ? (
                      <span className="text-xs text-[#8F8475] animate-pulse">Checking handle availability...</span>
                    ) : slugStatus.available === true ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] font-semibold text-xs">
                        <CheckCircle2 size={13} className="text-[#16a34a]" />
                        <span>Available</span>
                        <span className="text-[#166534] font-mono font-normal">agrom.app/store/{slugStatus.slug}</span>
                      </span>
                    ) : slugStatus.available === false ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#fffbeb] border border-[#fde68a] text-[#b45309] font-medium text-xs">
                        <span>Store name taken. Suggested:</span>
                        <span className="font-mono font-bold text-[#92400e]">agrom.app/store/{slugStatus.candidate}</span>
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241A12] mb-2">
                  Store / Commercial Classification *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STORE_TYPES.map((type) => {
                    const isSelected = storeType === type.key;
                    return (
                      <div
                        key={type.key}
                        onClick={() => setStoreType(type.key)}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${isSelected
                          ? 'bg-[#EEF8F1] border-[#4E8B3F] shadow-xs'
                          : 'bg-white border-[#CCEBD5] hover:border-[#4E8B3F]/50'
                          }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#173A20] text-white' : 'bg-[#FAF7F2] text-[#8F8475]'
                            }`}
                        >
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#241A12]">{type.label}</div>
                          <div className="text-[11px] text-[#5C5245] leading-relaxed mt-0.5">{type.sub}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241A12] mb-1">
                  Store Overview & Wholesale Terms
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe warehouse facilities, daily trading volume, acceptance of cooperative crates, return policies..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#CCEBD5] bg-white text-xs font-medium text-[#241A12] placeholder-[#8F8475] focus:outline-none focus:border-[#4E8B3F]"
                />
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 2: LOCATION & MARKET HUB
        ===================================================================== */}
        {step === 2 && (
          <div className="space-y-6 bg-[#FAF7F2] border border-[#EBE3D5] rounded-3xl p-6 sm:p-8">
            <div>
              <h2 className="text-lg font-bold text-[#241A12]">2. Commercial Hub & Market Location</h2>
              <p className="text-xs sm:text-sm text-[#5C5245]">
                Specify where buyers, transporters, and institutional clients dispatch and pick up bulk inventory.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">Economic Region *</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#CCEBD5] bg-white text-xs font-semibold text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                  >
                    {CAMEROON_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">Division / County</label>
                  <input
                    type="text"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    placeholder="e.g., Wouri, Mfoundi, Noun, Mezam, Fako"
                    className="w-full px-4 py-3 rounded-2xl border border-[#CCEBD5] bg-white text-xs font-semibold text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">Primary Market City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) setErrors({ ...errors, city: '' });
                    }}
                    placeholder="e.g., Douala, Yaoundé, Bafoussam, Bamenda, Buea"
                    className={`w-full px-4 py-3 rounded-2xl border bg-white text-xs font-semibold text-[#241A12] focus:outline-none focus:border-[#4E8B3F] ${errors.city ? 'border-red-500' : 'border-[#CCEBD5]'
                      }`}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">
                    Market Zone / Dock Stall *
                  </label>
                  <input
                    type="text"
                    value={marketZone}
                    onChange={(e) => {
                      setMarketZone(e.target.value);
                      if (errors.marketZone) setErrors({ ...errors, marketZone: '' });
                    }}
                    placeholder="e.g., Marché Sandaga - Quai 4, Marché Mokolo Hall 3"
                    className={`w-full px-4 py-3 rounded-2xl border bg-white text-xs font-semibold text-[#241A12] focus:outline-none focus:border-[#4E8B3F] ${errors.marketZone ? 'border-red-500' : 'border-[#CCEBD5]'
                      }`}
                  />
                  {errors.marketZone && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.marketZone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241A12] mb-1">
                  Full Physical Warehouse Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., Boulevard de la Liberté, Entry 2, Depot Shed #48"
                  className="w-full px-4 py-3 rounded-2xl border border-[#CCEBD5] bg-white text-xs font-medium text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                />
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 3: MULTI-SITE OPERATIONAL DEPOTS (PARCEL PARITY)
        ===================================================================== */}
        {step === 3 && (
          <div className="space-y-6 bg-[#FAF7F2] border border-[#EBE3D5] rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#241A12]">3. Operating Depot Sites & Facilities</h2>
                <p className="text-xs sm:text-sm text-[#5C5245]">
                  Configure your physical depot points (e.g. Cold Room, Ambient Warehouse). When publishing wholesale lots, you will select which site dispatches the inventory.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSite}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#173A20] text-white text-xs font-bold hover:bg-[#224A2E] transition cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Plus size={14} />
                <span>+ Add Depot Site</span>
              </button>
            </div>

            {errors.sites && (
              <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl border border-red-200">
                {errors.sites}
              </p>
            )}

            <div className="space-y-4">
              {sites.map((site, index) => (
                <div
                  key={site.id}
                  className="bg-white border border-[#CCEBD5] rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#EEF8F1] flex items-center justify-center text-xs font-bold text-[#173A20]">
                        {index + 1}
                      </div>
                      <span className="text-sm font-bold text-[#241A12]">
                        {site.name || `Operating Site ${index + 1}`}
                      </span>
                    </div>

                    {sites.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSite(site.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                        title="Remove Site"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#241A12] mb-1">
                        Depot Site Name * (e.g. Dock 4 Cold Room)
                      </label>
                      <input
                        type="text"
                        value={site.name}
                        onChange={(e) => handleUpdateSite(site.id, 'name', e.target.value)}
                        placeholder="e.g., Dock 4 Cold Room or Exterior Dry Warehouse"
                        className="w-full px-3 py-2 rounded-xl border border-[#CCEBD5] text-xs font-semibold text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#241A12] mb-1">
                        Facility Classification
                      </label>
                      <select
                        value={site.facilityType}
                        onChange={(e) => handleUpdateSite(site.id, 'facilityType', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#CCEBD5] bg-white text-xs font-medium text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                      >
                        <option value="COLD_ROOM">Insulated Cold Room (0°C - 8°C)</option>
                        <option value="AMBIENT_SHED">Ambient Dry Warehouse</option>
                        <option value="GRAIN_SILO">Ventilated Grain Storage</option>
                        <option value="PACKAGING_BAY">Sorting & Packaging Terminal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#241A12] mb-1">
                        Specific Location / Dock Stall
                      </label>
                      <input
                        type="text"
                        value={site.location}
                        onChange={(e) => handleUpdateSite(site.id, 'location', e.target.value)}
                        placeholder="e.g., Marché Sandaga - Quai 4"
                        className="w-full px-3 py-2 rounded-xl border border-[#CCEBD5] text-xs font-medium text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#241A12] mb-1">
                        Storage Capacity (Tons)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={site.capacityTons}
                        onChange={(e) => handleUpdateSite(site.id, 'capacityTons', e.target.value)}
                        placeholder="8.0"
                        className="w-full px-3 py-2 rounded-xl border border-[#CCEBD5] text-xs font-medium text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 4: SPECS, FARM LINK & REVIEW
        ===================================================================== */}
        {step === 4 && (
          <div className="space-y-6 bg-[#FAF7F2] border border-[#EBE3D5] rounded-3xl p-6 sm:p-8">
            <div>
              <h2 className="text-lg font-bold text-[#241A12]">4. Storage Specifications, Provenance & Review</h2>
              <p className="text-xs sm:text-sm text-[#5C5245]">
                Review store capacity, link to an existing AgroFarm for verified single-origin provenance, and finalize launch.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">
                    Cumulative Depot Capacity (Tons)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={storageCapacityTons}
                    onChange={(e) => setStorageCapacityTons(e.target.value)}
                    placeholder="20.0"
                    className="w-full px-4 py-3 rounded-2xl border border-[#CCEBD5] bg-white text-xs font-semibold text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241A12] mb-1">
                    Trade License Number
                  </label>
                  <input
                    type="text"
                    value={tradeLicenseNumber}
                    onChange={(e) => setTradeLicenseNumber(e.target.value)}
                    placeholder="e.g., RC/DLA/2026/B/1049"
                    className="w-full px-4 py-3 rounded-2xl border border-[#CCEBD5] bg-white text-xs font-semibold text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                  />
                </div>
              </div>

              {/* Optional Farm Linkage */}
              <div className="p-4 rounded-2xl bg-white border border-[#CCEBD5] space-y-2">
                <div className="flex items-center gap-2">
                  <LinkIcon size={16} className="text-[#4E8B3F]" />
                  <span className="text-xs font-bold text-[#173A20]">Link to Registered AgroFarm (Optional)</span>
                </div>
                <p className="text-[11px] text-[#5C5245] leading-relaxed">
                  If you operate a farm parcel, link it to your store to give institutional buyers verified single-origin provenance on your depot stock. You can also operate as a Standalone Urban Merchant Depot.
                </p>
                <select
                  value={linkedFarmId}
                  onChange={(e) => setLinkedFarmId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCEBD5] bg-[#FAF7F2] text-xs font-semibold text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
                >
                  <option value="">Standalone Commercial Depot (No Farm Linked)</option>
                  {userFarms.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      🚜 {f.name} ({f.city || 'Cameroon'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cover Photo */}
              <div>
                <label className="block text-xs font-bold text-[#241A12] mb-2">
                  Store & Depot Banner Photo
                </label>
                <div className="relative h-44 rounded-2xl overflow-hidden border border-[#CCEBD5] group">
                  <img src={coverPhoto} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-xs font-bold text-[#241A12] hover:bg-[#FAF7F2] transition shadow-md cursor-pointer"
                    >
                      <Camera size={14} />
                      <span>{uploadingCover ? 'Uploading...' : 'Change Cover Photo'}</span>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-[#8F8475] font-semibold">Or pick a sample banner:</span>
                  <div className="flex items-center gap-2">
                    {SAMPLE_COVERS.map((sample, i) => (
                      <img
                        key={sample}
                        src={sample}
                        alt={`Sample ${i}`}
                        onClick={() => setCoverPhoto(sample)}
                        className={`w-10 h-7 rounded-lg object-cover cursor-pointer border-2 transition ${coverPhoto === sample ? 'border-[#4E8B3F] scale-105' : 'border-transparent opacity-65 hover:opacity-100'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Summary Card */}
              <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#4E8B3F]" />
                  <span className="text-xs font-bold text-[#173A20]">Store Launch Summary</span>
                </div>
                <div className="text-xs text-[#241A12] space-y-1">
                  <div><strong>Store:</strong> {name} ({storeType})</div>
                  <div><strong>Market Hub:</strong> {city} • {marketZone}</div>
                  <div><strong>Operating Sites:</strong> {sites.map((s) => s.name).join(' • ')}</div>
                  <div><strong>Storage Capacity:</strong> {storageCapacityTons} Tonnes</div>
                  <div><strong>Provenance:</strong> {linkedFarmId ? 'Linked to AgroFarm' : 'Standalone Merchant Depot'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#CCEBD5]">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl border border-[#CCEBD5] text-xs font-bold text-[#241A12] hover:bg-[#FAF7F2] transition cursor-pointer"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#173A20] text-white text-xs font-bold hover:bg-[#224A2E] transition shadow-xs cursor-pointer"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-7 py-3 rounded-xl bg-[#4E8B3F] text-white text-xs font-bold hover:bg-[#3D7030] transition shadow-md cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? (
                <span>Publishing Store...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>Launch AgroStore & Open Depots</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterStoreWizardPage;

