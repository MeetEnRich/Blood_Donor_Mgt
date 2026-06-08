import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import BloodGroupCard from '../../components/inventory/BloodGroupCard';

const InventoryView = () => {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get('/inventory/summary').catch(() => ({ data: {} }));
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Network Blood Availability</h1>
        <p className="text-muted">Real-time view of available blood units across the network.</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {bloodGroups.map(bg => (
            <BloodGroupCard key={bg} bloodGroup={bg} count={summary[bg] || 0} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryView;
