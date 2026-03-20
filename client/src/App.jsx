import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SchoolPage from './pages/SchoolPage';
import Schools from './pages/Schools';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminTenants from './pages/admin/Tenants';
import AdminInstructors from './pages/admin/Instructors';
import AdminBookings from './pages/admin/Bookings';
import AdminReviews from './pages/admin/Reviews';
import AdminPackages from './pages/admin/Packages';
import AdminAreas from './pages/admin/Areas';
import AdminUsers from './pages/admin/Users';
import TheoryTest from './pages/TheoryTest';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="schools" element={<Schools />} />
        <Route path="school/:slug" element={<SchoolPage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="theory" element={<TheoryTest />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin/tenants" element={<AdminTenants />} />
        <Route path="admin/instructors" element={<AdminInstructors />} />
        <Route path="admin/bookings" element={<AdminBookings />} />
        <Route path="admin/reviews" element={<AdminReviews />} />
        <Route path="admin/packages" element={<AdminPackages />} />
        <Route path="admin/areas" element={<AdminAreas />} />
        <Route path="admin/users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}
