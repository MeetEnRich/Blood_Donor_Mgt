const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const { initFirebase } = require('./config/firebase');
const { startExpiryAlertJob } = require('./services/expiryAlertService');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
// mongoSanitize removed due to Express 5 compatibility issues

// Rate limiting on auth routes
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/auth/login', authLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donors', require('./routes/donorRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/survey', require('./routes/surveyRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err.stack);
  res.status(500).json({ message: 'Internal server error', stack: err.stack, errorObj: err });
});

// Start
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  // Initialize Firebase (with graceful fallback)
  initFirebase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    startExpiryAlertJob();
  });
});
