import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import CreateAdmin from './pages/CreateAdmin';
import CreateHospital from './pages/CreateHospital';
import ManageDoctors from './pages/ManageDoctors';
import ManageNurses from './pages/ManageNurses';
import ManageAdmins from './pages/ManageAdmins';
import ManageHospitals from './pages/ManageHospitals';

// Hospital Admin Imports
import HospitalLayout from './components/HospitalLayout';
import HospitalDashboard from './pages/HospitalDashboard';
import CreateHospitalWard from './pages/CreateHospitalWard';
import CreateHospitalDoctor from './pages/CreateHospitalDoctor';
import CreateHospitalNurse from './pages/CreateHospitalNurse';
import ManageHospitalDoctors from './pages/ManageHospitalDoctors';
import ManageHospitalNurses from './pages/ManageHospitalNurses';

// Ward Admin Imports
import WardLayout from './components/WardLayout';
import WardDashboard from './pages/WardDashboard';
import CreatePatient from './pages/CreatePatient';
import AssignDoctor from './pages/AssignDoctor';
import AssignNurse from './pages/AssignNurse';
import WardPatientProfile from './pages/WardPatientProfile';

// Doctor Imports
import DoctorLayout from './components/DoctorLayout';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorWardView from './pages/DoctorWardView';

// Nurse Imports
import NurseLayout from './components/NurseLayout';
import NurseDashboard from './pages/NurseDashboard';
import NurseWardView from './pages/NurseWardView';

import './App.css';

// Placeholder for future components
const Placeholder = ({ title }) => <div style={{ padding: '2rem' }}><h2>{title} Integration Pending</h2></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="create/admin" element={<CreateAdmin />} />
          <Route path="create/hospital" element={<CreateHospital />} />

          <Route path="manage/doctors" element={<ManageDoctors />} />
          <Route path="manage/nurses" element={<ManageNurses />} />
          <Route path="manage/admins" element={<ManageAdmins />} />
          <Route path="manage/hospitals" element={<ManageHospitals />} />
        </Route>

        <Route path="/hospital" element={<HospitalLayout />}>
          <Route index element={<HospitalDashboard />} />
          <Route path="create/ward" element={<CreateHospitalWard />} />
          <Route path="create/doctor" element={<CreateHospitalDoctor />} />
          <Route path="create/nurse" element={<CreateHospitalNurse />} />
          <Route path="manage/doctors" element={<ManageHospitalDoctors />} />
          <Route path="manage/nurses" element={<ManageHospitalNurses />} />
        </Route>

        <Route path="/ward" element={<WardLayout />}>
          <Route index element={<WardDashboard />} />
          <Route path="create-patient" element={<CreatePatient />} />
          <Route path="assign-doctor" element={<AssignDoctor />} />
          <Route path="assign-nurse" element={<AssignNurse />} />
          <Route path="patient/:bed_no" element={<WardPatientProfile />} />
        </Route>

        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="ward/:hospital_id/:ward_id" element={<DoctorWardView />} />
          <Route path="ward/:hospital_id/:ward_id/patient/:bed_no" element={<WardPatientProfile />} />
        </Route>

        <Route path="/nurse" element={<NurseLayout />}>
          <Route index element={<NurseDashboard />} />
          <Route path="ward/:hospital_id/:ward_id" element={<NurseWardView />} />
          <Route path="ward/:hospital_id/:ward_id/patient/:bed_no" element={<WardPatientProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
