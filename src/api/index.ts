import apiClient from './client';
import {
  User,
  UserRole,
  Yield,
  Category,
  Post,
  Order,
  PaymentMethod,
  LoanProduct,
  LoanApplication,
  AgroVestorCampaign,
  AgroPatronSubscription,
  Conversation,
  Message,
  Farm,
} from '@/types';
import { resolveMediaUrl } from '@/utils/media';

// ============================================================================
// REALISTIC SEED / FALLBACK DATA (Used only if backend returns empty or is offline)
// ============================================================================
export const FALLBACK_YIELDS: Yield[] = [
  {
    id: 'yield-foumbot-tomatoes',
    farmerId: 'farmer-1',
    farmId: 'farm-1',
    farmerName: 'Papa Njoya Cooperative',
    title: 'Fresh Foumbot Roma Tomatoes',
    description:
      'Vine-ripened highland Roma tomatoes harvested this morning from volcanic soils in Foumbot, West Region. Sorted Grade-A crate with zero bruising.',
    originRegion: 'Foumbot • West Region',
    price: 8500,
    pricePerUnit: 8500,
    oldPrice: 10000,
    unit: 'CRATE',
    stockQuantity: 48,
    minOrderQuantity: 1,
    isWholesaleBulkAvailable: true,
    bulkMinQuantity: 10,
    bulkPricePerUnit: 7200,
    isOrganic: true,
    available: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&auto=format&fit=crop&q=80',
    mediaUrls: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&auto=format&fit=crop&q=80'],
    category: { id: 'cat-veg', name: 'Vegetables' },
    farm: {
      id: 'farm-1',
      userId: 'farmer-1',
      name: 'Foumbot Volcanic Highland Farm',
      category: 'CROPS',
      location: 'Foumbot, Noun Division',
      city: 'Foumbot',
      region: 'West Region',
      sizeHectares: 14.5,
      isVerified: true,
      rating: 4.9,
      coverPhoto: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&auto=format&fit=crop&q=80',
    },
    farmer: {
      creditTier: 'GOLD',
      creditScore: 765,
      user: {
        id: 'farmer-1',
        name: 'Ibrahim Njoya',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      },
    },
  },
  {
    id: 'yield-santa-potatoes',
    farmerId: 'farmer-2',
    farmId: 'farm-2',
    farmerName: 'Santa Highland Growers',
    title: 'Santa Highland Irish Potatoes',
    description:
      'Clean, dry-brushed Dosa variety Irish potatoes from Santa, North-West highlands. Ideal for chips, restaurants, and household storage.',
    originRegion: 'Santa • North-West',
    price: 18500,
    pricePerUnit: 18500,
    oldPrice: 21000,
    unit: 'BAG_50KG',
    stockQuantity: 120,
    minOrderQuantity: 1,
    isWholesaleBulkAvailable: true,
    bulkMinQuantity: 20,
    bulkPricePerUnit: 16500,
    isOrganic: true,
    available: true,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=900&auto=format&fit=crop&q=80',
    mediaUrls: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=900&auto=format&fit=crop&q=80'],
    category: { id: 'cat-tubers', name: 'Tubers & Roots' },
    farm: {
      id: 'farm-2',
      userId: 'farmer-2',
      name: 'Santa Mist Valley Estates',
      category: 'CROPS',
      location: 'Santa, Mezam',
      city: 'Bamenda',
      region: 'North-West',
      sizeHectares: 22,
      isVerified: true,
      rating: 4.8,
    },
    farmer: {
      creditTier: 'PLATINUM',
      creditScore: 812,
      user: {
        id: 'farmer-2',
        name: 'Mama Grace Bih',
        avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=80',
      },
    },
  },
  {
    id: 'yield-penja-pepper',
    farmerId: 'farmer-3',
    farmId: 'farm-3',
    farmerName: 'Moungo Terroir Estate',
    title: 'IGP White Penja Pepper (Poivre de Penja)',
    description:
      'Authentic Geographical Indication (IGP) sun-dried white Penja pepper grains from Moungo volcanic valley. Rich, woody aroma.',
    originRegion: 'Penja • Littoral',
    price: 12000,
    pricePerUnit: 12000,
    unit: 'KG',
    stockQuantity: 65,
    minOrderQuantity: 1,
    isWholesaleBulkAvailable: true,
    bulkMinQuantity: 15,
    bulkPricePerUnit: 10200,
    isOrganic: true,
    available: true,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=900&auto=format&fit=crop&q=80',
    mediaUrls: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=900&auto=format&fit=crop&q=80'],
    category: { id: 'cat-spices', name: 'Spices & Herbs' },
    farm: {
      id: 'farm-3',
      userId: 'farmer-3',
      name: 'Moungo Terroir Spice Plantation',
      category: 'HORTICULTURE',
      location: 'Penja, Moungo',
      city: 'Penja',
      region: 'Littoral',
      sizeHectares: 9.2,
      isVerified: true,
      rating: 5.0,
    },
    farmer: {
      creditTier: 'GOLD',
      creditScore: 780,
      user: {
        id: 'farmer-3',
        name: 'Jean-Paul Ebongue',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      },
    },
  },
  {
    id: 'yield-bafoussam-eggs',
    farmerId: 'farmer-4',
    farmId: 'farm-4',
    farmerName: 'Mifi Golden Poultry',
    title: 'Farm-Fresh Large Table Eggs (30-Egg Tray)',
    description:
      'Maize-fed layer eggs collected daily in Bafoussam. Thick shells, deep golden yolks, candled and packed in shock-resistant trays.',
    originRegion: 'Bafoussam • West Region',
    price: 2600,
    pricePerUnit: 2600,
    oldPrice: 2900,
    unit: 'CRATE',
    stockQuantity: 250,
    minOrderQuantity: 2,
    isWholesaleBulkAvailable: true,
    bulkMinQuantity: 30,
    bulkPricePerUnit: 2350,
    isOrganic: false,
    available: true,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=900&auto=format&fit=crop&q=80',
    mediaUrls: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=900&auto=format&fit=crop&q=80'],
    category: { id: 'cat-poultry', name: 'Poultry & Eggs' },
    farm: {
      id: 'farm-4',
      userId: 'farmer-4',
      name: 'Mifi Golden Poultry & Feeds',
      category: 'POULTRY',
      location: 'Bafoussam, Mifi',
      city: 'Bafoussam',
      region: 'West Region',
      sizeHectares: 5.0,
      isVerified: true,
      rating: 4.7,
    },
    farmer: {
      creditTier: 'SILVER',
      creditScore: 675,
      user: {
        id: 'farmer-4',
        name: 'Clarisse Kamga',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      },
    },
  },
  {
    id: 'yield-muyuka-plantains',
    farmerId: 'farmer-5',
    farmId: 'farm-5',
    farmerName: 'Fako Green Plantations',
    title: 'Giant Green Plantain Bunches (Bâtard Variety)',
    description:
      'Heavy, mature green plantain bunches harvested from rich volcanic slopes of Mount Cameroon. Perfect for wholesale markets and restaurants.',
    originRegion: 'Muyuka • South-West',
    price: 4500,
    pricePerUnit: 4500,
    oldPrice: 5200,
    unit: 'BUNCH',
    stockQuantity: 85,
    minOrderQuantity: 1,
    isWholesaleBulkAvailable: true,
    bulkMinQuantity: 15,
    bulkPricePerUnit: 3800,
    isOrganic: true,
    available: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=900&auto=format&fit=crop&q=80',
    mediaUrls: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=900&auto=format&fit=crop&q=80'],
    category: { id: 'cat-fruits', name: 'Fruits' },
    farm: {
      id: 'farm-5',
      userId: 'farmer-5',
      name: 'Fako Volcanic Slope AgroFarm',
      category: 'CROPS',
      location: 'Muyuka, Fako',
      city: 'Buea',
      region: 'South-West',
      sizeHectares: 18.0,
      isVerified: true,
      rating: 4.9,
    },
    farmer: {
      creditTier: 'GOLD',
      creditScore: 742,
      user: {
        id: 'farmer-5',
        name: 'Chief Enow Tabi',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      },
    },
  },
  {
    id: 'yield-mbalmayo-cassava',
    farmerId: 'farmer-6',
    farmId: 'farm-6',
    farmerName: 'Nyong Cooperative Union',
    title: 'Sweet White Cassava Tubers & Garri Lot',
    description:
      'Freshly uprooted low-cyanide white cassava tubers from Mbalmayo. High starch yield for baton de manioc, fufu, and garri processing.',
    originRegion: 'Mbalmayo • Centre',
    price: 14000,
    pricePerUnit: 14000,
    unit: 'BAG_100KG',
    stockQuantity: 60,
    minOrderQuantity: 1,
    isWholesaleBulkAvailable: true,
    bulkMinQuantity: 10,
    bulkPricePerUnit: 12000,
    isOrganic: true,
    available: true,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=900&auto=format&fit=crop&q=80',
    mediaUrls: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=900&auto=format&fit=crop&q=80'],
    category: { id: 'cat-tubers', name: 'Tubers & Roots' },
    farm: {
      id: 'farm-6',
      userId: 'farmer-6',
      name: 'Nyong River Valley Cooperative',
      category: 'CROPS',
      location: 'Mbalmayo, Nyong-et-So’o',
      city: 'Mbalmayo',
      region: 'Centre',
      sizeHectares: 31.0,
      isVerified: true,
      rating: 4.8,
    },
    farmer: {
      creditTier: 'GOLD',
      creditScore: 728,
      user: {
        id: 'farmer-6',
        name: 'Solange Mballa',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      },
    },
  },
  {
    id: 'yield-combo-achu',
    farmerId: 'farmer-7',
    farmId: 'farm-1',
    farmerName: 'Grassland Co-op & Kitchen',
    title: 'The Traditional Achu Soup Meal Combo',
    frenchTitle: 'Kit Repas Traditionnel Achu & Soupe Jaune',
    description:
      'Complete authentic Achu meal kit: Fresh peeled Taro Coco (Colocasia), Achu yellow soup spice blend, limestone potash extract, and pure yellow palm oil. Feeds a family of 6.',
    originRegion: 'Bamenda • Mezam',
    price: 12500,
    pricePerUnit: 12500,
    oldPrice: 15000,
    unit: 'MEAL PACK',
    stockQuantity: 30,
    minOrderQuantity: 1,
    isMealCombo: true,
    sourceType: 'COMBO',
    comboItems: ['5kg Fresh Taro Coco', 'Achu Yellow Soup Spice Blend', '500ml Pure Palm Oil', 'Limestone Potash Extract'],
    isOrganic: true,
    available: true,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80',
    mediaUrls: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80'],
    category: { id: 'cat-combos', name: 'Meal Combos' },
  },
  {
    id: 'yield-combo-ndole',
    farmerId: 'farmer-1',
    farmId: 'farm-1',
    farmerName: 'Foumbot Volcanic Highland Farm',
    title: 'Sunday Ndole Feast Meal Box',
    frenchTitle: 'Panier Festin Ndolè du Dimanche',
    description:
      'Ready-to-cook Ndole crate: Fresh washed and pre-boiled bitterleaf, peeled white egusi (melon seeds), smoked dried crayfish, garlic-ginger aromatics, and a bunch of green plantains.',
    originRegion: 'Littoral & West Co-op',
    price: 15000,
    pricePerUnit: 15000,
    oldPrice: 18000,
    unit: 'COMBO CRATE',
    stockQuantity: 25,
    minOrderQuantity: 1,
    isMealCombo: true,
    sourceType: 'COMBO',
    comboItems: ['2kg Washed Bitterleaf', '1kg Peeled White Egusi', '250g Smoked Crayfish', '1 Bunch Plantains', 'Aromatics Pack'],
    isOrganic: true,
    available: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80',
    mediaUrls: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80'],
    category: { id: 'cat-combos', name: 'Meal Combos' },
  },
  {
    id: 'yield-combo-stew',
    farmerId: 'farmer-1',
    farmId: 'farm-1',
    farmerName: 'Foumbot Volcanic Highland Farm',
    title: 'Farm-Direct Stew & Salad Meal Basket',
    frenchTitle: 'Panier Maraîcher Sauce & Salade Fraîche',
    description:
      'Farm-direct stew & salad bundle: 1 small crate Roma tomatoes, 2kg sweet red bell peppers, 1kg green beans, 1kg fresh onions, and fresh celery/parsley bouquet.',
    originRegion: 'Foumbot • West Region',
    price: 9500,
    pricePerUnit: 9500,
    oldPrice: 11000,
    unit: 'COMBO BASKET',
    stockQuantity: 40,
    minOrderQuantity: 1,
    isMealCombo: true,
    sourceType: 'COMBO',
    comboItems: ['1 Crate Roma Tomatoes (8kg)', '2kg Sweet Bell Peppers', '1kg Onions', 'Celery & Parsley Bouquet'],
    isOrganic: true,
    available: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=900&auto=format&fit=crop&q=80',
    mediaUrls: ['https://images.unsplash.com/photo-1518843875459-f738682238a6?w=900&auto=format&fit=crop&q=80'],
    category: { id: 'cat-combos', name: 'Meal Combos' },
  },
];

