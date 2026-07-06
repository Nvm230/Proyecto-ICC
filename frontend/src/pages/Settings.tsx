import { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { changePassword } from '../services/api';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { username, role } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ newPassword });
      toast.success('Contraseña actualizada correctamente');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Error al actualizar la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'profile' 
                ? 'bg-zinc-800/50 text-zinc-200 border border-zinc-700/50' 
                : 'hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}>
            <User className="w-5 h-5" />
            <span>Mi Perfil</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'notifications' 
                ? 'bg-zinc-800/50 text-zinc-200 border border-zinc-700/50' 
                : 'hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}>
            <Bell className="w-5 h-5" />
            <span>Notificaciones</span>
          </button>

          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'security' 
                ? 'bg-zinc-800/50 text-zinc-200 border border-zinc-700/50' 
                : 'hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}>
            <Shield className="w-5 h-5" />
            <span>Seguridad del Sistema</span>
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'profile' && (
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
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-zinc-100 mb-4">Preferencias de Notificaciones</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <div>
                    <h3 className="text-zinc-200 font-medium">Notificaciones de Alertas</h3>
                    <p className="text-zinc-500 text-sm">Recibir alertas de seguridad y cámaras en tiempo real.</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-blue-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-zinc-100 mb-4">Cambiar Contraseña</h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Confirmar Contraseña</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                    placeholder="Confirma la contraseña"
                    required
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSubmitting || !newPassword || !confirmPassword}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
