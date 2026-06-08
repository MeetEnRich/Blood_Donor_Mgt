import React from 'react';

const ExpiryAlert = ({ count }) => {
  if (!count || count === 0) return null;

  return (
    <div style={{
      backgroundColor: '#fef5e7',
      border: '1px solid #f39c12',
      color: '#d68910',
      padding: '1rem',
      borderRadius: '4px',
      marginBottom: '1rem',
      fontWeight: '500'
    }}>
      ⚠ Alert: {count} unit(s) expiring within the next 3 days.
    </div>
  );
};

export default ExpiryAlert;
