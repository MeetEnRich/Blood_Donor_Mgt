import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { formatDate } from '../../utils/formatDate';
import './ManageDonors.css';

const ManageDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const rowsPerPage = 5;
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterBloodGroup, filterStatus]);

  const fetchDonors = async () => {
    try {
      const res = await api.get('/donors');
      setDonors(res.data.donors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const action = status === 'approved' ? 'approve' : 'suspend';
      await api.put(`/donors/${id}/${action}`);
      fetchDonors();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donor account? This action cannot be undone.')) {
      try {
        await api.delete(`/donors/${id}`);
        fetchDonors();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete account');
      }
    }
  };

  // Filter calculations
  const filteredDonors = donors.filter(donor => {
    const matchesGroup = filterBloodGroup ? donor.bloodGroup === filterBloodGroup : true;
    const matchesStatus = filterStatus ? donor.status === filterStatus : true;
    return matchesGroup && matchesStatus;
  });

  // Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredDonors.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredDonors.length / rowsPerPage);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>Manage Donors</h1>
      </div>

      <div className="card">
        <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Donors List</h3>
          <div className="flex gap-2">
            <select 
              className="form-control" 
              style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: 'auto' }} 
              value={filterBloodGroup} 
              onChange={e => setFilterBloodGroup(e.target.value)}
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
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
              ) : currentRows.length > 0 ? (
                currentRows.map(donor => (
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
                        <button className="btn btn-sm btn-danger" onClick={() => updateStatus(donor._id, 'suspended')} style={{ marginRight: '0.5rem' }}>Suspend</button>
                      )}
                      <button className="btn btn-sm btn-outline" onClick={() => handleDelete(donor._id)} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center">No donors found</td></tr>
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

export default ManageDonors;
