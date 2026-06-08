/**
 * Calculate the System Usability Scale (SUS) score from 10 responses.
 * 
 * SUS scoring algorithm:
 * - Odd-numbered questions (1,3,5,7,9): subtract 1 from the response
 * - Even-numbered questions (2,4,6,8,10): subtract the response from 5
 * - Sum all adjusted scores and multiply by 2.5
 * 
 * @param {number[]} responses - Array of 10 responses, each 1-5
 * @returns {number} SUS score (0-100)
 */
const calculateSUS = (responses) => {
  if (!responses || responses.length !== 10) {
    throw new Error('SUS calculation requires exactly 10 responses');
  }

  let total = 0;
  for (let i = 0; i < 10; i++) {
    const response = responses[i];
    if (response < 1 || response > 5) {
      throw new Error(`Response ${i + 1} must be between 1 and 5`);
    }
    if ((i + 1) % 2 === 1) {
      // Odd questions (1-indexed): response - 1
      total += response - 1;
    } else {
      // Even questions (1-indexed): 5 - response
      total += 5 - response;
    }
  }

  return total * 2.5;
};

module.exports = { calculateSUS };
