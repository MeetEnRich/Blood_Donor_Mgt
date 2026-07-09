const admin = require('firebase-admin');

let firebaseApp = null;
let messaging = null;

const initFirebase = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.warn('WARNING: Firebase credentials not configured. Push notifications will be logged to console instead.');
    // Return mock messaging object
    messaging = {
      send: async (message) => {
        console.warn('[MOCK FCM] Would send notification:', JSON.stringify(message, null, 2));
        return 'mock-message-id';
      },
      sendEachForMulticast: async (message) => {
        console.warn('[MOCK FCM] Would send multicast notification:', JSON.stringify(message, null, 2));
        return {
          successCount: message.tokens ? message.tokens.length : 0,
          failureCount: 0,
          responses: (message.tokens || []).map(() => ({ success: true, messageId: 'mock-id' }))
        };
      }
    };
    return;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail
      })
    });
    messaging = admin.messaging();
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.warn(`WARNING: Firebase initialization failed: ${error.message}. Using mock fallback.`);
    messaging = {
      send: async (message) => {
        console.warn('[MOCK FCM] Would send notification:', JSON.stringify(message, null, 2));
        return 'mock-message-id';
      },
      sendEachForMulticast: async (message) => {
        console.warn('[MOCK FCM] Would send multicast notification:', JSON.stringify(message, null, 2));
        return {
          successCount: message.tokens ? message.tokens.length : 0,
          failureCount: 0,
          responses: (message.tokens || []).map(() => ({ success: true, messageId: 'mock-id' }))
        };
      }
    };
  }
};

const getMessaging = () => {
  if (!messaging) {
    initFirebase();
  }
  return messaging;
};

module.exports = { initFirebase, getMessaging };
