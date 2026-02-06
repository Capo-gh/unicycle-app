import { useState, useEffect } from 'react';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import Listings from './pages/Listings';
import ItemDetail from './pages/ItemDetail';
import SellItem from './pages/SellItem';
import EditListing from './pages/EditListing';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Requests from './pages/Requests';
import Signup from './pages/Signup';
import { getCurrentUser } from './api/auth';

function App() {
  const [currentPage, setCurrentPage] = useState('loading');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [messageRequest, setMessageRequest] = useState(null);
  const [user, setUser] = useState(null);
  const [currentMarketplace, setCurrentMarketplace] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          // Default to user's university marketplace
          setCurrentMarketplace(userData.university);
          setCurrentPage('listings');
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentPage('signup');
        }
      } else {
        setCurrentPage('signup');
      }
    };

    checkAuth();
  }, []);

  const handleSignup = (userData) => {
    setUser(userData);
    // Default to user's university marketplace
    setCurrentMarketplace(userData.university);
    setCurrentPage('listings');
  };

  const handleNavigate = (page, data = null) => {
    if (page === 'edit-listing' && data) {
      setEditingListing(data);
      setCurrentPage('edit-listing');
    } else {
      setCurrentPage(page);
      if (page !== 'detail') {
        setSelectedItem(null);
      }
      if (page !== 'edit-listing') {
        setEditingListing(null);
      }
      if (page !== 'messages') {
        setMessageRequest(null);
      }
    }
  };

  const handleContactSeller = (request) => {
    setMessageRequest(request);
    setCurrentPage('messages');
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
        <Signup onSignup={handleSignup} />
      </div>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate} currentMarketplace={currentMarketplace} onMarketplaceChange={setCurrentMarketplace}>
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

      </div>
    </Layout>
  );
}

export default App;