export const FALLBACK_POSTS: Post[] = [
  {
    id: 'post-1',
    farmerId: 'farmer-1',
    farmId: 'farm-1',
    userId: 'farmer-1',
    farmerName: 'Foumbot Volcanic Highland Farm',
    farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    farmerCreditTier: 'GOLD',
    isPatron: true,
    content:
      '🍅 Morning harvest in Foumbot! 48 crates of firm, sun-ripened Roma tomatoes ready for immediate dispatch to Douala & Yaoundé. Escrow-protected 1-tap ordering below! #AgroFeed #FoumbotHarvest #Agrom',
    mediaUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&auto=format&fit=crop&q=80',
    media: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&auto=format&fit=crop&q=80',
    isVideo: false,
    linkedYieldId: 'yield-foumbot-tomatoes',
    linkedYield: FALLBACK_YIELDS[0],
    likesCount: 248,
    likes: 248,
    commentsCount: 34,
    comments: [
      {
        id: 'c1',
        userId: 'u2',
        userName: 'Chef Nadine (Douala)',
        content: 'Just locked 6 crates in Smart Escrow! Last week’s batch was spotless.',
        createdAt: '2h ago',
      },
      {
        id: 'c2',
        userId: 'u3',
        userName: 'Mokolo Market Wholesalers',
        content: 'Do you have 25 crates available for wholesale Buyam-Sellam pickup tomorrow?',
        createdAt: '1h ago',
      },
    ],
    createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
  },
  {
    id: 'post-2',
    farmerId: 'farmer-2',
    farmId: 'farm-2',
    userId: 'farmer-2',
    farmerName: 'Santa Mist Valley Estates',
    farmerAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=80',
    farmerCreditTier: 'PLATINUM',
    isPatron: true,
    content:
      '🥔 Grading 120 bags of dry-brushed Santa Irish Potatoes! Zero rot guarantee, backed by Engine 3 Smart Escrow. AgroPatrons get automatic 8% off on bulk bags!',
    mediaUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=900&auto=format&fit=crop&q=80',
    media: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=900&auto=format&fit=crop&q=80',
    isVideo: false,
    linkedYieldId: 'yield-santa-potatoes',
    linkedYield: FALLBACK_YIELDS[1],
    likesCount: 412,
    likes: 412,
    commentsCount: 59,
    comments: [
      {
        id: 'c3',
        userId: 'u4',
        userName: 'Bastos Bistro',
        content: 'Best frying potatoes in Cameroon. Ordering 4 bags now.',
        createdAt: '4h ago',
      },
    ],
    createdAt: new Date(Date.now() - 3600 * 1000 * 7).toISOString(),
  },
  {
    id: 'post-3',
    farmerId: 'farmer-3',
    farmId: 'farm-3',
    userId: 'farmer-3',
    farmerName: 'Moungo Terroir Spice Plantation',
    farmerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    farmerCreditTier: 'GOLD',
    isPatron: false,
    content:
      '✨ Sun-drying our certified IGP White Penja Pepper harvest in Moungo Valley. Export-grade aroma, available by the kilogram or wholesale sacks.',
    mediaUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=900&auto=format&fit=crop&q=80',
    media: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=900&auto=format&fit=crop&q=80',
    isVideo: false,
    linkedYieldId: 'yield-penja-pepper',
    linkedYield: FALLBACK_YIELDS[2],
    likesCount: 189,
    likes: 189,
    commentsCount: 21,
    comments: [],
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
  {
    id: 'post-4',
    farmerId: 'farmer-5',
    farmId: 'farm-5',
    userId: 'farmer-5',
    farmerName: 'Fako Volcanic Slope AgroFarm',
    farmerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    farmerCreditTier: 'GOLD',
    isPatron: true,
    content:
      '🌱 Heavy Bâtard plantain bunches coming down from Muyuka slopes today! Direct farm-gate pricing for households and Buyam-Sellam aggregators.',
    mediaUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=900&auto=format&fit=crop&q=80',
    media: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=900&auto=format&fit=crop&q=80',
    isVideo: false,
    linkedYieldId: 'yield-muyuka-plantains',
    linkedYield: FALLBACK_YIELDS[4],
    likesCount: 315,
    likes: 315,
    commentsCount: 42,
    comments: [],
    createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
  },
];

// ============================================================================
// NORMALIZERS
// ============================================================================
export const normalizeYield = (item: any): Yield => {
  if (!item) return item;
  const rawPrice = item.price ?? item.pricePerUnit ?? 0;
  const price = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice) || 0;
  const rawImage =
    item.image || (Array.isArray(item.mediaUrls) && item.mediaUrls.length > 0 ? item.mediaUrls[0] : '') || '';
  const image =
    resolveMediaUrl(rawImage) ||
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80';

  const catName = typeof item.category === 'object' ? item.category?.name : (item.category || '');
  const isMealCombo = Boolean(
    item.isMealCombo ||
    catName?.toLowerCase().includes('combo') ||
    item.title?.toLowerCase().includes('combo') ||
    item.title?.toLowerCase().includes('meal pack') ||
    item.title?.toLowerCase().includes('meal box') ||
    item.title?.toLowerCase().includes('soup kit') ||
    item.title?.toLowerCase().includes('soup combo')
  );

  return {
    ...item,
    price,
    pricePerUnit: price,
    image,
    isMealCombo,
    comboItems: item.comboItems || (isMealCombo ? ['Farm-fresh ingredients', 'Recipe seasoning bundle', 'Direct harvest portion'] : undefined),
    sourceType: item.sourceType || (isMealCombo ? 'COMBO' : (item.storeId ? 'STORE' : 'FARM')),
    storeId: item.storeId,
    storeSiteId: item.storeSiteId,
    dispatchSiteName: item.dispatchSiteName,
    storeName: item.storeName || item.store?.name,
    mediaUrls:
      Array.isArray(item.mediaUrls) && item.mediaUrls.length > 0
        ? item.mediaUrls.map((u: string) => resolveMediaUrl(u))
        : [image],
  };
};

