import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Evento } from '../types';
import { cn } from '../lib/utils';

import { Loader2, AlertCircle, RefreshCw, SkipForward } from 'lucide-react';

interface VideoPlayerProps {
  evento: Evento | null;
  onEnded?: (url: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ evento, onEnded }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [useNative, setUseNative] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isYouTube = evento?.url_video.includes('youtube.com/embed');
  const isArchive = evento?.url_video.includes('archive.org/download/');

  const getArchiveEmbedUrl = (url: string) => {
    try {
      // Format: https://archive.org/download/IDENTIFIER/FILENAME.mp4
      const parts = url.split('archive.org/download/')[1].split('/');
      const identifier = parts[0];
      const filename = parts[1];
      
      // Using /embed/IDENTIFIER/FILENAME format which is more direct
      // We still include the file param just in case
      return `https://archive.org/embed/${identifier}/${filename}?autoplay=1`;
    } catch (e) {
      return url;
    }
  };

  const reloadVideo = () => {
    setError(null);
    setUseNative(false);
    setIsLoading(true);
    
    if (playerRef.current) {
      const player = playerRef.current;
      if (evento) {
        player.src({
          src: evento.url_video,
          type: 'video/mp4',
        });
        player.load();
        player.muted(false);
        player.volume(1.0);
        player.play().catch(() => switchToNative());
      }
    } else {
      // If player is not initialized, just let the component re-render
      window.location.reload(); 
    }
  };

  const switchToNative = () => {
    setError(null);
    setUseNative(true);
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
  };

