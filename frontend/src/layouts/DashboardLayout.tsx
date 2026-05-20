import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Users, LogOut, Settings } from 'lucide-react';

export default function DashboardLayout() {
  const { token, role, logout } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    ...(role !== 'RESIDENTE' ? [{ icon: Activity, label: 'Alertas en Vivo', path: '/dashboard' }] : []),
    { icon: AlertTriangle, label: 'Infracciones', path: '/dashboard/infractions' },
    ...(role !== 'RESIDENTE' ? [{ icon: Users, label: 'Usuarios', path: '/dashboard/users' }] : []),
    { icon: Settings, label: 'Configuración', path: '/dashboard/settings' },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 glass border-r border-zinc-800/50 flex flex-col"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <div className="w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
            </div>
            SmartCondo
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors group"
            >
              <item.icon className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800/50">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="p-8 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
