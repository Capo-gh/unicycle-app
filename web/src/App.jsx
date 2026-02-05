import { useState, useEffect } from 'react';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import Listings from './pages/Listings';
import ItemDetail from './pages/ItemDetail';
import SellItem from './pages/SellItem';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Requests from './pages/Requests';
import Signup from './pages/Signup';
import { getCurrentUser } from './api/auth';

function App() {
  const [currentPage, setCurrentPage] = useState('loading');
  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);
  const [currentMarketplace, setCurrentMarketplace] = useState('');

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is still valid
          const userData = await getCurrentUser();
          setUser(userData);
          setCurrentMarketplace(userData.university);
          setCurrentPage('listings');
        } catch (error) {
          // Token invalid, clear storage
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
    setCurrentMarketplace(userData.university);
    setCurrentPage('listings');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page !== 'detail') {
      setSelectedItem(null);
    }
  };

  // Show loading while checking auth
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

  // Signup is standalone (no Layout)
  if (currentPage === 'signup') {
    return (
      <div className="animate-fadeIn">
        <Signup onSignup={handleSignup} />
      </div>
    );
  }

  // Everything else wraps in Layout
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
            onContactSeller={() => {
              setCurrentPage('messages');
            }}
          />
        )}

        {currentPage === 'sell' && (
          <SellItem onBack={() => setCurrentPage('listings')} />
        )}
        {currentPage === 'profile' && (
          <Profile user={user} onNavigate={handleNavigate} />
        )}

        {currentPage === 'settings' && (
          <Settings
            user={user}
            onBack={() => setCurrentPage('profile')}
            onLogout={() => {
              setUser(null);
              setCurrentPage('signup');
            }}
          />
        )}

        {currentPage === 'messages' && (
          <Messages
            user={user}
            incomingRequest={selectedItem ? {
              sellerName: selectedItem.seller?.name,
              itemTitle: selectedItem.title,
              itemPrice: selectedItem.price
            } : null}
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