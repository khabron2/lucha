import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { Sidebar } from './components/Sidebar';
import { NavigationMenu } from './components/NavigationMenu';
import { EventManagerModal } from './components/EventManagerModal';
import { Evento } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, AlertCircle, RefreshCw, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType, getRedirectResult } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';

// Mock API URL (In a real app, this would be the Google Sheets API endpoint)
const API_URL = 'https://api.jsonbin.io/v3/b/661ba672ad19ca34f8595914'; // Example URL or placeholder

export default function App() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [viewedUrls, setViewedUrls] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth listener
  useEffect(() => {
    setIsSyncing(true);
    // Handle redirect result (for TV/Mobile browsers that block popups)
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        console.log('Redirect login successful:', result.user.email);
      }
    }).catch(err => {
      if (err.code !== 'auth/no-recent-redirect-operation') {
        console.error('Redirect result error:', err);
        handleFirestoreError(err, OperationType.GET, 'auth-redirect');
      }
    }).finally(() => {
      setIsSyncing(false);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (currentUser) {
        // Sync user profile
        const userDoc = doc(db, 'users', currentUser.uid);
        
        // Get user data to restore last show
        getDoc(userDoc).then(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.lastViewedShowUrl && !selectedEvento) {
              // We'll handle restoration in the fetchEventos or here if already fetched
            }
          }
        });

        setDoc(userDoc, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          lastLogin: serverTimestamp()
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`));
      } else {
        // Clear viewed events if logged out (optional, or keep local)
        setViewedUrls(new Set());
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync viewed events from Firestore
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/viewedEvents`;
    const q = collection(db, path);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const urls = new Set<string>();
      snapshot.forEach(doc => {
        urls.add(doc.data().videoUrl);
      });
      setViewedUrls(urls);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  const fetchEventos = useCallback(async () => {
    try {
      // Mock Data - RAW 2001 Episodes
      const raw2001Dates = [
        "2001-01-01", "2001-01-08", "2001-01-15", "2001-01-22", "2001-01-29",
        "2001-02-05", "2001-02-12", "2001-02-19", "2001-02-26",
        "2001-03-05", "2001-03-12", "2001-03-19", "2001-03-26",
        "2001-04-02", "2001-04-09", "2001-04-16", "2001-04-23", "2001-04-30",
        "2001-05-07", "2001-05-14", "2001-05-21", "2001-05-28",
        "2001-06-04", "2001-06-11", "2001-06-18", "2001-06-25",
        "2001-07-02", "2001-07-09", "2001-07-16", "2001-07-23", "2001-07-30",
        "2001-08-06", "2001-08-13", "2001-08-20", "2001-08-27",
        "2001-09-03", "2001-09-10", "2001-09-17", "2001-09-24",
        "2001-10-01", "2001-10-08", "2001-10-15", "2001-10-22", "2001-10-29",
        "2001-11-05", "2001-11-12", "2001-11-19", "2001-11-26",
        "2001-12-03", "2001-12-10", "2001-12-17", "2001-12-24", "2001-12-31"
      ];

      const smackdown2001Dates = [
        "2001-01-04", "2001-01-11", "2001-01-18", "2001-01-25",
        "2001-02-01", "2001-02-08", "2001-02-15", "2001-02-22",
        "2001-03-01", "2001-03-08", "2001-03-15", "2001-03-22", "2001-03-29",
        "2001-04-05", "2001-04-12", "2001-04-19", "2001-04-26",
        "2001-05-03", "2001-05-10", "2001-05-17", "2001-05-24", "2001-05-31",
        "2001-06-07", "2001-06-14", "2001-06-21", "2001-06-28",
        "2001-07-05", "2001-07-12", "2001-07-19", "2001-07-26",
        "2001-08-02", "2001-08-09", "2001-08-16", "2001-08-23", "2001-08-30",
        "2001-09-04", "2001-09-13", "2001-09-20", "2001-09-27",
        "2001-10-04", "2001-10-11", "2001-10-18", "2001-10-25",
        "2001-11-01", "2001-11-08", "2001-11-15", "2001-11-22", "2001-11-29",
        "2001-12-06", "2001-12-13", "2001-12-20", "2001-12-27"
      ];

      const rawData: Evento[] = raw2001Dates.map(date => ({
        titulo: `Raw - ${date.split('-').reverse().join('-')}`,
        fecha: date,
        empresa: "WWE",
        url_video: `https://archive.org/download/WAR-2001/${date}.mp4`,
        imagen: `https://www.planetawrestling.com/wp-content/uploads/2022/11/RAW-is-WAR-logo-1997-300x192.jpg`,
        duracion: "01:35:00"
      }));

      const sdData: Evento[] = smackdown2001Dates.map(date => ({
        titulo: `Smackdown - ${date.split('-').reverse().join('-')}`,
        fecha: date,
        empresa: "WWE",
        url_video: `https://archive.org/download/2001.03.15/${date.replace(/-/g, '.')}.mp4`,
        imagen: `https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/feb152e2-38e3-4ee6-ab4a-ed3ef8e04f54/dg0yvn3-c90c7a65-27d0-4af9-a009-7bebaff76667.png/v1/fill/w_1259,h_634/wwf_smackdown__1999___2001_logo_v1_by_insanity_designs_dg0yvn3-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NjUyNCIsInBhdGgiOiJcL2ZcL2ZlYjE1MmUyLTM4ZTMtNGVlNi1hYjRhLWVkM2VmOGUwNGY1NFwvZGcweXZuMy1jOTBjN2E2NS0yN2QwLTRhZjktYTAwOS03YmViYWZmNzY2NjcucG5nIiwid2lkdGgiOiI8PTEyOTQ0In1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.uhUKPPDziZ13OAZSD6f6Mei_sXiEF5CAdnFI0yzA6v8`,
        duracion: "01:28:00"
      }));

      const mockData = [
        ...rawData, 
        ...sdData,
        {
          titulo: "WrestleMania X-Seven",
          fecha: "2001-04-01",
          empresa: "WWE",
          url_video: "https://www.youtube.com/embed/Fa82rY0vnCA",
          imagen: "https://i.ytimg.com/vi/uhAauCAGf8A/maxresdefault.jpg",
          duracion: "03:45:00"
        }
      ];
      setEventos(mockData);
      
      // Load viewed events from localStorage
      const savedViewed = localStorage.getItem('viewedEventUrls');
      if (savedViewed) {
        setViewedUrls(new Set(JSON.parse(savedViewed)));
      }

      // Load last selected event from localStorage
      const lastSelected = localStorage.getItem('lastSelectedEvento');
      let restoredEvento: Evento | null = null;
      
      if (lastSelected) {
        const parsed = JSON.parse(lastSelected);
        restoredEvento = mockData.find(e => e.url_video === parsed.url_video) || null;
      }

      // If user is logged in, try to restore from Firestore (prioritize Firestore)
      if (auth.currentUser) {
        const userDoc = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.lastViewedShowUrl) {
            const found = mockData.find(e => e.url_video === data.lastViewedShowUrl);
            if (found) restoredEvento = found;
          }
        }
      }

      if (restoredEvento) setSelectedEvento(restoredEvento);

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("No se pudieron cargar los eventos. Reintentando...");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
    
    // Real-time reload system (every 5 minutes)
    const interval = setInterval(fetchEventos, 300000);
    return () => clearInterval(interval);
  }, [fetchEventos]);

  const handleSelectEvento = (evento: Evento) => {
    setSelectedEvento(evento);
    localStorage.setItem('lastSelectedEvento', JSON.stringify(evento));
    
    // Sync last viewed show to Firestore
    if (user) {
      const userDoc = doc(db, 'users', user.uid);
      updateDoc(userDoc, {
        lastViewedShowUrl: evento.url_video,
        lastViewedAt: serverTimestamp()
      }).catch(err => console.warn('Failed to sync last show', err));
    }

    // Scroll to top on mobile when selecting an event
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetViewed = async () => {
    if (user) {
      const path = `users/${user.uid}/viewedEvents`;
      // In a real app, we'd batch delete. For now, we'll just clear local if needed, 
      // but Firestore is the source of truth.
      // To properly reset, we'd need to delete all docs in the subcollection.
      // For simplicity in this demo, we'll just alert or do a simple loop if small.
      try {
        // This is a simplified reset for the demo
        setViewedUrls(new Set());
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setViewedUrls(new Set());
      localStorage.removeItem('viewedEventUrls');
    }
  };

  const handleMarkAsViewed = async (url: string) => {
    if (user) {
      const eventId = btoa(url).replace(/\//g, '_'); // Simple ID from URL
      const path = `users/${user.uid}/viewedEvents/${eventId}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/viewedEvents`, eventId), {
          userId: user.uid,
          videoUrl: url,
          viewedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const newViewed = new Set(viewedUrls);
      newViewed.add(url);
      setViewedUrls(newViewed);
      localStorage.setItem('viewedEventUrls', JSON.stringify(Array.from(newViewed)));
    }

    // Auto-select next show
    const currentIndex = eventos.findIndex(e => e.url_video === url);
    if (currentIndex !== -1 && currentIndex < eventos.length - 1) {
      const nextShow = eventos[currentIndex + 1];
      handleSelectEvento(nextShow);
    }
  };

  const handleToggleViewed = async (url: string) => {
    if (user) {
      const eventId = btoa(url).replace(/\//g, '_');
      const path = `users/${user.uid}/viewedEvents/${eventId}`;
      if (viewedUrls.has(url)) {
        try {
          await deleteDoc(doc(db, `users/${user.uid}/viewedEvents`, eventId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      } else {
        try {
          await setDoc(doc(db, `users/${user.uid}/viewedEvents`, eventId), {
            userId: user.uid,
            videoUrl: url,
            viewedAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
    } else {
      const newViewed = new Set(viewedUrls);
      if (newViewed.has(url)) {
        newViewed.delete(url);
      } else {
        newViewed.add(url);
      }
      setViewedUrls(newViewed);
      localStorage.setItem('viewedEventUrls', JSON.stringify(Array.from(newViewed)));
    }
  };

  const handleToggleFullScreen = () => {
    window.dispatchEvent(new CustomEvent('toggle-video-fullscreen'));
  };

  // Filter out viewed events for the sidebar
  const availableEventos = eventos.filter(e => !viewedUrls.has(e.url_video));

  // TV Navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const focusable = document.querySelectorAll('button, input, [tabindex="0"], a');
      const focusableArray = Array.from(focusable) as HTMLElement[];
      const index = focusableArray.indexOf(document.activeElement as HTMLElement);

      if (e.key === 'ArrowDown') {
        if (index < focusableArray.length - 1) focusableArray[index + 1].focus();
      } else if (e.key === 'ArrowUp') {
        if (index > 0) focusableArray[index - 1].focus();
      } else if (e.key === 'ArrowRight') {
        // Simple horizontal navigation
        if (index < focusableArray.length - 1) focusableArray[index + 1].focus();
      } else if (e.key === 'ArrowLeft') {
        if (index > 0) focusableArray[index - 1].focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading && eventos.length === 0) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Cargando LuchaStream...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-1 gap-2">
        <Header />
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 bg-slate-800/50 p-0.5 pr-2 rounded-full border border-slate-700">
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-6 h-6 rounded-full border border-yellow-500" />
              <div className="hidden sm:block">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Sincronizado</p>
                <p className="text-[10px] font-black text-white truncate max-w-[80px]">{user.displayName}</p>
              </div>
              <button 
                onClick={logout}
                className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-full transition-all"
                title="Cerrar sesión"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogIn className="w-3 h-3" />}
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 space-y-6">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedEvento?.titulo || 'banner'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-5xl mx-auto"
            >
              <VideoPlayer 
                evento={selectedEvento} 
                onEnded={(url) => handleMarkAsViewed(url)}
              />
            </motion.div>
          </AnimatePresence>

          <div className="w-full max-w-5xl mx-auto">
            <NavigationMenu 
              onOpenEvents={() => setIsModalOpen(true)} 
              onToggleFullScreen={handleToggleFullScreen}
            />
          </div>

          <EventManagerModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            eventos={eventos}
            viewedUrls={viewedUrls}
            onToggleViewed={handleToggleViewed}
            onReset={handleResetViewed}
          />

          {/* Info Section */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50">
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Sobre el <span className="text-yellow-500">Canal</span>
              </h3>
              <p className="text-slate-400 leading-relaxed">
                La Era de la Actitud: donde WWE se volvió sin censura y cambió el wrestling para siempre.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 md:p-8 rounded-2xl border border-yellow-400/20 text-black shadow-xl shadow-yellow-500/10 flex flex-col justify-center">
              <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-2">Próximo a ver</h3>
              {availableEventos.length > 0 ? (
                <>
                  <div className="text-3xl md:text-4xl lg:text-5xl font-black mb-1 truncate leading-none">{availableEventos[0].titulo}</div>
                  <div className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">{availableEventos[0].duracion || "01:30:00"}</div>
                  <p className="text-black/70 text-xs md:text-sm font-bold uppercase tracking-wider">
                    Fecha: {availableEventos[0].fecha.split('-').reverse().join('-')}
                  </p>
                  <button 
                    onClick={() => handleSelectEvento(availableEventos[0])}
                    className="mt-6 w-full bg-black text-white py-3 md:py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-slate-900 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Ver ahora
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <p className="font-bold uppercase text-sm">¡Has visto todo!</p>
                  <button 
                    onClick={handleResetViewed}
                    className="mt-4 w-full bg-black text-white py-2 rounded-lg font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-colors"
                  >
                    Reiniciar lista
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="w-full max-w-5xl mx-auto py-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
              <RefreshCw className="w-3 h-3" />
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </div>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
              © 2026 LuchaStream - Todos los derechos reservados
            </p>
          </div>
        </div>

        {/* Sidebar Area */}
        <aside className="w-full md:w-80 lg:w-96 h-[500px] md:h-auto border-t md:border-t-0 md:border-l border-slate-800">
          <Sidebar 
            eventos={availableEventos} 
            selectedEvento={selectedEvento} 
            onSelect={handleSelectEvento} 
            onReset={handleResetViewed}
          />
        </aside>
      </main>

      {/* Mobile Bottom Padding for Nav if needed */}
      <div className="h-4 md:hidden" />
    </div>
  );
}
