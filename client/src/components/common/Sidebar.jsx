import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, Users, Building2, Syringe, AlertCircle, 
  FileText, ClipboardPlus, History, FileHeart, LogOut, BellRing, HeartPulse 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isCollapsed }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { path: '/admin/donors', label: 'Donors', icon: <Users size={20} /> },
          { path: '/admin/hospitals', label: 'Hospitals', icon: <Building2 size={20} /> },
          { path: '/admin/inventory', label: 'Inventory', icon: <Syringe size={20} /> },
          { path: '/admin/requests', label: 'Requests', icon: <AlertCircle size={20} /> },
          { path: '/admin/reports', label: 'Reports', icon: <FileText size={20} /> },
        ];
      case 'hospital':
        return [
          { path: '/hospital/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { path: '/hospital/inventory', label: 'Inventory', icon: <Syringe size={20} /> },
          { path: '/hospital/requests/new', label: 'New Request', icon: <ClipboardPlus size={20} /> },
          { path: '/hospital/requests', label: 'Request History', icon: <History size={20} /> },
        ];
      case 'donor':
        return [
          { path: '/donor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { path: '/donor/history', label: 'Donation History', icon: <History size={20} /> },
          { path: '/donor/alerts', label: 'SOS Alerts', icon: <BellRing size={20} /> },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', gap: '0.75rem', borderBottom: '1px solid #34495e' }}>
        <HeartPulse size={28} className="text-primary" />
        {!isCollapsed && <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>BBMS</span>}
      </div>
      
      <div className="sidebar-nav">
        {getLinks().map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={isCollapsed ? link.label : ''}
          >
            <span className="sidebar-icon">{link.icon}</span>
            {!isCollapsed && <span className="sidebar-label">{link.label}</span>}
          </NavLink>
        ))}
      </div>
      <div className="sidebar-footer">
        {user.role === 'donor' && (
          <NavLink to="/survey" className="sidebar-link" title={isCollapsed ? 'Take Survey' : ''}>
            <span className="sidebar-icon"><FileHeart size={20} /></span>
            {!isCollapsed && <span className="sidebar-label">Take Survey</span>}
          </NavLink>
        )}
        <button className="sidebar-link logout-btn" onClick={logout} title={isCollapsed ? 'Logout' : ''}>
          <span className="sidebar-icon"><LogOut size={20} /></span>
          {!isCollapsed && <span className="sidebar-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
