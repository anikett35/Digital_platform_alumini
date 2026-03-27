import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Loader from './components/Common/Loader';
import PrivateRoute from './utils/PrivateRoute';

import Login    from './components/Auth/Login';
import Register from './components/Auth/Register';

import StudentDashboard from './components/Dashboard/StudentDashboard';
import AlumniDashboard  from './components/Dashboard/AlumniDashboard';
import AdminDashboard   from './components/Dashboard/AdminDashboard';
import AdminApprovalPage from './components/Dashboard/AdminApprovalPage';

import JobsList         from './components/Jobs/JobsList';
import MessagingPage    from './components/Messaging/MessagingPage';
import ProfilesList     from './components/Profiles/ProfilesList';
import AlumniProfilePage from './components/Profiles/AlumniProfilePage';
import MentorSuggestions  from './components/AI/MentorSuggestions';
import SetupProfile       from './components/AI/SetupProfile';
import MentorshipDashboard from './components/AI/MentorshipDashboard';
import VerificationRequest from './components/Verification/VerificationRequest';
import PendingApproval     from './components/Verification/PendingApproval';
import CommunitiesPage  from './components/Community/CommunitiesPage';
import MeetingsPage     from './components/Meetings/MeetingsPage';
import InsightsPage     from './components/Insights/InsightsPage';

const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'alumni')  return <AlumniDashboard />;
  if (user?.role === 'admin')   return <AdminDashboard />;
  return <Navigate to="/login" replace />;
};

const NotFound = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <p className="text-6xl font-bold text-violet-600 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/dashboard" className="btn-primary">Go Home</a>
    </div>
  </div>
);

function AppContent() {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {isAuthenticated && !isAuthPage && <Navbar />}
      <main className={`flex-1 flex flex-col ${isAuthenticated && !isAuthPage ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/login"    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
          <Route path="/dashboard/*" element={<PrivateRoute><DashboardRouter /></PrivateRoute>} />
          <Route path="/jobs"           element={<PrivateRoute><JobsList /></PrivateRoute>} />
          <Route path="/messages"       element={<PrivateRoute><MessagingPage /></PrivateRoute>} />
          <Route path="/alumni-directory" element={<PrivateRoute><ProfilesList /></PrivateRoute>} />
          <Route path="/alumni/:id"     element={<PrivateRoute><AlumniProfilePage /></PrivateRoute>} />
          <Route path="/ai-matching"    element={<PrivateRoute><MentorSuggestions /></PrivateRoute>} />
          <Route path="/setup-profile"  element={<PrivateRoute><SetupProfile /></PrivateRoute>} />
          <Route path="/mentorships"    element={<PrivateRoute><MentorshipDashboard /></PrivateRoute>} />
          <Route path="/verify"         element={<PrivateRoute><VerificationRequest /></PrivateRoute>} />
          <Route path="/verification-status" element={<PrivateRoute><PendingApproval /></PrivateRoute>} />
          <Route path="/communities"    element={<PrivateRoute><CommunitiesPage /></PrivateRoute>} />
          <Route path="/meetings"       element={<PrivateRoute><MeetingsPage /></PrivateRoute>} />
          <Route path="/insights"       element={<PrivateRoute><InsightsPage /></PrivateRoute>} />
          <Route path="/admin/approvals" element={<PrivateRoute><AdminApprovalPage /></PrivateRoute>} />
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {isAuthenticated && !isAuthPage && <Footer />}
      <ToastContainer position="top-right" autoClose={3500} theme="light"
        toastClassName="!rounded-2xl !shadow-lg !border !border-gray-100 !font-sans" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}