import React from 'react';
import './RequestStatusBadge.css';

const RequestStatusBadge = ({ status }) => {
  const normalizedStatus = (status || '').toLowerCase();
  
  let badgeClass = 'badge-default';
  let displayStatus = status;

  switch(normalizedStatus) {
    case 'submitted':
      badgeClass = 'badge-grey';
      displayStatus = 'Submitted';
      break;
    case 'fulfilling':
      badgeClass = 'badge-blue';
      displayStatus = 'Fulfilling';
      break;
    case 'fulfilled':
      badgeClass = 'badge-green';
      displayStatus = 'Fulfilled';
      break;
    case 'sos_dispatched':
      badgeClass = 'badge-orange';
      displayStatus = 'SOS Dispatched';
      break;
    case 'pending_donation':
      badgeClass = 'badge-blue';
      displayStatus = 'Pending Donation';
      break;
    case 'unfulfilled':
      badgeClass = 'badge-red';
      displayStatus = 'Unfulfilled';
      break;
    case 'cancelled':
      badgeClass = 'badge-grey-strike';
      displayStatus = 'Cancelled';
      break;
    default:
      displayStatus = status || 'Unknown';
  }

  return (
    <span className={`request-status-badge ${badgeClass}`}>
      {displayStatus}
    </span>
  );
};

export default RequestStatusBadge;
