import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import './ManageHospitals.css';

const ManageHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/admin/users?role=hospital').catch(() => ({ 
        data: [
          { _id: '1', facilityName: 'Lagos State Hospital', facilityType: 'Public', state: 'Lagos', status: 'approved' },
          { _id: '2', facilityName: 'Abuja Central Clinic', facilityType: 'Private', state: 'FCT', status: 'pending' }
        ] 
      }));
      setHospitals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { status });
      fetchHospitals();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center page-header">
        <h1>Manage Hospitals</h1>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Facility Name</th>
                <th>Type</th>
                <th>State</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center">Loading...</td></tr>
              ) : hospitals.length > 0 ? (
                hospitals.map(hospital => (
                  <tr key={hospital._id}>
                    <td>{hospital.facilityName}</td>
                    <td>{hospital.facilityType}</td>
                    <td>{hospital.state}</td>
                    <td>
                      <span className={`badge badge-${hospital.status === 'approved' ? 'success' : hospital.status === 'pending' ? 'warning' : 'danger'}`}>
                        {hospital.status}
                      </span>
                    </td>
                    <td>
                      {hospital.status === 'pending' && (
                        <button className="btn btn-sm btn-primary" onClick={() => updateStatus(hospital._id, 'approved')} style={{ marginRight: '0.5rem' }}>Approve</button>
                      )}
                      {hospital.status === 'approved' && (
                        <button className="btn btn-sm btn-danger" onClick={() => updateStatus(hospital._id, 'suspended')}>Suspend</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center">No hospitals found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageHospitals;
