import React from 'react';
import { Calendar, MessageSquare, Send, Film, Tv } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-1.5 px-6 py-3 rounded-xl transition-all duration-300 group",
      active 
        ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <div className={cn(
      "transition-transform duration-300 group-hover:scale-110",
      active ? "text-black" : "group-hover:text-yellow-400"
    )}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

interface NavigationMenuProps {
  onOpenEvents: () => void;
  onToggleFullScreen: () => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ onOpenEvents, onToggleFullScreen }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 p-4 bg-slate-900/30 backdrop-blur-md rounded-2xl border border-slate-800/50">
      <NavItem icon={<Calendar className="w-5 h-5" />} label="Eventos" onClick={onOpenEvents} />
      <NavItem icon={<Film className="w-5 h-5" />} label="Cine" onClick={onToggleFullScreen} />
      <NavItem icon={<Tv className="w-5 h-5" />} label="TV" onClick={onToggleFullScreen} />
    </div>
  );
};
