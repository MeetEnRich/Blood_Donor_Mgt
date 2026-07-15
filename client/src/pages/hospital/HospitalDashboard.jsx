import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import StatCard from '../../components/common/StatCard';
import RequestStatusBadge from '../../components/request/RequestStatusBadge';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeRequests: 0, fulfilledRequests: 0, availableNetworkUnits: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, reqRes] = await Promise.all([
          api.get('/requests/stats/hospital').catch(() => ({ data: { activeRequests: 0, fulfilledRequests: 0, availableNetworkUnits: 0 } })),
          api.get('/requests/my?limit=5').catch(() => ({ data: { requests: [] } }))
        ]);
        
        if (statsRes.data) setStats(statsRes.data);
        if (reqRes.data.requests) setRecentRequests(reqRes.data.requests);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div className="flex justify-between items-center page-header">
        <div>
          <h1>Hospital Dashboard</h1>
          <p className="text-muted">{user?.email || 'Facility'}</p>
        </div>
        <Link to="/hospital/requests/new" className="btn btn-primary">Submit New Request</Link>
      </div>
      
      <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '2rem' }}>
        <StatCard label="Active Requests" value={stats.activeRequests} colorAccent="var(--warning)" />
        <StatCard label="Fulfilled Requests" value={stats.fulfilledRequests} colorAccent="var(--success)" />
        <StatCard label="Available Units in Network" value={stats.availableNetworkUnits} colorAccent="var(--secondary)" />
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Recent Requests</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.length > 0 ? (
                recentRequests.map(req => (
                  <tr key={req._id}>
                    <td>{req._id.substring(0, 8)}...</td>
                    <td><span className="badge badge-primary">{req.bloodGroup}</span></td>
                    <td>{req.unitsRequired}</td>
                    <td>{req.urgencyLevel}</td>
                    <td><RequestStatusBadge status={req.status} /></td>
                    <td>{formatDate(req.createdAt)}</td>
                    <td>
                      <Link to={`/hospital/requests/${req._id}`} className="btn btn-sm btn-outline">View</Link>
                    </td>
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

export default HospitalDashboard;
