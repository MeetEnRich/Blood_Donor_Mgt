import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import RequestStatusBadge from '../../components/request/RequestStatusBadge';
import { formatDateTime } from '../../utils/formatDate';

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/hospital/requests').catch(() => ({ data: { requests: [] } }));
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
        await api.patch(`/hospital/requests/${id}/cancel`);
        fetchRequests();
      } catch (err) {
        alert('Failed to cancel request');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>My Requests</h1>
      </div>

      <div className="card">
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
              ) : requests.length > 0 ? (
                requests.map(req => (
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
      </div>
    </div>
  );
};

export default RequestHistory;
