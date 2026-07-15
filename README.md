# Blood Bank Management System (BBMS)

A robust, full-stack Blood Bank Management System built to streamline the blood donation supply chain, matching donors to hospitals based on real-time inventory and geographical proximity.

## Overview

The BBMS connects blood donors, hospitals, and system administrators into a single unified platform. By digitizing inventory, tracking donor eligibility, and offering emergency SOS alerts to nearby eligible donors, the system aims to solve critical shortages in the blood supply chain.

This project was built using the **MERN** stack (MongoDB, Express.js, React, Node.js/Vite).

## Features

- **Role-Based Dashboards**: Distinct portals for System Administrators, Hospitals, and Donors.
- **Geographical Donor Matching**: Uses a greedy algorithm to alert the nearest eligible donors during emergency blood shortages.
- **Real-Time Inventory Management**: Hospitals and Admins can view available blood units across the network.
- **Automated Expiry Alerts**: Scheduled cron jobs check for expiring blood units and update their status automatically.
- **Donor Eligibility Tracking**: Automatically calculates donor eligibility based on the 90-day wait period rule.
- **System Usability Survey (SUS)**: Built-in survey for continuous feedback and system evaluation.

## Technology Stack

- **Frontend**: React, Vite, React Router v6, Context API
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Styling**: Vanilla CSS (Professional Healthcare Theme)

## Project Structure

This is a monorepo containing both the client and server.

```text
blood_donor_mgt/
├── client/          # Vite + React Frontend
│   ├── src/
│   │   ├── api/     # Axios instance & interceptors
│   │   ├── components/
│   │   ├── pages/   # Role-based pages (admin, donor, hospital, public)
│   │   └── styles/  # Global CSS Design System
│   └── package.json
└── server/          # Node.js + Express Backend
    ├── config/      # DB and external service configurations
    ├── controllers/ # Route logic
    ├── middleware/  # Auth & Role restrictions
    ├── models/      # Mongoose schemas
    ├── routes/      # Express routes
    ├── services/    # Greedy matching & Cron jobs
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Local MongoDB instance running on `localhost:27017`
- Environment variables: Please ensure that `.env` files exist in both the `/server` and `/client` directories before starting.
  - Server `.env` needs `MONGO_URI`, `JWT_SECRET`, etc.
  - Client `.env` needs `VITE_API_URL=http://localhost:5000/api`

### Automatic Setup (Windows)

We have included batch scripts to automate the installation, database seeding, and execution process.

**1. Install & Seed Database:**
Double-click the **`setup.bat`** file in the root directory. This will:
- Install all backend dependencies
- Seed the database with test data (Admin, Hospitals, Donors)
- Install all frontend dependencies

**2. Start the Application:**
Double-click the **`start.bat`** file. This will automatically open two new command prompt windows to run both the frontend and backend servers simultaneously.
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

### Manual Setup

If you are not on Windows or prefer to install dependencies manually:

#### 1. Backend Setup
```bash
cd server
npm install
```

#### 2. Frontend Setup
```bash
cd client
npm install
```

#### 3. Seeding the Database
To test the application properly, you should seed the database with realistic test data. This will clear existing collections and generate an Admin, 5 Donors, 3 Hospitals, 20 Blood Units, and several Requests.
```bash
cd server
npm run seed
```

#### 4. Running the Application
You need to start both the backend and frontend servers.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Visit the app at `http://localhost:5173`.

## Test Credentials

If you seeded the database using `npm run seed`, you can log in using the following test accounts:

**Admin:**
- Email: `admin@bbms.com`
- Password: `Admin@123`

**Hospital:**
- Email: `info@fmclafia.com`
- Password: `Hospital@123`

**Donor:**
- Email: `chinedu.okafor@email.com`
- Password: `Password@123`

### Quick Login Buttons
To make evaluating and defending the project as seamless as possible, the login screen includes **Quick Login Buttons** at the bottom. You can simply click the corresponding button (e.g. *Login as Admin*, *Login as Hospital*, or *Login as Donor*) to instantly authenticate with the seeded test accounts without having to type the credentials manually.

*(All test donor and hospital accounts use the passwords `Password@123` and `Hospital@123` respectively).*

## Security & Best Practices

- Passwords are hashed using `bcryptjs` (12 rounds) via Mongoose `pre('save')` hooks.
- Routes are protected by JWT authentication and Role-Based Access Control (RBAC).
- `helmet`, `cors`, and `express-rate-limit` are used to secure HTTP headers, prevent cross-origin issues, and mitigate brute-force attacks.

## License
This project is for educational/academic purposes.
