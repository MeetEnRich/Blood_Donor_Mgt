const { getMessaging } = require('../config/firebase');

/**
 * Send an SOS alert to multiple donors via FCM (or mock).
 * 
 * @param {string[]} tokens - Array of FCM tokens
 * @param {Object} alertData - Alert data including blood group, hospital, urgency
 * @returns {Promise<Object>} Result of the multicast send
 */
const sendSOSAlert = async (tokens, alertData) => {
  try {
    if (!tokens || tokens.length === 0) {
      console.warn('No FCM tokens provided for SOS alert');
      return { successCount: 0, failureCount: 0, responses: [] };
    }

    const messaging = getMessaging();

    const message = {
      tokens,
      notification: {
        title: `🚨 SOS: ${alertData.bloodGroup} Blood Needed!`,
        body: `${alertData.hospitalName || 'A hospital'} urgently needs ${alertData.bloodGroup} blood. ${alertData.urgencyLevel || 'Urgent'} request. Can you help?`
      },
      data: {
        type: 'SOS_ALERT',
        requestId: String(alertData.requestId || ''),
        bloodGroup: String(alertData.bloodGroup || ''),
        hospitalName: String(alertData.hospitalName || ''),
        urgencyLevel: String(alertData.urgencyLevel || 'Routine'),
        timestamp: new Date().toISOString()
      }
    };

    console.log(`📤 Sending SOS alert to ${tokens.length} donor(s) for ${alertData.bloodGroup} blood`);
    const result = await messaging.sendEachForMulticast(message);
    console.log(`✅ SOS alert sent: ${result.successCount} success, ${result.failureCount} failed`);

    return result;
  } catch (error) {
    console.error('❌ FCM SOS alert error:', error.message);
    // Graceful fallback — don't crash the system
    return {
      successCount: 0,
      failureCount: tokens ? tokens.length : 0,
      error: error.message
    };
  }
};

/**
 * Send a notification to a single device.
 * 
 * @param {string} token - FCM token
 * @param {Object} notification - { title, body }
 * @param {Object} data - Additional data payload
 * @returns {Promise<string>} Message ID
 */
const sendNotification = async (token, notification, data = {}) => {
  try {
    if (!token) {
      console.warn('No FCM token provided');
      return null;
    }

    const messaging = getMessaging();

    const message = {
      token,
      notification,
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      )
    };

    const result = await messaging.send(message);
    console.log(`📤 Notification sent: ${result}`);
    return result;
  } catch (error) {
    console.error('❌ FCM notification error:', error.message);
    return null;
  }
};

module.exports = { sendSOSAlert, sendNotification };
