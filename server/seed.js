/**
 * BBMS Seed Script
 * Populates the database with realistic test data for development and testing.
 * 
 * Run: npm run seed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Donor = require('./models/Donor');
const Hospital = require('./models/Hospital');
const BloodUnit = require('./models/BloodUnit');
const Request = require('./models/Request');
const SurveyResponse = require('./models/SurveyResponse');

const SALT_ROUNDS = 12;

const seed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear all collections
    console.log('Clearing all collections...');
    await Promise.all([
      User.deleteMany({}),
      Donor.deleteMany({}),
      Hospital.deleteMany({}),
      BloodUnit.deleteMany({}),
      Request.deleteMany({}),
      SurveyResponse.deleteMany({})
    ]);
    console.log('All collections cleared');

    // Use plain text passwords (the User model pre-save hook will hash them)
    const adminPassword = 'Admin@123';
    const donorPassword = 'Password@123';
    const hospitalPassword = 'Hospital@123';

    // ═══════════════════════════════════════════════════════════
    // 1. ADMIN ACCOUNT
    // ═══════════════════════════════════════════════════════════
    console.log('Creating admin account...');
    const adminUser = await User.create({
      email: 'admin@bbms.com',
      password: adminPassword,
      role: 'admin',
      status: 'approved'
    });

    // ═══════════════════════════════════════════════════════════
    // 2. DONORS (5 donors, all approved)
    // ═══════════════════════════════════════════════════════════
    console.log('Creating donor accounts...');

    const now = new Date();

    const donorData = [
      {
        email: 'chinedu.okafor@email.com',
        fullName: 'Chinedu Okafor',
        dateOfBirth: new Date('1990-03-15'),
        gender: 'Male',
        bloodGroup: 'O+',
        genotype: 'AA',
        phone: '08012345001',
        address: '12 Jos Road, Lafia',
        state: 'Nasarawa',
        lga: 'Lafia',
        coordinates: { latitude: 8.4966, longitude: 8.5156 },
        medicalHistory: 'No known medical conditions. Regular donor.',
        lastDonationDate: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), // 120 days ago (eligible)
        donationHistory: [
          { date: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), facilityName: 'Federal Medical Centre Lafia', units: 1 },
          { date: new Date(now.getTime() - 300 * 24 * 60 * 60 * 1000), facilityName: 'Dalhatu Araf Specialist Hospital', units: 1 }
        ]
      },
      {
        email: 'fatima.abubakar@email.com',
        fullName: 'Fatima Abubakar',
        dateOfBirth: new Date('1995-07-22'),
        gender: 'Female',
        bloodGroup: 'A+',
        genotype: 'AS',
        phone: '08012345002',
        address: '45 Shendam Road, Lafia',
        state: 'Nasarawa',
        lga: 'Lafia',
        coordinates: { latitude: 8.51, longitude: 8.52 },
        medicalHistory: 'Mild allergies to dust. No chronic conditions.',
        lastDonationDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago (NOT eligible)
        donationHistory: [
          { date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), facilityName: 'Federal Medical Centre Lafia', units: 1 }
        ]
      },
      {
        email: 'emeka.nwankwo@email.com',
        fullName: 'Emeka Nwankwo',
        dateOfBirth: new Date('1988-11-08'),
        gender: 'Male',
        bloodGroup: 'B+',
        genotype: 'AA',
        phone: '08012345003',
        address: '78 Makurdi Road, Lafia',
        state: 'Nasarawa',
        lga: 'Lafia',
        coordinates: { latitude: 8.49, longitude: 8.50 },
        medicalHistory: 'No medical conditions. First-time donor.',
        lastDonationDate: null, // Never donated (eligible)
        donationHistory: []
      },
      {
        email: 'aisha.mohammed@email.com',
        fullName: 'Aisha Mohammed',
        dateOfBirth: new Date('1992-05-30'),
        gender: 'Female',
        bloodGroup: 'AB+',
        genotype: 'AA',
        phone: '08012345004',
        address: '23 Hospital Road, Lafia',
        state: 'Nasarawa',
        lga: 'Lafia',
        coordinates: { latitude: 8.52, longitude: 8.53 },
        medicalHistory: 'No known medical conditions.',
        lastDonationDate: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000), // 95 days ago (eligible)
        donationHistory: [
          { date: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000), facilityName: 'Lafia Community Blood Bank', units: 1 }
        ]
      },
      {
        email: 'blessing.adeyemi@email.com',
        fullName: 'Blessing Adeyemi',
        dateOfBirth: new Date('1997-01-12'),
        gender: 'Female',
        bloodGroup: 'O-',
        genotype: 'AS',
        phone: '08012345005',
        address: '56 Akwanga Road, Lafia',
        state: 'Nasarawa',
        lga: 'Lafia',
        coordinates: { latitude: 8.48, longitude: 8.51 },
        medicalHistory: 'Sickle cell trait carrier (AS). Otherwise healthy.',
        lastDonationDate: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000), // 200 days ago (eligible)
        donationHistory: [
          { date: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000), facilityName: 'Federal Medical Centre Lafia', units: 1 },
          { date: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000), facilityName: 'Federal Medical Centre Lafia', units: 1 }
        ]
      }
    ];

    const donorUsers = [];
    const donors = [];

    for (const d of donorData) {
      const user = await User.create({
        email: d.email,
        password: donorPassword,
        role: 'donor',
        status: 'approved'
      });
      donorUsers.push(user);

      const donor = await Donor.create({
        userId: user._id,
        fullName: d.fullName,
        dateOfBirth: d.dateOfBirth,
        gender: d.gender,
        bloodGroup: d.bloodGroup,
        genotype: d.genotype,
        phone: d.phone,
        address: d.address,
        state: d.state,
        lga: d.lga,
        coordinates: d.coordinates,
        fcmToken: `fake-fcm-token-${d.fullName.toLowerCase().replace(/\s/g, '-')}`,
        medicalHistory: d.medicalHistory,
        lastDonationDate: d.lastDonationDate,
        donationHistory: d.donationHistory.map(dh => ({
          ...dh,
          recordedBy: adminUser._id
        }))
      });
      donors.push(donor);
    }

    // ═══════════════════════════════════════════════════════════
    // 3. HOSPITALS (3 hospitals, all approved)
    // ═══════════════════════════════════════════════════════════
    console.log('Creating hospital accounts...');

    const hospitalData = [
      {
        email: 'info@fmclafia.com',
        facilityName: 'Federal Medical Centre Lafia',
        facilityType: 'Hospital',
        address: 'PMB 451, Jos Road, Lafia',
        state: 'Nasarawa',
        lga: 'Lafia',
        phone: '08098765001',
        contactPersonName: 'Dr. Ibrahim Musa',
        coordinates: { latitude: 8.4966, longitude: 8.5156 }
      },
      {
        email: 'info@dashospital.com',
        facilityName: 'Dalhatu Araf Specialist Hospital',
        facilityType: 'Hospital',
        address: 'Shendam Road, Lafia',
        state: 'Nasarawa',
        lga: 'Lafia',
        phone: '08098765002',
        contactPersonName: 'Dr. Amina Yusuf',
        coordinates: { latitude: 8.50, longitude: 8.52 }
      },
      {
        email: 'info@lafiabloodbank.com',
        facilityName: 'Lafia Community Blood Bank',
        facilityType: 'Blood Bank',
        address: 'Hospital Road, Lafia',
        state: 'Nasarawa',
        lga: 'Lafia',
        phone: '08098765003',
        contactPersonName: 'Mrs. Grace Ojo',
        coordinates: { latitude: 8.49, longitude: 8.50 }
      }
    ];

    const hospitalUsers = [];
    const hospitals = [];

    for (const h of hospitalData) {
      const user = await User.create({
        email: h.email,
        password: hospitalPassword,
        role: 'hospital',
        status: 'approved'
      });
      hospitalUsers.push(user);

      const hospital = await Hospital.create({
        userId: user._id,
        facilityName: h.facilityName,
        facilityType: h.facilityType,
        address: h.address,
        state: h.state,
        lga: h.lga,
        phone: h.phone,
        contactPersonName: h.contactPersonName,
        coordinates: h.coordinates
      });
      hospitals.push(hospital);
    }

    // ═══════════════════════════════════════════════════════════
    // 4. BLOOD UNITS (20 units)
    // ═══════════════════════════════════════════════════════════
    console.log('Creating blood units...');

    const year = now.getFullYear();
    let unitCounter = 0;

    const makeUnitCode = () => {
      unitCounter++;
      return `BU-${year}-${String(unitCounter).padStart(5, '0')}`;
    };

    const bloodUnits = [];

    // 12 available units (spread across blood groups)
    const availableUnitsData = [
      { bloodGroup: 'O+', daysAgo: 5, donor: 0, facility: 0 },
      { bloodGroup: 'O+', daysAgo: 10, donor: 0, facility: 0 },
      { bloodGroup: 'O+', daysAgo: 15, donor: 0, facility: 1 },
      { bloodGroup: 'A+', daysAgo: 3, donor: 1, facility: 0 },
      { bloodGroup: 'A+', daysAgo: 8, donor: 1, facility: 1 },
      { bloodGroup: 'B+', daysAgo: 7, donor: 2, facility: 0 },
      { bloodGroup: 'B+', daysAgo: 12, donor: 2, facility: 2 },
      { bloodGroup: 'AB+', daysAgo: 6, donor: 3, facility: 1 },
      { bloodGroup: 'O-', daysAgo: 4, donor: 4, facility: 0 },
      { bloodGroup: 'O-', daysAgo: 9, donor: 4, facility: 2 },
      { bloodGroup: 'A-', daysAgo: 11, donor: 1, facility: 0 },
      { bloodGroup: 'A-', daysAgo: 14, donor: 3, facility: 1 }
    ];

    for (const u of availableUnitsData) {
      const collectionDate = new Date(now.getTime() - u.daysAgo * 24 * 60 * 60 * 1000);
      const expirationDate = new Date(collectionDate.getTime() + 42 * 24 * 60 * 60 * 1000);
      const unit = await BloodUnit.create({
        unitCode: makeUnitCode(),
        bloodGroup: u.bloodGroup,
        componentType: 'Whole Blood',
        collectionDate,
        expirationDate,
        status: 'available',
        donorId: donors[u.donor]._id,
        facilityId: hospitals[u.facility]._id,
        notes: `Collected from ${donors[u.donor].fullName}`
      });
      bloodUnits.push(unit);
    }

    // 3 reserved units
    for (let i = 0; i < 3; i++) {
      const groups = ['O+', 'A+', 'B+'];
      const collectionDate = new Date(now.getTime() - (20 + i * 3) * 24 * 60 * 60 * 1000);
      const expirationDate = new Date(collectionDate.getTime() + 42 * 24 * 60 * 60 * 1000);
      const unit = await BloodUnit.create({
        unitCode: makeUnitCode(),
        bloodGroup: groups[i],
        componentType: 'Whole Blood',
        collectionDate,
        expirationDate,
        status: 'reserved',
        donorId: donors[i]._id,
        facilityId: hospitals[0]._id,
        notes: 'Reserved for pending request'
      });
      bloodUnits.push(unit);
    }

    // 2 delivered units
    for (let i = 0; i < 2; i++) {
      const groups = ['O+', 'AB+'];
      const collectionDate = new Date(now.getTime() - (30 + i * 5) * 24 * 60 * 60 * 1000);
      const expirationDate = new Date(collectionDate.getTime() + 42 * 24 * 60 * 60 * 1000);
      const unit = await BloodUnit.create({
        unitCode: makeUnitCode(),
        bloodGroup: groups[i],
        componentType: 'Packed Red Cells',
        collectionDate,
        expirationDate,
        status: 'delivered',
        donorId: donors[i]._id,
        facilityId: hospitals[1]._id,
        notes: 'Successfully delivered'
      });
      bloodUnits.push(unit);
    }

    // 2 expired units (expiration date in the past)
    for (let i = 0; i < 2; i++) {
      const groups = ['B+', 'A-'];
      const collectionDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const expirationDate = new Date(now.getTime() - (5 + i * 3) * 24 * 60 * 60 * 1000); // Already expired
      const unit = await BloodUnit.create({
        unitCode: makeUnitCode(),
        bloodGroup: groups[i],
        componentType: 'Whole Blood',
        collectionDate,
        expirationDate,
        status: 'expired',
        donorId: donors[2]._id,
        facilityId: hospitals[2]._id,
        notes: 'Unit expired — not used in time'
      });
      bloodUnits.push(unit);
    }

    // 1 unit expiring within 2 days (to trigger expiry alert)
    const almostExpiredCollection = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
    const almostExpiredExpiry = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const almostExpiredUnit = await BloodUnit.create({
      unitCode: makeUnitCode(),
      bloodGroup: 'O+',
      componentType: 'Platelets',
      collectionDate: almostExpiredCollection,
      expirationDate: almostExpiredExpiry,
      status: 'available',
      donorId: donors[0]._id,
      facilityId: hospitals[0]._id,
      notes: 'ALERT: Expiring soon!'
    });
    bloodUnits.push(almostExpiredUnit);

    // ═══════════════════════════════════════════════════════════
    // 5. BLOOD REQUESTS (5 requests, mix of statuses)
    // ═══════════════════════════════════════════════════════════
    console.log('Creating blood requests...');

    // Request 1: Fulfilled (from inventory) — FMC Lafia
    const request1 = await Request.create({
      hospitalId: hospitals[0]._id,
      bloodGroup: 'O+',
      unitsRequired: 2,
      urgencyLevel: 'Urgent',
      status: 'fulfilled',
      reservedUnits: [bloodUnits[12]._id, bloodUnits[13]._id], // reserved units
      fulfilledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      notes: 'Emergency surgery - fulfilled from inventory'
    });

    // Request 2: Fulfilled — Dalhatu Araf
    const request2 = await Request.create({
      hospitalId: hospitals[1]._id,
      bloodGroup: 'AB+',
      unitsRequired: 1,
      urgencyLevel: 'Routine',
      status: 'fulfilled',
      reservedUnits: [bloodUnits[14]._id], // reserved unit
      fulfilledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      notes: 'Scheduled transfusion - fulfilled from inventory'
    });

    // Request 3: SOS dispatched — Lafia Blood Bank
    const request3 = await Request.create({
      hospitalId: hospitals[2]._id,
      bloodGroup: 'O-',
      unitsRequired: 3,
      urgencyLevel: 'Critical',
      status: 'sos_dispatched',
      alertedDonors: [donors[0]._id, donors[2]._id, donors[3]._id, donors[4]._id],
      notes: 'Critical shortage — SOS sent to nearby donors'
    });

    // Request 4: Pending donation — FMC Lafia
    const request4 = await Request.create({
      hospitalId: hospitals[0]._id,
      bloodGroup: 'B+',
      unitsRequired: 2,
      urgencyLevel: 'Urgent',
      status: 'pending_donation',
      alertedDonors: [donors[2]._id, donors[3]._id],
      acceptedDonors: [donors[2]._id],
      notes: 'Donor accepted — awaiting donation'
    });

    // Request 5: Submitted (new, waiting) — Dalhatu Araf
    const request5 = await Request.create({
      hospitalId: hospitals[1]._id,
      bloodGroup: 'A+',
      unitsRequired: 2,
      urgencyLevel: 'Routine',
      status: 'submitted',
      notes: 'Routine blood request — pending processing'
    });

    // Link reserved units to their requests
    await BloodUnit.updateMany(
      { _id: { $in: [bloodUnits[12]._id, bloodUnits[13]._id] } },
      { $set: { reservedForRequestId: request1._id } }
    );
    await BloodUnit.updateOne(
      { _id: bloodUnits[14]._id },
      { $set: { reservedForRequestId: request2._id } }
    );

    // ═══════════════════════════════════════════════════════════
    // 6. SUS SURVEY RESPONSES (2 surveys)
    // ═══════════════════════════════════════════════════════════
    console.log('Creating survey responses...');

    // Donor survey (Chinedu) — generally positive
    const donorResponses = [4, 2, 5, 1, 4, 2, 5, 1, 4, 2];
    const donorSusScore = calculateSUS(donorResponses);
    await SurveyResponse.create({
      userId: donorUsers[0]._id,
      role: 'donor',
      responses: donorResponses,
      susScore: donorSusScore
    });

    // Hospital survey (FMC Lafia) — mixed
    const hospitalResponses = [3, 3, 4, 2, 4, 3, 4, 2, 3, 3];
    const hospitalSusScore = calculateSUS(hospitalResponses);
    await SurveyResponse.create({
      userId: hospitalUsers[0]._id,
      role: 'hospital',
      responses: hospitalResponses,
      susScore: hospitalSusScore
    });

    // ═══════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(65));
    console.log('  BBMS DATABASE SEEDED SUCCESSFULLY');
    console.log('═'.repeat(65));
    console.log('\nSUMMARY:');
    console.log(`  Users:            ${1 + 5 + 3} (1 admin, 5 donors, 3 hospitals)`);
    console.log(`  Donors:           ${donors.length}`);
    console.log(`  Hospitals:        ${hospitals.length}`);
    console.log(`  Blood Units:      ${bloodUnits.length}`);
    console.log(`  Requests:         5`);
    console.log(`  Survey Responses: 2`);

    console.log('\nTEST ACCOUNTS:');
    console.log('─'.repeat(65));
    console.log(`  ${'Role'.padEnd(10)} ${'Email'.padEnd(35)} ${'Password'.padEnd(15)}`);
    console.log('─'.repeat(65));
    console.log(`  ${'Admin'.padEnd(10)} ${'admin@bbms.com'.padEnd(35)} ${'Admin@123'.padEnd(15)}`);
    console.log(`  ${'Donor'.padEnd(10)} ${'chinedu.okafor@email.com'.padEnd(35)} ${'Password@123'.padEnd(15)}`);
    console.log(`  ${'Donor'.padEnd(10)} ${'fatima.abubakar@email.com'.padEnd(35)} ${'Password@123'.padEnd(15)}`);
    console.log(`  ${'Donor'.padEnd(10)} ${'emeka.nwankwo@email.com'.padEnd(35)} ${'Password@123'.padEnd(15)}`);
    console.log(`  ${'Donor'.padEnd(10)} ${'aisha.mohammed@email.com'.padEnd(35)} ${'Password@123'.padEnd(15)}`);
    console.log(`  ${'Donor'.padEnd(10)} ${'blessing.adeyemi@email.com'.padEnd(35)} ${'Password@123'.padEnd(15)}`);
    console.log(`  ${'Hospital'.padEnd(10)} ${'info@fmclafia.com'.padEnd(35)} ${'Hospital@123'.padEnd(15)}`);
    console.log(`  ${'Hospital'.padEnd(10)} ${'info@dashospital.com'.padEnd(35)} ${'Hospital@123'.padEnd(15)}`);
    console.log(`  ${'Hospital'.padEnd(10)} ${'info@lafiabloodbank.com'.padEnd(35)} ${'Hospital@123'.padEnd(15)}`);
    console.log('─'.repeat(65));

    console.log('\nBLOOD UNITS BREAKDOWN:');
    console.log(`  Available: 13  |  Reserved: 3  |  Delivered: 2  |  Expired: 2`);
    console.log(`  WARNING:  1 unit expiring within 2 days (will trigger expiry alert)`);

    console.log('\nREQUEST STATUS BREAKDOWN:');
    console.log(`  Fulfilled: 2  |  SOS Dispatched: 1  |  Pending Donation: 1  |  Submitted: 1`);

    console.log('\nSUS SCORES:');
    console.log(`  Donor (Chinedu):  ${donorSusScore}`);
    console.log(`  Hospital (FMC):   ${hospitalSusScore}`);

    console.log('\nSeed complete! You can now run: npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

/**
 * SUS calculator (inline for seed script independence)
 */
function calculateSUS(responses) {
  let total = 0;
  for (let i = 0; i < 10; i++) {
    if ((i + 1) % 2 === 1) {
      total += responses[i] - 1;
    } else {
      total += 5 - responses[i];
    }
  }
  return total * 2.5;
}

seed();
