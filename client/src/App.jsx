import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import './styles/global.css';

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <div className="app-container">
      <Navbar />
      <div className={user ? 'main-layout' : ''}>
        {user && <Sidebar />}
        <main className={user ? 'content-area' : ''} style={{ width: '100%', paddingTop: user ? '0' : '60px' }}>
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
