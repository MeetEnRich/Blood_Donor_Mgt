import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard' },
          { path: '/admin/donors', label: 'Donors' },
          { path: '/admin/hospitals', label: 'Hospitals' },
          { path: '/admin/inventory', label: 'Inventory' },
          { path: '/admin/requests', label: 'Requests' },
          { path: '/admin/reports', label: 'Reports' },
        ];
      case 'hospital':
        return [
          { path: '/hospital/dashboard', label: 'Dashboard' },
          { path: '/hospital/inventory', label: 'Inventory' },
          { path: '/hospital/requests/new', label: 'New Request' },
          { path: '/hospital/requests', label: 'Request History' },
        ];
      case 'donor':
        return [
          { path: '/donor/dashboard', label: 'Dashboard' },
          { path: '/donor/history', label: 'Donation History' },
          { path: '/donor/alerts', label: 'SOS Alerts' },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        {getLinks().map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="sidebar-footer">
        <NavLink to="/survey" className="sidebar-link">Take Survey</NavLink>
        <button className="sidebar-link logout-btn" onClick={logout}>Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
