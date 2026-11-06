export type UserRole =
  | 'BUYER'
  | 'WHOLESALER'
  | 'FARMER'
  | 'AGRO_TRANSPORTER'
  | 'FINANCIAL_OFFICER'
  | 'ADMIN';

export type CreditTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export type ProduceUnit =
  | 'KG'
  | 'CRATE'
  | 'BAG_50KG'
  | 'BAG_100KG'
  | 'BUCKET'
  | 'BUNCH'
  | 'NET';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'ESCROW_LOCKED'
  | 'CONFIRMED_BY_FARMER'
  | 'IN_TRANSIT'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'SETTLED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'MTN_MOMO'
  | 'ORANGE_MONEY'
  | 'CASH_ON_DELIVERY'
  | 'BANK_TRANSFER'
  | 'STRIPE_CARD'
  | 'PAYSTACK'
  | 'FLUTTERWAVE';

export interface FarmerProfile {
  id: string;
  userId: string;
  farmName: string;
  region: string;
  division?: string;
  city: string;
  bio?: string;
  coverPhoto?: string;
  cooperativeName?: string;
  rating: number;
  totalRatings: number;
  totalFollowers: number;
  farmSizeHectares?: number;
  primaryCrops?: string[];
  creditTier: CreditTier;
  creditScore: number;
}

export type FarmCategory =
  | 'CROPS'
  | 'LIVESTOCK'
  | 'POULTRY'
  | 'AQUACULTURE'
  | 'GREENHOUSE'
  | 'MIXED'
  | 'HORTICULTURE';

export interface FarmParcel {
  id: string;
  name: string;
  region: string;
  city: string;
  division?: string;
  location?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  sizeHectares?: number;
  isHeadquarters?: boolean;
}

export interface Farm {
  id: string;
  userId: string;
  name: string;
  slug?: string;
  category: FarmCategory | string;
  description?: string;
  location: string;
  city: string;
  region: string;
  division?: string;
  sizeHectares?: number;
  isVerified?: boolean;
  coverPhoto?: string;
  avatarPhoto?: string;
  primaryProduce?: string[];
  certifications?: string[];
  rating?: number;
  totalRatings?: number;
  yieldsCount?: number;
  parcels?: FarmParcel[];
  createdAt?: string;
  user?: User;
  farmerProfile?: FarmerProfile;
  yields?: Yield[];
  posts?: Post[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  isFarmer?: boolean;
  isAdmin?: boolean;
  isVerified?: boolean;
  farms?: Farm[];
  stores?: any[];
  creditScore?: number | string;
  farmerProfile?: FarmerProfile;
  followersCount?: number;
  followingCount?: number;
  farmsCount?: number;
  storesCount?: number;
  postsCount?: number;
  agroVestorsCount?: number;
  _count?: {
    followers?: number;
    following?: number;
    farms?: number;
    stores?: number;
    posts?: number;
  };
}

export interface Category {
  id: string;
  name: string;
  frenchName?: string;
  icon?: string;
  imageUrl?: string;
  description?: string;
}

export interface Yield {
  id: string;
  farmerId: string;
  farmId?: string;
  farm?: Farm;
  farmerName?: string;
  categoryId?: string;
  title: string;
  frenchTitle?: string;
  description: string;
  originRegion?: string;
  pricePerUnit?: number;
  price: number;
  oldPrice?: number;
  unit: ProduceUnit | string;
  stockQuantity?: number;
  minOrderQuantity?: number;
  isWholesaleBulkAvailable?: boolean;
  bulkMinQuantity?: number;
  bulkPricePerUnit?: number;
  isOrganic?: boolean;
  available?: boolean;
  isMealCombo?: boolean;
  comboItems?: string[];
  storeId?: string;
  storeSiteId?: string;
  dispatchSiteName?: string;
  storeName?: string;
  sourceType?: 'FARM' | 'STORE' | 'COMBO';
  harvestDate?: string;
  mediaUrls?: string[];
  seasonality?: string;
  shelfLifeDays?: number;
  image: string;
  images?: string[];
  rating?: number;
  farmer?: any;
  category?: Category | string;
  createdAt?: string;
}

export type AgroYield = Yield;

export interface Post {
  id: string;
  farmerId?: string;
  farmId?: string;
  farm?: Farm;
  userId?: string;
  user?: User;
  content: string;
  mediaUrl?: string;
  media?: string;
  isVideo: boolean;
  linkedYieldId?: string;
  linkedYield?: Yield;
  likesCount?: number;
  likes?: number;
  commentsCount?: number;
  comments?: Array<{
    id: string;
    userId: string;
    userName?: string;
    content: string;
    createdAt: string;
  }>;
  farmerName?: string;
  farmerAvatar?: string;
  farmerCreditTier?: CreditTier;
  isPatron?: boolean;
  isPartner?: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  yieldId: string;
  quantity: number;
  yield: Yield;
}

export interface Order {
  id: string;
  orderNumber?: string;
  buyerId: string;
  status: OrderStatus | string;
  paymentMethod: PaymentMethod | string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  currency?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPhone: string;
  isEscrowReleased?: boolean;
  items: any[];
  createdAt: string;
}

export interface LoanProduct {
  id: string;
  title: string;
  frenchTitle?: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRatePercent: number;
  durationMonths: number;
  requiredCreditTier: CreditTier;
  institution?: {
    id?: string;
    name?: string;
    type?: string;
  } | string;
}

export interface LoanApplication {
  id: string;
  farmerId: string;
  productId: string;
  purpose: string;
  requestedAmount: number;
  approvedAmount?: number;
  interestRate: number;
  durationMonths: number;
  status: string;
  repaymentDeductionPct: number;
  product?: LoanProduct;
  institution?: string;
  createdAt: string;
}

export interface AgroVestorCampaign {
  id: string;
  farmerId: string;
  farmerName?: string;
  farmName?: string;
  avatarUrl?: string;
  region?: string;
  cropType: string;
  title: string;
  description: string;
  targetAmount: number;
  fundedAmount: number;
  minPledge: number;
  expectedRoiPercent: number;
  durationMonths: number;
  creditScore: number;
  creditTier: CreditTier;
  riskLevel?: 'LOW' | 'MODERATE' | 'ELEVATED';
  backersCount: number;
  escrowSecured?: boolean;
  status?: string;
  createdAt?: string;
}

export interface AgroPatronSubscription {
  id: string;
  userId: string;
  userName: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  plan: 'MONTHLY' | 'SEASONAL';
  amount: number;
  currency: string;
  paymentMethod: string;
  discountRatePercent: number;
  hasEarlyHarvestAccess: boolean;
  hasPrivateStoryAccess: boolean;
  subscribedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  timestamp?: string;
}

export interface AgroStore {
  id: string;
  userId: string;
  businessName: string;
  tradeLicenseNumber?: string;
  primaryMarketCity: string;
  buyingCapacityTons?: number;
  preferredCommodities?: string[];
  linkedFarmId?: string;
  linkedFarm?: Farm;
  storeBio?: string;
  avatarUrl?: string;
  rating?: number;
  totalOrders?: number;
  createdAt?: string;
}

export type WholesalerProfile = AgroStore;

export interface Conversation {
  id: string;
  participantId?: string;
  participantName?: string;
  participantAvatar?: string;
  participantRole?: UserRole;
  isVerified?: boolean;
  creditTier?: CreditTier;
  farmerId?: string;
  farmerName?: string;
  farmerAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  timestamp?: string;
  unreadCount?: number;
}

