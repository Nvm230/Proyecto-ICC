import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { getUserViolations, createViolation } from '../services/api';
import { AlertTriangle, Plus, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { Pagination } from '../components/Pagination';

const SEVERITY_MAP: Record<string, string> = {
  CRITICAL: 'Crítica',
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja'
};

const STATUS_MAP: Record<string, string> = {
  PENDING: 'Pendiente',
  RESOLVED: 'Resuelta',
  FALSE_POSITIVE: 'Falso Positivo',
  FINED: 'Multada'
};

const TYPE_MAP: Record<string, string> = {
  NOISE_COMPLAINT: 'Ruido Molesto',
  PET_RESTRICTED_AREA: 'Mascota en Área Restringida',
  UNAUTHORIZED_PARKING: 'Estacionamiento Indebido',
  LATE_PAYMENT: 'Retraso en Pago',
  SENSOR_TRIGGERED: 'Alerta de Sensor'
};

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

  const [showFineModal, setShowFineModal] = useState(false);
  const [selectedViolationId, setSelectedViolationId] = useState<number | null>(null);
  const [fineResident, setFineResident] = useState('');
  const [fineDescription, setFineDescription] = useState('');

  const fetchViolations = async () => {
    try {
      setLoading(true);
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

  const handleResolve = async (id: number) => {
    try {
      await fetch(`/api/monitor/violations/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${useAuthStore.getState().token}` }
      });
      toast.success('Infracción resuelta');
      fetchViolations();
    } catch (e) { toast.error('Error al resolver'); }
  };

  const handleFalsePositive = async (id: number) => {
    try {
      await fetch(`/api/monitor/violations/${id}/false-positive`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${useAuthStore.getState().token}` }
      });
      toast.success('Marcado como falso positivo');
      fetchViolations();
    } catch (e) { toast.error('Error al actualizar'); }
  };

  const handleFineSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedViolationId) return;
    try {
      await fetch(`/api/monitor/violations/${selectedViolationId}/fine`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ residentUsername: fineResident, description: fineDescription })
      });
      toast.success('Multa asignada exitosamente');
      setShowFineModal(false);
      setFineResident('');
      setFineDescription('');
      fetchViolations();
    } catch (e) { toast.error('Error al asignar multa'); }
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

        {role === 'ADMIN' || role === 'RECEPCION' ? (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Infracción
          </button>
        ) : null}
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
                  {SEVERITY_MAP[v.severity] || v.severity}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(v.timestamp).toLocaleString()}
                </span>
              </div>
              <h3 className="text-zinc-200 font-medium mb-1">{TYPE_MAP[v.type] || v.type.replace(/_/g, ' ')}</h3>
              <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{v.description || 'Sin descripción'}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 mb-4">
                <div className="text-xs text-zinc-500">
                  Residente: <span className="text-zinc-300 font-medium">{v.residentUsername || 'Desconocido'}</span>
                </div>
                <div className="text-xs text-zinc-500">
                  Estado: <span className="text-zinc-300">{STATUS_MAP[v.status] || v.status}</span>
                </div>
              </div>

              {(role === 'ADMIN' || role === 'RECEPCION') && (v.status === 'PENDING' || v.status === 'FINED') && (                <div className="flex flex-wrap gap-2 pt-2">
                  <button 
                    onClick={() => handleResolve(v.id)}
                    className="flex-1 px-2 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded text-xs font-medium transition-colors"
                  >
                    Resolver
                  </button>
                  <button 
                    onClick={() => handleFalsePositive(v.id)}
                    className="flex-1 px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-medium transition-colors"
                  >
                    Falso Positivo
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedViolationId(v.id);
                      setShowFineModal(true);
                    }}
                    className="flex-1 px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-xs font-medium transition-colors"
                  >
                    Multar
                  </button>
                </div>
              )}
              {role === 'RESIDENTE' && (v.status === 'PENDING' || v.status === 'FINED') && (
                <div className="pt-3 border-t border-zinc-800/50 mt-2">
                  <p className="text-xs text-orange-400 font-medium text-center">
                    Diríjase a recepción para resolver su estado
                  </p>
                </div>
              )}
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

      {showFineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-100">Asignar Multa</h2>
            </div>
            <form onSubmit={handleFineSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Usuario del Residente a Multar</label>
                <input 
                  required
                  type="text" 
                  value={fineResident}
                  onChange={(e) => setFineResident(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:border-red-500/50"
                  placeholder="Ej. residente1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción de la Multa</label>
                <textarea 
                  required
                  rows={3}
                  value={fineDescription}
                  onChange={(e) => setFineDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:border-red-500/50 resize-none"
                  placeholder="Motivo de la multa..."
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowFineModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Confirmar Multa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
