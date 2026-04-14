import React from 'react';
import { Trophy, Menu, User, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-12 flex items-center justify-between px-4 bg-slate-950 border-b border-slate-800/50 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <Trophy className="w-5 h-5 text-black fill-black" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-black text-white tracking-tighter uppercase italic leading-none">
            LUCHA<span className="text-yellow-500">STREAM</span>
          </h1>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <nav className="flex items-center gap-6">
          <a href="#" className="text-xs font-bold text-yellow-500 uppercase tracking-widest hover:text-yellow-400 transition-colors">Inicio</a>
          <a href="#" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">Eventos</a>
          <a href="#" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">Noticias</a>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-1.5 text-slate-400 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-600 rounded-full border-2 border-slate-950" />
        </button>
        <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-2 py-1 rounded-lg border border-slate-800 transition-all group">
          <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-slate-700">
            <User className="w-3 h-3 text-slate-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Mi Cuenta</span>
        </button>
        <button className="md:hidden p-1.5 text-slate-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
