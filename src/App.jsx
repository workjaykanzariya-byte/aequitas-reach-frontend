import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Health from './pages/Health';

import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminSettings from './pages/AdminSettings';
import CampaignsList from './pages/campaigns/CampaignsList';
import CampaignDetails from './pages/campaigns/CampaignDetails';
import Members from './pages/Members';
import Users from './pages/Users';
import Forbidden from './pages/Forbidden';
import TemplatesList from './pages/templates/TemplatesList';
import TemplateForm from './pages/TemplateForm';
import TemplateDetails from './pages/templates/TemplateDetails';

export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/forgot" element={<ForgotPassword/>} />
          <Route path="/403" element={<Forbidden/>} />
          <Route path="/health" element={<Health />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Layout><Profile/></Layout></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><Layout><CampaignsList/></Layout></ProtectedRoute>} />
            <Route path="/campaigns/:id" element={<ProtectedRoute><Layout><CampaignDetails/></Layout></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Layout><TemplatesList/></Layout></ProtectedRoute>} />
          <Route path="/templates/new" element={<ProtectedRoute><Layout><TemplateForm/></Layout></ProtectedRoute>} />
          <Route path="/templates/:id/edit" element={<ProtectedRoute><Layout><TemplateForm/></Layout></ProtectedRoute>} />
          <Route path="/templates/:id" element={<ProtectedRoute><Layout><TemplateDetails/></Layout></ProtectedRoute>} />
          <Route path="/members"   element={<ProtectedRoute><Layout><Members/></Layout></ProtectedRoute>} />
          <Route path="/users"     element={<ProtectedRoute><Layout><Users/></Layout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><Layout><AdminSettings/></Layout></ProtectedRoute>} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

