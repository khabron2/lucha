import React from 'react';
import { Evento } from '../types';
import { cn } from '../lib/utils';
import { Play, Calendar, Trophy } from 'lucide-react';

interface EventCardProps {
  evento: Evento;
  isActive: boolean;
  onClick: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ evento, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full text-left group transition-all duration-300 rounded-xl overflow-hidden border focus:outline-none focus:ring-2 focus:ring-yellow-400",
        isActive 
          ? "bg-slate-800 border-yellow-500/50 shadow-lg shadow-yellow-500/10" 
          : "bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700"
      )}
    >
      <div className="flex gap-4 p-3">
        {/* Thumbnail */}
        <div className="relative w-28 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
          <img 
            src={evento.imagen} 
            alt={evento.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/20">
              <Play className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </div>
          )}
          {evento.en_vivo && (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-600 text-[8px] font-bold text-white rounded uppercase tracking-tighter animate-pulse">
              LIVE
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
              evento.empresa === 'WWE' ? "bg-red-600/20 text-red-500" : "bg-yellow-500/20 text-yellow-500"
            )}>
              {evento.empresa}
            </span>
            <span className="text-slate-500 text-[10px] flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3" />
              {evento.fecha.split('-').reverse().join('-')}
            </span>
          </div>
          <h3 className={cn(
            "text-sm font-bold truncate transition-colors",
            isActive ? "text-yellow-400" : "text-white group-hover:text-yellow-100"
          )}>
            {evento.titulo}
          </h3>
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
      )}
    </button>
  );
};
