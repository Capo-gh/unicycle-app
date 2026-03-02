import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useMarketplaceStore } from './store/marketplaceStore';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import OnboardingModal from './components/OnboardingModal';

import Listings from './pages/Listings';
import ItemDetail from './pages/ItemDetail';
import SellItem from './pages/SellItem';
import EditListing from './pages/EditListing';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Messages from './pages/Messages';
import Requests from './pages/Requests';
import MyListings from './pages/MyListings';
import Saved from './pages/Saved';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import CheckEmail from './pages/CheckEmail';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { activateBoost, activateSecurePay } from './api/payments';

function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, initAuth } = useAuthStore();
  const { setCurrentMarketplace } = useMarketplaceStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, []);

  // Set marketplace to user's university when user is first confirmed
  useEffect(() => {
    if (user) {
      setCurrentMarketplace(user.university || '');
    }
  }, [user?.id]);

  // Handle special URL params once user is confirmed (Stripe redirects + legacy share links)
  useEffect(() => {
    if (isLoading || !user) return;

    const params = new URLSearchParams(location.search);

    if (params.get('boost_success') && params.get('listing_id') && params.get('session_id')) {
      activateBoost(parseInt(params.get('listing_id')), params.get('session_id'))
        .catch((e) => console.error('Boost activation failed:', e));
      navigate('/my-listings', { replace: true });
      return;
    }

    if (params.get('boost_cancel')) {
      navigate('/my-listings', { replace: true });
      return;
    }

    if (params.get('secure_pay_success') && params.get('listing_id') && params.get('session_id')) {
      activateSecurePay(parseInt(params.get('listing_id')), params.get('session_id'))
        .catch((e) => console.error('Secure pay activation failed:', e));
      navigate('/my-listings', { replace: true });
      return;
    }

    if (params.get('secure_pay_cancel')) {
      navigate('/my-listings', { replace: true });
      return;
    }

    // Legacy share link: ?listing=id → /item/:id
    if (params.get('listing')) {
      navigate(`/item/${params.get('listing')}`, { replace: true });
      return;
    }

    // Clean any leftover query params from current URL
    if (location.search && location.pathname !== '/signup') {
      navigate(location.pathname, { replace: true });
    }
  }, [user, isLoading]);

  // Show onboarding for new users (triggered by Signup via localStorage flag)
  useEffect(() => {
    if (user && !localStorage.getItem('hasSeenOnboarding')) {
      setShowOnboarding(true);
    }
  }, [user?.id]);

  return (
    <>
      {showOnboarding && <OnboardingModal onDismiss={() => setShowOnboarding(false)} />}
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            isLoading ? null : user
              ? <Navigate to="/browse" replace />
              : <Landing />
          }
        />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes — wrapped in Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/browse" element={<Listings />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/sell" element={<SellItem />} />
            <Route path="/edit/:id" element={<EditListing />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route
              path="/admin"
              element={user?.is_admin ? <Admin /> : <Navigate to="/browse" replace />}
            />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return <AppInner />;
}