  const toggleFullScreen = () => {
    if (isYouTube) {
      if (iframeRef.current) {
        if (!document.fullscreenElement) {
          iframeRef.current.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      }
    } else {
      const player = playerRef.current;
      if (player) {
        if (player.isFullscreen()) {
          player.exitFullscreen();
        } else {
          player.muted(false);
          player.volume(1.0);
          player.requestFullscreen();
        }
      } else {
        // Native video element fallback
        const videoElement = document.querySelector('video');
        if (videoElement) {
          if (!document.fullscreenElement) {
            videoElement.muted = false;
            videoElement.volume = 1.0;
            videoElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen();
          }
        }
      }
    }
  };

  useEffect(() => {
    const handleToggleFS = () => toggleFullScreen();
    window.addEventListener('toggle-video-fullscreen', handleToggleFS);
    return () => window.removeEventListener('toggle-video-fullscreen', handleToggleFS);
  }, [isYouTube, isArchive]);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-city');
      videoElement.setAttribute('crossorigin', 'anonymous');
      videoElement.setAttribute('playsinline', 'true');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: true,
        muted: false,
        controls: true,
        responsive: true,
        fluid: true,
        preload: 'auto',
        playbackRates: [0.5, 1, 1.5, 2],
        errorDisplay: false,
        html5: {
          vhs: { overrideNative: false }
        },
        sources: evento ? [{
          src: evento.url_video,
          type: 'video/mp4'
        }] : []
      }, () => {
        console.log('player is ready');
        
        // Load progress after player is ready
        if (evento) {
          const savedProgress = localStorage.getItem(`progress_${evento.url_video}`);
          if (savedProgress) {
            player.currentTime(parseFloat(savedProgress));
          }
        }
      });

      player.on('waiting', () => setIsLoading(true));
      player.on('playing', () => {
        setIsLoading(false);
        setError(null);
      });
      player.on('canplay', () => setIsLoading(false));

      player.on('error', () => {
        setIsLoading(false);
        const err = player.error();
        console.error('VideoJS Error:', err);
        
        // If it's a source error (Code 4), try to switch to native automatically
        if (err && err.code === 4) {
          console.log('Code 4 detected, switching to native mode...');
          switchToNative();
        } else {
          setError(`Error: ${err ? err.message : 'Desconocido'}`);
        }
      });

      player.on('loadedmetadata', () => {
        setIsLoading(false);
      });

      // Save progress periodically
      player.on('timeupdate', () => {
        const currentTime = player.currentTime();
        const videoUrl = player.currentSrc();
        if (videoUrl && currentTime > 0) {
          localStorage.setItem(`progress_${videoUrl}`, currentTime.toString());
        }
      });

      player.on('ended', () => {
        if (onEnded && evento) {
          onEnded(evento.url_video);
        }
      });
    }
  }, [videoRef, onEnded]);

  useEffect(() => {
    const player = playerRef.current;
    if ((isYouTube || isArchive) && player && !player.isDisposed()) {
      player.dispose();
      playerRef.current = null;
    }
  }, [isYouTube, isArchive]);

  useEffect(() => {
    setUseNative(false);
    setError(null);
  }, [evento?.url_video]);

  // Dispose the player on unmount
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  if (!evento) {
    return (
      <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden rounded-xl border border-slate-800 group">
        <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-slate-950 to-transparent z-10" />
        <img 
          src="https://wallpapercave.com/wp/wp8408479.jpg" 
          alt="Banner" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-20 text-center px-6">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
            Selecciona un <span className="text-yellow-400">Evento</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-md mx-auto font-medium">
            Disfruta de lo mejor de la lucha libre en vivo y bajo demanda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
      {isYouTube ? (
        <div className="aspect-video w-full">
          <iframe
            ref={iframeRef}
            src={evento.url_video}
            title={evento.titulo}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : isArchive && !useNative ? (
        <div className="aspect-video w-full relative bg-black">
          <iframe
            key={evento.url_video}
            src={getArchiveEmbedUrl(evento.url_video)}
            title={evento.titulo}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay"
            onLoad={() => setIsLoading(false)}
          />
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <button 
              onClick={() => onEnded?.(evento.url_video)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-bold px-3 py-1 rounded transition-colors flex items-center gap-1 shadow-lg"
            >
              <SkipForward className="w-3 h-3" />
              Siguiente Show
            </button>
          </div>
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button 
              onClick={reloadVideo}
              className="bg-slate-900/80 hover:bg-slate-800 text-white text-[10px] px-3 py-1 rounded border border-slate-700 backdrop-blur-sm transition-colors shadow-lg flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Recargar
            </button>
            <button 
              onClick={switchToNative}
              className="bg-slate-900/80 hover:bg-slate-800 text-white text-[10px] px-3 py-1 rounded border border-slate-700 backdrop-blur-sm transition-colors shadow-lg"
            >
              Reproductor Alternativo
            </button>
          </div>
        </div>
      ) : useNative ? (
        <div className="aspect-video w-full bg-black relative">
          <video 
            src={evento.url_video} 
            controls 
            autoPlay 
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            className="w-full h-full"
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onEnded={() => onEnded?.(evento.url_video)}
            onError={(e) => {
              setIsLoading(false);
              setError("El servidor de Archive.org no responde o el formato no es compatible. Intenta recargar la página.");
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <div data-vjs-player>
            <div ref={videoRef} />
          </div>
          
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No se pudo cargar el video</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-xs">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={reloadVideo}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reintentar
                </button>
                <button 
                  onClick={switchToNative}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest transition-all border border-slate-700"
                >
                  Modo Compatible
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="p-4 bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider",
                (evento.empresa === 'RAW' || evento.empresa === 'WWE') ? "bg-red-600 text-white" : 
                evento.empresa === 'SMACKDOWN' ? "bg-blue-600 text-white" : 
                evento.empresa === 'PPV' ? "bg-yellow-500 text-black" :
                evento.empresa === 'ON DEMAND' ? "bg-indigo-600 text-white" :
                "bg-slate-800 text-slate-400"
              )}>
                {evento.empresa}
              </span>
              {evento.en_vivo && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded uppercase animate-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  EN VIVO
                </span>
              )}
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight">
              {evento.titulo}
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {evento.fecha.split('-').reverse().join('-')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
