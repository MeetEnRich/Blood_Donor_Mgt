const cron = require('node-cron');
const BloodUnit = require('../models/BloodUnit');
const Hospital = require('../models/Hospital');
const { Op } = require('sequelize');

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
      const expiringSoon = await BloodUnit.findAll({
        where: {
          status: 'available',
          expirationDate: {
            [Op.lte]: alertThreshold,
            [Op.gt]: now
          }
        },
        include: [{ model: Hospital, as: 'hospital', attributes: ['facilityName'] }]
      });

      const plainExpiringSoon = expiringSoon.map(u => {
        const plain = u.toObject();
        plain.facilityId = plain.hospital || null;
        return plain;
      });

      if (plainExpiringSoon.length > 0) {
        console.log(`⚠️  ${plainExpiringSoon.length} blood unit(s) expiring within ${alertDays} days:`);
        plainExpiringSoon.forEach(unit => {
          console.log(`   - ${unit.unitCode} (${unit.bloodGroup}) expires ${new Date(unit.expirationDate).toISOString().split('T')[0]} at ${unit.facilityId?.facilityName || 'Unknown facility'}`);
        });
      } else {
        console.log('✅ No blood units expiring soon.');
      }

      // 2. Bulk update expired units
      const [modifiedCount] = await BloodUnit.update(
        { status: 'expired', updatedAt: now },
        {
          where: {
            status: 'available',
            expirationDate: { [Op.lt]: now }
          }
        }
      );

      if (modifiedCount > 0) {
        console.log(`🔴 ${modifiedCount} blood unit(s) marked as expired.`);
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
