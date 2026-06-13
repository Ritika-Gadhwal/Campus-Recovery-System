import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostItem from './pages/PostItem';
import ItemDetails from './pages/ItemDetails';
import MyItems from './pages/MyItems';
import Claims from './pages/Claims';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Layout Controller Component to conditionally render Sidebar
const AppLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />
      <div className="flex flex-1">
        {/* Only show Sidebar if student is logged in */}
        {user && <Sidebar />}
        <main className="flex-1 w-full overflow-x-hidden">
          <Routes>
            {/* Public Pathways */}
            <Route path="/" element={!user ? <Home /> : <Navigate to="/dashboard" replace />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

            {/* Protected Pathways */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/post-lost" element={<PrivateRoute><PostItem defaultType="Lost" /></PrivateRoute>} />
            <Route path="/post-found" element={<PrivateRoute><PostItem defaultType="Found" /></PrivateRoute>} />
            <Route path="/items/:id" element={<PrivateRoute><ItemDetails /></PrivateRoute>} />
            <Route path="/my-items" element={<PrivateRoute><MyItems /></PrivateRoute>} />
            <Route path="/claims" element={<PrivateRoute><Claims /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Admin Pathways */}
            <Route path="/admin" element={<PrivateRoute><AdminRoute><AdminDashboard /></AdminRoute></PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <AppLayout />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