// ============================================================================
// AUTH API
// ============================================================================
export const loginApi = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data;
};

export const registerApi = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
  farmName?: string;
  region?: string;
  city?: string;
}): Promise<{ user: User; token: string }> => {
  const res = await apiClient.post('/auth/register', data);
  return res.data;
};

export const fetchCurrentUserApi = async (): Promise<User> => {
  const res = await apiClient.get('/auth/me');
  return res.data.user;
};

export const fetchPublicProfileApi = async (userId: string): Promise<any> => {
  const res = await apiClient.get(`/auth/profile/${userId}`);
  return res.data.user;
};

export const toggleFollowUserApi = async (userId: string): Promise<{ isFollowing: boolean }> => {
  const res = await apiClient.post(`/auth/profile/${userId}/follow`);
  return res.data;
};

export const updateMyProfileApi = async (data: {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
}): Promise<any> => {
  const res = await apiClient.put('/auth/profile', data);
  return res.data;
};

// ============================================================================
// YIELDS / MARKETPLACE API
// ============================================================================
export const fetchYieldsApi = async (params?: {
  category?: string;
  region?: string;
  search?: string;
  isWholesale?: boolean;
  farmId?: string;
  storeId?: string;
}): Promise<Yield[]> => {
  try {
    const res = await apiClient.get('/yields', { params });
    const data = Array.isArray(res.data) ? res.data : [];
    return data.map(normalizeYield);
  } catch {
    return [];
  }
};

