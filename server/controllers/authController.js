const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');

/**
 * Register a new user (donor or hospital).
 * Creates User + Donor/Hospital profile atomically.
 */
const register = async (req, res) => {
  try {
    const { email, password, role, ...profileData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user with pending status
    const user = new User({
      email,
      password,
      role,
      status: 'pending'
    });
    await user.save();

    // Create role-specific profile
    if (role === 'donor') {
      const donor = new Donor({
        userId: user._id,
        fullName: profileData.fullName || '',
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        bloodGroup: profileData.bloodGroup,
        genotype: profileData.genotype,
        phone: profileData.phone || '',
        address: profileData.address,
        state: profileData.state,
        lga: profileData.lga,
        coordinates: profileData.coordinates,
        medicalHistory: profileData.medicalHistory
      });
      await donor.save();
    } else if (role === 'hospital') {
      const hospital = new Hospital({
        userId: user._id,
        facilityName: profileData.facilityName || '',
        facilityType: profileData.facilityType,
        address: profileData.address || '',
        state: profileData.state || '',
        lga: profileData.lga,
        phone: profileData.phone,
        contactPersonName: profileData.contactPersonName,
        coordinates: profileData.coordinates
      });
      await hospital.save();
    }

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'Registration successful. Your account is pending approval.',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Cleanup on failure
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

/**
 * Login user.
 * Validates credentials, checks approval status, returns JWT.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check approval status
    if (user.status !== 'approved') {
      return res.status(403).json({
        message: `Account is ${user.status}. Please contact admin for approval.`,
        status: user.status
      });
    }

    // Sign JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

/**
 * Get current user profile.
 * Populates donor or hospital profile based on role.
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = user.toObject();
    let profile = null;

    if (user.role === 'donor') {
      profile = await Donor.findOne({ userId: user._id });
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOne({ userId: user._id });
    }

    res.json({
      user: userResponse,
      profile
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

module.exports = { register, login, getMe };
