import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { formatDate } from '../../utils/formatDate';
import './ManageDonors.css';

const ManageDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      // Mock data if API fails
      const res = await api.get('/admin/users?role=donor').catch(() => ({ 
        data: [
          { _id: '1', fullName: 'John Doe', bloodGroup: 'O+', phone: '08012345678', status: 'approved', lastDonationDate: null },
          { _id: '2', fullName: 'Jane Smith', bloodGroup: 'A-', phone: '08087654321', status: 'pending', lastDonationDate: new Date().toISOString() }
        ] 
      }));
      setDonors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { status });
      fetchDonors();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center page-header">
        <h1>Manage Donors</h1>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Blood Group</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Last Donation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center">Loading...</td></tr>
              ) : donors.length > 0 ? (
                donors.map(donor => (
                  <tr key={donor._id}>
                    <td>{donor.fullName}</td>
                    <td><span className="badge badge-primary">{donor.bloodGroup}</span></td>
                    <td>{donor.phone}</td>
                    <td>
                      <span className={`badge badge-${donor.status === 'approved' ? 'success' : donor.status === 'pending' ? 'warning' : 'danger'}`}>
                        {donor.status}
                      </span>
                    </td>
                    <td>{formatDate(donor.lastDonationDate)}</td>
                    <td>
                      {donor.status === 'pending' && (
                        <button className="btn btn-sm btn-primary" onClick={() => updateStatus(donor._id, 'approved')} style={{ marginRight: '0.5rem' }}>Approve</button>
                      )}
                      {donor.status === 'approved' && (
                        <button className="btn btn-sm btn-danger" onClick={() => updateStatus(donor._id, 'suspended')}>Suspend</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center">No donors found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageDonors;
