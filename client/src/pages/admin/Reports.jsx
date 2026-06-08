import React from 'react';
import './Reports.css';

const Reports = () => {
  return (
    <div>
      <div className="page-header">
        <h1>System Reports</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <h3>Fulfillment Report</h3>
          <p className="text-muted mb-2">Metrics on request fulfillment</p>
          <div className="flex justify-between items-center p-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <span>Total Requests</span>
            <strong>124</strong>
          </div>
          <div className="flex justify-between items-center p-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <span>Fulfilled via Inventory</span>
            <strong>86 (69%)</strong>
          </div>
          <div className="flex justify-between items-center p-2">
            <span>Fulfilled via SOS</span>
            <strong>22 (18%)</strong>
          </div>
          <button className="btn btn-outline btn-sm mt-3 w-100">Export CSV</button>
        </div>

        <div className="card">
          <h3>SUS Usability Scores</h3>
          <p className="text-muted mb-2">System Usability Scale responses</p>
          <div className="text-center" style={{ padding: '2rem 0' }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--success)' }}>84.5</h2>
            <p className="text-muted">Average SUS Score (Excellent)</p>
          </div>
          <button className="btn btn-outline btn-sm w-100">Export Feedback Data</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
