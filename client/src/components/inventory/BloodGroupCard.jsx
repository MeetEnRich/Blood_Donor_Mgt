import React from 'react';
import './BloodGroupCard.css';

const BloodGroupCard = ({ bloodGroup, count }) => {
  return (
    <div className="blood-group-card">
      <div className="bg-circle">{bloodGroup}</div>
      <div className="bg-count">
        <span className="count-val">{count || 0}</span>
        <span className="count-label">Units</span>
      </div>
    </div>
  );
};

export default BloodGroupCard;
