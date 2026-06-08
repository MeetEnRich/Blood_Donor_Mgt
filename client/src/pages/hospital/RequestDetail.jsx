import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import RequestStatusBadge from '../../components/request/RequestStatusBadge';
import { formatDateTime } from '../../utils/formatDate';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
    // Poll every 5 seconds
    const interval = setInterval(fetchRequest, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchRequest = async () => {
    try {
      // Assuming GET /hospital/requests/:id exists. Fallback if not.
      const res = await api.get(`/hospital/requests/${id}`).catch(() => ({ data: null }));
      if (res.data) setRequest(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    try {
      await api.post(`/hospital/requests/${id}/deliver`);
      fetchRequest();
    } catch (err) {
      alert('Failed to mark as delivered');
    }
  };

  if (loading && !request) return <div>Loading...</div>;
  if (!request) return <div>Request not found.</div>;

  return (
    <div>
      <div className="flex justify-between items-center page-header">
        <h1>Request Detail</h1>
        <button className="btn btn-outline" onClick={() => navigate('/hospital/requests')}>Back to List</button>
      </div>

      <div className="card">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3>Basic Info</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', lineHeight: '2' }}>
              <li><strong>ID:</strong> {request._id}</li>
              <li><strong>Blood Group:</strong> <span className="badge badge-primary">{request.bloodGroup}</span></li>
              <li><strong>Units Required:</strong> {request.unitsRequired}</li>
              <li><strong>Urgency:</strong> {request.urgencyLevel}</li>
              <li><strong>Date Submitted:</strong> {formatDateTime(request.createdAt)}</li>
              <li><strong>Status:</strong> <RequestStatusBadge status={request.status} /></li>
              {request.notes && <li><strong>Notes:</strong> {request.notes}</li>}
            </ul>
          </div>

          <div>
            <h3>Fulfillment Details</h3>
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              {request.status === 'sos_dispatched' && (
                <div>
                  <p><strong>SOS Status:</strong> Dispatched</p>
                  <p className="text-muted text-sm mt-2">Waiting for eligible donors to accept the request.</p>
                </div>
              )}
              
              {request.status === 'fulfilled' && (
                <div>
                  <p><strong>Reserved Units:</strong></p>
                  <ul style={{ paddingLeft: '1.5rem' }}>
                    {request.fulfilledUnits?.map(unit => (
                      <li key={unit._id}>{unit.unitCode}</li>
                    )) || <li>Units allocated from inventory.</li>}
                  </ul>
                  <button className="btn btn-success mt-3 w-100" onClick={handleMarkDelivered}>
                    Mark as Delivered
                  </button>
                </div>
              )}

              {request.status !== 'sos_dispatched' && request.status !== 'fulfilled' && (
                <p className="text-muted">No fulfillment details available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
