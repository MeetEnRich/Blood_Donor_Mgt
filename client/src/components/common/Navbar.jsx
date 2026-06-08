import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <strong>BBMS</strong> | Blood Bank Management System
      </div>
      {user && (
        <div className="navbar-menu">
          <span className="badge badge-secondary role-badge">{user.role}</span>
          <span className="user-email">{user.email || user.id}</span>
          <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
