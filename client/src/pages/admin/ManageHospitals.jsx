import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import './ManageHospitals.css';

const ManageHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const rowsPerPage = 5;

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterStatus]);

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

  // Filter calculations
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesType = filterType ? hospital.facilityType === filterType : true;
    const matchesStatus = filterStatus ? hospital.status === filterStatus : true;
    return matchesType && matchesStatus;
  });

  // Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredHospitals.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredHospitals.length / rowsPerPage);

  return (
    <div>
      <div className="flex justify-between items-center page-header">
        <h1>Manage Hospitals</h1>
      </div>

      <div className="card">
        <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Hospitals List</h3>
          <div className="flex gap-2">
            <select 
              className="form-control" 
              style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: 'auto' }} 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Hospital">Hospital</option>
              <option value="Clinic">Clinic</option>
              <option value="Blood Bank">Blood Bank</option>
              <option value="Health Centre">Health Centre</option>
            </select>
            <select 
              className="form-control" 
              style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: 'auto' }} 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
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
              ) : currentRows.length > 0 ? (
                currentRows.map(hospital => (
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

        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center mt-3">
            <button 
              className="btn btn-sm btn-outline" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            <span className="text-sm text-muted">Page {currentPage} of {totalPages}</span>
            <button 
              className="btn btn-sm btn-outline" 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageHospitals;
