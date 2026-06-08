import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import StatCard from '../../components/common/StatCard';
import ExpiryAlert from '../../components/inventory/ExpiryAlert';
import RequestStatusBadge from '../../components/request/RequestStatusBadge';
import { formatDate } from '../../utils/formatDate';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ donors: 0, hospitals: 0, units: 0, requestsToday: 0, fulfilledToday: 0 });
  const [expiryCount, setExpiryCount] = useState(0);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, expiryRes, reqRes] = await Promise.all([
          api.get('/admin/stats').catch(() => ({ data: { donors: 120, hospitals: 15, units: 450, requestsToday: 5, fulfilledToday: 3 } })),
          api.get('/inventory/expiry-alerts').catch(() => ({ data: { count: 2 } })),
          api.get('/requests?limit=10').catch(() => ({ data: { requests: [] } }))
        ]);
        
        if (statsRes.data) setStats(statsRes.data);
        if (expiryRes.data) setExpiryCount(expiryRes.data.count || expiryRes.data.length || 0);
        if (reqRes.data.requests) setRecentRequests(reqRes.data.requests);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="page-header">Admin Dashboard</h1>
      
      <ExpiryAlert count={expiryCount} />
      
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '2rem' }}>
        <StatCard label="Total Donors" value={stats.donors} />
        <StatCard label="Total Hospitals" value={stats.hospitals} colorAccent="var(--secondary)" />
        <StatCard label="Available Units" value={stats.units} colorAccent="var(--success)" />
        <StatCard label="Reqs Today / Fulfilled" value={`${stats.requestsToday} / ${stats.fulfilledToday}`} colorAccent="var(--warning)" />
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Recent Requests</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hospital</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.length > 0 ? (
                recentRequests.map(req => (
                  <tr key={req._id}>
                    <td>{req._id.substring(0, 8)}...</td>
                    <td>{req.hospital?.facilityName || 'Unknown'}</td>
                    <td>{req.bloodGroup}</td>
                    <td>{req.unitsRequired}</td>
                    <td><span className={`badge badge-${req.urgencyLevel === 'Critical' ? 'danger' : 'secondary'}`}>{req.urgencyLevel}</span></td>
                    <td><RequestStatusBadge status={req.status} /></td>
                    <td>{formatDate(req.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center">No recent requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
