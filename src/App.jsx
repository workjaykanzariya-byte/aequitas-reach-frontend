import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminSettings from './pages/AdminSettings'; // optional later
import Forbidden from './pages/Forbidden';
import Profile from './pages/Profile';

export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/403" element={<Forbidden/>} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile/></Layout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><Layout><AdminSettings/></Layout></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
