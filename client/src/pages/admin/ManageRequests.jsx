import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import RequestStatusBadge from '../../components/request/RequestStatusBadge';
import { formatDateTime } from '../../utils/formatDate';

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests').catch(() => ({ data: { requests: [] } }));
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center page-header">
        <h1>All Blood Requests</h1>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hospital</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center">Loading...</td></tr>
              ) : requests.length > 0 ? (
                requests.map(req => (
                  <tr key={req._id}>
                    <td>{req._id.substring(0, 8)}...</td>
                    <td>{req.hospital?.facilityName || 'Unknown'}</td>
                    <td><span className="badge badge-primary">{req.bloodGroup}</span></td>
                    <td>{req.unitsRequired}</td>
                    <td><span className={`badge badge-${req.urgencyLevel === 'Critical' ? 'danger' : 'secondary'}`}>{req.urgencyLevel}</span></td>
                    <td><RequestStatusBadge status={req.status} /></td>
                    <td>{formatDateTime(req.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center">No requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageRequests;
