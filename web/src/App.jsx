import { useState } from 'react';
import Listings from './pages/Listings';
import ItemDetail from './pages/ItemDetail';
import SellItem from './pages/SellItem';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Requests from './pages/Requests';
import Chat from './pages/Chat';
import Signup from './pages/Signup';

function App() {
  const [currentPage, setCurrentPage] = useState('signup'); // Start with signup
  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);

  const handleSignup = (userData) => {
    setUser(userData);
    setCurrentPage('listings');
  };

  return (
    <div key={currentPage} className="animate-fadeIn">
      {currentPage === 'signup' && (
        <Signup onSignup={handleSignup} />
      )}

      {currentPage === 'listings' && (
        <Listings
          onItemClick={(item) => {
            setSelectedItem(item);
            setCurrentPage('detail');
          }}
          onSellClick={() => setCurrentPage('sell')}
          onProfileClick={() => setCurrentPage('profile')}
          onRequestsClick={() => setCurrentPage('requests')}
          onMessagesClick={() => setCurrentPage('messages')}
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
        <Profile
          onBack={() => setCurrentPage('listings')}
          onBrowseClick={() => setCurrentPage('listings')}
          onRequestsClick={() => setCurrentPage('requests')}
          onSellClick={() => setCurrentPage('sell')}
        />
      )}

      {currentPage === 'messages' && (
        <Messages onBack={() => setCurrentPage('listings')} />
      )}

      {currentPage === 'requests' && (
        <Requests
          onSellClick={() => setCurrentPage('sell')}
          onBrowseClick={() => setCurrentPage('listings')}
          onProfileClick={() => setCurrentPage('profile')}
        />
      )}
    </div>
  );
}

export default App;