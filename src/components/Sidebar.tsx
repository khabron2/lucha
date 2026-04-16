import React, { useState } from 'react';
import { Evento, FilterType } from '../types';
import { EventCard } from './EventCard';
import { Search, Filter, Trophy, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  eventos: Evento[];
  selectedEvento: Evento | null;
  onSelect: (evento: Evento) => void;
  onReset?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ eventos, selectedEvento, onSelect, onReset }) => {
  const [filter, setFilter] = useState<FilterType>('TODOS');
  const [search, setSearch] = useState('');

  const filteredEventos = eventos
    .filter(e => {
      const matchesFilter = filter === 'TODOS' || e.empresa === filter;
      const matchesSearch = e.titulo.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  // Show more items on larger screens
  const visibleEventos = filteredEventos.slice(0, 12);

  return (
    <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-xl border-l border-slate-800/50">
      {/* Header / Search */}
      <div className="p-4 space-y-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white tracking-tighter uppercase italic flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            Próximos <span className="text-yellow-400">Eventos</span>
          </h2>
          <div className="flex items-center gap-2">
            {onReset && (
              <button 
                onClick={onReset}
                className="text-[9px] font-bold text-slate-500 hover:text-yellow-500 transition-colors uppercase tracking-widest"
              >
                Reiniciar
              </button>
            )}
            <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded-full">
              {eventos.length}
            </span>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
          />
        </div>

        <div className="flex gap-2">
          {(['TODOS', 'PPV', 'ON DEMAND'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-black rounded-md transition-all uppercase tracking-widest",
                filter === f 
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" 
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {visibleEventos.length > 0 ? (
          visibleEventos.map((evento, idx) => (
            <EventCard 
              key={`${evento.titulo}-${idx}`}
              evento={evento}
              isActive={selectedEvento?.titulo === evento.titulo}
              onClick={() => onSelect(evento)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-slate-700" />
            </div>
            <p className="text-slate-500 font-medium">No se encontraron eventos</p>
          </div>
        )}
      </div>
    </div>
  );
};
