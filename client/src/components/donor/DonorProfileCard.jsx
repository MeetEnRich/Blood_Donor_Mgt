import React from 'react';

const DonorProfileCard = ({ donor }) => {
  if (!donor) return null;

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>Profile Information</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-muted text-sm block">Full Name</span>
          <strong>{donor.fullName || donor.name}</strong>
        </div>
        <div>
          <span className="text-muted text-sm block">Blood Group</span>
          <strong>{donor.bloodGroup}</strong>
        </div>
        <div>
          <span className="text-muted text-sm block">Genotype</span>
          <strong>{donor.genotype || '—'}</strong>
        </div>
        <div>
          <span className="text-muted text-sm block">Phone</span>
          <strong>{donor.phone || '—'}</strong>
        </div>
        <div>
          <span className="text-muted text-sm block">Email</span>
          <strong>{donor.email || '—'}</strong>
        </div>
        <div>
          <span className="text-muted text-sm block">Address</span>
          <strong>{donor.address || '—'}</strong>
        </div>
      </div>
    </div>
  );
};

export default DonorProfileCard;
