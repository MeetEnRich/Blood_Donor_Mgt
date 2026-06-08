import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import './Register.css';

const Register = () => {
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    fullName: '', facilityName: '', facilityType: '', dateOfBirth: '', gender: '', 
    bloodGroup: '', genotype: '', phone: '', email: '', password: '', 
    address: '', state: '', lga: '', contactPersonName: '',
    latitude: '', longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRoleSelect = (selectedRole) => setRole(selectedRole);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (err) => setError('Could not fetch location: ' + err.message)
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = role === 'donor' ? '/auth/register/donor' : '/auth/register/hospital';
      await api.post(endpoint, formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-container">
        <div className="card text-center" style={{ maxWidth: '500px' }}>
          <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Registration Submitted!</h2>
          <p>Your registration is complete. Please await admin approval before logging in.</p>
          <Link to="/login" className="btn btn-primary mt-3">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="card register-card">
        <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Register for BBMS</h2>
        
        {!role ? (
          <div>
            <p className="text-center mb-2">Select your account type:</p>
            <div className="role-selection grid grid-cols-2 gap-2">
              <div className="role-card" onClick={() => handleRoleSelect('donor')}>
                <h3>Donor</h3>
                <p className="text-muted text-sm">Register to donate blood</p>
              </div>
              <div className="role-card" onClick={() => handleRoleSelect('hospital')}>
                <h3>Hospital</h3>
                <p className="text-muted text-sm">Register a healthcare facility</p>
              </div>
            </div>
            <p className="text-center mt-3">Already have an account? <Link to="/login">Login</Link></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert-danger">{error}</div>}
            
            <div className="form-section">
              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                {role === 'donor' ? 'Donor Details' : 'Hospital Details'}
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                {role === 'donor' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" name="fullName" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date of Birth</label>
                      <input type="date" name="dateOfBirth" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select name="gender" className="form-control" onChange={handleChange} required>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Blood Group</label>
                      <select name="bloodGroup" className="form-control" onChange={handleChange} required>
                        <option value="">Select</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Genotype</label>
                      <select name="genotype" className="form-control" onChange={handleChange}>
                        <option value="">Select (Optional)</option>
                        <option value="AA">AA</option>
                        <option value="AS">AS</option>
                        <option value="SS">SS</option>
                        <option value="AC">AC</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group col-span-2">
                      <label className="form-label">Facility Name</label>
                      <input type="text" name="facilityName" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Facility Type</label>
                      <select name="facilityType" className="form-control" onChange={handleChange} required>
                        <option value="">Select</option>
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contact Person</label>
                      <input type="text" name="contactPersonName" className="form-control" onChange={handleChange} required />
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" name="phone" className="form-control" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-control" onChange={handleChange} required />
                </div>
                <div className="form-group col-span-2">
                  <label className="form-label">Password</label>
                  <input type="password" name="password" className="form-control" onChange={handleChange} required minLength="6" />
                </div>
                <div className="form-group col-span-2">
                  <label className="form-label">Address</label>
                  <input type="text" name="address" className="form-control" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" name="state" className="form-control" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">LGA</label>
                  <input type="text" name="lga" className="form-control" onChange={handleChange} required />
                </div>
                
                <div className="form-group col-span-2" style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '4px' }}>
                  <label className="form-label">Location Data</label>
                  <div className="flex items-center gap-2">
                    <button type="button" className="btn btn-outline" onClick={getGeoLocation}>Get Current Location</button>
                    {formData.latitude && <span className="text-sm text-success">Location captured!</span>}
                  </div>
                  <div className="text-xs text-muted mt-2">Required for proximity routing during SOS emergencies.</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-3">
              <button type="button" className="btn btn-outline" onClick={() => setRole('')}>Back</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Register'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