export const fetchCategoriesApi = async (): Promise<Category[]> => {
  try {
    const res = await apiClient.get('/yields/categories');
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
};

export const fetchYieldByIdApi = async (id: string): Promise<Yield> => {
  const res = await apiClient.get(`/yields/${id}`);
  return normalizeYield(res.data);
};

export const createYieldApi = async (data: any): Promise<Yield> => {
  const res = await apiClient.post('/yields', data);
  return normalizeYield(res.data.yield || res.data);
};

// ============================================================================
// AGROSTORE & WHOLESALER PROFILE API
// ============================================================================
export const fetchWholesalerProfileApi = async (): Promise<any> => {
  try {
    const res = await apiClient.get('/wholesaler/me');
    return res.data;
  } catch {
    return null;
  }
};

export const checkStoreSlugApi = async (
  name: string,
  excludeId?: string
): Promise<{ slug: string; available: boolean; candidate: string }> => {
  const res = await apiClient.get('/wholesaler/check-slug', { params: { name, excludeId } });
  return res.data;
};

export const fetchMyStoresApi = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get('/wholesaler/my-stores');
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
};

export const createStoreApi = async (data: any): Promise<any> => {
  const res = await apiClient.post('/wholesaler', data);
  return res.data?.store || res.data;
};

export const fetchStoreByIdApi = async (id: string): Promise<any> => {
  const res = await apiClient.get(`/wholesaler/${id}`);
  return res.data;
};

