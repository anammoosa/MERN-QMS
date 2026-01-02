import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin/*" element={<PageTransition><AdminDashboard /></PageTransition>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Instructor']} />}>
          <Route path="/teacher/*" element={<PageTransition><TeacherDashboard /></PageTransition>} />
        </Route>

        {/* Support legacy route for existing users/links */}
        <Route element={<ProtectedRoute allowedRoles={['Instructor']} />}>
          <Route path="/instructor/*" element={<Navigate to="/teacher" replace />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
          <Route path="/student/*" element={<PageTransition><StudentDashboard /></PageTransition>} />
        </Route>

        <Route path="/unauthorized" element={<div className="p-10 text-center">Unauthorized</div>} />
      </Routes>
    </AnimatePresence>
  );
};

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export default App;
