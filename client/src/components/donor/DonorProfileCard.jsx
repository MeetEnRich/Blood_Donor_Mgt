import React from 'react';

const DonorProfileCard = ({ donor }) => {
  if (!donor) return null;

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>Profile Information</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-muted text-sm" style={{ marginRight: '0.35rem' }}>Full Name:</span>
          <strong>{donor.fullName || donor.name}</strong>
        </div>
        <div>
          <span className="text-muted text-sm" style={{ marginRight: '0.35rem' }}>Blood Group:</span>
          <strong>{donor.bloodGroup}</strong>
        </div>
        <div>
          <span className="text-muted text-sm" style={{ marginRight: '0.35rem' }}>Genotype:</span>
          <strong>{donor.genotype || '—'}</strong>
        </div>
        <div>
          <span className="text-muted text-sm" style={{ marginRight: '0.35rem' }}>Phone:</span>
          <strong>{donor.phone || '—'}</strong>
        </div>
        <div>
          <span className="text-muted text-sm" style={{ marginRight: '0.35rem' }}>Email:</span>
          <strong>{donor.email || '—'}</strong>
        </div>
        <div>
          <span className="text-muted text-sm" style={{ marginRight: '0.35rem' }}>Address:</span>
          <strong>{donor.address || '—'}</strong>
        </div>
      </div>
    </div>
  );
};

export default DonorProfileCard;
