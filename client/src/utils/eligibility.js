export function isDonorEligible(lastDonationDate) {
  if (!lastDonationDate) return true;
  const daysSince = (Date.now() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24);
  return daysSince >= 90;
}

export function nextEligibleDate(lastDonationDate) {
  if (!lastDonationDate) return null;
  const next = new Date(lastDonationDate);
  next.setDate(next.getDate() + 90);
  return next;
}

export function daysUntilEligible(lastDonationDate) {
  if (!lastDonationDate) return 0;
  const next = nextEligibleDate(lastDonationDate);
  const diff = Math.ceil((next - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}
