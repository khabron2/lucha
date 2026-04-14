export interface Evento {
  titulo: string;
  fecha: string;
  empresa: 'WWE' | 'AEW' | string;
  url_video: string;
  imagen: string;
  en_vivo?: boolean;
  duracion?: string;
}

export type FilterType = 'TODOS' | 'WWE' | 'AEW';
