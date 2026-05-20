import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { getUserViolations, createViolation } from '../services/api';
import { AlertTriangle, Plus, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { Pagination } from '../components/Pagination';

const PAGE_SIZE = 9;

export const Infractions = () => {
  const { role, username } = useAuthStore();
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    residentUsername: '',
    type: 'NOISE_COMPLAINT',
    severity: 'MEDIUM',
    description: ''
  });

  const fetchViolations = async () => {
    try {
      setLoading(true);
      // In a real app, ADMIN/SEGURIDAD would fetch ALL violations. 
      // For now, if resident, fetch their own. Otherwise, we fetch all from monitor service
      // We will assume `getUserViolations` with empty string fetches all or we just use GET /api/monitor/violations
      const res = await (role === 'RESIDENTE' 
        ? getUserViolations(username || '')
        : fetch('/api/monitor/violations', {
            headers: { 'Authorization': `Bearer ${useAuthStore.getState().token}` }
          }).then(r => r.json()));
          
      setViolations(res || []);
    } catch (error) {
      toast.error('Error al cargar infracciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [role, username]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createViolation(formData);
      toast.success('Infracción registrada exitosamente');
      setShowModal(false);
      setFormData({ residentUsername: '', type: 'NOISE_COMPLAINT', severity: 'MEDIUM', description: '' });
      fetchViolations();
    } catch (error) {
      toast.error('Error al registrar infracción');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">
              {role === 'RESIDENTE' ? 'Mis Infracciones' : 'Gestión de Infracciones'}
            </h1>
            <p className="text-zinc-400 text-sm">
              {role === 'RESIDENTE' ? 'Historial de multas y notificaciones' : 'Registro y control de multas del condominio'}
            </p>
          </div>
        </div>

        {role !== 'RESIDENTE' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Infracción
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-10 text-zinc-400">Cargando datos...</div>
        ) : violations.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <ShieldAlert className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-zinc-400">No hay infracciones registradas.</p>
          </div>
        ) : (
          violations
            .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
            .map((v) => (
            <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  v.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  v.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  {v.severity}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(v.timestamp).toLocaleString()}
                </span>
              </div>
              <h3 className="text-zinc-200 font-medium mb-1">{v.type.replace(/_/g, ' ')}</h3>
              <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{v.description || 'Sin descripción'}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                <div className="text-xs text-zinc-500">
                  Residente: <span className="text-zinc-300 font-medium">{v.residentUsername || 'Desconocido'}</span>
                </div>
                <div className="text-xs text-zinc-500">
                  Estado: <span className="text-zinc-300">{v.status}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && violations.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalItems={violations.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-100">Registrar Infracción</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Usuario del Residente</label>
                <input 
                  required
                  type="text" 
                  value={formData.residentUsername}
                  onChange={(e) => setFormData({...formData, residentUsername: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:border-red-500/50"
                  placeholder="Ej. residente1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Tipo</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:border-red-500/50"
                >
                  <option value="NOISE_COMPLAINT">Ruido Molesto</option>
                  <option value="PET_RESTRICTED_AREA">Mascota en Área Restringida</option>
                  <option value="UNAUTHORIZED_PARKING">Estacionamiento Indebido</option>
                  <option value="LATE_PAYMENT">Retraso en Pago</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Severidad</label>
                <select 
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:border-red-500/50"
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="CRITICAL">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:border-red-500/50 resize-none"
                  placeholder="Detalles de la infracción..."
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Guardar Multa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
