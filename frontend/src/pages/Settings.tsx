
import { Settings as SettingsIcon, Shield, Bell, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Settings = () => {
  const { username, role } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-zinc-800 rounded-xl">
          <SettingsIcon className="w-6 h-6 text-zinc-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Configuración</h1>
          <p className="text-zinc-400 text-sm">Ajustes de cuenta y preferencias del sistema</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-zinc-800/50 text-zinc-200 rounded-xl font-medium border border-zinc-700/50">
            <User className="w-5 h-5 text-zinc-400" />
            <span>Mi Perfil</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200 rounded-xl font-medium transition-colors">
            <Bell className="w-5 h-5" />
            <span>Notificaciones</span>
          </button>
          {role !== 'RESIDENTE' && (
            <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200 rounded-xl font-medium transition-colors">
              <Shield className="w-5 h-5" />
              <span>Seguridad del Sistema</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-zinc-100 mb-4">Información de la Cuenta</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre de Usuario</label>
                <input 
                  type="text" 
                  disabled 
                  value={username || ''}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-500 cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Rol de Acceso</label>
                <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-500 cursor-not-allowed uppercase">
                  {role}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-end">
              <button disabled className="px-4 py-2 bg-zinc-800 text-zinc-500 rounded-lg cursor-not-allowed font-medium">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
