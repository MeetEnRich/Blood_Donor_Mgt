import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Public pages
import Landing from '../pages/public/Landing';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageDonors from '../pages/admin/ManageDonors';
import ManageHospitals from '../pages/admin/ManageHospitals';
import ManageInventory from '../pages/admin/ManageInventory';
import ManageRequests from '../pages/admin/ManageRequests';
import Reports from '../pages/admin/Reports';

// Hospital pages
import HospitalDashboard from '../pages/hospital/HospitalDashboard';
import InventoryView from '../pages/hospital/InventoryView';
import SubmitRequest from '../pages/hospital/SubmitRequest';
import RequestHistory from '../pages/hospital/RequestHistory';
import RequestDetail from '../pages/hospital/RequestDetail';

// Donor pages
import DonorDashboard from '../pages/donor/DonorDashboard';
import DonationHistory from '../pages/donor/DonationHistory';
import SOSAlerts from '../pages/donor/SOSAlerts';

// Shared
import SUSsurvey from '../pages/shared/SUSsurvey';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/donors" element={<ProtectedRoute allowedRoles={['admin']}><ManageDonors /></ProtectedRoute>} />
      <Route path="/admin/hospitals" element={<ProtectedRoute allowedRoles={['admin']}><ManageHospitals /></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><ManageInventory /></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={['admin']}><ManageRequests /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />

      {/* Hospital Routes */}
      <Route path="/hospital/dashboard" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalDashboard /></ProtectedRoute>} />
      <Route path="/hospital/inventory" element={<ProtectedRoute allowedRoles={['hospital']}><InventoryView /></ProtectedRoute>} />
      <Route path="/hospital/requests/new" element={<ProtectedRoute allowedRoles={['hospital']}><SubmitRequest /></ProtectedRoute>} />
      <Route path="/hospital/requests" element={<ProtectedRoute allowedRoles={['hospital']}><RequestHistory /></ProtectedRoute>} />
      <Route path="/hospital/requests/:id" element={<ProtectedRoute allowedRoles={['hospital']}><RequestDetail /></ProtectedRoute>} />

      {/* Donor Routes */}
      <Route path="/donor/dashboard" element={<ProtectedRoute allowedRoles={['donor']}><DonorDashboard /></ProtectedRoute>} />
      <Route path="/donor/history" element={<ProtectedRoute allowedRoles={['donor']}><DonationHistory /></ProtectedRoute>} />
      <Route path="/donor/alerts" element={<ProtectedRoute allowedRoles={['donor']}><SOSAlerts /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/survey" element={<ProtectedRoute><SUSsurvey /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;
