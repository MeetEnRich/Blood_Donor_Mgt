import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { formatDateTime } from '../../utils/formatDate';
import './SOSAlerts.css';

const SOSAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/donor/alerts').catch(() => ({ data: [] }));
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id, response) => {
    try {
      await api.post(`/donor/alerts/${id}/respond`, { response });
      fetchAlerts(); // Refresh
    } catch (err) {
      alert('Failed to respond to alert');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>SOS Alerts</h1>
        <p className="text-muted">Emergency requests for your blood group near you.</p>
      </div>

      <div className="grid gap-3">
        {loading ? (
          <p>Loading alerts...</p>
        ) : alerts.length > 0 ? (
          alerts.map(alert => (
            <div key={alert._id} className={`card alert-card ${alert.status}`}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <span className="badge badge-danger">EMERGENCY</span>
                <span className="text-muted">{formatDateTime(alert.createdAt)}</span>
              </div>
              
              <h3 style={{ marginBottom: '0.5rem' }}>{alert.hospital?.facilityName}</h3>
              <p className="text-muted mb-2">{alert.hospital?.address}, {alert.hospital?.lga}, {alert.hospital?.state}</p>
              
              <div style={{ backgroundColor: '#f9ebea', padding: '1rem', borderRadius: '4px', borderLeft: '4px solid var(--danger)', marginBottom: '1rem' }}>
                Urgent need for <strong>{alert.request?.unitsRequired} unit(s)</strong> of <strong>{alert.bloodGroup}</strong> blood.
              </div>

              {alert.status === 'pending' && (
                <div className="flex gap-2">
                  <button className="btn btn-primary" onClick={() => handleRespond(alert._id, 'accepted')}>I can donate</button>
                  <button className="btn btn-outline" onClick={() => handleRespond(alert._id, 'declined')}>I'm unable</button>
                </div>
              )}

              {alert.status === 'accepted' && (
                <div className="text-success font-medium">You accepted this request. Please head to the facility.</div>
              )}

              {alert.status === 'declined' && (
                <div className="text-muted">You declined this request.</div>
              )}
            </div>
          ))
        ) : (
          <div className="card text-center">
            <p className="text-muted">No SOS alerts at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOSAlerts;
