import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import LandingMarketPage from './pages/LandingMarketPage';
import AgroFeedPage from './pages/AgroFeedPage';
import ProfilePage from './pages/ProfilePage';
import YieldDetailPage from './pages/YieldDetailPage';
import CartAndCheckoutPage from './pages/CartAndCheckoutPage';
import InboxPage from './pages/InboxPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import FarmManagementPage from './pages/FarmManagementPage';
import RegisterFarmWizardPage from './pages/RegisterFarmWizardPage';
import FarmStorefrontPage from './pages/FarmStorefrontPage';
import {
  FintechAndLoansPage,
  WalletPage,
  EscrowOrdersPage,
  ArchitectureOverviewPage,
  AdminConsolePage,
} from './pages/EcosystemAndFintechPages';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone Authentication Routes (No Header / No Sidebar / No Bottom Navbar) */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Main Application Routes Wrapped in Responsive AppShell */}
        <Route
          path="/*"
          element={
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
                <Route path="/farmer/manage" element={<FarmManagementPage />} />
                <Route path="/farmer/new" element={<RegisterFarmWizardPage />} />
                <Route path="/farmer/:id" element={<FarmStorefrontPage />} />
                <Route path="/ecosystem" element={<ArchitectureOverviewPage />} />
                <Route path="/admin" element={<AdminConsolePage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
