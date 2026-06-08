import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useAuth } from '../../hooks/useAuth';
import DonorProfileCard from '../../components/donor/DonorProfileCard';
import EligibilityBadge from '../../components/donor/EligibilityBadge';
import StatCard from '../../components/common/StatCard';
import { formatDate } from '../../utils/formatDate';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/donor/dashboard').catch(() => ({
          data: {
            donor: user,
            stats: { totalDonations: 0, daysSinceLastDonation: null },
            recentAlerts: []
          }
        }));
        setDashboardData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  if (loading || !dashboardData) return <div>Loading...</div>;

  const { donor, stats, recentAlerts } = dashboardData;

  return (
    <div>
      <div className="flex justify-between items-center page-header">
        <h1>Donor Dashboard</h1>
        <EligibilityBadge lastDonationDate={donor.lastDonationDate} />
      </div>

      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '2rem' }}>
        <DonorProfileCard donor={donor} />
        <div className="grid gap-2">
          <StatCard label="Total Donations" value={stats.totalDonations} />
          <StatCard 
            label="Days Since Last Donation" 
            value={stats.daysSinceLastDonation !== null ? stats.daysSinceLastDonation : 'N/A'} 
            colorAccent="var(--secondary)" 
          />
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <h3>Recent SOS Alerts</h3>
          <Link to="/donor/alerts" className="btn btn-outline btn-sm">View All</Link>
        </div>
        
        {recentAlerts && recentAlerts.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {recentAlerts.map(alert => (
              <li key={alert._id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{alert.hospital?.facilityName}</strong> needs <strong>{alert.bloodGroup}</strong>
                  <div className="text-muted text-sm mt-1">{formatDate(alert.createdAt)} - {alert.urgencyLevel}</div>
                </div>
                <Link to="/donor/alerts" className="btn btn-sm btn-primary">Respond</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted">No recent alerts.</p>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
