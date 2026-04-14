import React from 'react';
import { Evento } from '../types';
import { CheckCircle2, Circle, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface EventManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventos: Evento[];
  viewedUrls: Set<string>;
  onToggleViewed: (url: string) => void;
  onReset: () => void;
}

export const EventManagerModal: React.FC<EventManagerModalProps> = ({
  isOpen,
  onClose,
  eventos,
  viewedUrls,
  onToggleViewed,
  onReset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              Gestión de <span className="text-yellow-500">Eventos</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium">Marca los shows que ya has visto para organizar tu lista.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats & Actions */}
        <div className="px-6 py-4 bg-slate-950/50 flex items-center justify-between border-b border-slate-800">
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-xl font-black text-white">{eventos.length}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Total</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-yellow-500">{viewedUrls.size}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Vistos</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-slate-400">{eventos.length - viewedUrls.size}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Pendientes</div>
            </div>
          </div>
          
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Reiniciar Todo
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
          {[...eventos]
            .sort((a, b) => {
              const aViewed = viewedUrls.has(a.url_video);
              const bViewed = viewedUrls.has(b.url_video);
              if (aViewed !== bViewed) return aViewed ? 1 : -1;
              return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
            })
            .map((evento) => {
              const isViewed = viewedUrls.has(evento.url_video);
            return (
              <button
                key={evento.url_video}
                onClick={() => onToggleViewed(evento.url_video)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all group",
                  isViewed 
                    ? "bg-slate-950/30 border-slate-800/50 opacity-60" 
                    : "bg-slate-800/40 border-slate-700/50 hover:border-yellow-500/50 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    isViewed ? "bg-slate-800 text-slate-500" : "bg-slate-700 text-yellow-500"
                  )}>
                    {isViewed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </div>
                  <div className="text-left">
                    <div className={cn(
                      "font-bold text-sm transition-colors",
                      isViewed ? "text-slate-500 line-through" : "text-white"
                    )}>
                      {evento.titulo}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {evento.fecha.split('-').reverse().join('-')} • {evento.duracion}
                    </div>
                  </div>
                </div>
                
                <div className={cn(
                  "px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest",
                  isViewed ? "bg-slate-800 text-slate-600" : "bg-yellow-500/10 text-yellow-500"
                )}>
                  {isViewed ? 'Visto' : 'Pendiente'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 text-center">
          <button 
            onClick={onClose}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase py-3 rounded-xl transition-all shadow-lg shadow-yellow-500/20"
          >
            Listo
          </button>
        </div>
      </motion.div>
    </div>
  );
};
