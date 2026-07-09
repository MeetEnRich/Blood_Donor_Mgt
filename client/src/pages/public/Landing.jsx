import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  HeartPulse, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  UserPlus, 
  BellRing, 
  Droplet 
} from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const { user } = useAuth();

  // If user is already logged in, redirect them to their respective dashboard
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <div className="landing-container">
      {/* 1. Transparent Navbar */}
      <nav className="landing-nav-clean">
        <div className="container flex justify-between items-center py-4">
          <div className="landing-brand font-bold text-xl flex items-center gap-2">
            <HeartPulse size={28} className="text-primary" />
            <span style={{ color: 'var(--secondary)' }}>BBMS</span>
          </div>
          <div className="landing-nav-actions flex gap-3">
            <Link to="/login" className="btn btn-outline" style={{ border: 'none' }}>Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="hero-section">
        <div className="container grid hero-grid items-center">
          <div className="hero-content animate-fade-in-up">
            <div className="badge badge-primary mb-3">#1 Lifesaving Network</div>
            <h1 className="hero-title">
              Connecting Lifesavers to Hospitals in <span className="text-primary">Real-Time.</span>
            </h1>
            <p className="hero-subtitle">
              Bridging the gap in the blood supply chain. We use intelligent geographic matching to deliver instant SOS alerts to nearby eligible donors when critical shortages occur.
            </p>
            <div className="hero-actions flex gap-3">
              <Link to="/register" className="btn btn-primary btn-lg">
                Become a Donor <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <img 
              src="/hero-illustration.png" 
              alt="Modern Healthcare Network" 
              className="hero-image"
            />
          </div>
        </div>
      </header>

      {/* 3. Impact Stats Banner */}
      <section className="impact-banner">
        <div className="container grid grid-cols-3 text-center">
          <div className="impact-stat">
            <h2 className="stat-number">8</h2>
            <p className="stat-label">Supported Blood Groups</p>
          </div>
          <div className="impact-stat border-x">
            <h2 className="stat-number">&lt; 3s</h2>
            <p className="stat-label">Average Match Time</p>
          </div>
          <div className="impact-stat">
            <h2 className="stat-number">90-day</h2>
            <p className="stat-label">Eligibility Tracking</p>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="how-it-works-section bg-app py-6">
        <div className="container text-center">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle text-muted mb-5">A seamless process designed to save lives in critical moments.</p>
          
          <div className="grid grid-cols-3 gap-4 process-grid">
            <div className="process-step card text-center">
              <div className="step-icon-wrapper"><UserPlus size={32} /></div>
              <h3 className="step-title">1. Register Profile</h3>
              <p className="text-muted text-sm">Sign up as a donor, enter your blood group, and set your location.</p>
            </div>
            <div className="process-step card text-center">
              <div className="step-icon-wrapper"><BellRing size={32} /></div>
              <h3 className="step-title">2. Get SOS Alerts</h3>
              <p className="text-muted text-sm">Receive instant push notifications if a nearby hospital needs your specific blood type.</p>
            </div>
            <div className="process-step card text-center">
              <div className="step-icon-wrapper"><Droplet size={32} /></div>
              <h3 className="step-title">3. Donate & Save</h3>
              <p className="text-muted text-sm">Accept the alert, visit the hospital, and make a life-saving donation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Key Features Grid */}
      <section className="features-section py-6">
        <div className="container">
          <h2 className="section-title text-center">Why Choose BBMS</h2>
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div className="feature-block flex gap-3 p-4">
              <div className="feature-icon"><MapPin size={28} /></div>
              <div>
                <h3 className="font-bold mb-1">Geographic SOS Matching</h3>
                <p className="text-muted">Our greedy algorithm instantly calculates distance and routes alerts to the nearest compatible lifesavers.</p>
              </div>
            </div>
            <div className="feature-block flex gap-3 p-4">
              <div className="feature-icon"><HeartPulse size={28} /></div>
              <div>
                <h3 className="font-bold mb-1">Real-Time Inventory</h3>
                <p className="text-muted">Hospitals and administrators have full visibility over available, reserved, and expired blood units.</p>
              </div>
            </div>
            <div className="feature-block flex gap-3 p-4">
              <div className="feature-icon"><Clock size={28} /></div>
              <div>
                <h3 className="font-bold mb-1">Automated Eligibility</h3>
                <p className="text-muted">The system tracks your last donation date and automatically updates your status after the 90-day wait period.</p>
              </div>
            </div>
            <div className="feature-block flex gap-3 p-4">
              <div className="feature-icon"><ShieldCheck size={28} /></div>
              <div>
                <h3 className="font-bold mb-1">Secure & Private</h3>
                <p className="text-muted">Role-based access control and strict data sanitization ensures medical history remains strictly confidential.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="landing-footer text-center">
        <div className="container">
          <div className="footer-brand flex justify-center items-center gap-2 mb-2">
            <HeartPulse size={20} className="text-primary" />
            <span className="font-bold">BBMS Project</span>
          </div>
          <p className="text-muted text-sm">&copy; {new Date().getFullYear()} Blood Bank Management System. Built for impact.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
