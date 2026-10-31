import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import LandingMarketPage from './pages/LandingMarketPage';
import AgroFeedPage from './pages/AgroFeedPage';
import ProfilePage from './pages/ProfilePage';
import YieldDetailPage from './pages/YieldDetailPage';
import CartAndCheckoutPage from './pages/CartAndCheckoutPage';
import InboxPage from './pages/InboxPage';
import {
  FintechAndLoansPage,
  WalletPage,
  EscrowOrdersPage,
  WholesalerHubPage,
  FarmManagePage,
  ArchitectureOverviewPage,
  AdminConsolePage,
  AuthPage,
} from './pages/EcosystemAndFintechPages';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          {/* Hybrid Live Commerce Portal & AgroMarket Landing Hub */}
          <Route path="/" element={<LandingMarketPage />} />
          <Route path="/agro-yields" element={<LandingMarketPage />} />

          {/* Immersive AgroFeed Video & Story Hub */}
          <Route path="/feed" element={<AgroFeedPage />} />
          <Route path="/feed/create" element={<AgroFeedPage />} />

          {/* Yield Product Detail */}
          <Route path="/yield/:id" element={<YieldDetailPage />} />

          {/* Smart Basket & Multi-Gateway Escrow Checkout */}
          <Route path="/cart" element={<CartAndCheckoutPage />} />
          <Route path="/cart/checkout" element={<CartAndCheckoutPage />} />

          {/* AgroInbox & Direct Farmer Negotiation */}
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/chat/:id" element={<InboxPage />} />

          {/* Profile & Ecosystem Command Center (100% Parity with profile.tsx) */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />

          {/* Ecosystem, Supply-Side & Fintech Modules */}
          <Route path="/fintech/loans" element={<FintechAndLoansPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/orders" element={<EscrowOrdersPage />} />
          <Route path="/orders/:id" element={<EscrowOrdersPage />} />
          <Route path="/wholesaler" element={<WholesalerHubPage />} />
          <Route path="/farmer/manage" element={<FarmManagePage />} />
          <Route path="/farmer/new" element={<FarmManagePage />} />
          <Route path="/farmer/:id" element={<FarmManagePage />} />
          <Route path="/ecosystem" element={<ArchitectureOverviewPage />} />
          <Route path="/admin" element={<AdminConsolePage />} />

          {/* Authentication */}
          <Route path="/auth/login" element={<AuthPage />} />
          <Route path="/auth/register" element={<AuthPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

export default App;

