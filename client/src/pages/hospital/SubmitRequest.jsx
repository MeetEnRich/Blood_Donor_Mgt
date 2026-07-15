import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import './SubmitRequest.css';

const SubmitRequest = () => {
  const [formData, setFormData] = useState({
    bloodGroup: '',
    unitsRequired: 1,
    urgencyLevel: 'Routine',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/requests', formData);
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="card text-center" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Request Processed</h2>
        
        {result.status === 'fulfilled' ? (
          <div className="alert alert-success">
            <h4>Fulfilled from Inventory</h4>
            <p>Your request has been matched with available units in the network.</p>
          </div>
        ) : (
          <div className="alert alert-warning">
            <h4>SOS Dispatched</h4>
            <p>Units are not available in inventory. We have dispatched SOS alerts to eligible donors near your facility.</p>
          </div>
        )}
        
        <div className="mt-3 flex justify-center gap-2">
          <button className="btn btn-outline" onClick={() => navigate('/hospital/requests')}>View My Requests</button>
          <button className="btn btn-primary" onClick={() => setResult(null)}>Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-request-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'center' }}>
        <h1>Submit Blood Request</h1>
      </div>
      
      <div className="card" style={{ width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Blood Group Needed</label>
            <select name="bloodGroup" className="form-control" value={formData.bloodGroup} onChange={handleChange} required>
              <option value="">Select Blood Group</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Units Required</label>
            <input type="number" name="unitsRequired" className="form-control" min="1" max="20" value={formData.unitsRequired} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Urgency Level</label>
            <select name="urgencyLevel" className="form-control" value={formData.urgencyLevel} onChange={handleChange} required>
              <option value="Routine">Routine</option>
              <option value="Urgent">Urgent</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea name="notes" className="form-control" rows="3" value={formData.notes} onChange={handleChange}></textarea>
          </div>
          
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Processing...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitRequest;
