import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Layout } from './components/Layout';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDiscovery } from './pages/DoctorDiscovery';
import { DoctorProfile } from './pages/DoctorProfile';
import { Consultation } from './pages/Consultation';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { MedicalRecords } from './pages/MedicalRecords';
import { DoctorSchedule } from './pages/DoctorSchedule';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDoctors } from './pages/AdminDoctors';
import { AdminPatients } from './pages/AdminPatients';
import { AdminAppointments } from './pages/AdminAppointments';
import { AdminSettings } from './pages/AdminSettings';
import { PatientAppointments } from './pages/PatientAppointments';
import { DoctorPatients } from './pages/DoctorPatients';
import { PatientProfile } from './pages/PatientProfile';
import { DoctorProfileManagement } from './pages/DoctorProfileManagement';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth type="login" />} />
        <Route path="/signup" element={<Auth type="signup" />} />

        {/* Patient Routes */}
        <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="/patient/dashboard" element={<Layout role="patient"><PatientDashboard /></Layout>} />
        <Route path="/patient/doctors" element={<Layout role="patient"><DoctorDiscovery /></Layout>} />
        <Route path="/patient/doctors/:id" element={<Layout role="patient"><DoctorProfile /></Layout>} />
        <Route path="/patient/appointments" element={<Layout role="patient"><PatientAppointments /></Layout>} />
        <Route path="/patient/records" element={<Layout role="patient"><MedicalRecords /></Layout>} />
        <Route path="/patient/profile" element={<Layout role="patient"><PatientProfile /></Layout>} />
        <Route path="/patient/consultation/:id" element={<Consultation />} />

        {/* Doctor Routes */}
        <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="/doctor/dashboard" element={<Layout role="doctor"><DoctorDashboard /></Layout>} />
        <Route path="/doctor/schedule" element={<Layout role="doctor"><DoctorSchedule /></Layout>} />
        <Route path="/doctor/patients" element={<Layout role="doctor"><DoctorPatients /></Layout>} />
        <Route path="/doctor/profile" element={<Layout role="doctor"><DoctorProfileManagement /></Layout>} />
        <Route path="/doctor/consultation/:id" element={<Consultation />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Layout role="admin"><AdminDashboard /></Layout>} />
        <Route path="/admin/doctors" element={<Layout role="admin"><AdminDoctors /></Layout>} />
        <Route path="/admin/patients" element={<Layout role="admin"><AdminPatients /></Layout>} />
        <Route path="/admin/appointments" element={<Layout role="admin"><AdminAppointments /></Layout>} />
        <Route path="/admin/settings" element={<Layout role="admin"><AdminSettings /></Layout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
