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
      const res = await api.get('/donors/me/alerts').catch(() => ({ data: { alerts: [] } }));
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id, response) => {
    try {
      await api.post(`/donors/me/respond-alert`, { requestId: id, response });
      fetchAlerts(); // Refresh
    } catch (err) {
      alert('Failed to respond to alert');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>SOS Alerts</h1>
      </div>

      <div className="grid gap-3">
        {loading ? (
          <p>Loading alerts...</p>
        ) : alerts.length > 0 ? (
          alerts.map(alert => (
            <div key={alert._id} className={`card alert-card ${alert.status}`}>
              <div className="flex items-center justify-between" style={{ gap: '1rem' }}>
                {/* Column 1: Hospital Info */}
                <div style={{ flex: '2', minWidth: '200px' }}>
                  <h3 style={{ marginBottom: '0.15rem', fontSize: '1rem' }}>{alert.hospitalId?.facilityName}</h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                    {alert.hospitalId?.address}, {alert.hospitalId?.lga}, {alert.hospitalId?.state}
                  </p>
                </div>

                {/* Column 2: Requirements & Date */}
                <div style={{ flex: '1.5', minWidth: '180px' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--danger)', fontWeight: '700', fontSize: '0.7rem', letterSpacing: '0.05em' }}>EMERGENCY</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDateTime(alert.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--secondary)' }}>
                    <strong>{alert.unitsRequired} unit(s)</strong> of <strong style={{ color: 'var(--danger)' }}>{alert.bloodGroup}</strong>
                  </div>
                </div>

                {/* Column 3: Actions */}
                <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end', minWidth: '180px' }}>
                  {alert.status === 'sos_dispatched' && (
                    <div className="flex gap-2">
                      <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleRespond(alert._id, 'accept')}>I can donate</button>
                      <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleRespond(alert._id, 'decline')}>I'm unable</button>
                    </div>
                  )}

                  {alert.status === 'pending_donation' && (
                    <span className="badge badge-warning" style={{ padding: '0.3rem 0.6rem' }}>Awaiting Hospital</span>
                  )}

                  {alert.status === 'fulfilled' && (
                    <span className="badge badge-success" style={{ padding: '0.3rem 0.6rem' }}>✓ Donation Complete</span>
                  )}
                </div>
              </div>
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
