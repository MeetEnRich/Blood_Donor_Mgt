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
      const res = await api.get(`/requests/${id}`).catch(() => ({ data: null }));
      if (res.data && res.data.request) {
        setRequest(res.data.request);
      } else if (res.data) {
        setRequest(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    try {
      await api.put(`/requests/${id}/delivered`);
      fetchRequest();
    } catch (err) {
      alert('Failed to mark as delivered');
    }
  };

  const [recordedDonors, setRecordedDonors] = useState([]);

  const handleRecordDonation = async (donorId) => {
    try {
      const payload = {
        date: new Date().toISOString(),
        facilityName: request.hospitalId?.facilityName || 'Hospital',
        units: 1
      };
      await api.post(`/donors/${donorId}/donation`, payload);
      setRecordedDonors(prev => [...prev, donorId]);

      // After recording, mark the request as fulfilled
      await api.put(`/requests/${id}/delivered`);
      fetchRequest();
    } catch (err) {
      console.error(err);
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

              {/* Render Accepted Donors if any exist */}
              {request.acceptedDonors && request.acceptedDonors.length > 0 && (
                <div className="mt-3">
                  <p><strong>Accepted Donors (Pending Verification):</strong></p>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                    {request.acceptedDonors.map(donor => (
                      <li key={donor._id} className="flex justify-between items-center p-2 mb-2" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <strong>{donor.fullName}</strong> <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{donor.bloodGroup}</span>
                          <div className="text-muted text-sm">{donor.phone || 'No phone provided'}</div>
                        </div>
                        {recordedDonors.includes(donor._id) || request.status === 'fulfilled' ? (
                          <span className="badge badge-success" style={{ padding: '0.35rem 0.75rem' }}>✓ Donated</span>
                        ) : (
                          <button className="btn btn-sm btn-success" onClick={() => handleRecordDonation(donor._id)}>
                            Record Donation
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {request.status === 'fulfilled' && request.reservedUnits && request.reservedUnits.length > 0 && (
                <div className="mt-3">
                  <p><strong>Reserved Units:</strong></p>
                  <ul style={{ paddingLeft: '1.5rem' }}>
                    {request.reservedUnits.map(unit => (
                      <li key={unit._id}>{unit.unitCode} ({unit.componentType})</li>
                    ))}
                  </ul>
                  {request.reservedUnits.some(u => u.status === 'reserved') && (
                    <button className="btn btn-success mt-3" style={{ width: '100%' }} onClick={handleMarkDelivered}>
                      Mark as Delivered
                    </button>
                  )}
                  {request.reservedUnits.every(u => u.status === 'delivered') && (
                    <div className="text-success font-medium mt-3">✓ All units delivered to facility.</div>
                  )}
                </div>
              )}

              {request.status === 'fulfilled' && (!request.reservedUnits || request.reservedUnits.length === 0) && (
                <div className="mt-3 text-success font-medium">
                  ✓ Request successfully fulfilled via direct donor donation.
                </div>
              )}

              {request.status !== 'sos_dispatched' && request.status !== 'fulfilled' && (!request.acceptedDonors || request.acceptedDonors.length === 0) && (
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
