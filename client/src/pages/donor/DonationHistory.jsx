import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { formatDate } from '../../utils/formatDate';

const DonationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

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

  // Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = history.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(history.length / rowsPerPage);

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
              ) : currentRows.length > 0 ? (
                currentRows.map((record, idx) => (
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

export default DonationHistory;