export const updateStoreApi = async (id: string, data: any): Promise<any> => {
  const res = await apiClient.put(`/wholesaler/${id}`, data);
  return res.data?.store || res.data;
};

export const registerOrUpdateStoreApi = async (data: {
  businessName: string;
  tradeLicenseNumber?: string;
  primaryMarketCity: string;
  buyingCapacityTons?: number;
  preferredCommodities?: string[];
  linkedFarmId?: string;
  storeBio?: string;
}): Promise<any> => {
  const res = await apiClient.post('/wholesaler/register', data);
  return res.data;
};

// ============================================================================
// AGROFEED POSTS API
// ============================================================================
export const fetchFeedPostsApi = async (params?: { farmId?: string; userId?: string }): Promise<Post[]> => {
  try {
    const res = await apiClient.get('/posts', { params });
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((item: any) => ({
        id: item.id,
        farmerId: item.farmerId || item.userId || 'f1',
        farmId: item.farmId,
        farm: item.farm,
        userId: item.userId,
        user: item.user,
        farmerName: item.farm?.name || item.user?.name || item.farmer?.user?.name || 'Agro Producer',
        farmerAvatar:
          resolveMediaUrl(item.farm?.coverPhoto || item.user?.avatarUrl) ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
        farmerCreditTier: item.farmer?.creditTier || item.farmerCreditTier || 'GOLD',
        isPatron: Boolean(item.isPatron || item.rankingMetadata?.isPatronStory),
        content: item.content,
        mediaUrl: resolveMediaUrl(item.mediaUrl),
        media: resolveMediaUrl(item.mediaUrl),
        isVideo: Boolean(item.isVideo),
        linkedYieldId: item.linkedYieldId,
        linkedYield: item.linkedYield ? normalizeYield(item.linkedYield) : undefined,
        likesCount: item.likesCount ?? item.likes?.length ?? 0,
        likes: item.likesCount ?? item.likes?.length ?? 0,
        commentsCount: item.commentsCount ?? item.comments?.length ?? 0,
        comments: item.comments || [],
        createdAt: item.createdAt || new Date().toISOString(),
      }));
    }
    if (params?.userId || params?.farmId) return [];
    return FALLBACK_POSTS;
  } catch {
    if (params?.userId || params?.farmId) return [];
    return FALLBACK_POSTS;
  }
};

