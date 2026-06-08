import React from 'react';
import { isDonorEligible, nextEligibleDate } from '../../utils/eligibility';
import { formatDate } from '../../utils/formatDate';
import './EligibilityBadge.css';

const EligibilityBadge = ({ lastDonationDate }) => {
  const eligible = isDonorEligible(lastDonationDate);

  if (eligible) {
    return <span className="eligibility-badge eligible">Eligible to Donate</span>;
  }

  const nextDate = nextEligibleDate(lastDonationDate);
  return (
    <span className="eligibility-badge ineligible">
      Eligible on {formatDate(nextDate)}
    </span>
  );
};

export default EligibilityBadge;
