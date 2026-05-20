import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import { Users } from './pages/Users';
import { Infractions } from './pages/Infractions';
import { Settings } from './pages/Settings';

import { useAuthStore } from './store/useAuthStore';

// Placeholder component for cameras
const Cameras = () => <div className="text-zinc-400 p-8 text-center bg-zinc-900 rounded-2xl border border-zinc-800">Cámaras (En desarrollo)</div>;

// Smart index: residents go straight to their infractions
const DashboardIndex = () => {
  const role = useAuthStore((s) => s.role);
  if (role === 'RESIDENTE') return <Navigate to="/dashboard/infractions" replace />;
  return <Dashboard />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '!bg-zinc-900 !text-white !border !border-zinc-800',
        }} 
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardIndex />} />
          <Route path="cameras" element={<Cameras />} />
          <Route path="infractions" element={<Infractions />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