export const createPostApi = async (data: {
  content: string;
  mediaUrl: string;
  isVideo?: boolean;
  linkedYieldId?: string;
  farmId?: string;
}): Promise<Post> => {
  const res = await apiClient.post('/posts', data);
  const item = res.data.post || res.data;
  return {
    id: item.id,
    farmerId: item.farmerId || item.userId,
    farmId: item.farmId,
    farm: item.farm,
    userId: item.userId,
    user: item.user,
    farmerName: item.farm?.name || item.user?.name || 'Agro Producer',
    farmerAvatar:
      resolveMediaUrl(item.farm?.coverPhoto || item.user?.avatarUrl) ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
    content: item.content,
    mediaUrl: resolveMediaUrl(item.mediaUrl),
    media: resolveMediaUrl(item.mediaUrl),
    isVideo: Boolean(item.isVideo),
    linkedYieldId: item.linkedYieldId,
    likesCount: item.likesCount ?? 0,
    likes: item.likesCount ?? 0,
    commentsCount: item.commentsCount ?? 0,
    comments: item.comments || [],
    createdAt: item.createdAt || new Date().toISOString(),
  };
};

export const toggleLikePostApi = async (postId: string): Promise<{ liked: boolean }> => {
  const res = await apiClient.post(`/posts/${postId}/like`);
  return res.data;
};

export const addPostCommentApi = async (postId: string, content: string): Promise<any> => {
  const res = await apiClient.post(`/posts/${postId}/comment`, { content });
  return res.data;
};

export const deletePostApi = async (postId: string): Promise<boolean> => {
  const res = await apiClient.delete(`/posts/${postId}`);
  return res.status === 200 || res.data?.success === true;
};

export const uploadMediaFileApi = async (
  file: File
): Promise<{ url: string; filename: string; isVideo: boolean }> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// ============================================================================
// FARMS API
// ============================================================================
export const fetchMyFarmsApi = async (): Promise<Farm[]> => {
  const res = await apiClient.get('/farms/my-farms');
  return Array.isArray(res.data) ? res.data : [];
};

export const createFarmApi = async (farmData: Partial<Farm>): Promise<Farm> => {
  const res = await apiClient.post('/farms', farmData);
  return res.data.farm || res.data;
};

export const checkFarmSlugApi = async (
  name: string,
  excludeId?: string
): Promise<{ slug: string; available: boolean; candidate: string }> => {
  const res = await apiClient.get('/farms/check-slug', { params: { name, excludeId } });
  return res.data;
};

export const fetchFarmByIdApi = async (farmId: string): Promise<Farm> => {
  const res = await apiClient.get(`/farms/${farmId}?includeAllYields=true`);
  return res.data;
};

export const updateFarmApi = async (farmId: string, farmData: Partial<Farm>): Promise<any> => {
  const res = await apiClient.put(`/farms/${farmId}`, farmData);
  return res.data.farm || res.data;
};

export const deleteFarmApi = async (
  farmId: string,
  targetFarmId?: string
): Promise<{ success: boolean; message: string; id: string; migratedTo?: string }> => {
  const res = await apiClient.delete(`/farms/${farmId}`, {
    data: targetFarmId ? { targetFarmId } : undefined,
  });
  return res.data;
};

export const fetchFarmAnalyticsApi = async (farmId: string): Promise<any> => {
  const res = await apiClient.get(`/farms/${farmId}/analytics`);
  return res.data;
};

export const createProduceApi = async (produceData: any): Promise<any> => {
  const res = await apiClient.post('/yields', produceData);
  return res.data;
};

export const updateProduceApi = async (yieldId: string, updates: any): Promise<any> => {
  const res = await apiClient.put(`/yields/${yieldId}`, updates);
  return res.data;
};

export const deleteProduceApi = async (yieldId: string): Promise<any> => {
  const res = await apiClient.delete(`/yields/${yieldId}`);
  return res.data;
};

export const patchProduceStockApi = async (
  yieldId: string,
  data: { delta?: number; stockQuantity?: number; isAvailable?: boolean }
): Promise<any> => {
  const res = await apiClient.patch(`/yields/${yieldId}/stock`, data);
  return res.data;
};

export const fetchPartnerStatusApi = async (
  targetUserId: string
): Promise<{ isPartner: boolean; isMutual: boolean; wholesaleDiscountPercent: number }> => {
  try {
    const res = await apiClient.get(`/farms/partner-status/${targetUserId}`);
    return res.data;
  } catch {
    return { isPartner: false, isMutual: false, wholesaleDiscountPercent: 0 };
  }
};

export const requestPartnerApi = async (
  targetUserId: string
): Promise<{ success: boolean; isMutual: boolean }> => {
  const res = await apiClient.post(`/farms/partner-request/${targetUserId}`);
  return res.data;
};

// ============================================================================
// ORDERS & ENGINE 3 ESCROW API
// ============================================================================
export const checkoutOrderApi = async (data: {
  items: Array<{ yieldId: string; quantity: number }>;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPhone: string;
  deliveryNotes?: string;
  paymentMethod: PaymentMethod | string;
  currency?: string;
}): Promise<{ message: string; order: Order; campayPrompt?: any }> => {
  const res = await apiClient.post('/orders/checkout', data);
  return res.data;
};

