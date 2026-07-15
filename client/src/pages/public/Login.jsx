import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect them to their respective dashboard
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      // Determine dashboard route based on role
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      navigate(`/${payload.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);
    try {
      const data = await login(demoEmail, demoPassword);
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      navigate(`/${payload.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Login to BBMS</h2>
        {error && <div className="alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-3">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <p className="text-muted text-center" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>Quick Login</p>
          <div className="flex gap-2" style={{ justifyContent: 'center' }}>
            <button 
              type="button"
              className="btn btn-outline" 
              style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem 0.5rem' }}
              disabled={loading}
              onClick={() => handleQuickLogin('admin@bbms.com', 'Admin@123')}
            >
              Admin
            </button>
            <button 
              type="button"
              className="btn btn-outline" 
              style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem 0.5rem' }}
              disabled={loading}
              onClick={() => handleQuickLogin('info@fmclafia.com', 'Hospital@123')}
            >
              Hospital
            </button>
            <button 
              type="button"
              className="btn btn-outline" 
              style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem 0.5rem' }}
              disabled={loading}
              onClick={() => handleQuickLogin('chinedu.okafor@email.com', 'Password@123')}
            >
              Donor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
