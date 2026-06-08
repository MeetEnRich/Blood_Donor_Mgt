# Blood Bank Management System (BBMS)
## Complete System Specification & Build Guide
**Version:** 1.0.0  
**Author:** Ecpo Samuel Barnabas  
**Institution:** Final Year Computer Science Project  
**Stack:** MERN (MongoDB, Express.js, React.js, Node.js)  
**Styling:** External CSS files (no Tailwind, no CSS-in-JS)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Objectives](#2-system-objectives)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Feature Specifications](#4-feature-specifications)
5. [System Architecture](#5-system-architecture)
6. [Database Schema](#6-database-schema)
7. [API Endpoint Specifications](#7-api-endpoint-specifications)
8. [Business Logic & Algorithms](#8-business-logic--algorithms)
9. [Security Implementation](#9-security-implementation)
10. [Third-Party Integrations](#10-third-party-integrations)
11. [Frontend Pages & Components](#11-frontend-pages--components)
12. [Project Directory Structure](#12-project-directory-structure)
13. [Environment Variables](#13-environment-variables)
14. [Implementation Instructions for Coding Agent](#14-implementation-instructions-for-coding-agent)

---

## 1. Project Overview

The Blood Bank Management System (BBMS) is a full-stack, web-based application designed to digitize and coordinate blood donor management, blood inventory tracking, and emergency blood request fulfillment across hospitals and blood banks in Nigeria.

The system replaces paper-based, fragmented record-keeping with a centralized, real-time platform accessible by three types of users: Admins, Hospitals, and Donors. It solves five critical problems identified in existing Nigerian health facilities:

- **Manual record inefficiency:** Donor searches that take hours are reduced to seconds
- **Inventory wastage:** Blood units expiring undetected due to no tracking system
- **Donor management gaps:** No automated eligibility enforcement or re-engagement reminders
- **Security vulnerabilities:** Paper records susceptible to theft, fire, and unauthorized access
- **Inter-facility blindness:** No shared visibility of blood availability across facilities

The defining technical feature of the system is a **two-path blood request fulfillment pipeline**:
- **Path A:** Blood unit available in inventory — reserve it immediately
- **Path B:** No stock — trigger a Greedy Algorithm that finds the nearest eligible donors by proximity and dispatches SOS push notifications via Firebase Cloud Messaging (FCM)

---

## 2. System Objectives

The system must fulfil the following five objectives exactly as specified:

1. Implement a **centralized MongoDB-based donor registry** that securely stores donor demographics, medical histories, and ABO/Rh eligibility status
2. Develop a **real-time blood inventory tracking module** that monitors unit levels, blood groups, and expiration dates with automated threshold alerts
3. Build an **emergency SOS notification system** applying a Greedy Algorithm with Google Maps API geolocation to alert the nearest eligible donors within the 90-day donation eligibility window
4. Implement a **JWT-secured role-based access control system** with distinct permission levels for Admin, Hospital, and Donor
5. Provide **system performance evaluation** tools: donor-matching response time logging and a System Usability Scale (SUS) feedback form

---

## 3. User Roles & Permissions

There are exactly **three roles** in the system. Every protected route must validate both the JWT token and the role claim.

### 3.1 Admin
- Full system access
- Can view, edit, approve, or suspend any User, Donor, or Hospital record
- Can add, update, or retire blood inventory units
- Can view all blood requests across all facilities
- Can generate system-wide inventory and fulfillment reports
- Can view system activity logs
- Cannot donate blood (Admin is not a Donor)

### 3.2 Hospital
- Can submit blood requests specifying blood group, quantity, and urgency level
- Can view the live blood inventory dashboard (read-only)
- Can view and track status of their own submitted requests
- Can update status of received blood units to "Delivered"
- Cannot access donor personal medical data
- Cannot access other hospitals' request histories

### 3.3 Donor
- Can register a profile with demographics, blood group, and location coordinates
- Can view their own donation history
- Can view their next eligible donation date (calculated from last donation + 90 days)
- Can update their contact details and location coordinates
- Can receive and view SOS alert notifications
- Can accept or decline an SOS alert
- Cannot access inventory data
- Cannot access other donors' data

---

## 4. Feature Specifications

### 4.1 Authentication Module

**Registration:**
- All three user types register through a single registration form
- Role is selected at registration time (Donor, Hospital)
- Admin accounts are created only by an existing Admin (no public Admin registration)
- Password must be at minimum 8 characters
- Password is hashed with bcrypt (salt rounds: 12) before storage
- On successful registration, Hospital and Donor accounts are set to `status: "pending"` and require Admin approval before login is permitted
- Admin approves or rejects registrations from the Admin dashboard

**Login:**
- Email and password authentication
- On success, server returns a signed JWT containing: `{ userId, role, email }`
- JWT expiry: 7 days
- Token is stored in `localStorage` on the client
- All subsequent API requests include the token in the `Authorization: Bearer <token>` header

**Logout:**
- Clears token from `localStorage`
- Redirects to Login page

**Protected Routes (Frontend):**
- All dashboard routes are wrapped in a `ProtectedRoute` component
- `ProtectedRoute` checks for a valid token in `localStorage`
- If no token, redirect to `/login`
- If token exists but role does not match the route, redirect to the appropriate role dashboard

---

### 4.2 Donor Management Module

**Donor Registration Profile Fields:**
- Full name
- Date of birth
- Gender
- Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Genotype (AA, AS, SS, AC)
- Phone number
- Email address
- Home address
- State of residence
- Local Government Area (LGA)
- Geographic coordinates (latitude, longitude) — captured via browser Geolocation API or entered manually
- FCM device token — captured on first login to donor dashboard (used for push notifications)
- Medical history notes (optional free text field)
- Last donation date (set by Admin when a donation is recorded; initially null)
- Status: `pending` | `approved` | `suspended`

**Eligibility Logic:**
- A donor is eligible to donate if: `currentDate - lastDonationDate >= 90 days` OR `lastDonationDate === null` (never donated before)
- This calculation is performed **dynamically at query time** on the server, never stored as a static boolean
- On the donor dashboard, display a countdown: "Next eligible date: DD/MM/YYYY" or "You are eligible to donate now"

**Donor Dashboard Features:**
- Personal profile summary card
- Eligibility status with next eligible date countdown
- Donation history table (date, blood bank, units donated)
- SOS alert inbox (received alerts, with Accept / Decline action buttons)
- Option to update contact details and location

---

### 4.3 Blood Inventory Module

**Blood Unit Record Fields:**
- Unit ID (auto-generated)
- Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Component type: Whole Blood | Packed Red Cells | Platelets | Fresh Frozen Plasma
- Collection date
- Expiration date (collection date + 35 days for whole blood; component-specific values should be configurable)
- Status: `available` | `reserved` | `delivered` | `expired` | `discarded`
- Donor ID (reference to Donor who contributed this unit)
- Facility ID (which blood bank/hospital currently holds this unit)
- Notes (optional)

**Inventory Operations:**
- Admin can add new blood units to inventory
- Admin can update unit status manually
- Admin can discard units
- System automatically flags units as `expired` when current date exceeds expiration date (via a scheduled job — see Section 8.3)

**Expiry Alert System:**
- A scheduled cron job runs every 24 hours
- It queries all units with status `available` and checks if `expirationDate <= currentDate + 3 days`
- All flagged units are surfaced on the Admin dashboard as urgent alerts
- Admin receives an in-app notification badge on the dashboard

**Inventory Dashboard (Admin View):**
- Summary cards: Total units by blood group (8 cards, one per ABO/Rh type)
- Table: All units with filter by blood group, status, and expiry date range
- Expiry alerts panel
- Quick actions: Add unit, Discard unit

**Inventory Dashboard (Hospital View - Read Only):**
- Summary cards showing available units per blood group only
- No ability to modify inventory

---

### 4.4 Blood Request Module (Core Feature)

This is the most critical module. It implements the two-path fulfillment pipeline.

**Request Submission (Hospital):**
- Hospital submits a request with: blood group, units required, urgency level (Routine | Urgent | Critical), and optional notes
- On submission, the system immediately begins the fulfillment pipeline

**Path A — Inventory Match:**
1. Backend queries `BloodUnit` collection for units where: `bloodGroup === requestedGroup` AND `status === 'available'` AND `expirationDate > currentDate`
2. If sufficient units found: update their status to `reserved`, link them to the request ID
3. Return HTTP 200 with fulfillment confirmation to the hospital dashboard
4. Request status updated to `fulfilled`
5. Hospital dashboard updates in real time

**Path B — Donor Sourcing (Greedy Algorithm + FCM):**
1. If inventory query returns null or insufficient units, trigger donor sourcing
2. Query `Donor` collection for donors where: `bloodGroup === requestedGroup` AND `status === 'approved'` AND `(currentDate - lastDonationDate >= 90 days OR lastDonationDate === null)`
3. For each eligible donor, calculate Euclidean distance from the requesting hospital's coordinates to the donor's stored coordinates using the Google Maps Distance Matrix API
4. Sort donors ascending by distance
5. Select the nearest N donors (N = configurable, default 10)
6. Retrieve their FCM device tokens
7. Dispatch SOS push notification via Firebase Cloud Messaging with payload: `{ bloodGroup, hospitalName, hospitalAddress, urgencyLevel, requestId }`
8. Update request status to `sos_dispatched`
9. Hospital dashboard updates: "SOS dispatched — awaiting donor response"

**Donor Response to SOS:**
- Donor opens the push notification, lands on the SOS Alerts page in the donor dashboard
- Donor clicks Accept or Decline
- If Accept: request status updates to `pending_donation`, hospital dashboard notified
- If Decline: donor is removed from the active SOS list for that request; no penalty

**Request Status Flow:**
```
submitted → fulfilling → fulfilled (Path A)
submitted → fulfilling → sos_dispatched → pending_donation → fulfilled (Path B)
submitted → fulfilling → sos_dispatched → unfulfilled (no donor responded within 24h)
```

**Request History (Hospital View):**
- Table of all requests submitted by this hospital
- Columns: Request ID, Blood Group, Units, Urgency, Date, Status
- Click a request to view full detail including which units were reserved or which donors were alerted

---

### 4.5 Admin Module

**Admin Dashboard:**
- System overview statistics: Total registered donors, Total hospitals, Total blood units in stock, Total requests today, Total fulfilled today
- Expiry alerts panel
- Recent activity feed

**Donor Management:**
- Table of all registered donors with filter by status (pending, approved, suspended) and blood group
- Approve or reject pending registrations
- Suspend an approved donor
- View full donor profile
- Record a donation event (which updates `lastDonationDate` and adds to donation history)

**Hospital Management:**
- Table of all registered hospitals with filter by status
- Approve or reject pending hospital registrations
- Suspend a hospital account
- View all requests submitted by a specific hospital

**Inventory Management:**
- Full inventory CRUD
- Add new blood unit
- Update unit status
- Discard unit with reason
- View expiry alerts

**Reports:**
- Fulfillment rate report: percentage of requests fulfilled from inventory vs. via SOS
- Donor activity report: most active donors, dormant donors (no donation in 180+ days)
- Inventory turnover report: units added vs. units used vs. units expired per month
- Export reports as CSV

---

### 4.6 SUS Evaluation Module

At the end of every session (or triggered by a menu option), users are offered a short System Usability Scale survey.

The SUS consists of exactly 10 standard questions, each rated 1–5 (Strongly Disagree to Strongly Agree). The standard SUS questions are:

1. I think that I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think that I would need the support of a technical person to be able to use this system.
5. I found the various functions in this system were well integrated.
6. I thought there was too much inconsistency in this system.
7. I would imagine that most people would learn to use this system very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using the system.
10. I needed to learn a lot of things before I could get going with this system.

**SUS Score Calculation (server-side):**
- For odd-numbered questions: score = response - 1
- For even-numbered questions: score = 5 - response
- Total = sum of all converted scores × 2.5
- Maximum score = 100

**Storage:** SUS responses stored in a `SurveyResponse` collection with userId, role, scores, calculatedSUS, and timestamp.

**Admin view:** Average SUS score across all users displayed on the Admin dashboard Reports page.

---

## 5. System Architecture

```
Client (React SPA)
       |
       | HTTPS / REST API (JSON)
       |
Express.js Server (Node.js)
       |
  ┌────┴─────────────────────────────────────┐
  │                                          │
MongoDB                          External Services
(Mongoose ODM)              ┌────────────────────────┐
  │                         │  Google Maps API       │
  ├── Users                 │  Firebase FCM          │
  ├── Donors                └────────────────────────┘
  ├── BloodUnits
  ├── Hospitals
  ├── Requests
  └── SurveyResponses
```

**Frontend** is a React Single Page Application (SPA) built with Vite. Routing handled by React Router v6. State managed via React Context API. HTTP calls via Axios with a configured instance that attaches the JWT automatically.

**Backend** is an Express.js REST API. All routes are prefixed `/api/`. Authentication and role validation enforced via middleware on every protected route. Business logic lives in controllers and services, not in route files.

**Database** is MongoDB accessed via Mongoose. All schemas are defined with strict validation. Indexes are applied to frequently queried fields (bloodGroup, status, expirationDate, coordinates).

---

## 6. Database Schema

### 6.1 User Schema
```javascript
{
  _id: ObjectId,
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },        // bcrypt hashed
  role: { type: String, enum: ['admin', 'hospital', 'donor'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}
```

### 6.2 Donor Schema
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
  genotype: { type: String, enum: ['AA', 'AS', 'SS', 'AC'] },
  phone: { type: String, required: true },
  address: { type: String },
  state: { type: String },
  lga: { type: String },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  fcmToken: { type: String },                        // Firebase device token
  medicalHistory: { type: String },
  lastDonationDate: { type: Date, default: null },
  donationHistory: [
    {
      date: Date,
      facilityName: String,
      units: Number,
      recordedBy: { type: ObjectId, ref: 'User' }
    }
  ],
  createdAt: { type: Date, default: Date.now }
}
```

### 6.3 BloodUnit Schema
```javascript
{
  _id: ObjectId,
  unitCode: { type: String, unique: true },          // auto-generated e.g. "BU-2025-00142"
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
  componentType: {
    type: String,
    enum: ['Whole Blood', 'Packed Red Cells', 'Platelets', 'Fresh Frozen Plasma'],
    default: 'Whole Blood'
  },
  collectionDate: { type: Date, required: true },
  expirationDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['available', 'reserved', 'delivered', 'expired', 'discarded'],
    default: 'available'
  },
  donorId: { type: ObjectId, ref: 'Donor' },
  facilityId: { type: ObjectId, ref: 'Hospital' },
  reservedForRequestId: { type: ObjectId, ref: 'Request', default: null },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 6.4 Hospital Schema
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, unique: true },
  facilityName: { type: String, required: true },
  facilityType: { type: String, enum: ['Hospital', 'Clinic', 'Blood Bank', 'Health Centre'] },
  address: { type: String, required: true },
  state: { type: String, required: true },
  lga: { type: String },
  phone: { type: String },
  contactPersonName: { type: String },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
}
```

### 6.5 Request Schema
```javascript
{
  _id: ObjectId,
  hospitalId: { type: ObjectId, ref: 'Hospital', required: true },
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
  unitsRequired: { type: Number, required: true, min: 1 },
  urgencyLevel: { type: String, enum: ['Routine', 'Urgent', 'Critical'], default: 'Routine' },
  status: {
    type: String,
    enum: ['submitted', 'fulfilling', 'fulfilled', 'sos_dispatched', 'pending_donation', 'unfulfilled', 'cancelled'],
    default: 'submitted'
  },
  reservedUnits: [{ type: ObjectId, ref: 'BloodUnit' }],
  alertedDonors: [{ type: ObjectId, ref: 'Donor' }],
  acceptedDonors: [{ type: ObjectId, ref: 'Donor' }],
  fulfilledAt: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 6.6 SurveyResponse Schema
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'hospital', 'donor'] },
  responses: [{ type: Number, min: 1, max: 5 }],    // Array of 10 values
  susScore: { type: Number },                        // Calculated on server
  submittedAt: { type: Date, default: Date.now }
}
```

---

## 7. API Endpoint Specifications

All routes prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` header.

### 7.1 Auth Routes `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user (donor or hospital) |
| POST | `/login` | Public | Login and receive JWT |
| GET | `/me` | Protected | Get current logged-in user profile |

**POST /register body:**
```json
{
  "email": "string",
  "password": "string",
  "role": "donor | hospital",
  "profileData": { ... }
}
```
`profileData` contains all role-specific fields (see schema above). The endpoint creates both a `User` document and the corresponding `Donor` or `Hospital` document in a single transaction.

**POST /login response:**
```json
{
  "token": "jwt_string",
  "user": { "id": "", "email": "", "role": "", "status": "" }
}
```

---

### 7.2 Donor Routes `/api/donors`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin | Get all donors (paginated, filterable) |
| GET | `/me` | Donor | Get own profile |
| PUT | `/me` | Donor | Update own contact info and coordinates |
| PUT | `/me/fcm-token` | Donor | Update FCM device token |
| GET | `/:id` | Admin | Get specific donor by ID |
| PUT | `/:id/approve` | Admin | Approve donor registration |
| PUT | `/:id/suspend` | Admin | Suspend donor |
| POST | `/:id/donation` | Admin | Record a donation event (updates lastDonationDate) |
| GET | `/:id/eligibility` | Admin, Donor | Check eligibility status |
| GET | `/alerts/my` | Donor | Get SOS alerts sent to this donor |
| PUT | `/alerts/:requestId/respond` | Donor | Accept or decline an SOS alert |

---

### 7.3 Inventory Routes `/api/inventory`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin, Hospital | Get all blood units (filterable by bloodGroup, status) |
| GET | `/summary` | Admin, Hospital | Get count per blood group (available only) |
| GET | `/expiry-alerts` | Admin | Get units expiring within 3 days |
| POST | `/` | Admin | Add new blood unit |
| PUT | `/:id` | Admin | Update unit (status, notes) |
| DELETE | `/:id` | Admin | Discard unit (sets status to discarded) |

---

### 7.4 Request Routes `/api/requests`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Hospital | Submit new blood request (triggers fulfillment pipeline) |
| GET | `/` | Admin | Get all requests (paginated, filterable) |
| GET | `/my` | Hospital | Get this hospital's request history |
| GET | `/:id` | Admin, Hospital | Get specific request detail |
| PUT | `/:id/cancel` | Hospital | Cancel a pending request |
| PUT | `/:id/delivered` | Hospital | Mark received units as delivered |

---

### 7.5 Admin Routes `/api/admin`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/stats` | Admin | System overview statistics |
| GET | `/hospitals` | Admin | Get all hospitals |
| PUT | `/hospitals/:id/approve` | Admin | Approve hospital registration |
| PUT | `/hospitals/:id/suspend` | Admin | Suspend hospital |
| GET | `/reports/fulfillment` | Admin | Fulfillment rate report |
| GET | `/reports/donors` | Admin | Donor activity report |
| GET | `/reports/inventory` | Admin | Inventory turnover report |
| GET | `/reports/sus` | Admin | Average SUS scores |

---

### 7.6 Survey Routes `/api/survey`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/submit` | Donor, Hospital | Submit SUS survey responses |
| GET | `/my` | Donor, Hospital | Check if user has already submitted |

---

## 8. Business Logic & Algorithms

### 8.1 The Fulfillment Pipeline (`requestController.js`)

This is the most important function in the entire system. Implement it exactly as described.

```
async function fulfillRequest(requestId):

  1. Fetch the request document
  2. Update request status to 'fulfilling'
  
  3. PATH A: Query BloodUnit collection
     - bloodGroup === request.bloodGroup
     - status === 'available'
     - expirationDate > Date.now()
     - Limit to request.unitsRequired
     
  4. If units found (units.length >= request.unitsRequired):
     - Bulk update all matched units: status = 'reserved', reservedForRequestId = requestId
     - Update request: status = 'fulfilled', reservedUnits = [unitIds], fulfilledAt = now
     - Return { path: 'A', status: 'fulfilled', units: [...] }
     
  5. PATH B: If no sufficient units found:
     - Call greedyAlgorithmService.findNearestDonors(request)
     - Get list of eligible donors sorted by proximity
     - Extract FCM tokens from donor records
     - Call fcmService.sendSOS(tokens, payload)
     - Update request: status = 'sos_dispatched', alertedDonors = [donorIds]
     - Return { path: 'B', status: 'sos_dispatched', donorsAlerted: count }
```

---

### 8.2 Greedy Algorithm (`services/greedyAlgorithm.js`)

```
async function findNearestDonors(request):

  1. Get requesting hospital coordinates from Hospital document
  
  2. Query Donor collection:
     - bloodGroup === request.bloodGroup (or compatible type — see compatibility table below)
     - status === 'approved'
     - fcmToken exists and is not null
     - Filter eligibility: (Date.now() - lastDonationDate) >= 90 days
       OR lastDonationDate === null
  
  3. For each eligible donor, calculate distance:
     distance = sqrt((donor.lat - hospital.lat)^2 + (donor.lng - hospital.lng)^2)
     (Euclidean approximation for speed; use Google Maps Distance Matrix for precision)
  
  4. Sort donors ascending by distance
  
  5. Return top N donors (default N=10, configurable via environment variable)
```

**ABO/Rh Compatibility Table** (for donor matching when exact match unavailable):

| Patient Blood Group | Compatible Donor Groups |
|---------------------|------------------------|
| A+ | A+, A-, O+, O- |
| A- | A-, O- |
| B+ | B+, B-, O+, O- |
| B- | B-, O- |
| AB+ | All groups |
| AB- | AB-, A-, B-, O- |
| O+ | O+, O- |
| O- | O- only |

When searching for donors, first try exact blood group match. If insufficient donors found, expand to compatible groups.

---

### 8.3 Expiry Alert Cron Job (`services/expiryAlertService.js`)

```
Schedule: runs every day at 00:00 UTC (use node-cron)

function runExpiryCheck():
  1. Query BloodUnit: status === 'available' AND expirationDate <= (Date.now() + 3 days)
  2. For each flagged unit, add to an alerts array
  3. Store alert summary in a lightweight cache or a dedicated Alerts collection
  4. Admin dashboard reads from this collection to display the expiry alerts panel
  
  Also:
  5. Query BloodUnit: status === 'available' AND expirationDate < Date.now()
  6. Bulk update these units: status = 'expired'
```

---

### 8.4 SUS Score Calculator (`utils/susCalculator.js`)

```javascript
function calculateSUS(responses) {
  // responses is an array of 10 integers, each between 1 and 5
  let total = 0;
  for (let i = 0; i < 10; i++) {
    if ((i + 1) % 2 !== 0) {
      // Odd questions (1,3,5,7,9): response - 1
      total += responses[i] - 1;
    } else {
      // Even questions (2,4,6,8,10): 5 - response
      total += 5 - responses[i];
    }
  }
  return total * 2.5; // Range: 0 to 100
}
```

---

### 8.5 Eligibility Check (`utils/eligibilityCheck.js`)

```javascript
function isDonorEligible(lastDonationDate) {
  if (!lastDonationDate) return true; // Never donated — always eligible
  const daysSince = (Date.now() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24);
  return daysSince >= 90;
}

function nextEligibleDate(lastDonationDate) {
  if (!lastDonationDate) return null;
  const next = new Date(lastDonationDate);
  next.setDate(next.getDate() + 90);
  return next;
}
```

---

## 9. Security Implementation

### 9.1 Authentication Middleware (`middleware/authMiddleware.js`)

Every protected route must pass through this middleware:

```javascript
function protect(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
```

### 9.2 Role Middleware (`middleware/roleMiddleware.js`)

```javascript
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
}
```

Usage in routes:
```javascript
router.get('/admin/stats', protect, restrictTo('admin'), adminController.getStats);
router.post('/requests', protect, restrictTo('hospital'), requestController.submit);
router.get('/donors/me', protect, restrictTo('donor'), donorController.getMyProfile);
```

### 9.3 Additional Security Measures

- **Helmet.js:** Add as Express middleware to set secure HTTP headers
- **express-rate-limit:** Apply rate limiting to `/api/auth/login` (max 10 requests per 15 minutes per IP) to prevent brute-force attacks
- **CORS:** Configure to allow only the frontend origin in production
- **Input Validation:** Use `express-validator` on all POST and PUT routes. Validate and sanitize every incoming field
- **Password Hashing:** bcrypt with saltRounds = 12
- **MongoDB Injection:** Mongoose's strict schema prevents injection by default; additionally sanitize inputs with `express-mongo-sanitize`
- **Environment Variables:** All secrets (JWT_SECRET, MongoDB URI, FCM credentials, Google Maps API key) must be stored in `.env` and never committed to version control
- **Sensitive Field Exclusion:** The `password` field must be excluded from all database query responses using `select: false` in the schema or `.select('-password')` in queries

---

## 10. Third-Party Integrations

### 10.1 Firebase Cloud Messaging (FCM)

**Setup:**
1. Create a Firebase project at console.firebase.google.com
2. Enable Cloud Messaging
3. Download the service account JSON key
4. Initialize the Firebase Admin SDK in `config/firebase.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
```

**Sending SOS (`services/fcmService.js`):**
```javascript
async function sendSOSAlert(tokens, payload) {
  const message = {
    notification: {
      title: `URGENT: ${payload.bloodGroup} Blood Needed`,
      body: `${payload.hospitalName} requires ${payload.bloodGroup} blood. Tap to respond.`
    },
    data: {
      requestId: payload.requestId.toString(),
      bloodGroup: payload.bloodGroup,
      hospitalName: payload.hospitalName,
      urgencyLevel: payload.urgencyLevel,
      type: 'SOS_ALERT'
    },
    tokens: tokens  // Array of FCM tokens
  };
  
  const response = await admin.messaging().sendEachForMulticast(message);
  return response;
}
```

**Client-side FCM Token Capture:**
On the donor dashboard, after login, request notification permission from the browser and retrieve the FCM registration token. Send it to `PUT /api/donors/me/fcm-token` to store it against the donor profile.

---

### 10.2 Google Maps API

**Purpose:** Calculate geographic distance between hospital and candidate donors.

**Usage in `services/mapsService.js`:**
```javascript
const axios = require('axios');

async function getDistanceMatrix(origin, destinations) {
  // origin: { lat, lng }
  // destinations: array of { lat, lng }
  const originStr = `${origin.latitude},${origin.longitude}`;
  const destStr = destinations.map(d => `${d.latitude},${d.longitude}`).join('|');
  
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;
  const response = await axios.get(url, {
    params: {
      origins: originStr,
      destinations: destStr,
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  });
  
  return response.data.rows[0].elements; // Array of distance objects
}
```

**Note:** For the Greedy Algorithm, Euclidean distance (calculated in-code without an API call) is acceptable as a fast approximation for initial sorting. The Google Maps API is used for precise distance display on the frontend map view.

---

## 11. Frontend Pages & Components

### 11.1 Page Structure by Role

**Public Pages:**
- `/` — Landing page with system description and login/register links
- `/login` — Login form
- `/register` — Registration form (role selection, then role-specific fields)

**Admin Pages (`/admin/...`):**
- `/admin/dashboard` — Overview stats, expiry alerts, recent activity
- `/admin/donors` — Donor management table
- `/admin/donors/:id` — Individual donor profile view
- `/admin/hospitals` — Hospital management table
- `/admin/inventory` — Full inventory management
- `/admin/requests` — All requests across all hospitals
- `/admin/reports` — Reports and SUS scores

**Hospital Pages (`/hospital/...`):**
- `/hospital/dashboard` — Overview: active requests, inventory summary
- `/hospital/inventory` — Read-only inventory view
- `/hospital/requests/new` — Submit blood request form
- `/hospital/requests` — Request history table
- `/hospital/requests/:id` — Request detail view

**Donor Pages (`/donor/...`):**
- `/donor/dashboard` — Profile summary, eligibility status, recent alerts
- `/donor/history` — Full donation history
- `/donor/alerts` — SOS alert inbox with accept/decline

**Shared:**
- `/survey` — SUS questionnaire (available to all logged-in users)

---

### 11.2 Key Components

**`ProtectedRoute.jsx`**
Wraps role-specific route groups. Reads token and role from `localStorage`/`AuthContext`. Redirects unauthorized users.

**`AuthContext.jsx`**
Provides `user`, `token`, `login()`, `logout()` to the entire app. `login()` stores token to localStorage. `logout()` clears it.

**`axiosInstance.js`**
Configured Axios instance:
```javascript
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('bbms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

**`EligibilityBadge.jsx`**
Displays green "Eligible Now" or orange "Eligible on DD/MM/YYYY" based on lastDonationDate prop.

**`RequestStatusBadge.jsx`**
Color-coded status label: submitted (grey), fulfilling (blue), fulfilled (green), sos_dispatched (orange), unfulfilled (red).

**`BloodGroupCard.jsx`**
Summary card showing count of available units for one blood group. Used in inventory dashboard.

---

### 11.3 Styling Notes

- Use **external CSS files** only. No Tailwind. No CSS-in-JS (no styled-components, no emotion).
- Each page or major component has its own `.css` file imported at the top of the component file.
- A global `index.css` or `global.css` file handles: CSS reset, CSS custom properties (variables), typography, button base styles, form base styles, and utility classes.
- Color palette based on the medical/blood domain:

```css
:root {
  --color-primary: #c0392b;       /* Blood red — primary actions */
  --color-primary-dark: #96281b;  /* Hover state */
  --color-secondary: #2c3e50;     /* Dark navy — sidebar, headers */
  --color-accent: #e74c3c;        /* Alerts and urgency indicators */
  --color-success: #27ae60;       /* Fulfilled, eligible, approved */
  --color-warning: #f39c12;       /* Expiry alerts, SOS dispatched */
  --color-danger: #c0392b;        /* Unfulfilled, suspended, expired */
  --color-bg: #f4f6f9;            /* Page background */
  --color-card: #ffffff;          /* Card background */
  --color-text: #2c3e50;          /* Primary text */
  --color-text-muted: #7f8c8d;    /* Secondary text */
  --color-border: #dfe6e9;        /* Borders */
  --font-main: 'Segoe UI', sans-serif;
  --radius: 8px;
  --shadow: 0 2px 8px rgba(0,0,0,0.08);
}
```

---

## 12. Project Directory Structure

```
bbms/
│
├── client/                              # React frontend (Vite)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js         # Configured Axios with JWT interceptor
│   │   │
│   │   ├── assets/
│   │   │   └── logo.svg
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Navbar.css
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Sidebar.css
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── LoadingSpinner.css
│   │   │   │   ├── StatCard.jsx         # Reusable dashboard stat card
│   │   │   │   └── StatCard.css
│   │   │   ├── donor/
│   │   │   │   ├── EligibilityBadge.jsx
│   │   │   │   ├── EligibilityBadge.css
│   │   │   │   └── DonorProfileCard.jsx
│   │   │   ├── inventory/
│   │   │   │   ├── BloodGroupCard.jsx
│   │   │   │   ├── BloodGroupCard.css
│   │   │   │   └── ExpiryAlert.jsx
│   │   │   └── request/
│   │   │       ├── RequestStatusBadge.jsx
│   │   │       └── RequestStatusBadge.css
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Auth state provider
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js               # Consumes AuthContext
│   │   │   └── useInventory.js          # Inventory data fetching hook
│   │   │
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── Landing.jsx
│   │   │   │   ├── Landing.css
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Login.css
│   │   │   │   ├── Register.jsx
│   │   │   │   └── Register.css
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminDashboard.css
│   │   │   │   ├── ManageDonors.jsx
│   │   │   │   ├── ManageDonors.css
│   │   │   │   ├── ManageHospitals.jsx
│   │   │   │   ├── ManageHospitals.css
│   │   │   │   ├── ManageInventory.jsx
│   │   │   │   ├── ManageInventory.css
│   │   │   │   ├── ManageRequests.jsx
│   │   │   │   ├── ManageRequests.css
│   │   │   │   ├── Reports.jsx
│   │   │   │   └── Reports.css
│   │   │   │
│   │   │   ├── hospital/
│   │   │   │   ├── HospitalDashboard.jsx
│   │   │   │   ├── HospitalDashboard.css
│   │   │   │   ├── InventoryView.jsx
│   │   │   │   ├── InventoryView.css
│   │   │   │   ├── SubmitRequest.jsx
│   │   │   │   ├── SubmitRequest.css
│   │   │   │   ├── RequestHistory.jsx
│   │   │   │   ├── RequestHistory.css
│   │   │   │   ├── RequestDetail.jsx
│   │   │   │   └── RequestDetail.css
│   │   │   │
│   │   │   ├── donor/
│   │   │   │   ├── DonorDashboard.jsx
│   │   │   │   ├── DonorDashboard.css
│   │   │   │   ├── DonationHistory.jsx
│   │   │   │   ├── DonationHistory.css
│   │   │   │   ├── SOSAlerts.jsx
│   │   │   │   └── SOSAlerts.css
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── SUSsurvey.jsx
│   │   │       └── SUSsurvey.css
│   │   │
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx            # All React Router v6 routes defined here
│   │   │
│   │   ├── utils/
│   │   │   ├── eligibility.js           # Client-side eligibility display helper
│   │   │   └── formatDate.js            # Date formatting helpers
│   │   │
│   │   ├── styles/
│   │   │   └── global.css               # CSS variables, reset, global base styles
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
│
├── server/                              # Node.js + Express backend
│   ├── config/
│   │   ├── db.js                        # Mongoose connection setup
│   │   └── firebase.js                  # Firebase Admin SDK initialization
│   │
│   ├── controllers/
│   │   ├── authController.js            # register, login, getMe
│   │   ├── donorController.js           # donor CRUD, eligibility, donation recording
│   │   ├── inventoryController.js       # blood unit CRUD, expiry alerts
│   │   ├── requestController.js         # fulfillment pipeline (Path A + Path B)
│   │   ├── adminController.js           # stats, reports, approvals
│   │   └── surveyController.js          # SUS submit and retrieve
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js            # JWT verification — protect()
│   │   └── roleMiddleware.js            # Role enforcement — restrictTo()
│   │
│   ├── models/
│   │   ├── User.js                      # Auth model (email, password, role, status)
│   │   ├── Donor.js                     # Donor profile model
│   │   ├── BloodUnit.js                 # Blood inventory unit model
│   │   ├── Hospital.js                  # Hospital/facility model
│   │   ├── Request.js                   # Blood request model
│   │   └── SurveyResponse.js            # SUS survey response model
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── donorRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── adminRoutes.js
│   │   └── surveyRoutes.js
│   │
│   ├── services/
│   │   ├── greedyAlgorithm.js           # Donor proximity matching (Path B core)
│   │   ├── fcmService.js                # FCM SOS push notification dispatch
│   │   ├── mapsService.js               # Google Maps distance calculation
│   │   └── expiryAlertService.js        # Cron job for daily expiry checks
│   │
│   ├── utils/
│   │   ├── eligibilityCheck.js          # isDonorEligible(), nextEligibleDate()
│   │   ├── susCalculator.js             # calculateSUS()
│   │   └── generateUnitCode.js          # Auto-generates unique blood unit codes
│   │
│   ├── validators/
│   │   ├── authValidator.js             # express-validator rules for auth routes
│   │   ├── donorValidator.js
│   │   ├── inventoryValidator.js
│   │   └── requestValidator.js
│   │
│   ├── .env                             # Environment variables (never commit)
│   ├── server.js                        # Express app entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 13. Environment Variables

### Server `.env`
```
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bbms

# JWT
JWT_SECRET=your_very_long_random_secret_string_here
JWT_EXPIRES_IN=7d

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Greedy Algorithm Config
SOS_DONOR_LIMIT=10
EXPIRY_ALERT_DAYS=3
```

### Client `.env`
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 14. Implementation Instructions for Coding Agent

Follow this exact build order. Do not skip ahead. Each step depends on the previous being complete and tested.

### Phase 1 — Backend Foundation
1. Initialise Node.js project in `/server`. Install dependencies: `express mongoose dotenv bcryptjs jsonwebtoken cors helmet express-rate-limit express-validator express-mongo-sanitize node-cron axios firebase-admin nodemon`
2. Create `server.js` — Express app with middleware (cors, helmet, json parser, rate limiter), route mounts, error handler, and MongoDB connection call
3. Create `config/db.js` — Mongoose connect function using `MONGO_URI` env variable
4. Create all 6 Mongoose models exactly as specified in Section 6

### Phase 2 — Auth
5. Create `authController.js` — `register`, `login`, `getMe` functions
6. Create `authMiddleware.js` and `roleMiddleware.js` exactly as specified in Section 9
7. Create `authRoutes.js` and mount at `/api/auth`
8. Test: register a donor, register a hospital, login as each, confirm JWT returned

### Phase 3 — Core Backend Modules
9. Create `donorController.js` and `donorRoutes.js`
10. Create `inventoryController.js` and `inventoryRoutes.js`
11. Create `adminController.js` and `adminRoutes.js`
12. Create utility functions: `eligibilityCheck.js`, `susCalculator.js`, `generateUnitCode.js`

### Phase 4 — The Fulfillment Pipeline
13. Create `services/greedyAlgorithm.js` — implement exactly as described in Section 8.2
14. Create `services/fcmService.js` — implement SOS dispatch as described in Section 10.1
15. Create `services/mapsService.js` — implement distance matrix call as described in Section 10.2
16. Create `services/expiryAlertService.js` — implement cron job as described in Section 8.3
17. Create `requestController.js` — implement the full two-path pipeline as described in Section 8.1
18. Create `requestRoutes.js` and mount at `/api/requests`
19. **Test this entire pipeline thoroughly before moving to frontend**

### Phase 5 — Survey
20. Create `surveyController.js` and `surveyRoutes.js`

### Phase 6 — React Frontend
21. Initialise React project in `/client` using Vite: `npm create vite@latest client -- --template react`
22. Install dependencies: `react-router-dom axios`
23. Create `styles/global.css` with the full CSS variable palette defined in Section 11.3
24. Create `context/AuthContext.jsx` and `hooks/useAuth.js`
25. Create `api/axiosInstance.js` with JWT interceptor
26. Create `routes/AppRoutes.jsx` with all routes and role-based protection
27. Build pages in this order: Login → Register → Admin Dashboard → Donor Dashboard → Hospital Dashboard → all sub-pages
28. Each page gets its own CSS file imported at the component level

### Phase 7 — Integration & Polish
29. Connect FCM token capture on donor dashboard first login
30. Implement real-time request status updates using polling (setInterval every 5 seconds on request detail page) — WebSockets are not required
31. Implement CSV export for reports using a client-side CSV generator (no external library needed)
32. Add loading states and error states to all API calls
33. Final review: check every route has correct middleware, every form has validation, all sensitive fields are excluded from responses

---

### Dependencies Summary

**Server `package.json` dependencies:**
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "firebase-admin": "^12.0.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

**Client `package.json` dependencies:**
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "firebase": "^10.7.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

---

*End of BBMS System Specification.*  
*Feed this entire document to your coding agent as the primary build instruction.*  
*Do not deviate from the schemas, route structures, or algorithm implementations defined here.*
