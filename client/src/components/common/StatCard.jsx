import React from 'react';
import './StatCard.css';

const StatCard = ({ label, value, colorAccent }) => {
  return (
    <div className="stat-card" style={{ borderLeftColor: colorAccent || 'var(--primary)' }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
};

export default StatCard;
