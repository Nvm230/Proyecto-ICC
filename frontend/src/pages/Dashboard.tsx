import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertOctagon, Camera, CheckCircle2 } from 'lucide-react';
import { api, resolveViolation } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { Pagination } from '../components/Pagination';

interface Violation {
  id: number;
  type: string;
  severity: string;
  cameraId: string;
  status: string;
  timestamp: string;
}

const PAGE_SIZE = 10;

export default function Dashboard() {
  const { role } = useAuthStore();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [page, setPage] = useState(1);

  const handleResolve = async (id: number) => {
    try {
      await resolveViolation(id);
      // Update state instantly without a full reload
      setViolations(prev => prev.map(v => v.id === id ? { ...v, status: 'RESOLVED' } : v));
      toast.success('Alerta marcada como resuelta');
    } catch {
      toast.error('No se pudo resolver la alerta');
    }
  };

  const [showFineModal, setShowFineModal] = useState(false);
  const [selectedViolationId, setSelectedViolationId] = useState<number | null>(null);
  const [fineResident, setFineResident] = useState('');
  const [fineDescription, setFineDescription] = useState('');

  const handleFalsePositive = async (id: number) => {
    try {
      await api.patch(`/monitor/violations/${id}/false-positive`);
      setViolations(prev => prev.map(v => v.id === id ? { ...v, status: 'FALSE_POSITIVE' } : v));
      toast.success('Marcado como falso positivo');
    } catch (e) { toast.error('Error al actualizar'); }
  };

  const handleFineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedViolationId) return;
    try {
      await api.patch(`/monitor/violations/${selectedViolationId}/fine`, {
        residentUsername: fineResident,
        description: fineDescription
      });
      setViolations(prev => prev.map(v => v.id === selectedViolationId ? { ...v, status: 'FINED' } : v));
      toast.success('Multa asignada exitosamente');
      setShowFineModal(false);
      setFineResident('');
      setFineDescription('');
    } catch (e) { toast.error('Error al asignar multa'); }
  };

  useEffect(() => {
    // 1. Fetch initial state
    const fetchViolations = async () => {
      try {
        const res = await api.get('/monitor/violations');
        setViolations(res.data);
      } catch (error) {
        setViolations([]);
      }
    };
    fetchViolations();

    // 2. Setup WebSocket Connection
    const socket = new SockJS('/ws/alerts'); // Handled by Nginx proxy
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('Connected to WebSocket!');
        stompClient.subscribe('/topic/alerts', (message) => {
          const newViolation: Violation = JSON.parse(message.body);
          
          // Prepend new violation
          setViolations((prev) => [newViolation, ...prev].slice(0, 50)); // Keep last 50
          
          // Show Toast notification
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-zinc-900 border border-zinc-800 shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <AlertOctagon className={`h-10 w-10 ${newViolation.severity === 'HIGH' ? 'text-red-500' : 'text-amber-500'}`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-white">
                      Nueva Infracción Detectada
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {newViolation.type.replace(/_/g, ' ')} en {newViolation.cameraId.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ));
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  const stats = [
    { label: 'Cámaras Activas', value: '12/12', icon: Camera, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Alertas Hoy', value: violations.length.toString(), icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Infracciones Pendientes', value: violations.filter(v => v.status === 'PENDING').length.toString(), icon: AlertOctagon, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { label: 'Resueltas', value: '28', icon: CheckCircle2, color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Centro de Monitoreo</h1>
        <p className="text-zinc-400">Visión general del estado de seguridad del condominio en tiempo real.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 rounded-2xl flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-zinc-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Violations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-800/50">
          <h2 className="text-lg font-semibold text-white">Infracciones Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/50 text-zinc-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Cámara / Sensor</th>
                <th className="px-6 py-4 font-medium">Severidad</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Tiempo</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              <AnimatePresence>
                {violations
                  .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                  .map((v) => (
                  <motion.tr 
                    key={v.id}
                    initial={{ opacity: 0, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                    animate={{ opacity: 1, backgroundColor: 'transparent' }}
                    transition={{ duration: 1 }}
                    className="hover:bg-zinc-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-200">{v.type?.replace(/_/g, ' ') ?? 'Sin tipo'}</td>
                    <td className="px-6 py-4 text-zinc-400">{v.cameraId?.replace(/_/g, ' ') ?? 'Manual'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                        v.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                        v.severity === 'CRITICAL' ? 'bg-red-600/20 text-red-500 border-red-600/30' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {v.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                        v.status === 'PENDING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-500">
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(role === 'ADMIN' || role === 'RECEPCION' || role === 'SEGURIDAD') && v.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleResolve(v.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resolver
                          </button>
                          <button 
                            onClick={() => handleFalsePositive(v.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                          >
                            Falso Positivo
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedViolationId(v.id);
                              setShowFineModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                          >
                            Multar
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalItems={violations.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </motion.div>

      {/* Modal de Multas (desde Dashboard) */}
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
}
