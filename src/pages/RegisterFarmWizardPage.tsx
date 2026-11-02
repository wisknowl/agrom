import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sprout,
  Egg,
  Fish,
  Home,
  Layers,
  MapPin,
  ShieldCheck,
  Check,
  Plus,
  Trash2,
  Building2,
  Camera,
  Upload,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { createFarmApi, uploadMediaFileApi } from '@/api';
import { Farm, FarmCategory } from '@/types';
import { resolveMediaUrl } from '@/utils/media';

const CATEGORIES: Array<{ key: FarmCategory; label: string; icon: any; sub: string }> = [
  { key: 'CROPS', label: 'Crops & Vegetables', icon: Sprout, sub: 'Tomatoes, Maize, Potatoes, Greens' },
  { key: 'POULTRY', label: 'Poultry & Birds', icon: Egg, sub: 'Broilers, Layers, Free-Range Eggs' },
  { key: 'LIVESTOCK', label: 'Livestock & Cattle', icon: Layers, sub: 'Cattle, Goats, Sheep, Pigs' },
  { key: 'AQUACULTURE', label: 'Fish & Aquaculture', icon: Fish, sub: 'Tilapia, Catfish, Fingerlings' },
  { key: 'GREENHOUSE', label: 'Greenhouse & Tech', icon: Home, sub: 'Hydroponics, Climate Controlled' },
  { key: 'MIXED', label: 'Mixed Farming', icon: Layers, sub: 'Integrated crops and animals' },
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

const SAMPLE_COVERS = [
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1000&auto=format&fit=crop&q=80',
];

export const RegisterFarmWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Step 1: Identity & Category
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FarmCategory>('CROPS');
  const [description, setDescription] = useState('');

  // Step 2: Multi-Site Operational Parcels
  const [parcels, setParcels] = useState<
    Array<{
      id: string;
      name: string;
      region: string;
      city: string;
      division: string;
      location: string;
      sizeHectares: string;
    }>
  >([
    {
      id: 'site-1',
      name: 'Main Base / Headquarters',
      region: CAMEROON_REGIONS[0],
      city: 'Foumbot',
      division: 'Noun',
      location: 'Volcanic Highland Corridor',
      sizeHectares: '2.5',
    },
  ]);

  // Step 3: Capacity & Glance Tags
  const [produceInput, setProduceInput] = useState('');
  const [produceTags, setProduceTags] = useState<string[]>(['Tomatoes', 'Maize']);
  const [cooperative, setCooperative] = useState('');

  // Step 4: Cover Banner & Practices
  const [coverPhoto, setCoverPhoto] = useState(SAMPLE_COVERS[0]);
  const [isOrganic, setIsOrganic] = useState(true);
  const [isGapCertified, setIsGapCertified] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast local preview using FileReader
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setCoverPhoto(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Upload to server if available
    setUploadingCover(true);
    try {
      const uploadRes = await uploadMediaFileApi(file);
      if (uploadRes?.url) {
        setCoverPhoto(uploadRes.url);
      }
    } catch (uploadErr) {
      console.warn('Cover upload to server failed, using local preview data URI', uploadErr);
    } finally {
      setUploadingCover(false);
    }
  };

  const totalParcelsHectares = parcels.reduce(
    (sum, p) => sum + (parseFloat(p.sizeHectares) || 0),
    0
  );

  const handleAddParcel = () => {
    const nextIdx = parcels.length + 1;
    setParcels((prev) => [
      ...prev,
      {
        id: `site-${Date.now()}`,
        name: `Operating Site ${nextIdx}`,
        region: prev[0]?.region || CAMEROON_REGIONS[0],
        city: '',
        division: '',
        location: '',
        sizeHectares: '1.0',
      },
    ]);
  };

  const handleRemoveParcel = (idToRemove: string) => {
    if (parcels.length <= 1) return;
    setParcels((prev) => prev.filter((p) => p.id !== idToRemove));
  };

  const handleUpdateParcel = (id: string, field: string, value: string) => {
    setParcels((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    if (errors[`city-${id}`] && field === 'city') {
      setErrors((e) => ({ ...e, [`city-${id}`]: '' }));
    }
  };

  const handleAddTag = () => {
    if (produceInput.trim() && !produceTags.includes(produceInput.trim())) {
      setProduceTags([...produceTags, produceInput.trim()]);
      setProduceInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setProduceTags(produceTags.filter((t) => t !== tag));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        setErrors({ name: 'Farm name is required' });
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      const newErrors: { [key: string]: string } = {};
      parcels.forEach((p) => {
        if (!p.city.trim()) {
          newErrors[`city-${p.id}`] = 'Town or city is required for this site';
        }
      });
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      setStep(3);
    } else if (step === 3) {
      setErrors({});
      setStep(4);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const primaryParcel = parcels[0];
    const newFarm: Partial<Farm> = {
      name: name.trim(),
      category,
      description: description.trim() || 'Verified farm profile on Agrom platform.',
      region: primaryParcel.region.split(' (')[0],
      division: primaryParcel.division.trim() || 'Noun',
      city: primaryParcel.city.trim(),
      location: primaryParcel.location.trim() || `${primaryParcel.city.trim()}, ${primaryParcel.region.split(' (')[0]}`,
      sizeHectares: totalParcelsHectares || 2.5,
      coverPhoto,
      primaryProduce: produceTags,
      isVerified: true,
      rating: 5.0,
      totalRatings: 1,
      yieldsCount: 0,
      parcels: parcels.map((p, idx) => ({
        id: p.id,
        name: p.name.trim() || (idx === 0 ? 'Main Base / HQ' : `Site ${idx + 1}`),
        region: p.region.split(' (')[0],
        division: p.division.trim() || 'Noun',
        city: p.city.trim(),
        location: p.location.trim(),
        sizeHectares: parseFloat(p.sizeHectares) || 1.0,
        isHeadquarters: idx === 0,
      })),
      certifications: [
        ...(isOrganic ? ['Natural & Chemical-Free Practice'] : []),
        ...(isGapCertified ? ['Good Agricultural Practice (Self-Reported)'] : []),
      ],
    };

    try {
      const created = await createFarmApi(newFarm);
      const existingFarms = user?.farms || [];
      const createdFarmRecord = created || (newFarm as Farm);
      const updatedFarms = [...existingFarms, createdFarmRecord];

      updateUser({
        role: 'FARMER',
        isFarmer: true,
        farms: updatedFarms,
      });

      alert(`🌾 AgroFarm Registered Successfully!\n\n"${createdFarmRecord.name || newFarm.name}" is now live in your workspace.`);
      navigate(`/farmer/manage${createdFarmRecord.id ? `?farmId=${createdFarmRecord.id}` : ''}`);
    } catch {
      // Fallback local save for seamless offline / seed experience
      const fallbackFarm: Farm = {
        id: `farm-${Date.now()}`,
        userId: user?.id || 'u1',
        name: newFarm.name!,
        category: newFarm.category!,
        description: newFarm.description!,
        region: newFarm.region!,
        division: newFarm.division!,
        city: newFarm.city!,
        location: newFarm.location!,
        sizeHectares: newFarm.sizeHectares!,
        coverPhoto: newFarm.coverPhoto!,
        primaryProduce: newFarm.primaryProduce!,
        isVerified: true,
        rating: 5.0,
        totalRatings: 1,
        yieldsCount: 0,
        createdAt: new Date().toISOString(),
      };
      const existingFarms = user?.farms || [];
      updateUser({
        role: 'FARMER',
        isFarmer: true,
        farms: [...existingFarms, fallbackFarm],
      });
      alert(`🌾 AgroFarm Registered Successfully!\n\n"${fallbackFarm.name}" is now active in your workspace.`);
      navigate(`/farmer/manage?farmId=${fallbackFarm.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  // If in Guest Mode, prompt to sign in
  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-[#CCEBD5] p-6 sm:p-8 text-center space-y-5 shadow-[0_8px_30px_rgba(23,58,32,0.06)]">
          <div className="w-16 h-16 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center mx-auto text-[#4E8B3F]">
            <Building2 size={30} strokeWidth={2.2} />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-[11px] font-semibold text-[#4E8B3F]">
              Farmer Enterprise Gateway
            </span>
            <h1 className="font-display-italic text-2xl sm:text-[26px] font-semibold text-[#173A20]">
              Sign in to Register your AgroFarm
            </h1>
            <p className="text-xs sm:text-sm text-[#5C5245] max-w-md mx-auto leading-relaxed">
              Registering an AgroFarm enterprise unlocks direct harvest sales on AgroMarket, video stories on AgroFeed, and Tabi Credit Scoring. Please sign in or create an account to begin.
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
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
        <button
          type="button"
          onClick={() => (step > 1 ? setStep((step - 1) as any) : navigate(-1))}
          className="w-10 h-10 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center text-[#241A12] hover:border-[#4E8B3F] transition cursor-pointer"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>
        <div className="text-center">
          <h1 className="font-display-italic text-xl font-bold text-[#173A20]">Register AgroFarm</h1>
          <p className="font-mono-num text-xs text-[#5C5245]">Step {step} of 4</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress Track */}
      <div className="h-1.5 w-full bg-[#EEF8F1] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4E8B3F] transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* STEP 1: Farm Identity & Category */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-[#CCEBD5] p-5 sm:p-7 space-y-5 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-[#173A20]">Farm Identity & Primary Category</h2>
            <p className="text-xs text-[#5C5245] mt-0.5">
              Name your agricultural enterprise and choose its primary farming focus.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#241A12] mb-1.5">
                Farm Enterprise Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((err) => ({ ...err, name: '' }));
                }}
                placeholder="e.g. Mount Cameroon Organic Highlands"
                className={`w-full rounded-xl bg-[#EEF8F1] border px-3.5 py-2.5 text-sm text-[#241A12] focus:outline-none focus:border-[#4E8B3F] ${errors.name ? 'border-[#dc2626]' : 'border-[#CCEBD5]'
                  }`}
              />
              {errors.name && <span className="text-[11px] text-[#dc2626] mt-1 block">{errors.name}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A12] mb-2">
                Primary Farming Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const active = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${active
                        ? 'bg-[#EEF8F1] border-[#4E8B3F] shadow-xs'
                        : 'bg-white border-[#CCEBD5] hover:border-[#4E8B3F]'
                        }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${active ? 'bg-[#4E8B3F] text-white' : 'bg-[#EEF8F1] text-[#4E8B3F]'
                          }`}
                      >
                        <Icon size={18} strokeWidth={2.2} />
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${active ? 'text-[#173A20]' : 'text-[#241A12]'}`}>
                          {cat.label}
                        </div>
                        <div className="text-[10px] text-[#5C5245] line-clamp-1">{cat.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A12] mb-1.5">
                Farm Description & Soil Ethics
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell buyers about your soil, elevation, farming ethics, and harvest methods..."
                className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2.5 text-xs text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Operating Sites & Parcels */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#CCEBD5] p-5 sm:p-7 space-y-4 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-[#173A20]">Operating Sites & Geographic Footprint</h2>
              <p className="text-xs text-[#5C5245] mt-0.5">
                Register operational plots, greenhouse sites, or headquarters across Cameroon.
              </p>
            </div>

            <div className="space-y-4">
              {parcels.map((parcel, idx) => {
                const isHQ = idx === 0;
                const cityErr = errors[`city-${parcel.id}`];
                return (
                  <div
                    key={parcel.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CCEBD5] space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#EEF8F1]">
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-bold ${isHQ ? 'bg-[#FEF2D8] text-[#B87D1E] border border-[#F2DCAA]' : 'bg-[#EEF8F1] text-[#4E8B3F]'
                          }`}
                      >
                        {isHQ ? '📍 Primary Base (HQ)' : `📍 Site ${idx + 1}`}
                      </span>
                      {!isHQ && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParcel(parcel.id)}
                          className="inline-flex items-center gap-1 text-xs text-[#dc2626] hover:underline cursor-pointer"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                          Site / Facility Name
                        </label>
                        <input
                          type="text"
                          value={parcel.name}
                          onChange={(e) => handleUpdateParcel(parcel.id, 'name', e.target.value)}
                          placeholder={isHQ ? 'Main Base / HQ' : 'e.g. Mutengene Pen'}
                          className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                          Agricultural Region
                        </label>
                        <select
                          value={parcel.region}
                          onChange={(e) => handleUpdateParcel(parcel.id, 'region', e.target.value)}
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
                          City / Town *
                        </label>
                        <input
                          type="text"
                          value={parcel.city}
                          onChange={(e) => handleUpdateParcel(parcel.id, 'city', e.target.value)}
                          placeholder="e.g. Foumbot"
                          className={`w-full rounded-xl bg-[#EEF8F1] border px-3.5 py-2 text-xs text-[#241A12] ${cityErr ? 'border-[#dc2626]' : 'border-[#CCEBD5]'
                            }`}
                        />
                        {cityErr && <span className="text-[10px] text-[#dc2626] mt-0.5 block">{cityErr}</span>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                          Division / Sector
                        </label>
                        <input
                          type="text"
                          value={parcel.division}
                          onChange={(e) => handleUpdateParcel(parcel.id, 'division', e.target.value)}
                          placeholder="e.g. Noun"
                          className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                          Access Road / Landmark
                        </label>
                        <input
                          type="text"
                          value={parcel.location}
                          onChange={(e) => handleUpdateParcel(parcel.id, 'location', e.target.value)}
                          placeholder="e.g. Mile 4 Junction Road"
                          className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                          Plot Area (Hectares)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={parcel.sizeHectares}
                          onChange={(e) => handleUpdateParcel(parcel.id, 'sizeHectares', e.target.value)}
                          placeholder="2.5"
                          className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddParcel}
                className="w-full py-3 rounded-2xl bg-[#EEF8F1] border border-dashed border-[#4E8B3F] text-[#4E8B3F] text-xs font-bold inline-flex items-center justify-center gap-2 hover:bg-[#E1F3E7] transition cursor-pointer"
              >
                <Plus size={16} />
                <span>+ Add Another Operating Site / Plot</span>
              </button>
            </div>
          </div>

          {/* Footprint Banner */}
          <div className="p-3.5 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] flex items-center gap-2 text-xs text-[#173A20]">
            <Building2 size={16} className="text-[#4E8B3F]" />
            <span>
              Enterprise Footprint: <strong>{parcels.length} Site(s)</strong> • Total Land Area:{' '}
              <strong>{totalParcelsHectares.toFixed(1)} ha</strong>
            </span>
          </div>
        </div>
      )}

      {/* STEP 3: Capacity & Glance Produce Tags */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-[#CCEBD5] p-5 sm:p-7 space-y-5 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-[#173A20]">Operations & Primary Produce Specialties</h2>
            <p className="text-xs text-[#5C5245] mt-0.5">
              Highlight what you grow so buyers instantly know your specialty.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4E8B3F] text-white flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#173A20]">Total Operating Land</div>
                  <div className="text-[11px] text-[#5C5245]">
                    {parcels.length} {parcels.length === 1 ? 'Site' : 'Sites'} across Cameroon
                  </div>
                </div>
              </div>
              <div className="font-mono-num text-xl font-bold text-[#4E8B3F]">
                {totalParcelsHectares.toFixed(1)} ha
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A12] mb-1">
                Produce Specialties (Glance Tags)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={produceInput}
                  onChange={(e) => setProduceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g. Roma Tomatoes, Sweet Pepper, Maize..."
                  className="flex-1 rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 rounded-xl bg-[#4E8B3F] text-white text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2.5">
                {produceTags.map((t) => (
                  <span
                    key={t}
                    onClick={() => handleRemoveTag(t)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-xs font-semibold text-[#173A20] hover:bg-[#FDF3F1] hover:text-[#B54A34] transition cursor-pointer"
                  >
                    <span>{t}</span>
                    <span>×</span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A12] mb-1">
                Cooperative / GIC Name (Optional)
              </label>
              <input
                type="text"
                value={cooperative}
                onChange={(e) => setCooperative(e.target.value)}
                placeholder="e.g. UCCAO, CAPLAME, Foumbot Tomato Union"
                className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12]"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Storefront Banner & Practices */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-[#CCEBD5] p-5 sm:p-7 space-y-5 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-[#173A20]">Storefront Banner & Farming Declarations</h2>
            <p className="text-xs text-[#5C5245] mt-0.5">
              Choose your public storefront landscape banner and declare your farming practices.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-[#241A12]">
                  Storefront Banner / Profile Image (16:9 Standard)
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  <Upload size={13} strokeWidth={2.2} />
                  <span>{uploadingCover ? 'Uploading...' : 'Upload Image'}</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Banner Preview with overlay action */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#EEF8F1] border border-[#CCEBD5] group">
                <img src={resolveMediaUrl(coverPhoto)} alt="Banner" className="w-full h-full object-cover" />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                >
                  <Camera size={26} className="mb-1" />
                  <span className="text-xs font-bold">Change Custom Photo</span>
                  <span className="text-[10px] text-white/80">Click to browse PNG, JPG, WebP</span>
                </div>
                {uploadingCover && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading Banner...</span>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <div className="text-[11px] font-semibold text-[#5C5245] mb-1.5">
                  Or select a Cameroon regional preset:
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_COVERS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCoverPhoto(url)}
                      className={`aspect-[16/9] rounded-xl overflow-hidden border-2 transition cursor-pointer ${coverPhoto === url ? 'border-[#4E8B3F] shadow-xs' : 'border-transparent'
                        }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-[#EEF8F1]">
              <label className="block text-xs font-semibold text-[#241A12]">
                Farming Practice Declarations (Self-Reported)
              </label>

              <div
                onClick={() => setIsOrganic(!isOrganic)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${isOrganic ? 'bg-[#EEF8F1] border-[#4E8B3F]' : 'bg-white border-[#CCEBD5]'
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${isOrganic ? 'bg-[#4E8B3F] text-white' : 'border border-[#CCEBD5]'
                    }`}
                >
                  {isOrganic && <Check size={14} strokeWidth={3} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#173A20]">Natural & Chemical-Free Practice</div>
                  <div className="text-[11px] text-[#5C5245]">
                    Grown with organic compost, bio-fertilizers, and zero synthetic pesticides.
                  </div>
                </div>
              </div>

              <div
                onClick={() => setIsGapCertified(!isGapCertified)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${isGapCertified ? 'bg-[#EEF8F1] border-[#4E8B3F]' : 'bg-white border-[#CCEBD5]'
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${isGapCertified ? 'bg-[#4E8B3F] text-white' : 'border border-[#CCEBD5]'
                    }`}
                >
                  {isGapCertified && <Check size={14} strokeWidth={3} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#173A20]">
                    Good Agricultural Practices (GAP Hygiene)
                  </div>
                  <div className="text-[11px] text-[#5C5245]">
                    Adheres to harvest sorting, clean-water wash, and food safety standards.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] flex items-start gap-2.5 text-xs text-[#173A20]">
                <ShieldCheck size={18} className="text-[#4E8B3F] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Official Verification Badges:</strong> Cameroon GAP & Organic seals are audited and issued by platform inspectors. You can upload certification documents inside your Farm Workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="flex items-center justify-between pt-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((step - 1) as any)}
            className="px-5 py-2.5 rounded-full bg-white border border-[#CCEBD5] text-xs font-bold text-[#241A12] hover:bg-[#EEF8F1] transition cursor-pointer"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={step < 4 ? handleNextStep : handleSubmit}
          disabled={submitting}
          className="px-7 py-3 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold shadow-md transition cursor-pointer"
        >
          {submitting
            ? 'Registering AgroFarm...'
            : step < 4
              ? `Continue to Step ${step + 1} →`
              : 'Register AgroFarm Enterprise'}
        </button>
      </div>
    </div>
  );
};

export default RegisterFarmWizardPage;

