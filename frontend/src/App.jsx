// Import React and necessary libraries
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import AlumniDashboard from './components/Dashboard/AlumniDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import Loader from './components/Common/Loader';
import MessagingPage from './components/Messaging/MessagingPage.jsx';

// AI Components
import MentorSuggestions from './components/AI/MentorSuggestions';
import SetupProfile from './components/AI/SetupProfile';
import MentorshipDashboard from './components/AI/MentorshipDashboard';

// Utils
import PrivateRoute from './utils/PrivateRoute';

// Dashboard Router Component
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

// Unauthorized Page Component
const UnauthorizedPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
      <p className="text-red-500 mb-4">You don't have permission to access this page.</p>
      <button
        onClick={() => window.history.back()}
        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

// Main App Content
const AppContent = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
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

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardRouter />
            </PrivateRoute>
          }
        />

        {/* Messages */}
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <MessagingPage />
            </PrivateRoute>
          }
        />

        {/* Role-based Dashboards */}
        <Route
          path="/student/*"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/alumni/*"
          element={
            <PrivateRoute allowedRoles={['alumni']}>
              <AlumniDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* ✅ AI Mentorship System Routes */}
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

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Default Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

// Main App Component
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