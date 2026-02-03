import { useState } from 'react';
import Layout from './components/Layout';
import Listings from './pages/Listings';
import ItemDetail from './pages/ItemDetail';
import SellItem from './pages/SellItem';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Requests from './pages/Requests';
import Chat from './pages/Chat';
import Signup from './pages/Signup';

function App() {
  const [currentPage, setCurrentPage] = useState('signup');
  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);
  const [currentMarketplace, setCurrentMarketplace] = useState('');

  const handleSignup = (userData) => {
    setUser(userData);
    setCurrentMarketplace(userData.university);
    setCurrentPage('listings');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page !== 'detail' && page !== 'chat') {
      setSelectedItem(null);
    }
  };

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
            onContactSeller={() => setCurrentPage('chat')}
          />
        )}

        {currentPage === 'chat' && (
          <Chat
            item={selectedItem}
            onBack={() => setCurrentPage('detail')}
          />
        )}

        {currentPage === 'sell' && (
          <SellItem onBack={() => setCurrentPage('listings')} />
        )}

        {currentPage === 'profile' && (
          <Profile />
        )}

        {currentPage === 'messages' && (
          <Messages />
        )}

        {currentPage === 'requests' && (
          <Requests />
        )}

      </div>
    </Layout>
  );
}

export default App;