import React, { useState } from 'react';
import { X, Plus, Video, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Evento } from '../types';

interface OnDemandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (evento: Evento) => void;
}

export const OnDemandFormModal: React.FC<OnDemandFormModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!titulo.trim() || !url.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    // Basic URL validation
    if (!url.includes('archive.org') && !url.includes('youtube.com')) {
      setError('Por favor ingresa un link válido de Archive.org o YouTube');
      return;
    }

    const newEvento: Evento = {
      titulo: titulo.trim(),
      fecha: new Date().toISOString().split('T')[0],
      empresa: 'ON DEMAND',
      url_video: url.trim(),
      imagen: url.includes('archive.org') 
        ? 'https://archive.org/services/img/' + url.split('/')[4] 
        : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300',
      duracion: '00:00:00'
    };

    onAdd(newEvento);
    setTitulo('');
    setUrl('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                <Plus className="w-5 h-5 text-yellow-500" />
                Cargar <span className="text-yellow-500">Video</span>
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Type className="w-3 h-3" />
                  Título del Video
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: WrestleMania X-Seven Highlights"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Video className="w-3 h-3" />
                  Link del Video (Archive.org o YouTube)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://archive.org/download/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-red-500 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase py-4 rounded-xl tracking-widest transition-all transform active:scale-[0.98] shadow-lg shadow-yellow-500/10"
              >
                Agregar a On Demand
              </button>
            </form>

            <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800">
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-relaxed">
                Este video se guardará localmente en tu navegador <br />
                y aparecerá en la sección <span className="text-yellow-500 font-bold">On Demand</span>.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
