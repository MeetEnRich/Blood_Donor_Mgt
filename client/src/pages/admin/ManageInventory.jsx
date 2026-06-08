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
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, invRes] = await Promise.all([
        api.get('/inventory/summary').catch(() => ({ data: {} })),
        api.get('/inventory').catch(() => ({ data: [] }))
      ]);
      setSummary(sumRes.data);
      setInventory(invRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center page-header">
        <h1>Blood Inventory</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Unit</button>
      </div>

      <div className="grid grid-cols-4 gap-2" style={{ marginBottom: '2rem' }}>
        {bloodGroups.map(bg => (
          <BloodGroupCard key={bg} bloodGroup={bg} count={summary[bg] || 0} />
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Inventory List</h3>
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
              ) : inventory.length > 0 ? (
                inventory.map(unit => (
                  <tr key={unit._id}>
                    <td>{unit.unitCode}</td>
                    <td><span className="badge badge-primary">{unit.bloodGroup}</span></td>
                    <td>{unit.componentType}</td>
                    <td>{formatDate(unit.collectionDate)}</td>
                    <td>{formatDate(unit.expiryDate)}</td>
                    <td>
                      <span className={`badge badge-${unit.status === 'available' ? 'success' : unit.status === 'reserved' ? 'warning' : 'danger'}`}>
                        {unit.status}
                      </span>
                    </td>
                    <td>{unit.facility?.facilityName || 'System'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center">No inventory records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
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
