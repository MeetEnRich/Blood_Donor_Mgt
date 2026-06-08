import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { formatDate } from '../../utils/formatDate';

const DonationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/donor/history').catch(() => ({ data: [] }));
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>My Donation History</h1>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Facility</th>
                <th>Units Donated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center">Loading...</td></tr>
              ) : history.length > 0 ? (
                history.map((record, idx) => (
                  <tr key={idx}>
                    <td>{formatDate(record.donationDate || record.date)}</td>
                    <td>{record.facilityName || 'System Record'}</td>
                    <td>{record.units || 1}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center">You haven't made any donations yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonationHistory;
