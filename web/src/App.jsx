import { useState, useEffect } from 'react';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import Listings from './pages/Listings';
import ItemDetail from './pages/ItemDetail';
import SellItem from './pages/SellItem';
import EditListing from './pages/EditListing';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Messages from './pages/Messages';
import Requests from './pages/Requests';
import Transactions from './pages/Activity';
import MyListings from './pages/MyListings';
import Saved from './pages/Saved';
import Admin from './pages/Admin';
import AnnouncementModal from './components/AnnouncementModal';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import CheckEmail from './pages/CheckEmail';
import ResetPassword from './pages/ResetPassword';
import { getCurrentUser } from './api/auth';
import { activateBoost, activateSecurePay } from './api/payments';
import { getListing } from './api/listings';

function App() {
  const [currentPage, setCurrentPage] = useState('loading');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [messageRequest, setMessageRequest] = useState(null);
  const [user, setUser] = useState(null);
  const [currentMarketplace, setCurrentMarketplace] = useState('');
  const [viewingUserId, setViewingUserId] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState(['listings']);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        // Restore page from history state
        setCurrentPage(event.state.page);
        if (event.state.selectedItem) {
          setSelectedItem(event.state.selectedItem);
        }
        if (event.state.editingListing) {
          setEditingListing(event.state.editingListing);
        }
        if (event.state.viewingUserId) {
          setViewingUserId(event.state.viewingUserId);
        }
        if (event.state.messageRequest) {
          setMessageRequest(event.state.messageRequest);
        }
      } else if (navigationHistory.length > 1) {
        // Go back to previous page in our history
        const newHistory = [...navigationHistory];
        newHistory.pop();
        const previousPage = newHistory[newHistory.length - 1];
        setNavigationHistory(newHistory);
        setCurrentPage(previousPage);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initialize history state on mount
    if (currentPage && currentPage !== 'loading') {
      window.history.replaceState(
        { page: currentPage },
        '',
        window.location.pathname
      );
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentPage, navigationHistory]);

  // Scroll to top on every page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      // If user is already logged in, stay logged in
      if (token && storedUser) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          // Default to user's university marketplace
          setCurrentMarketplace(userData.university);

          // Handle Stripe return URL params
          const params = new URLSearchParams(window.location.search);

          if (params.get('boost_success') && params.get('listing_id') && params.get('session_id')) {
            try {
              await activateBoost(parseInt(params.get('listing_id')), params.get('session_id'));
            } catch (e) {
              console.error('Boost activation failed:', e);
            }
            window.history.replaceState({}, '', window.location.pathname);
            setCurrentPage('my-listings');
            return;
          }

          if (params.get('boost_cancel')) {
            window.history.replaceState({}, '', window.location.pathname);
            setCurrentPage('my-listings');
            return;
          }

          if (params.get('secure_pay_success') && params.get('listing_id') && params.get('session_id')) {
            try {
              await activateSecurePay(parseInt(params.get('listing_id')), params.get('session_id'));
            } catch (e) {
              console.error('Secure pay activation failed:', e);
            }
            window.history.replaceState({}, '', window.location.pathname);
            setCurrentPage('my-interests');
            return;
          }

          if (params.get('secure_pay_cancel')) {
            window.history.replaceState({}, '', window.location.pathname);
          }

          // Handle shared listing deep link (?listing=id)
          if (params.get('listing')) {
            const listingId = parseInt(params.get('listing'));
            window.history.replaceState({}, '', window.location.pathname);
            try {
              const listing = await getListing(listingId);
              setSelectedItem(listing);
              setCurrentPage('detail');
            } catch {
              setCurrentPage('listings');
            }
            return;
          }

          // Restore the last page user was on, or default to listings
          const lastPage = localStorage.getItem('currentPage') || 'listings';
          setCurrentPage(lastPage);

          // Clear any verification token from URL after successful login
          if (params.get('token')) {
            window.history.replaceState({}, '', window.location.pathname);
          }

          return;
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('currentPage');
          // Fall through to check verification token
        }
      }

      // Check if URL has a reset_token (password reset link)
      const params = new URLSearchParams(window.location.search);

      if (params.get('reset_token')) {
        setCurrentPage('reset-password');
        return;
      }

      // Check if URL has verification token (only if not logged in)
      const verificationToken = params.get('token');

      if (verificationToken) {
        // Show verification page
        setCurrentPage('verify-email');
        return;
      }

      // Save shared listing for after login
      if (params.get('listing')) {
        localStorage.setItem('pendingListingId', params.get('listing'));
        window.history.replaceState({}, '', window.location.pathname);
      }

      // Not logged in and no verification token
      setCurrentPage('signup');
    };

    checkAuth();
  }, []);

  const handleSignup = async (userData) => {
    setUser(userData);
    setCurrentMarketplace(userData.university);

    // Check for a pending shared listing
    const pendingId = localStorage.getItem('pendingListingId');
    if (pendingId) {
      localStorage.removeItem('pendingListingId');
      try {
        const listing = await getListing(parseInt(pendingId));
        setSelectedItem(listing);
        setCurrentPage('detail');
        return;
      } catch {
        // fall through to listings
      }
    }

    setCurrentPage('listings');
    localStorage.setItem('currentPage', 'listings');
  };

  const handleNavigate = (page, data = null) => {
    if (page === 'edit-listing' && data) {
      setEditingListing(data);
      setCurrentPage('edit-listing');
      localStorage.setItem('currentPage', 'edit-listing');

      // Push to browser history
      window.history.pushState(
        { page: 'edit-listing', editingListing: data },
        '',
        window.location.pathname
      );

      // Update navigation history
      setNavigationHistory(prev => [...prev, 'edit-listing']);
    } else if (page === 'detail' && data) {
      setSelectedItem(data);
      setCurrentPage('detail');

      // Push to browser history
      window.history.pushState(
        { page: 'detail', selectedItem: data },
        '',
        window.location.pathname
      );

      // Update navigation history
      setNavigationHistory(prev => [...prev, 'detail']);
    } else if (page === 'user-profile' && data) {
      setViewingUserId(data);
      setCurrentPage('user-profile');

      // Push to browser history
      window.history.pushState(
        { page: 'user-profile', viewingUserId: data },
        '',
        window.location.pathname
      );

      // Update navigation history
      setNavigationHistory(prev => [...prev, 'user-profile']);
    } else {
      setCurrentPage(page);
      // Save current page to localStorage for persistence after refresh
      if (page !== 'loading' && page !== 'signup' && page !== 'verify-email' && page !== 'check-email') {
        localStorage.setItem('currentPage', page);
      }
      if (page !== 'detail') {
        setSelectedItem(null);
      }
      if (page !== 'edit-listing') {
        setEditingListing(null);
      }
      if (page !== 'messages') {
        setMessageRequest(null);
      }
      if (page !== 'user-profile') {
        setViewingUserId(null);
      }

      // Push to browser history
      window.history.pushState(
        { page },
        '',
        window.location.pathname
      );

      // Update navigation history
      setNavigationHistory(prev => [...prev, page]);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const handleContactSeller = (request) => {
    setMessageRequest(request);
    setCurrentPage('messages');

    // Push to browser history with message request
    window.history.pushState(
      { page: 'messages', messageRequest: request },
      '',
      window.location.pathname
    );

    // Update navigation history
    setNavigationHistory(prev => [...prev, 'messages']);
  };

  const handleViewSellerProfile = (userId) => {
    handleNavigate('user-profile', userId);
  };

  if (currentPage === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-unicycle-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'signup') {
    return (
      <div className="animate-fadeIn">
        <Signup onSignup={handleSignup} onNavigate={handleNavigate} />
      </div>
    );
  }

  if (currentPage === 'check-email') {
    const pendingEmail = localStorage.getItem('pendingVerificationEmail') || user?.email || '';
    return (
      <div className="animate-fadeIn">
        <CheckEmail userEmail={pendingEmail} onNavigate={handleNavigate} />
      </div>
    );
  }

  if (currentPage === 'verify-email') {
    return (
      <div className="animate-fadeIn">
        <VerifyEmail onNavigate={handleNavigate} onSignup={handleSignup} />
      </div>
    );
  }

  if (currentPage === 'reset-password') {
    return (
      <div className="animate-fadeIn">
        <ResetPassword onSignup={handleSignup} onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate} currentMarketplace={currentMarketplace} onMarketplaceChange={setCurrentMarketplace}>
      <AnnouncementModal />
      <div key={currentPage} className="animate-fadeIn">

        {currentPage === 'listings' && (
          <Listings
            onItemClick={(item) => handleNavigate('detail', item)}
            onNavigate={handleNavigate}
            currentMarketplace={currentMarketplace}
            onMarketplaceChange={setCurrentMarketplace}
          />
        )}

        {currentPage === 'detail' && (
          <ItemDetail
            item={selectedItem}
            onBack={goBack}
            onContactSeller={handleContactSeller}
            onNavigate={handleNavigate}
            onViewSellerProfile={handleViewSellerProfile}
          />
        )}

        {currentPage === 'user-profile' && (
          <UserProfile
            userId={viewingUserId}
            currentUser={user}
            onBack={goBack}
            onItemClick={(item) => handleNavigate('detail', item)}
            onContact={handleContactSeller}
          />
        )}

        {currentPage === 'sell' && (
          <SellItem onBack={goBack} />
        )}

        {currentPage === 'edit-listing' && (
          <EditListing
            listing={editingListing}
            onBack={goBack}
            onSuccess={goBack}
          />
        )}

        {currentPage === 'profile' && (
          <Profile user={user} onNavigate={handleNavigate} />
        )}

        {currentPage === 'settings' && (
          <Settings
            user={user}
            onBack={goBack}
            onLogout={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setCurrentMarketplace('');
              setCurrentPage('signup');
            }}
          />
        )}

        {currentPage === 'messages' && (
          <Messages
            user={user}
            incomingRequest={messageRequest}
          />
        )}

        {currentPage === 'requests' && (
          <Requests user={user} onNavigate={handleNavigate} />
        )}

        {currentPage === 'my-interests' && (
          <Transactions onNavigate={handleNavigate} />
        )}

        {currentPage === 'saved' && (
          <Saved onItemClick={(item) => handleNavigate('detail', item)} />
        )}

        {currentPage === 'my-listings' && (
          <MyListings onNavigate={handleNavigate} />
        )}

        {currentPage === 'admin' && user?.is_admin && (
          <Admin />
        )}

      </div>
    </Layout>
  );
}

export default App;