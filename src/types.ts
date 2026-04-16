export interface Evento {
  titulo: string;
  fecha: string;
  empresa: 'WWE' | 'AEW' | string;
  url_video: string;
  imagen: string;
  en_vivo?: boolean;
  duracion?: string;
}

export type FilterType = 'TODOS' | 'RAW' | 'SMACKDOWN' | 'PPV' | 'ON DEMAND' | 'WWE' | 'AEW';
