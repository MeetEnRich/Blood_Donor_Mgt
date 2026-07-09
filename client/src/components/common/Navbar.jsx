import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ toggleSidebar, isSidebarCollapsed }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center' }}>
        {user && (
          <button 
            onClick={toggleSidebar} 
            className="btn btn-outline" 
            style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', border: 'none', color: 'var(--secondary)' }}
            aria-label="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>
        )}
      </div>
      {user && (
        <div className="navbar-menu">
          <span className="badge badge-secondary role-badge">{user.role}</span>
          <span className="user-email hidden-mobile">{user.email || user.id}</span>
          <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
