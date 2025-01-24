export interface Tribute {
  id: string;
  created_by: string;
  nombre: string;
  fecha_nacimiento: string;
  fecha_fallecimiento: string;
  ubicacion: string | null;
  biografia: string | null;
  imagen_principal: string | null;
  tema: string;
  es_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  tribute_id: string;
  user_id: string;
  contenido: string;
  created_at: string;
  profile?: {
    nombre: string;
  };
}

export interface Candle {
  id: string;
  tribute_id: string;
  user_id: string;
  mensaje: string | null;
  created_at: string;
  profile?: {
    nombre: string;
  };
}

export interface Photo {
  id: string;
  tribute_id: string;
  url: string;
  descripcion: string | null;
  fecha: string | null;
  orden: number;
  created_at: string;
}