export const fetchMyOrdersApi = async (): Promise<Order[]> => {
  try {
    const res = await apiClient.get('/orders/my-orders');
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
};

export const fetchOrderByIdApi = async (orderId: string): Promise<Order> => {
  const res = await apiClient.get(`/orders/${orderId}`);
  return res.data;
};

export const confirmReceiptApi = async (orderId: string): Promise<{ success: boolean; message: string }> => {
  const res = await apiClient.post(`/orders/${orderId}/confirm-receipt`);
  return res.data;
};

// ============================================================================
// FINTECH, ENGINE 1 CREDIT SCORING, AGROVESTOR & AGROPATRON API
// ============================================================================
export const fetchFarmerCreditScoreApi = async (): Promise<any> => {
  try {
    const res = await apiClient.get('/fintech/credit-score');
    return res.data;
  } catch {
    return {
      creditScore: 748,
      ficoScore: 748,
      creditTier: 'GOLD',
      tier: 'GOLD',
      rating: 4.9,
      totalRatings: 42,
      completedOrders: 38,
      maxLoanLimitXaf: 2500000,
      maxLoanLimitUsd: 4100,
      autoEscrowDeductionRate: 15,
      normalizedRadar: {
        salesFulfillment: 0.92,
        listingFrequency: 0.85,
        reviewBayesian: 0.94,
        deliveryReliability: 0.91,
        networkReach: 0.78,
        engagementVelocity: 0.82,
        repaymentIntegrity: 0.96,
        kycCompliance: 1.0,
      },
      roadmapToNextTier: {
        nextTier: 'PLATINUM',
        pointsNeeded: 52,
        recommendations: [
          {
            metricKey: 'networkReach',
            metricLabel: 'AgroPatron & Partner Network Reach',
            currentScore: 78,
            targetScore: 90,
            advice: 'Grow your active AgroPatron subscribers and B2B Buyam-Sellam repeat contracts.',
          },
          {
            metricKey: 'listingFrequency',
            metricLabel: 'Weekly Harvest Story Consistency',
            currentScore: 85,
            targetScore: 95,
            advice: 'Post at least 3 verified AgroFeed harvest videos per week linked to live yields.',
          },
        ],
      },
    };
  }
};

export const fetchLoanProductsApi = async (): Promise<LoanProduct[]> => {
  try {
    const res = await apiClient.get('/fintech/products');
    if (Array.isArray(res.data) && res.data.length > 0) return res.data;
  } catch {
    // use fallback
  }
  return [
    {
      id: 'loan-seed-1',
      title: 'Certified Highland Seed & Input Micro-Credit',
      description: 'Seasonal working capital for certified seeds, organic compost, and drip irrigation kits. Auto-repaid via 15% Smart Escrow harvest deduction.',
      minAmount: 50000,
      maxAmount: 750000,
      interestRatePercent: 4.5,
      durationMonths: 4,
      requiredCreditTier: 'BRONZE',
      institution: { name: 'Agrom Microfinance & CCA Bank Partner', type: 'Microfinance' },
    },
    {
      id: 'loan-equip-2',
      title: 'Solar Cold-Crate & Post-Harvest Equipment Facility',
      description: 'Medium-term asset financing for solar cooling crates, motorized tricycles, and grading equipment.',
      minAmount: 250000,
      maxAmount: 3500000,
      interestRatePercent: 3.8,
      durationMonths: 9,
      requiredCreditTier: 'GOLD',
      institution: { name: 'CEMAC Agri-Development Fund', type: 'Development Bank' },
    },
  ];
};

export const fetchMyLoanApplicationsApi = async (): Promise<LoanApplication[]> => {
  try {
    const res = await apiClient.get('/fintech/my-loans');
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
};

export const applyForLoanApi = async (data: {
  productId: string;
  purpose: string;
  requestedAmount: number;
  durationMonths: number;
}): Promise<{ message: string; application: LoanApplication }> => {
  const res = await apiClient.post('/fintech/apply', data);
  return res.data;
};

export const fetchAgroVestorCampaignsApi = async (): Promise<AgroVestorCampaign[]> => {
  try {
    const res = await apiClient.get('/fintech/campaigns');
    if (Array.isArray(res.data) && res.data.length > 0) return res.data;
  } catch {
    // fallback
  }
  return [
    {
      id: 'camp-1',
      farmerId: 'farmer-1',
      farmerName: 'Ibrahim Njoya',
      farmName: 'Foumbot Volcanic Highland Farm',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      region: 'Foumbot • West Region',
      cropType: 'Roma Tomatoes (4 Hectares Expansion)',
      title: 'Dry-Season Drip-Irrigated Tomato Harvest Cycle',
      description: 'Expanding our drip-irrigated volcanic parcel by 4 hectares for peak dry-season supply to Douala supermarkets.',
      targetAmount: 1500000,
      fundedAmount: 1125000,
      minPledge: 25000,
      expectedRoiPercent: 14.5,
      durationMonths: 4,
      creditScore: 765,
      creditTier: 'GOLD',
      riskLevel: 'LOW',
      backersCount: 19,
      escrowSecured: true,
      status: 'ACTIVE',
    },
    {
      id: 'camp-2',
      farmerId: 'farmer-2',
      farmerName: 'Mama Grace Bih',
      farmName: 'Santa Mist Valley Estates',
      avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=80',
      region: 'Santa • North-West',
      cropType: 'Highland Dosa Potatoes',
      title: 'Certified Seed Potato Multiplication & Storage',
      description: 'Scaling our ventilated seed potato storage barn to supply 400+ bags to regional wholesale buyers.',
      targetAmount: 2400000,
      fundedAmount: 1980000,
      minPledge: 50000,
      expectedRoiPercent: 16.0,
      durationMonths: 5,
      creditScore: 812,
      creditTier: 'PLATINUM',
      riskLevel: 'LOW',
      backersCount: 31,
      escrowSecured: true,
      status: 'ACTIVE',
    },
  ];
};

export const pledgeAgroVestorInvestmentApi = async (data: {
  campaignId: string;
  amount: number;
  paymentMethod?: string;
  currency?: string;
}): Promise<any> => {
  const res = await apiClient.post('/fintech/invest', data);
  return res.data;
};

export const patronizeFarmApi = async (data: {
  farmerId: string;
  plan?: 'MONTHLY' | 'SEASONAL';
  paymentMethod?: string;
  currency?: string;
  phoneNumber?: string;
  amount?: number;
}): Promise<{ message: string; subscription: AgroPatronSubscription }> => {
  const res = await apiClient.post('/fintech/patronize', data);
  return res.data;
};

export const fetchMyPatronagesApi = async (): Promise<AgroPatronSubscription[]> => {
  try {
    const res = await apiClient.get('/fintech/my-patronages');
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
};

export const fetchMyAgroVestmentsApi = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get('/fintech/my-investments');
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
};

// ============================================================================
// CHAT / AGROINBOX API
// ============================================================================
export const fetchUserConversationsApi = async (): Promise<Conversation[]> => {
  try {
    const res = await apiClient.get('/chat/conversations');
    if (Array.isArray(res.data) && res.data.length > 0) return res.data;
  } catch {
    // fallback
  }
  return [
    {
      id: 'conv-demo-1',
      participantId: 'farmer-1',
      participantName: 'Ibrahim Njoya (Foumbot Farm)',
      participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      participantRole: 'FARMER',
      isVerified: true,
      creditTier: 'GOLD',
      lastMessage: 'Yes! All 10 crates are sorted Grade-A and ready for morning loading.',
      lastMessageTime: '10:42 AM',
      unreadCount: 1,
    },
    {
      id: 'conv-demo-2',
      participantId: 'farmer-2',
      participantName: 'Mama Grace Bih (Santa Highland)',
      participantAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=80',
      participantRole: 'FARMER',
      isVerified: true,
      creditTier: 'PLATINUM',
      lastMessage: 'AgroPatron 8% wholesale discount applied to your 50kg potato bags.',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
    },
  ];
};

export const fetchConversationMessagesApi = async (conversationId: string): Promise<Message[]> => {
  try {
    const res = await apiClient.get(`/chat/${conversationId}/messages`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((m: any) => ({
        ...m,
        timestamp: m.createdAt
          ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now',
      }));
    }
  } catch {
    // fallback
  }
  return [
    {
      id: 'm-1',
      conversationId,
      senderId: 'farmer-1',
      receiverId: 'me',
      content: 'Welcome to Foumbot Volcanic Highland Farm! How many crates or bags are you looking to reserve today?',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      timestamp: '10:30 AM',
    },
    {
      id: 'm-2',
      conversationId,
      senderId: 'farmer-1',
      receiverId: 'me',
      content: 'Yes! All 10 crates are sorted Grade-A and ready for morning loading via Engine 3 Smart Escrow.',
      isRead: true,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      timestamp: '10:42 AM',
    },
  ];
};

export const sendMessageApi = async (
  receiverId: string,
  content: string
): Promise<{ conversation: any; message: Message }> => {
  const res = await apiClient.post('/chat/messages', { receiverId, content });
  return {
    conversation: res.data.conversation,
    message: {
      ...res.data.message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  };
};

// ============================================================================
// ADMIN API
// ============================================================================
export const fetchAdminStatsApi = async (): Promise<any> => {
  try {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  } catch {
    return {
      users: 1284,
      farmers: 342,
      verifiedFarmers: 289,
      orders: 916,
      yields: 640,
      farms: 378,
      disputes: 2,
      gmv: 48650000,
      loans: 74,
      featureFlags: {
        engine1_tabi_credit_scoring: true,
        engine2_agrofeed_ranking: true,
        engine3_smart_escrow_fsm: true,
        engine4_social_graph_patronage: true,
        engine5_realtime_telemetry: true,
      },
    };
  }
};

