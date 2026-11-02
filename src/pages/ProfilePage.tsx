import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate, NavLink } from 'react-router-dom';
import {
  Warehouse,
  ShoppingBag,
  Sparkles,
  BookmarkCheck,
  Edit3,
  UserPlus,
  UserCheck,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Play,
  Leaf,
  X,
  Check,
  MapPin,
  Star,
  Sprout,
  PlaySquare,
  User,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import {
  fetchCurrentUserApi,
  fetchPublicProfileApi,
  updateMyProfileApi,
  fetchFeedPostsApi,
  fetchYieldsApi,
  fetchMyOrdersApi,
  fetchMyFarmsApi,
  patronizeFarmApi,
  FALLBACK_POSTS,
} from '@/api';
import { Post, Yield, Order, Farm } from '@/types';
import { FarmerBadge, MeetingLeafLogo } from '@/components/MeetingLeafLogo';
import YieldCard from '@/components/YieldCard';
import { resolveMediaUrl, formatXaf, isVideoMedia } from '@/utils/media';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const { user: currentUser, isAuthenticated, updateUser } = useAuthStore();
  const savedYieldIds = useFavoritesStore((s) => s.yields);
  const savedPostIds = useFavoritesStore((s) => s.posts);

  const isOwner = Boolean(!userId || (currentUser?.id && userId === currentUser.id));

  const [activeTab, setActiveTab] = useState<'farms' | 'orders' | 'posts' | 'wishlist'>('farms');
  const [wishlistFilter, setWishlistFilter] = useState<'all' | 'harvests' | 'stories'>('all');
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(Boolean(userId && !isOwner));
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [savedYieldsList, setSavedYieldsList] = useState<Yield[]>([]);
  const [savedPostsList, setSavedPostsList] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  // Modals
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [patronModalVisible, setPatronModalVisible] = useState(false);
  const [patronPlan, setPatronPlan] = useState<'MONTHLY' | 'SEASONAL'>('MONTHLY');
  const [patronSuccess, setPatronSuccess] = useState(false);

  // Default demo profile when viewing as guest or before backend sync
  const fallbackDemoProfile = {
    id: userId || currentUser?.id || 'farmer-1',
    name: currentUser?.name || (userId === 'farmer-2' ? 'Mama Grace Bih' : 'Ibrahim Njoya'),
    email: currentUser?.email || 'ibrahim.njoya@agrom.app',
    phone: currentUser?.phone || '+237 677 42 19 80',
    isVerified: true,
    avatarUrl:
      currentUser?.avatarUrl ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio:
      currentUser?.bio ||
      'Lead agronomist & cooperative producer at Foumbot Volcanic Highland Farm. Supplying Grade-A organic Roma tomatoes, sweet peppers & highland produce across CEMAC.',
    followersCount: 148,
    followingCount: 19,
    agroVestorsCount: 12,
    farmerProfile: {
      creditTier: 'GOLD',
      creditScore: 765,
      bio: 'Verified Cooperative Producer • Foumbot Highland',
    },
    farms: [
      {
        id: 'farm-1',
        name: 'Foumbot Volcanic Highland Farm',
        category: 'CROPS',
        location: 'Foumbot, Noun Division',
        city: 'Foumbot',
        region: 'West Region',
        sizeHectares: 14.5,
        isVerified: true,
        rating: 4.9,
        coverPhoto:
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&auto=format&fit=crop&q=80',
      },
    ],
  };

  const targetUser = isOwner
    ? {
      ...fallbackDemoProfile,
      ...profileData,
      ...currentUser,
      farms:
        currentUser?.farms && currentUser.farms.length > 0
          ? currentUser.farms
          : profileData?.farms || fallbackDemoProfile.farms,
    }
    : profileData || {
        id: userId,
        name: 'Agrom Producer',
        email: 'producer@agrom.app',
        avatarUrl: '',
        bio: 'Verified Agricultural Producer on Agrom',
        farms: [],
      };

  const userHasFarm = Boolean(targetUser?.farms && targetUser.farms.length > 0);

  useEffect(() => {
    const load = async () => {
      if (isOwner && isAuthenticated) {
        try {
          const [freshUser, freshFarms, myOrders] = await Promise.all([
            fetchCurrentUserApi().catch(() => null),
            fetchMyFarmsApi().catch(() => []),
            fetchMyOrdersApi().catch(() => []),
          ]);
          if (freshUser) {
            const combined =
              freshFarms.length > 0 ? { ...freshUser, farms: freshFarms } : freshUser;
            updateUser(combined);
            setProfileData(combined);
          }
          if (myOrders.length > 0) setOrdersList(myOrders);
        } catch {
          // use fallback
        }
      } else if (userId) {
        setProfileLoading(true);
        try {
          const pub = await fetchPublicProfileApi(userId);
          if (pub) setProfileData(pub);
        } catch {
          // use fallback
        } finally {
          setProfileLoading(false);
        }
      }

      const allPosts = await fetchFeedPostsApi();
      setUserPosts(allPosts.length > 0 ? allPosts : FALLBACK_POSTS);

      const allYields = await fetchYieldsApi();
      setSavedYieldsList(allYields.filter((y) => savedYieldIds.includes(y.id)));
      setSavedPostsList(allPosts.filter((p) => savedPostIds.includes(p.id)));
    };
    load();
  }, [userId, isOwner, isAuthenticated, savedYieldIds, savedPostIds]);

  const openEditModal = () => {
    setEditName(targetUser?.name || '');
    setEditPhone(targetUser?.phone || '');
    setEditBio(targetUser?.farmerProfile?.bio || targetUser?.bio || '');
    setEditAvatarUrl(targetUser?.avatarUrl || targetUser?.avatar || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = {
        name: editName.trim(),
        phone: editPhone.trim(),
        bio: editBio.trim(),
        avatarUrl: editAvatarUrl.trim(),
      };
      updateUser(updated);
      setProfileData((prev: any) => ({ ...prev, ...updated }));
      if (isAuthenticated) {
        await updateMyProfileApi(updated).catch(() => null);
      }
      setEditModalVisible(false);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePatronizeSubmit = async () => {
    try {
      await patronizeFarmApi({
        farmerId: targetUser.id,
        plan: patronPlan,
        amount: patronPlan === 'MONTHLY' ? 1200 : 3000,
        currency: 'XAF',
        paymentMethod: 'MTN_MOMO',
      }).catch(() => null);
      setIsFollowing(true);
      setPatronSuccess(true);
      setTimeout(() => {
        setPatronSuccess(false);
        setPatronModalVisible(false);
      }, 1400);
    } catch {
      setIsFollowing(true);
      setPatronModalVisible(false);
    }
  };

  const allTabs = [
    { key: 'farms', label: 'Farms', icon: Warehouse },
    ...(isOwner ? [{ key: 'orders', label: 'Orders', icon: ShoppingBag }] : []),
    { key: 'posts', label: 'Posts', icon: Sparkles },
    ...(isOwner ? [{ key: 'wishlist', label: 'Wishlist', icon: BookmarkCheck }] : []),
  ] as const;

  // If viewing /profile/:userId where userId is actually the logged in user, redirect to /profile
  if (userId && currentUser?.id && userId === currentUser.id) {
    return <Navigate to="/profile" replace />;
  }

  // Loading state when fetching public profile (prevents showing wrong profile data)
  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 bg-white min-h-screen">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#CCEBD5]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-3.5 py-1.5 rounded-full bg-[#EEF8F1] hover:bg-[#E1F3E7] border border-[#CCEBD5] text-xs font-semibold text-[#241A12] cursor-pointer inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <NavLink to="/" className="inline-flex items-center gap-1.5">
            <MeetingLeafLogo size={26} showWordmark variant="light" />
          </NavLink>
        </div>
        <div className="h-64 rounded-3xl bg-[#EEF8F1] border border-[#CCEBD5] animate-pulse flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-[#4E8B3F] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#4E8B3F]">Loading Producer Profile...</span>
        </div>
      </div>
    );
  }

  // When signed out (Guest Mode) and viewing own /profile route, show Guest prompt
  if (!isAuthenticated && !userId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-[#CCEBD5] p-6 sm:p-8 text-center space-y-5 shadow-[0_8px_30px_rgba(23,58,32,0.06)]">
          <div className="w-16 h-16 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] flex items-center justify-center mx-auto text-[#4E8B3F]">
            <User size={30} strokeWidth={2.2} />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-[11px] font-semibold text-[#4E8B3F]">
              Guest Session Active
            </span>
            <h1 className="font-display-italic text-2xl sm:text-[26px] font-semibold text-[#173A20]">
              Sign in to your Agrom Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#5C5245] max-w-md mx-auto leading-relaxed">
              Sign in or create an account to manage your farms, track Smart Escrow orders, save harvests to your wishlist, and connect with AgroPatrons.
            </p>
          </div>

          {/* Primary Auth Actions */}
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

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-[#CCEBD5]" />
            <span className="text-[11px] font-medium text-[#9C9284]">or continue exploring</span>
            <div className="h-px flex-1 bg-[#CCEBD5]" />
          </div>

          {/* Secondary Guest Exploration Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white hover:bg-[#EEF8F1] border border-[#CCEBD5] text-xs font-semibold text-[#241A12] transition cursor-pointer"
            >
              <Sprout size={15} className="text-[#4E8B3F]" />
              <span>Go to AgroMarket</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/feed')}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white hover:bg-[#EEF8F1] border border-[#CCEBD5] text-xs font-semibold text-[#241A12] transition cursor-pointer"
            >
              <PlaySquare size={15} className="text-[#4E8B3F]" />
              <span>Check AgroFeed</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* =====================================================================
          HEADER SECTION (100% Parity with Frontend/app/(tabs)/profile.tsx)
          Pure White (#FFFFFF) + Mint (#EEF8F1) + Sage Border (#CCEBD5)
      ===================================================================== */}
      <div className="px-4 sm:px-6 pt-5 pb-0 bg-white border-b border-[#CCEBD5]">
        {/* 1. Top Bar Navigation: Back on Left (if visiting another profile), Edit Profile on Top Right */}
        <div className="flex items-center justify-between mb-4">
          {!isOwner ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-3.5 py-1.5 rounded-full bg-[#EEF8F1] hover:bg-[#E1F3E7] border border-[#CCEBD5] text-xs font-semibold text-[#241A12] cursor-pointer inline-flex items-center gap-1.5 transition"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {!isOwner && (
            <NavLink to="/" className="inline-flex items-center gap-1.5">
              <MeetingLeafLogo size={26} showWordmark variant="light" />
            </NavLink>
          )}

          {isOwner && (
            <button
              type="button"
              onClick={openEditModal}
              className="inline-flex items-center gap-1.5 bg-[#EEF8F1] hover:bg-[#E1F3E7] border border-[#CCEBD5] px-4 py-1.5 rounded-full text-[13.5px] font-semibold text-[#4E8B3F] transition cursor-pointer"
            >
              <Edit3 size={15} strokeWidth={2.2} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* 2. Profile Info Row: Avatar on Left, Large Name, Email, Bio, Credit Badge on Right */}
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 mb-4">
          <div className="relative shrink-0">
            <img
              src={resolveMediaUrl(targetUser?.avatarUrl || targetUser?.avatar)}
              alt={targetUser?.name}
              className="w-[88px] h-[88px] rounded-full object-cover border-[2.5px] border-[#4E8B3F]"
            />
            {targetUser?.isVerified && (
              <span
                title="Verified Agrom Producer"
                className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-[#4E8B3F] border-[2.5px] border-white flex items-center justify-center text-white"
              >
                <Check size={10} strokeWidth={3.5} />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-[22px] font-bold text-[#241A12] leading-tight">
              {targetUser?.name || 'Agrom Member'}
            </h1>
            <p className="text-[13.5px] text-[#5C5245]">
              {targetUser?.email || 'member@agrom.app'}
            </p>
            <p className="text-[13.5px] text-[#241A12] leading-relaxed max-w-2xl">
              {targetUser?.bio || targetUser?.farmerProfile?.bio}
            </p>

            {/* Credit Tier / Role Badge */}
            {userHasFarm && (
              <div
                onClick={() => navigate('/fintech/loans')}
                className="pt-1 inline-block cursor-pointer"
              >
                <FarmerBadge
                  tier={targetUser?.farmerProfile?.creditTier || 'GOLD'}
                  label={`Credit Score: ${targetUser?.farmerProfile?.creditScore || 765
                    } • ${targetUser?.farmerProfile?.creditTier || 'GOLD'}`}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. Realtime Stats Bar (Farms, AgroPatrons, Patronized Farms, AgroVestors) */}
        <div className="grid grid-cols-4 items-center bg-[#EEF8F1] border border-[#CCEBD5] rounded-2xl py-3.5 px-2 mb-4">
          <div className="text-center border-r border-[#CCEBD5] px-1">
            <div className="font-mono-num font-bold text-[17px] text-[#241A12]">
              {targetUser?.farms?.length ?? 1}
            </div>
            <div className="text-[11.5px] font-medium text-[#5C5245] mt-0.5">Farms</div>
          </div>

          <div
            onClick={() => setPatronModalVisible(true)}
            className="text-center border-r border-[#CCEBD5] px-1 cursor-pointer hover:opacity-80"
          >
            <div className="font-mono-num font-bold text-[17px] text-[#241A12]">
              {targetUser?.followersCount ?? 148}
            </div>
            <div className="text-[11.5px] font-medium text-[#5C5245] mt-0.5">AgroPatrons</div>
          </div>

          <div
            onClick={() => navigate('/feed?tab=patronized')}
            className="text-center border-r border-[#CCEBD5] px-1 cursor-pointer hover:opacity-80"
          >
            <div className="font-mono-num font-bold text-[17px] text-[#241A12]">
              {targetUser?.followingCount ?? 19}
            </div>
            <div className="text-[11.5px] font-medium text-[#5C5245] mt-0.5">
              Patronized Farms
            </div>
          </div>

          <div
            onClick={() => navigate('/fintech/loans')}
            className="text-center px-1 cursor-pointer hover:opacity-80"
          >
            <div className="font-mono-num font-bold text-[17px] text-[#241A12]">
              {targetUser?.agroVestorsCount ?? 12}
            </div>
            <div className="text-[11.5px] font-medium text-[#5C5245] mt-0.5">AgroVestors</div>
          </div>
        </div>

        {/* 4. Visitor Action Bar (Become an AgroPatron $2 & Message) */}
        <div className="flex items-center gap-2.5 mb-3">
          <button
            type="button"
            onClick={() => setPatronModalVisible(true)}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs sm:text-[13px] font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer ${isFollowing
              ? 'bg-[#EEF8F1] border border-[#4E8B3F] text-[#4E8B3F]'
              : 'bg-[#4E8B3F] hover:bg-[#3D7030] text-white'
              }`}
          >
            {isFollowing ? (
              <>
                <UserCheck size={16} />
                <span>AgroPatron Active ⭐ (8% Off)</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Become an AgroPatron ($2 / 1,200 FCFA)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/inbox?userId=${targetUser.id}`)}
            className="flex-1 py-2.5 px-4 rounded-full bg-[#EEF8F1] hover:bg-[#E1F3E7] border border-[#CCEBD5] text-[#241A12] text-xs sm:text-[13px] font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <MessageCircle size={16} />
            <span>Direct Message</span>
          </button>
        </div>

        {/* 5. 4-Tab Bar (Farms, Orders, Posts, Wishlist) */}
        <div className="flex items-center border-t border-[#EEF8F1]">
          {allTabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key as any)}
                className="flex-1 py-3 flex flex-col items-center gap-1 relative cursor-pointer"
              >
                <Icon
                  size={19}
                  className={isActive ? 'text-[#4E8B3F]' : 'text-[#241A12]/45'}
                />
                <span
                  className={`text-xs ${isActive ? 'font-semibold text-[#4E8B3F]' : 'font-medium text-[#241A12]/50'
                    }`}
                >
                  {t.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2.5px] bg-[#4E8B3F] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          TAB CONTENT AREA
      ===================================================================== */}
      <div className="p-4 sm:p-6">
        {/* TAB 1: FARMS */}
        {activeTab === 'farms' && (
          <div className="space-y-4">
            {!userHasFarm ? (
              <div className="p-8 sm:p-10 rounded-3xl bg-[#EEF8F1] border border-[#CCEBD5] text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#CCEBD5] flex items-center justify-center mx-auto text-[#4E8B3F] shadow-xs">
                  <Warehouse size={28} strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-[#173A20]">No Farm Page Created Yet</h3>
                  <p className="text-xs text-[#5C5245] max-w-sm mx-auto leading-relaxed">
                    {isOwner
                      ? 'Register your farm page to publish direct harvests, record field stories, and build your cooperative rating.'
                      : 'This user does not currently manage any public farm pages.'}
                  </p>
                </div>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => navigate('/farmer/new')}
                    className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>+ Create Your Farm</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Manage AgroFarms Banner (Matches profile.tsx farmHubBanner) - Only for Owner */}
                {isOwner && (
                  <div
                    onClick={() => navigate('/farmer/manage')}
                    className="flex items-center justify-between bg-[#EEF8F1] hover:bg-[#E1F3E7] border border-[#CCEBD5] p-4 rounded-2xl cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#4E8B3F] text-white flex items-center justify-center shadow-sm">
                        <Warehouse size={22} />
                      </div>
                      <div>
                        <div className="font-display font-bold text-[15px] text-[#173A20]">
                          Manage AgroFarms & Publish Harvests
                        </div>
                        <div className="text-xs text-[#5C5245]">
                          Register farm parcels, update live crate inventory & track cooperative sales
                        </div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-[#CCEBD5] flex items-center justify-center text-[#4E8B3F]">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                )}

                {/* Section Header with + New Farm Button */}
                <div className="flex items-center justify-between pt-1">
                  <h3 className="font-bold text-sm text-[#173A20]">
                    Registered AgroFarms ({(targetUser?.farms || []).length})
                  </h3>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => navigate('/farmer/new')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      <span>+ New Farm</span>
                    </button>
                  )}
                </div>

                {/* Farm Cards List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(targetUser?.farms || []).map((farm: Farm) => (
                    <div
                      key={farm.id}
                      onClick={() =>
                        navigate(isOwner ? `/farmer/manage?farmId=${farm.id}` : `/farmer/${farm.id}`)
                      }
                      className="bg-white rounded-2xl border border-[#CCEBD5] hover:border-[#4E8B3F] overflow-hidden shadow-xs transition cursor-pointer"
                    >
                      <div className="h-36 bg-[#EEF8F1] relative">
                        <img
                          src={
                            farm.coverPhoto ||
                            'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&auto=format&fit=crop&q=80'
                          }
                          alt={farm.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 bg-[#EEF8F1]/95 text-[#173A20] border border-[#CCEBD5] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          {farm.category || 'CROPS'} • {farm.sizeHectares || 12} Ha
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base text-[#241A12]">{farm.name}</h3>
                          <span className="inline-flex items-center gap-1 text-xs font-mono-num font-bold text-[#173A20]">
                            <Star size={13} className="fill-[#E2A63C] text-[#E2A63C]" />
                            {farm.rating || 4.9}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#5C5245]">
                          <MapPin size={13} className="text-[#4E8B3F]" />
                          <span>
                            {farm.location || farm.city} • {farm.region}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {ordersList.length === 0 ? (
              <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-2xl p-8 text-center space-y-3">
                <ShoppingBag size={36} className="text-[#4E8B3F] mx-auto" />
                <h3 className="font-bold text-base text-[#241A12]">
                  Track Your Smart Escrow Orders
                </h3>
                <p className="text-xs text-[#5C5245] max-w-sm mx-auto">
                  All harvest purchases locked in Smart Escrow appear here with live tracking.
                </p>
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/orders')}
                    className="px-4 py-2 rounded-full bg-[#173A20] text-[#E2A63C] text-xs font-bold cursor-pointer"
                  >
                    Open Escrow FSM Tracker
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-4 py-2 rounded-full bg-[#4E8B3F] text-white text-xs font-bold cursor-pointer"
                  >
                    Explore AgroMarket
                  </button>
                </div>
              </div>
            ) : (
              ordersList.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate('/orders')}
                  className="bg-white rounded-2xl border border-[#CCEBD5] p-4 hover:border-[#4E8B3F] transition cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-num font-bold text-xs text-[#241A12]">
                      #{order.orderNumber || order.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF6E8] text-[#8A5F1C] border border-[#E2A63C]/40">
                      {String(order.status).replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-[#241A12]">
                      {order.deliveryAddress}, {order.deliveryCity}
                    </div>
                    <div className="font-mono-num font-bold text-sm text-[#4E8B3F]">
                      {formatXaf(order.totalAmount)}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#EEF8F1] flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-[#4E8B3F] font-medium">
                      <ShieldCheck size={14} /> Smart Escrow
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#173A20] text-[#E2A63C] px-3 py-1 rounded-full text-[11px] font-bold">
                      Track FSM State <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: POSTS (3-Column TikTok/Instagram Grid from profile.tsx) */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {userPosts.map((post, idx) => {
              const mediaUri = post.mediaUrl || post.media;
              const isVid = isVideoMedia(mediaUri, post.isVideo);
              return (
                <div
                  key={post.id}
                  onClick={() => navigate(`/feed?postIndex=${idx}`)}
                  className="relative aspect-[3/4] bg-[#EEF8F1] rounded-xl overflow-hidden cursor-pointer group"
                >
                  <img
                    src={mediaUri}
                    alt={post.content}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-white font-mono-num text-xs font-bold">
                    {isVid ? (
                      <Play size={11} className="fill-white" />
                    ) : (
                      <Leaf size={11} className="fill-[#4ADE80] text-[#4ADE80]" />
                    )}
                    <span>{post.likesCount ?? post.likes ?? 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: WISHLIST (All / Harvests / Stories Sub-Filter Pill Bar) */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(
                [
                  { id: 'all', label: `All (${savedYieldsList.length + savedPostsList.length})` },
                  { id: 'harvests', label: `Harvests (${savedYieldsList.length})` },
                  { id: 'stories', label: `Stories (${savedPostsList.length})` },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setWishlistFilter(pill.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${wishlistFilter === pill.id
                    ? 'bg-[#4E8B3F] text-white border-[#4E8B3F]'
                    : 'bg-[#EEF8F1] text-[#241A12] border-[#CCEBD5]'
                    }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {savedYieldsList.length === 0 && savedPostsList.length === 0 ? (
              <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-2xl p-8 text-center space-y-2">
                <BookmarkCheck size={36} className="text-[#4E8B3F] mx-auto" />
                <h3 className="font-bold text-base text-[#241A12]">Your Wishlist is Empty</h3>
                <p className="text-xs text-[#5C5245] max-w-xs mx-auto">
                  Tap the heart icon on any harvest lot or bookmark stories in AgroFeed to save them here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {(wishlistFilter === 'all' || wishlistFilter === 'harvests') &&
                  savedYieldsList.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {savedYieldsList.map((item) => (
                        <YieldCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}

                {(wishlistFilter === 'all' || wishlistFilter === 'stories') &&
                  savedPostsList.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {savedPostsList.map((post, idx) => (
                        <div
                          key={post.id}
                          onClick={() => navigate(`/feed?postIndex=${idx}`)}
                          className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#EEF8F1] cursor-pointer"
                        >
                          <img
                            src={post.mediaUrl || post.media}
                            alt={post.content}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          EDIT PROFILE MODAL (Matches profile.tsx Edit Modal)
      ===================================================================== */}
      {editModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setEditModalVisible(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-[#CCEBD5] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <h3 className="font-bold text-lg text-[#241A12]">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setEditModalVisible(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2.5 text-sm text-[#241A12]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2.5 text-sm text-[#241A12]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Avatar URL
                </label>
                <input
                  type="text"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2.5 text-xs text-[#241A12]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Bio / Farmer Description
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2.5 text-sm text-[#241A12]"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-sm font-semibold transition cursor-pointer"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          AGROPATRON ($2 / 1,200 FCFA) SUBSCRIPTION MODAL
      ===================================================================== */}
      {patronModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setPatronModalVisible(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-[#CCEBD5] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#CCEBD5]">
              <h3 className="font-display-italic text-lg font-semibold text-[#173A20]">
                Become an AgroPatron ⭐
              </h3>
              <button
                type="button"
                onClick={() => setPatronModalVisible(false)}
                className="w-8 h-8 rounded-full bg-[#EEF8F1] flex items-center justify-center text-[#241A12] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#5C5245] leading-relaxed">
              Support <strong>{targetUser?.name}</strong> directly and unlock Engine 4 commercial privileges:
              <strong> 8% automatic harvest discount</strong>, priority pre-harvest reservation, and VIP AgroFeed stories.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPatronPlan('MONTHLY')}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer ${patronPlan === 'MONTHLY'
                  ? 'bg-[#EEF8F1] border-[#4E8B3F]'
                  : 'bg-white border-[#CCEBD5]'
                  }`}
              >
                <div className="text-xs font-bold text-[#173A20]">Monthly Pass</div>
                <div className="font-mono-num text-base font-bold text-[#4E8B3F] mt-1">
                  1,200 FCFA ($2)
                </div>
                <div className="text-[11px] text-[#5C5245] mt-0.5">8% off all farm orders</div>
              </button>

              <button
                type="button"
                onClick={() => setPatronPlan('SEASONAL')}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer ${patronPlan === 'SEASONAL'
                  ? 'bg-[#FEF6E8] border-[#E2A63C]'
                  : 'bg-white border-[#CCEBD5]'
                  }`}
              >
                <div className="text-xs font-bold text-[#173A20]">Seasonal Pass (3 Mo)</div>
                <div className="font-mono-num text-base font-bold text-[#C68F30] mt-1">
                  3,000 FCFA ($5)
                </div>
                <div className="text-[11px] text-[#5C5245] mt-0.5">12% off + first crate priority</div>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePatronizeSubmit}
              className="w-full py-3 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              {patronSuccess
                ? '✓ AgroPatron Pass Activated!'
                : `Activate ${patronPlan} Pass via Smart Escrow`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

