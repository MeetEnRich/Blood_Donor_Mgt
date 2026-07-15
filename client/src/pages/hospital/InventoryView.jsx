import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import BloodGroupCard from '../../components/inventory/BloodGroupCard';
import { formatDate } from '../../utils/formatDate';

const InventoryView = () => {
  const [summary, setSummary] = useState({});
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const rowsPerPage = 5;
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchInventory = async () => {
    try {
      const [summaryRes, unitsRes] = await Promise.all([
        api.get('/inventory/summary').catch(() => ({ data: { summary: {} } })),
        api.get('/inventory?limit=100').catch(() => ({ data: { units: [] } }))
      ]);
      setSummary(summaryRes.data.summary || {});
      setUnits(unitsRes.data.units || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterBloodGroup, filterStatus]);

  const handleConsume = async (unitId) => {
    try {
      await api.put(`/inventory/${unitId}`, { status: 'delivered' });
      fetchInventory();
    } catch (err) {
      alert('Failed to update blood unit');
    }
  };

  const handleDiscard = async (unitId) => {
    if (window.confirm('Are you sure you want to discard this blood unit?')) {
      try {
        await api.put(`/inventory/${unitId}/discard`);
        fetchInventory();
      } catch (err) {
        alert('Failed to discard blood unit');
      }
    }
  };

  // Filter calculations
  const filteredUnits = units.filter(unit => {
    const matchesGroup = filterBloodGroup ? unit.bloodGroup === filterBloodGroup : true;
    const matchesStatus = filterStatus ? unit.status === filterStatus : true;
    return matchesGroup && matchesStatus;
  });

  // Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUnits.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredUnits.length / rowsPerPage);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>Network Blood Availability</h1>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2" style={{ marginBottom: '1.5rem' }}>
            {bloodGroups.map(bg => (
              <BloodGroupCard key={bg} bloodGroup={bg} count={summary[bg] || 0} />
            ))}
          </div>

          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Our Blood Inventory</h3>
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
                  <option value="available">Available</option>
                  <option value="delivered">Delivered</option>
                  <option value="discarded">Discarded</option>
                </select>
              </div>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Unit Code</th>
                    <th>Blood Group</th>
                    <th>Component</th>
                    <th>Collected</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.length > 0 ? (
                    currentRows.map(unit => (
                      <tr key={unit._id}>
                        <td><strong>{unit.unitCode}</strong></td>
                        <td><span className="badge badge-primary">{unit.bloodGroup}</span></td>
                        <td>{unit.componentType}</td>
                        <td>{formatDate(unit.collectionDate)}</td>
                        <td>{formatDate(unit.expirationDate)}</td>
                        <td>
                          <span className={`badge badge-${
                            unit.status === 'available' ? 'success' :
                            unit.status === 'delivered' ? 'secondary' : 'danger'
                          }`}>
                            {unit.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {unit.status === 'available' && (
                            <div className="flex gap-1" style={{ justifyContent: 'flex-end' }}>
                              <button 
                                className="btn btn-sm btn-success" 
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} 
                                onClick={() => handleConsume(unit._id)}
                              >
                                Use Unit
                              </button>
                              <button 
                                className="btn btn-sm btn-danger" 
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} 
                                onClick={() => handleDiscard(unit._id)}
                              >
                                Discard
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">No blood units in your local inventory.</td>
                    </tr>
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
        </>
      )}
    </div>
  );
};

export default InventoryView;
