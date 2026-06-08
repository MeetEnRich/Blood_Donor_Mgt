const cron = require('node-cron');
const BloodUnit = require('../models/BloodUnit');

/**
 * Start the daily expiry alert cron job.
 * Runs at midnight (00:00) every day.
 * 
 * 1. Find units expiring within EXPIRY_ALERT_DAYS days — log alerts
 * 2. Find expired units (expirationDate < now) — bulk update status to 'expired'
 */
const startExpiryAlertJob = () => {
  const cronExpression = '0 0 * * *'; // Midnight daily

  console.log('⏰ Expiry alert cron job scheduled (daily at midnight)');

  cron.schedule(cronExpression, async () => {
    try {
      console.log('🔍 Running expiry alert check...');

      const alertDays = parseInt(process.env.EXPIRY_ALERT_DAYS) || 3;
      const now = new Date();
      const alertThreshold = new Date(now.getTime() + alertDays * 24 * 60 * 60 * 1000);

      // 1. Find units expiring soon (within EXPIRY_ALERT_DAYS)
      const expiringSoon = await BloodUnit.find({
        status: 'available',
        expirationDate: { $lte: alertThreshold, $gt: now }
      }).populate('facilityId', 'facilityName').lean();

      if (expiringSoon.length > 0) {
        console.log(`⚠️  ${expiringSoon.length} blood unit(s) expiring within ${alertDays} days:`);
        expiringSoon.forEach(unit => {
          console.log(`   - ${unit.unitCode} (${unit.bloodGroup}) expires ${unit.expirationDate.toISOString().split('T')[0]} at ${unit.facilityId?.facilityName || 'Unknown facility'}`);
        });
      } else {
        console.log('✅ No blood units expiring soon.');
      }

      // 2. Bulk update expired units
      const expiredResult = await BloodUnit.updateMany(
        {
          status: 'available',
          expirationDate: { $lt: now }
        },
        {
          $set: { status: 'expired', updatedAt: now }
        }
      );

      if (expiredResult.modifiedCount > 0) {
        console.log(`🔴 ${expiredResult.modifiedCount} blood unit(s) marked as expired.`);
      } else {
        console.log('✅ No expired blood units to update.');
      }

      console.log('✅ Expiry alert check completed.');
    } catch (error) {
      console.error('❌ Expiry alert job error:', error.message);
    }
  });
};

module.exports = { startExpiryAlertJob };
