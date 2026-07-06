import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Camera, AlertTriangle } from 'lucide-react';

export function Cameras() {
  const cameras = [
    {
      id: "CAM_01_MAIN_GATE",
      name: "Entrada Principal",
      status: "Activa (IA)",
      videoSrc: "/videos/cam1.mp4",
      alerts: 2
    },
    {
      id: "CAM_02_POOL",
      name: "Zona de Piscina",
      status: "Activa (IA)",
      videoSrc: "/videos/cam2.mp4",
      alerts: 0
    },
    {
      id: "CAM_03_PARKING",
      name: "Estacionamiento",
      status: "Activa (IA)",
      videoSrc: "/videos/cam3.mp4",
      alerts: 1
    }
  ];

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Sistema de Videovigilancia IA</h1>
          <p className="text-zinc-400">Monitoreo en tiempo real procesado por el modelo YOLO.</p>
        </div>
        <div className="text-right text-sm text-zinc-400 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
          Transmisión en vivo: {currentTime.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cameras.map((cam, idx) => (
          <motion.div
            key={cam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-xl border border-zinc-800/50 overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-zinc-200">{cam.name}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  {cam.status}
                </span>
              </div>
              {cam.alerts > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3" />
                  {cam.alerts} Alertas
                </div>
              )}
            </div>
            
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <video 
                src={cam.videoSrc}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover pointer-events-none"
              />

              <div className="absolute top-4 left-4 flex gap-2 z-20">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-mono text-white">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  REC
                </div>
                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-mono text-blue-400">
                  YOLOv8
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
