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
        const [profileRes, alertsRes] = await Promise.all([
          api.get('/donors/me'),
          api.get('/donors/me/alerts').catch(() => ({ data: { alerts: [] } }))
        ]);
        
        const donorData = profileRes.data.donor;
        const alertsData = alertsRes.data?.alerts || [];

        let daysSince = null;
        if (donorData.lastDonationDate) {
          const diffTime = Math.abs(new Date() - new Date(donorData.lastDonationDate));
          daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        setDashboardData({
          donor: donorData,
          stats: { 
            totalDonations: donorData.donationHistory ? donorData.donationHistory.length : 0, 
            daysSinceLastDonation: daysSince 
          },
          recentAlerts: alertsData.slice(0, 5)
        });
      } catch (err) {
        console.error('Failed to fetch donor dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  if (loading || !dashboardData) return <div>Loading dashboard...</div>;

  const { donor, stats, recentAlerts } = dashboardData;

  return (
    <div>
      <div className="flex justify-between items-center page-header">
        <h1>Donor Dashboard</h1>
        <EligibilityBadge lastDonationDate={donor.lastDonationDate} />
      </div>

      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '1rem' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <DonorProfileCard donor={donor} />
        </div>
        <StatCard label="Total Donations" value={stats.totalDonations} />
        <StatCard 
          label="Days Since Last Donation" 
          value={stats.daysSinceLastDonation !== null ? stats.daysSinceLastDonation : 'N/A'} 
          colorAccent="var(--secondary)" 
        />
      </div>

      <div className="card">
        <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Recent SOS Alerts</h3>
          <Link to="/donor/alerts" className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>View All</Link>
        </div>
        
        {recentAlerts && recentAlerts.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {recentAlerts.map(alert => (
              <li key={alert._id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{alert.hospitalId?.facilityName || 'Unknown Facility'}</strong> needs <strong>{alert.bloodGroup}</strong>
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
