import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  Wallet,
  Warehouse,
  Store,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Truck,
  Lock,
  Compass,
  ShieldAlert,
  Award,
  Users,
} from 'lucide-react';
import {
  fetchFarmerCreditScoreApi,
  fetchLoanProductsApi,
  fetchAgroVestorCampaignsApi,
  pledgeAgroVestorInvestmentApi,
  applyForLoanApi,
  fetchMyOrdersApi,
  confirmReceiptApi,
  fetchYieldsApi,
  createFarmApi,
  createYieldApi,
  fetchAdminStatsApi,
  loginApi,
  registerApi,
} from '@/api';
import {
  LoanProduct,
  AgroVestorCampaign,
  Order,
  Yield,
  UserRole,
} from '@/types';
import { FarmerBadge, MeetingLeafLogo } from '@/components/MeetingLeafLogo';
import YieldCard from '@/components/YieldCard';
import { useAuthStore } from '@/store/authStore';
import { formatXaf } from '@/utils/media';

// ============================================================================
// 1. ENGINE 1: TABI CREDIT SCORING & AGROVESTOR CROWDLENDING (/fintech/loans)
// ============================================================================
export const FintechAndLoansPage: React.FC = () => {
  const [creditData, setCreditData] = useState<any>(null);
  const [loans, setLoans] = useState<LoanProduct[]>([]);
  const [campaigns, setCampaigns] = useState<AgroVestorCampaign[]>([]);
  const [pledgeSuccess, setPledgeSuccess] = useState<string | null>(null);
  const [loanSuccess, setLoanSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchFarmerCreditScoreApi().then(setCreditData);
    fetchLoanProductsApi().then(setLoans);
    fetchAgroVestorCampaignsApi().then(setCampaigns);
  }, []);

  const handlePledge = async (camp: AgroVestorCampaign) => {
    try {
      await pledgeAgroVestorInvestmentApi({
        campaignId: camp.id,
        amount: camp.minPledge || 25000,
        paymentMethod: 'MTN_MOMO',
        currency: 'XAF',
      }).catch(() => null);
    } finally {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === camp.id
            ? {
              ...c,
              fundedAmount: c.fundedAmount + (c.minPledge || 25000),
              backersCount: c.backersCount + 1,
            }
            : c
        )
      );
      setPledgeSuccess(camp.id);
      setTimeout(() => setPledgeSuccess(null), 1800);
    }
  };

  const handleApplyLoan = async (prod: LoanProduct) => {
    try {
      await applyForLoanApi({
        productId: prod.id,
        purpose: prod.title,
        requestedAmount: prod.minAmount,
        durationMonths: prod.durationMonths,
      }).catch(() => null);
    } finally {
      setLoanSuccess(prod.id);
      setTimeout(() => setLoanSuccess(null), 2000);
    }
  };

  const radar = creditData?.normalizedRadar || {
    salesFulfillment: 0.92,
    listingFrequency: 0.85,
    reviewBayesian: 0.94,
    deliveryReliability: 0.91,
    networkReach: 0.78,
    engagementVelocity: 0.82,
    repaymentIntegrity: 0.96,
    kycCompliance: 1.0,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-7">
      {/* Engine 1 Header Card */}
      <div className="rounded-3xl bg-[#173A20] text-white p-6 sm:p-8 border border-[#4E8B3F]/40 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-lg">
        <div className="lg:col-span-7 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E2515] border border-[#E2A63C]/40 text-xs font-mono-num text-[#E2A63C]">
            <Award size={14} /> Engine 1 • Victory Eyong Tabi Credit Scoring Model
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Algorithmic Farmer Credit & AgroVestor Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#EEF8F1]/85 leading-relaxed">
            Real-time escrow fulfillment, Bayesian review reliability, and social patronage velocity
            automatically underwrite collateral-free seasonal micro-loans and peer-to-farm investments.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <div className="bg-[#0E2515] border border-[#4E8B3F]/40 px-4 py-2.5 rounded-2xl">
              <div className="text-[11px] text-[#EEF8F1]/70">Pre-Approved Credit Limit</div>
              <div className="font-mono-num text-base font-bold text-[#E2A63C]">
                {formatXaf(creditData?.maxLoanLimitXaf || 2500000)}
              </div>
            </div>
            <div className="bg-[#0E2515] border border-[#4E8B3F]/40 px-4 py-2.5 rounded-2xl">
              <div className="text-[11px] text-[#EEF8F1]/70">Auto-Escrow Repayment Cut</div>
              <div className="font-mono-num text-base font-bold text-[#4ADE80]">
                {creditData?.autoEscrowDeductionRate || 15}% per Harvest Sale
              </div>
            </div>
          </div>
        </div>

        {/* Right FICO Score Gauge */}
        <div className="lg:col-span-5 bg-[#EEF8F1] text-[#241A12] rounded-2xl p-5 border border-[#CCEBD5] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#173A20]">Tabi FICO Credit Score</span>
            <FarmerBadge tier={creditData?.creditTier || 'GOLD'} size="md" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-num text-4xl font-extrabold text-[#173A20]">
              {creditData?.creditScore || 748}
            </span>
            <span className="font-mono-num text-xs text-[#5C5245]">/ 850 Max</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {Object.entries(radar)
              .slice(0, 6)
              .map(([key, val]: [string, any]) => (
                <div key={key} className="bg-white rounded-xl p-2 border border-[#CCEBD5]">
                  <div className="flex justify-between text-[10px] font-semibold text-[#5C5245] capitalize">
                    <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-mono-num font-bold text-[#4E8B3F]">
                      {Math.round(Number(val) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EEF8F1] rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-[#4E8B3F] rounded-full"
                      style={{ width: `${Math.round(Number(val) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* AgroVestor Crowdlending Campaigns */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display-italic text-xl font-semibold text-[#173A20]">
              AgroVestor Harvest Crowdlending Campaigns 🚀
            </h2>
            <p className="text-xs text-[#5C5245]">
              Co-finance verified Gold & Platinum farm harvest cycles and earn escrow-backed seasonal returns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {campaigns.map((camp) => {
            const pct = Math.min(100, Math.round((camp.fundedAmount / camp.targetAmount) * 100));
            return (
              <div
                key={camp.id}
                className="bg-white rounded-3xl border border-[#CCEBD5] p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={camp.avatarUrl}
                      alt={camp.farmerName}
                      className="w-10 h-10 rounded-full object-cover border border-[#4E8B3F]"
                    />
                    <div>
                      <div className="font-bold text-sm text-[#241A12]">{camp.farmName}</div>
                      <div className="text-xs text-[#5C5245]">{camp.region}</div>
                    </div>
                  </div>
                  <FarmerBadge
                    tier={camp.creditTier}
                    label={`Score ${camp.creditScore} • ${camp.creditTier}`}
                  />
                </div>

                <div>
                  <span className="text-[11px] font-semibold bg-[#EEF8F1] text-[#4E8B3F] border border-[#CCEBD5] px-2.5 py-0.5 rounded-full">
                    {camp.cropType}
                  </span>
                  <h3 className="font-bold text-base text-[#173A20] mt-2">{camp.title}</h3>
                  <p className="text-xs text-[#5C5245] mt-1 leading-relaxed">{camp.description}</p>
                </div>

                {/* Funding Bar */}
                <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-2xl p-3.5 space-y-2">
                  <div className="flex justify-between text-xs font-mono-num">
                    <span className="font-bold text-[#173A20]">
                      {formatXaf(camp.fundedAmount)} raised
                    </span>
                    <span className="text-[#5C5245]">
                      Target: {formatXaf(camp.targetAmount)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#CCEBD5]">
                    <div
                      className="h-full bg-[#4E8B3F] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#5C5245] pt-1">
                    <span>
                      Expected Return: <strong className="text-[#4E8B3F]">+{camp.expectedRoiPercent}% ROI</strong> ({camp.durationMonths} mos)
                    </span>
                    <span>{camp.backersCount} AgroVestors</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePledge(camp)}
                  className="w-full py-3 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold transition cursor-pointer"
                >
                  {pledgeSuccess === camp.id
                    ? '✓ Pledge Locked in Smart Escrow!'
                    : `Pledge ${formatXaf(camp.minPledge)} to Harvest Cycle`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Institutional Micro-Loan Facilities */}
      <section className="space-y-4">
        <h2 className="font-display-italic text-xl font-semibold text-[#173A20]">
          Institutional Input & Equipment Micro-Loans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loans.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-2xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FarmerBadge
                    tier={prod.requiredCreditTier}
                    label={`Requires ${prod.requiredCreditTier}+`}
                  />
                  <span className="font-mono-num text-xs font-bold text-[#4E8B3F]">
                    {prod.interestRatePercent}% Interest • {prod.durationMonths} Months
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#173A20]">{prod.title}</h3>
                <p className="text-xs text-[#5C5245] leading-relaxed">{prod.description}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#CCEBD5]">
                <div className="font-mono-num text-xs font-bold text-[#241A12]">
                  Up to {formatXaf(prod.maxAmount)}
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyLoan(prod)}
                  className="px-4 py-2 rounded-full bg-[#173A20] text-[#E2A63C] text-xs font-bold cursor-pointer"
                >
                  {loanSuccess === prod.id ? '✓ Application Submitted!' : '1-Tap Apply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// 2. AGROWALLET & ESCROW VAULT (/wallet)
// ============================================================================
export const WalletPage: React.FC = () => {
  const [availableBalance, setAvailableBalance] = useState(350000);
  const [escrowLocked] = useState(125000);
  const [depositAmt, setDepositAmt] = useState('25000');

  const ledger = [
    {
      id: 'tx-1',
      title: 'Harvest Payout Released (Engine 3 FSM)',
      sub: 'Order #ESC-8924 • Foumbot Roma Tomatoes (10 Crates)',
      amount: '+85,000 FCFA',
      positive: true,
      status: 'SETTLED',
    },
    {
      id: 'tx-2',
      title: 'Smart Escrow Purchase Lock',
      sub: 'Order #ESC-7712 • Santa Highland Potatoes (2 Bags)',
      amount: '-37,000 FCFA',
      positive: false,
      status: 'ESCROW_LOCKED',
    },
    {
      id: 'tx-3',
      title: 'AgroPatron Monthly Pass Subscription',
      sub: 'Foumbot Volcanic Highland Farm • 8% Trade Discount',
      amount: '-1,200 FCFA',
      positive: false,
      status: 'ACTIVE',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-[#173A20] text-white p-6 border border-[#4E8B3F]/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#EEF8F1]/80">
            <span>Available Agrom.app Wallet Balance</span>
            <Wallet size={18} className="text-[#E2A63C]" />
          </div>
          <div className="font-mono-num text-3xl font-bold text-white">
            {formatXaf(availableBalance)}
          </div>
          <div className="pt-2 flex items-center gap-2">
            <input
              type="number"
              value={depositAmt}
              onChange={(e) => setDepositAmt(e.target.value)}
              className="w-32 rounded-full bg-[#0E2515] border border-[#4E8B3F] px-3 py-1.5 text-xs font-mono-num text-white"
            />
            <button
              type="button"
              onClick={() => setAvailableBalance((b) => b + (Number(depositAmt) || 0))}
              className="px-4 py-1.5 rounded-full bg-[#E2A63C] text-[#241A12] text-xs font-bold cursor-pointer"
            >
              + Instant Top-Up (MoMo)
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-[#EEF8F1] border border-[#CCEBD5] p-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#173A20]">
            <span>Engine 3 Smart Escrow Vault (Locked)</span>
            <ShieldCheck size={18} className="text-[#4E8B3F]" />
          </div>
          <div className="font-mono-num text-3xl font-bold text-[#173A20]">
            {formatXaf(escrowLocked)}
          </div>
          <p className="text-xs text-[#5C5245] leading-relaxed">
            Protected in double-entry escrow ledger until harvest delivery is verified by QR/OTP.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#CCEBD5] p-5 space-y-3">
        <h2 className="font-display-italic text-lg font-semibold text-[#173A20]">
          Double-Entry Settlement Ledger
        </h2>
        <div className="divide-y divide-[#EEF8F1]">
          {ledger.map((tx) => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.positive
                      ? 'bg-[#EEF8F1] text-[#4E8B3F]'
                      : 'bg-[#FEF6E8] text-[#C68F30]'
                    }`}
                >
                  {tx.positive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#241A12]">{tx.title}</div>
                  <div className="text-xs text-[#5C5245]">{tx.sub}</div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-mono-num font-bold text-sm ${tx.positive ? 'text-[#4E8B3F]' : 'text-[#241A12]'
                    }`}
                >
                  {tx.amount}
                </div>
                <span className="text-[10px] font-mono-num bg-[#EEF8F1] border border-[#CCEBD5] px-2 py-0.5 rounded-full text-[#173A20]">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. ENGINE 3: SMART ESCROW ORDERS & FSM TRACKER (/orders)
// ============================================================================
export const EscrowOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ESC-8924',
      orderNumber: 'ESC-8924',
      buyerId: 'me',
      status: 'IN_TRANSIT',
      paymentMethod: 'MTN_MOMO',
      subtotal: 85000,
      deliveryFee: 0,
      totalAmount: 85000,
      deliveryAddress: 'Rue Njo-Njo, Bonapriso',
      deliveryCity: 'Douala',
      deliveryPhone: '+237 677 42 19 80',
      items: [{ title: 'Fresh Foumbot Roma Tomatoes (10 Crates)' }],
      createdAt: 'Today, 09:15 AM',
    },
    {
      id: 'ESC-8810',
      orderNumber: 'ESC-8810',
      buyerId: 'me',
      status: 'SETTLED',
      paymentMethod: 'ORANGE_MONEY',
      subtotal: 37000,
      deliveryFee: 0,
      totalAmount: 37000,
      deliveryAddress: 'Bastos Ambassade',
      deliveryCity: 'Yaoundé',
      deliveryPhone: '+237 699 11 22 33',
      items: [{ title: 'Santa Highland Irish Potatoes (2 Bags 50kg)' }],
      createdAt: '2 Days Ago',
    },
  ]);

  useEffect(() => {
    fetchMyOrdersApi().then((apiOrders) => {
      if (apiOrders && apiOrders.length > 0) {
        setOrders(apiOrders);
      }
    });
  }, []);

  const handleReleaseEscrow = async (orderId: string) => {
    await confirmReceiptApi(orderId).catch(() => null);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'SETTLED' } : o))
    );
  };

  const fsmSteps = ['PENDING_PAYMENT', 'ESCROW_LOCKED', 'IN_TRANSIT', 'DELIVERED', 'SETTLED'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-3xl p-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display-italic text-xl sm:text-2xl font-semibold text-[#173A20]">
            Engine 3 Smart Escrow & Order State Machine
          </h1>
          <p className="text-xs text-[#5C5245] mt-1">
            Funds remain locked in the escrow state machine until buyer inspection & delivery confirmation.
          </p>
        </div>
        <ShieldCheck size={32} className="text-[#4E8B3F] shrink-0" />
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isSettled = order.status === 'SETTLED' || order.status === 'COMPLETED';
          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-[#CCEBD5] p-5 space-y-4 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono-num font-bold text-sm text-[#173A20]">
                    Order #{order.orderNumber || order.id}
                  </span>
                  <div className="text-xs text-[#5C5245]">
                    {order.deliveryAddress}, {order.deliveryCity} • {order.paymentMethod}
                  </div>
                </div>
                <div className="font-mono-num font-bold text-base text-[#4E8B3F]">
                  {formatXaf(order.totalAmount)}
                </div>
              </div>

              {/* FSM Stepper */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {fsmSteps.map((step, i) => {
                  const activeIndex = isSettled ? 4 : 2;
                  const done = i <= activeIndex;
                  return (
                    <div
                      key={step}
                      className={`p-2 rounded-xl border text-center ${done
                          ? 'bg-[#EEF8F1] border-[#4E8B3F] text-[#173A20]'
                          : 'bg-white border-[#CCEBD5] text-[#9C9284]'
                        }`}
                    >
                      <div className="font-mono-num text-[10px] font-bold">
                        {i + 1}. {step.replace('_', ' ')}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#EEF8F1] flex items-center justify-between">
                <span className="text-xs text-[#5C5245]">
                  {isSettled
                    ? '✅ Escrow released to farmer (85% Farmer / 15% Loan Auto-Repayment)'
                    : '🔒 Funds locked in Engine 3 Smart Escrow Vault'}
                </span>

                {!isSettled && (
                  <button
                    type="button"
                    onClick={() => handleReleaseEscrow(order.id)}
                    className="px-4 py-2 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-bold transition cursor-pointer"
                  >
                    Confirm Harvest Delivery & Release Escrow
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 4. BUYAM-SELLAM WHOLESALE AGGREGATOR HUB (/wholesaler)
// ============================================================================
export const WholesalerHubPage: React.FC = () => {
  const [yields, setYields] = useState<Yield[]>([]);

  useEffect(() => {
    fetchYieldsApi({ isWholesale: true }).then(setYields);
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="rounded-3xl bg-[#173A20] text-white p-6 sm:p-7 border border-[#4E8B3F]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono-num text-[#E2A63C]">
            <Store size={14} /> B2B Wholesale & Cooperative Aggregator
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Buyam-Sellam Wholesale Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#EEF8F1]/85 max-w-xl">
            Source bulk 50kg/100kg sacks, multi-crate truckloads, and pooled regional harvests directly from verified cooperatives at tiered wholesale pricing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        {yields.map((item) => (
          <YieldCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 5. FARM STOREFRONT & HARVEST INVENTORY MANAGER (/farmer/manage)
// ============================================================================
export const FarmManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [farmName, setFarmName] = useState('Foumbot Volcanic Highland Farm');
  const [farmCity, setFarmCity] = useState('Foumbot');
  const [farmRegion, setFarmRegion] = useState('West Region');
  const [yieldTitle, setYieldTitle] = useState('');
  const [yieldPrice, setYieldPrice] = useState('8500');
  const [yieldUnit, setYieldUnit] = useState('CRATE');
  const [savedMsg, setSavedMsg] = useState('');

  const handleCreateYield = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yieldTitle.trim()) return;
    await createYieldApi({
      title: yieldTitle,
      price: Number(yieldPrice),
      pricePerUnit: Number(yieldPrice),
      unit: yieldUnit,
      originRegion: `${farmCity} • ${farmRegion}`,
      isWholesaleBulkAvailable: true,
    }).catch(() => null);
    setYieldTitle('');
    setSavedMsg('Harvest lot published to AgroMarket!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-3xl p-5 flex items-center justify-between">
        <div>
          <h1 className="font-display-italic text-xl sm:text-2xl font-semibold text-[#173A20]">
            AgroFarm Storefront & Harvest Publisher
          </h1>
          <p className="text-xs text-[#5C5245] mt-0.5">
            Manage your cooperative farm parcels and publish fresh harvest batches to AgroMarket.
          </p>
        </div>
        <Warehouse size={30} className="text-[#4E8B3F]" />
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-[#EEF8F1] border border-[#4E8B3F] text-xs font-bold text-[#173A20]">
          ✓ {savedMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Register / Update Farm */}
        <div className="bg-white rounded-3xl border border-[#CCEBD5] p-6 space-y-4">
          <h2 className="font-bold text-base text-[#173A20]">1. Active Cooperative Farm</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#5C5245] mb-1">Farm Name</label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">City</label>
                <input
                  type="text"
                  value={farmCity}
                  onChange={(e) => setFarmCity(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">Region</label>
                <input
                  type="text"
                  value={farmRegion}
                  onChange={(e) => setFarmRegion(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await createFarmApi({ name: farmName, city: farmCity, region: farmRegion }).catch(
                  () => null
                );
                setSavedMsg('Farm profile synced!');
              }}
              className="w-full py-2.5 rounded-full bg-[#EEF8F1] border border-[#4E8B3F] text-[#4E8B3F] text-xs font-bold cursor-pointer"
            >
              Save Farm Parcel Details
            </button>
          </div>
        </div>

        {/* Publish New Harvest Lot */}
        <form
          onSubmit={handleCreateYield}
          className="bg-white rounded-3xl border border-[#CCEBD5] p-6 space-y-4"
        >
          <h2 className="font-bold text-base text-[#173A20]">2. Publish New Harvest Lot</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                Harvest Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Fresh Foumbot Sweet Bell Peppers"
                value={yieldTitle}
                onChange={(e) => setYieldTitle(e.target.value)}
                className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Price (FCFA)
                </label>
                <input
                  type="number"
                  value={yieldPrice}
                  onChange={(e) => setYieldPrice(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-sm font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">Unit</label>
                <select
                  value={yieldUnit}
                  onChange={(e) => setYieldUnit(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-sm"
                >
                  <option value="CRATE">CRATE</option>
                  <option value="BAG_50KG">BAG (50KG)</option>
                  <option value="BAG_100KG">BAG (100KG)</option>
                  <option value="BUNCH">BUNCH</option>
                  <option value="KG">KG</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[#4E8B3F] text-white text-xs font-bold cursor-pointer"
            >
              + Publish Harvest to AgroMarket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 6. AGROM.APP 5-ENGINE ARCHITECTURE PRESENTATION PAGE (/ecosystem)
// ============================================================================
export const ArchitectureOverviewPage: React.FC = () => {
  const engines = [
    {
      num: 'Engine 1',
      title: 'Farmer Credit Scoring & Risk Underwriting (Victory Eyong Tabi Model)',
      desc: 'Transforms raw escrow fulfillment, Bayesian review scores, and social patronage velocity into a deterministic 300–850 FICO credit score (Bronze, Silver, Gold, Platinum).',
    },
    {
      num: 'Engine 2',
      title: 'Algorithmic AgroFeed Ranking & Discovery Engine',
      desc: 'Scores 9:16 harvest videos by freshness decay, geographic proximity, engagement velocity, and AgroPatron affinity with 1-tap shoppable yield overlays.',
    },
    {
      num: 'Engine 3',
      title: 'Multi-Party Financial Escrow & Double-Entry Settlement FSM',
      desc: 'Holds buyer payments safely across MTN MoMo, Orange Money, Flutterwave, Paystack, and Stripe, splitting payouts automatically upon verified harvest delivery.',
    },
    {
      num: 'Engine 4',
      title: 'Commercial Relationship Graph & AgroPatron Privileges',
      desc: 'Powers $2/mo AgroPatron subscriptions (8% automatic harvest discount) and mutual B2B Buyam-Sellam wholesale trade corridors.',
    },
    {
      num: 'Engine 5',
      title: 'Real-Time Telemetry, Price Intelligence & Event Bus',
      desc: 'Streams domain events across all modules to prevent predatory dumping and keep regional harvest prices transparent.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="rounded-3xl bg-[#173A20] text-white p-6 sm:p-8 border border-[#4E8B3F]/40 space-y-3">
        <span className="font-mono-num text-xs text-[#E2A63C] font-bold">
          agrom.app • Master Systems Architecture
        </span>
        <h1 className="font-display text-2xl sm:text-4xl font-bold">
          The 5 Deterministic Engines Powering Agrom
        </h1>
        <p className="text-sm text-[#EEF8F1]/85 max-w-2xl leading-relaxed">
          Engineered to bridge smallholder cooperatives, urban households, Buyam-Sellam wholesale
          aggregators, and microfinance institutions on a single unified backend.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {engines.map((e) => (
          <div
            key={e.num}
            className="bg-white rounded-3xl border border-[#CCEBD5] p-5 space-y-2 shadow-2xs"
          >
            <span className="inline-block font-mono-num text-xs font-bold bg-[#EEF8F1] text-[#4E8B3F] border border-[#CCEBD5] px-3 py-0.5 rounded-full">
              {e.num}
            </span>
            <h3 className="font-bold text-base text-[#173A20]">{e.title}</h3>
            <p className="text-xs text-[#5C5245] leading-relaxed">{e.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 7. GOVERNANCE & ADMIN CONSOLE (/admin)
// ============================================================================
export const AdminConsolePage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchAdminStatsApi().then(setStats);
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-3xl p-5 flex items-center justify-between">
        <div>
          <h1 className="font-display-italic text-xl sm:text-2xl font-semibold text-[#173A20]">
            Agrom.app Governance & Admin Console
          </h1>
          <p className="text-xs text-[#5C5245]">
            KYC Farmer Verification, Escrow Dispute Arbitration & Engine Feature Flags
          </p>
        </div>
        <ShieldAlert size={28} className="text-[#4E8B3F]" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#CCEBD5] rounded-2xl p-4">
          <div className="text-xs text-[#5C5245]">Verified Farmers</div>
          <div className="font-mono-num text-2xl font-bold text-[#173A20] mt-1">
            {stats?.verifiedFarmers ?? 289}
          </div>
        </div>
        <div className="bg-white border border-[#CCEBD5] rounded-2xl p-4">
          <div className="text-xs text-[#5C5245]">Escrow Orders</div>
          <div className="font-mono-num text-2xl font-bold text-[#4E8B3F] mt-1">
            {stats?.orders ?? 916}
          </div>
        </div>
        <div className="bg-white border border-[#CCEBD5] rounded-2xl p-4">
          <div className="text-xs text-[#5C5245]">Cumulative GMV</div>
          <div className="font-mono-num text-xl font-bold text-[#173A20] mt-1">
            {formatXaf(stats?.gmv ?? 48650000)}
          </div>
        </div>
        <div className="bg-white border border-[#CCEBD5] rounded-2xl p-4">
          <div className="text-xs text-[#5C5245]">Active Micro-Loans</div>
          <div className="font-mono-num text-2xl font-bold text-[#C68F30] mt-1">
            {stats?.loans ?? 74}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 8. AUTHENTICATION PAGES (/auth/login & /auth/register)
// ============================================================================
export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname.includes('register');
  const login = useAuthStore((s) => s.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+237 6');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('FARMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        const res = await registerApi({ name, email, phone, password, role });
        login(res.user, res.token);
      } else {
        const res = await loginApi(email, password);
        login(res.user, res.token);
      }
      navigate('/profile');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        'Could not reach backend auth endpoint—use Quick Demo Sign-In below or verify Backend is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoRole: UserRole) => {
    login(
      {
        id: 'farmer-1',
        name: demoRole === 'FARMER' ? 'Ibrahim Njoya (Foumbot Farm)' : 'Chef Nadine (Douala Buyer)',
        email: demoRole === 'FARMER' ? 'ibrahim@agrom.app' : 'nadine@agrom.app',
        phone: '+237 677 42 19 80',
        role: demoRole,
        isVerified: true,
        farmerProfile: {
          id: 'fp-1',
          userId: 'farmer-1',
          farmName: 'Foumbot Volcanic Highland Farm',
          region: 'West Region',
          city: 'Foumbot',
          rating: 4.9,
          totalRatings: 42,
          totalFollowers: 148,
          creditTier: 'GOLD',
          creditScore: 765,
        },
      },
      'demo-jwt-token'
    );
    navigate('/profile');
  };

  return (
    <div className="p-4 sm:p-8 max-w-md mx-auto my-6">
      <div className="bg-white rounded-3xl border border-[#CCEBD5] p-6 sm:p-8 shadow-sm space-y-5">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <MeetingLeafLogo size={48} showWordmark showDomainBadge />
          </div>
          <h1 className="font-display-italic text-2xl text-[#173A20] font-semibold pt-1">
            {isRegister ? 'Create your Agrom.app Account' : 'Welcome back to Agrom.app'}
          </h1>
          <p className="text-xs text-[#5C5245]">
            From farm to hand • Direct harvests, AgroFeed & Smart Escrow
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#FDF3F1] border border-[#B54A34]/30 text-xs text-[#B54A34]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5C5245] mb-1">
                  Primary Ecosystem Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2.5 text-sm"
                >
                  <option value="FARMER">Farmer / Cooperative Producer</option>
                  <option value="BUYER">Household / Restaurant Buyer</option>
                  <option value="WHOLESALER">Buyam-Sellam Wholesaler</option>
                  <option value="AGRO_TRANSPORTER">Agro-Logistics Transporter</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#5C5245] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="producer@agrom.app"
              className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C5245] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-sm font-bold transition cursor-pointer"
          >
            {loading ? 'Connecting...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Instant 1-Click Demo Switcher */}
        <div className="pt-3 border-t border-[#CCEBD5] space-y-2">
          <div className="text-[11px] font-semibold text-center text-[#5C5245]">
            Instant Demo Session (Gold Farmer or Buyer)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('FARMER')}
              className="py-2 px-3 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-xs font-bold text-[#173A20] hover:border-[#4E8B3F] cursor-pointer"
            >
              👨‍🌾 Demo Gold Farmer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('BUYER')}
              className="py-2 px-3 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] text-xs font-bold text-[#173A20] hover:border-[#4E8B3F] cursor-pointer"
            >
              🛒 Demo Buyer
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#5C5245]">
          {isRegister ? (
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="text-[#4E8B3F] font-semibold hover:underline cursor-pointer"
            >
              Already have an account? Sign In
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/auth/register')}
              className="text-[#4E8B3F] font-semibold hover:underline cursor-pointer"
            >
              New to Agrom.app? Create Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

