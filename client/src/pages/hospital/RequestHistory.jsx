import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import RequestStatusBadge from '../../components/request/RequestStatusBadge';
import { formatDateTime } from '../../utils/formatDate';

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const rowsPerPage = 5;
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterBloodGroup, filterStatus]);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/my').catch(() => ({ data: { requests: [] } }));
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        await api.put(`/requests/${id}/cancel`);
        fetchRequests();
      } catch (err) {
        alert('Failed to cancel request');
      }
    }
  };

  // Filter calculations
  const filteredRequests = requests.filter(req => {
    const matchesGroup = filterBloodGroup ? req.bloodGroup === filterBloodGroup : true;
    const matchesStatus = filterStatus ? req.status === filterStatus : true;
    return matchesGroup && matchesStatus;
  });

  // Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRequests.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>My Requests</h1>
      </div>

      <div className="card">
        <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Request List</h3>
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
              <option value="submitted">Submitted</option>
              <option value="fulfilling">Fulfilling</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="sos_dispatched">SOS Dispatched</option>
              <option value="pending_donation">Pending Donation</option>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center">Loading...</td></tr>
              ) : currentRows.length > 0 ? (
                currentRows.map(req => (
                  <tr key={req._id}>
                    <td>{formatDateTime(req.createdAt)}</td>
                    <td><span className="badge badge-primary">{req.bloodGroup}</span></td>
                    <td>{req.unitsRequired}</td>
                    <td><span className={`badge badge-${req.urgencyLevel === 'Critical' ? 'danger' : 'secondary'}`}>{req.urgencyLevel}</span></td>
                    <td><RequestStatusBadge status={req.status} /></td>
                    <td>
                      <Link to={`/hospital/requests/${req._id}`} className="btn btn-sm btn-outline" style={{ marginRight: '0.5rem' }}>View</Link>
                      {(req.status === 'submitted' || req.status === 'fulfilling' || req.status === 'sos_dispatched') && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleCancel(req._id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center">No requests found.</td></tr>
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

export default RequestHistory;
