/**
 * Check if a donor is eligible to donate blood.
 * Donors must wait at least 90 days between donations.
 * @param {Date|null} lastDonationDate - The date of the donor's last donation
 * @returns {boolean} true if eligible to donate
 */
const isDonorEligible = (lastDonationDate) => {
  if (!lastDonationDate) return true;
  const now = new Date();
  const last = new Date(lastDonationDate);
  const diffInDays = (now - last) / (1000 * 60 * 60 * 24);
  return diffInDays >= 90;
};

/**
 * Calculate the next eligible donation date.
 * @param {Date|null} lastDonationDate - The date of the donor's last donation
 * @returns {Date|null} The next eligible date, or null if already eligible
 */
const nextEligibleDate = (lastDonationDate) => {
  if (!lastDonationDate) return null;
  const last = new Date(lastDonationDate);
  const eligible = new Date(last.getTime() + 90 * 24 * 60 * 60 * 1000);
  const now = new Date();
  if (eligible <= now) return null;
  return eligible;
};

module.exports = { isDonorEligible, nextEligibleDate };
