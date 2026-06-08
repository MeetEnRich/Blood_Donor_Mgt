import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-container">
      <header className="hero-section text-center">
        <h1 className="hero-title">Blood Bank Management System</h1>
        <p className="hero-subtitle">Bridging the gap in Nigeria's blood supply chain. Secure, fast, and reliable life-saving connections.</p>
        <div className="hero-actions flex justify-center gap-2">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/register" className="btn btn-outline">Register</Link>
        </div>
      </header>

      <section className="features-section container">
        <h2 className="text-center section-title">Key Features</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="card feature-card">
            <h3>Donor Management</h3>
            <p className="text-muted">Register, track eligibility, and manage your donation history with ease.</p>
          </div>
          <div className="card feature-card">
            <h3>Real-Time Inventory</h3>
            <p className="text-muted">Hospitals can view real-time blood availability across the network.</p>
          </div>
          <div className="card feature-card">
            <h3>Emergency SOS</h3>
            <p className="text-muted">Instant alerts dispatched to eligible nearby donors during critical shortages.</p>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container grid grid-cols-3 gap-3 text-center">
          <div>
            <h2 className="stat-number">90-day</h2>
            <p>Eligibility Tracking</p>
          </div>
          <div>
            <h2 className="stat-number">8</h2>
            <p>Blood Groups Supported</p>
          </div>
          <div>
            <h2 className="stat-number">&lt; 3s</h2>
            <p>Donation Matching</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer text-center">
        <p>&copy; {new Date().getFullYear()} BBMS Project. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
