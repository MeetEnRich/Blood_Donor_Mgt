import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import BloodGroupCard from '../../components/inventory/BloodGroupCard';
import { formatDate } from '../../utils/formatDate';
import './ManageInventory.css';

const ManageInventory = () => {
  const [summary, setSummary] = useState({});
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const rowsPerPage = 5;
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterBloodGroup, filterStatus]);

  const fetchData = async () => {
    try {
      const [sumRes, invRes] = await Promise.all([
        api.get('/inventory/summary').catch(() => ({ data: { summary: {} } })),
        api.get('/inventory?limit=100').catch(() => ({ data: { units: [] } }))
      ]);
      setSummary(sumRes.data.summary || {});
      setInventory(invRes.data.units || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter calculations
  const filteredInventory = inventory.filter(unit => {
    const matchesGroup = filterBloodGroup ? unit.bloodGroup === filterBloodGroup : true;
    const matchesStatus = filterStatus ? unit.status === filterStatus : true;
    return matchesGroup && matchesStatus;
  });

  // Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredInventory.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredInventory.length / rowsPerPage);

  return (
    <div>
      <div className="flex justify-between items-center page-header" style={{ marginBottom: '1rem' }}>
        <h1>Blood Inventory</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Unit</button>
      </div>

      <div className="grid grid-cols-4 gap-2" style={{ marginBottom: '2rem' }}>
        {bloodGroups.map(bg => (
          <BloodGroupCard key={bg} bloodGroup={bg} count={summary[bg] || 0} />
        ))}
      </div>

      <div className="card">
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Inventory List</h3>
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
              <option value="reserved">Reserved</option>
              <option value="delivered">Delivered</option>
              <option value="expired">Expired</option>
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
                <th>Collection Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Facility</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center">Loading...</td></tr>
              ) : currentRows.length > 0 ? (
                currentRows.map(unit => (
                  <tr key={unit._id}>
                    <td>{unit.unitCode}</td>
                    <td><span className="badge badge-primary">{unit.bloodGroup}</span></td>
                    <td>{unit.componentType}</td>
                    <td>{formatDate(unit.collectionDate)}</td>
                    <td>{formatDate(unit.expirationDate || unit.expiryDate)}</td>
                    <td>
                      <span className={`badge badge-${unit.status === 'available' ? 'success' : unit.status === 'reserved' ? 'warning' : 'danger'}`}>
                        {unit.status}
                      </span>
                    </td>
                    <td>{unit.facilityId?.facilityName || 'System'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center">No inventory records found</td></tr>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h3>Add Unit (Mock)</h3>
            <p className="text-muted mt-2">Form logic goes here.</p>
            <div className="flex justify-end gap-2 mt-3">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInventory;
