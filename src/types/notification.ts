export interface Notification {
  id: string;
  user_id: string;
  tribute_id: string | null;
  tipo: 'vela' | 'comentario' | 'sistema';
  mensaje: string;
  leida: boolean;
  created_at: string;
  datos_adicionales?: {
    tribute_nombre?: string;
    user_nombre?: string;
    comentario_id?: string;
    vela_id?: string;
  };
}
