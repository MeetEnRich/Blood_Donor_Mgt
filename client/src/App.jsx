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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(true);

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
  
  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
      {user && <Sidebar isCollapsed={isSidebarCollapsed} />}
      
      <div 
        className={user ? 'main-content-wrapper' : ''} 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          marginLeft: user ? (isSidebarCollapsed ? '64px' : '240px') : '0',
          transition: 'margin-left 0.3s ease',
          width: '100%'
        }}
      >
        {user && <Navbar toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />}
        
        <main className={user ? 'content-area' : ''} style={{ flex: 1, padding: user ? '1.25rem' : '0' }}>
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
