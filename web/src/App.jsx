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
import Transactions from './pages/Transactions';
import MyListings from './pages/MyListings';
import Admin from './pages/Admin';
import AnnouncementModal from './components/AnnouncementModal';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import CheckEmail from './pages/CheckEmail';
import { getCurrentUser } from './api/auth';

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

          // Restore the last page user was on, or default to listings
          const lastPage = localStorage.getItem('currentPage') || 'listings';
          setCurrentPage(lastPage);

          // Clear any verification token from URL after successful login
          const params = new URLSearchParams(window.location.search);
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

      // Check if URL has verification token (only if not logged in)
      const params = new URLSearchParams(window.location.search);
      const verificationToken = params.get('token');

      if (verificationToken) {
        // Show verification page
        setCurrentPage('verify-email');
        return;
      }

      // Not logged in and no verification token
      setCurrentPage('signup');
    };

    checkAuth();
  }, []);

  const handleSignup = (userData) => {
    setUser(userData);
    // Default to user's university marketplace
    setCurrentMarketplace(userData.university);
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
    setViewingUserId(userId);
    setCurrentPage('user-profile');
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

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate} currentMarketplace={currentMarketplace} onMarketplaceChange={setCurrentMarketplace}>
      <AnnouncementModal />
      <div key={currentPage} className="animate-fadeIn">

        {currentPage === 'listings' && (
          <Listings
            onItemClick={(item) => {
              setSelectedItem(item);
              setCurrentPage('detail');
            }}
            onNavigate={handleNavigate}
            currentMarketplace={currentMarketplace}
            onMarketplaceChange={setCurrentMarketplace}
          />
        )}

        {currentPage === 'detail' && (
          <ItemDetail
            item={selectedItem}
            onBack={() => setCurrentPage('listings')}
            onContactSeller={handleContactSeller}
            onNavigate={handleNavigate}
            onViewSellerProfile={handleViewSellerProfile}
          />
        )}

        {currentPage === 'user-profile' && (
          <UserProfile
            userId={viewingUserId}
            currentUser={user}
            onBack={() => {
              if (selectedItem) {
                setCurrentPage('detail');
              } else {
                setCurrentPage('listings');
              }
            }}
            onItemClick={(item) => {
              setSelectedItem(item);
              setCurrentPage('detail');
            }}
          />
        )}

        {currentPage === 'sell' && (
          <SellItem onBack={() => setCurrentPage('listings')} />
        )}

        {currentPage === 'edit-listing' && (
          <EditListing
            listing={editingListing}
            onBack={() => setCurrentPage('profile')}
            onSuccess={() => setCurrentPage('profile')}
          />
        )}

        {currentPage === 'profile' && (
          <Profile user={user} onNavigate={handleNavigate} />
        )}

        {currentPage === 'settings' && (
          <Settings
            user={user}
            onBack={() => setCurrentPage('profile')}
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
          <Requests user={user} />
        )}

        {currentPage === 'my-interests' && (
          <Transactions onNavigate={handleNavigate} />
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