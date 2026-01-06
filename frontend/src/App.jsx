import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Dashboards
import StudentDashboard from './components/Dashboard/StudentDashboard';
import AlumniDashboard from './components/Dashboard/AlumniDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';

// Common Components
import Loader from './components/Common/Loader';
import Chatbot from './components/Common/Chatbot';

// Messaging
import MessagingPage from './components/Messaging/MessagingPage.jsx';

// AI Components
import MentorSuggestions from './components/AI/MentorSuggestions';
import SetupProfile from './components/AI/SetupProfile';
import MentorshipDashboard from './components/AI/MentorshipDashboard';

// Alumni Profiles
import ProfilesList from './components/Profiles/ProfilesList';
import AlumniProfilePage from './components/Profiles/AlumniProfilePage';

// 🔥 Job Board Page
import JobBoard from './pages/JobBoard';

// Utils
import PrivateRoute from './utils/PrivateRoute';

/* =========================
   Dashboard Router
========================= */
const DashboardRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'student':
      return <StudentDashboard />;
    case 'alumni':
      return <AlumniDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

/* =========================
   Unauthorized Page
========================= */
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
      <p className="text-red-500 mt-2">You don't have permission to access this page.</p>
    </div>
  </div>
);

/* =========================
   App Content
========================= */
const AppContent = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="App">
      <Routes>

        {/* ===== Public Routes ===== */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          }
        />

        {/* ===== Dashboard ===== */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <DashboardRouter />
            </PrivateRoute>
          }
        />

        {/* ===== Job Board ===== */}
        <Route
          path="/jobs"
          element={
            <PrivateRoute>
              <JobBoard />
            </PrivateRoute>
          }
        />

        {/* ===== Messaging ===== */}
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <MessagingPage />
            </PrivateRoute>
          }
        />

        {/* ===== Alumni Directory ===== */}
        <Route
          path="/alumni-directory"
          element={
            <PrivateRoute>
              <ProfilesList />
            </PrivateRoute>
          }
        />

        <Route
          path="/alumni/:id"
          element={
            <PrivateRoute>
              <AlumniProfilePage />
            </PrivateRoute>
          }
        />

        {/* ===== AI Mentorship ===== */}
        <Route
          path="/ai-matching"
          element={
            <PrivateRoute>
              <MentorSuggestions />
            </PrivateRoute>
          }
        />
        <Route
          path="/setup-profile"
          element={
            <PrivateRoute>
              <SetupProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/mentorships"
          element={
            <PrivateRoute>
              <MentorshipDashboard />
            </PrivateRoute>
          }
        />

        {/* ===== Unauthorized ===== */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ===== Default ===== */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* ===== Catch All ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      {/* Global Chatbot */}
      {isAuthenticated && <Chatbot />}

      {/* Toasts */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        theme="colored"
      />
    </div>
  );
};

/* =========================
   Main App
========================= */
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
