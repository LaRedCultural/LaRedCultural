export interface Estado {
  id: number;
  descripcion: string;
  activo: number;
}

export interface TipoEvento {
  id: number;
  tipoevento_descripcion: string;
  tipoevento_estado_id: number;
}

export interface Usuario {
  id: number;
  usr_id: string; // Email principal
  usr_nombre: string;
  usr_apellido: string;
  usr_pass?: string;
  usr_celular?: string;
  usr_codigopostal?: string;
  usr_estado_id: number;
  usr_fec_alta?: string;
  usr_fec_ult_mod?: string;
  email_verification_token?: string;
  email_verification_expires?: string;
}

export interface LugarEvento {
  id: number;
  lugarevento_nombre: string;
  lugarevento_estado_id: number;
  // Domicilio
  calle?: string;
  numero?: string;
  piso?: string;
  puerta?: string;
  partido?: string;
  localidad?: string;
  codigopostal?: string;
}

export interface EventoArtista {
  id?: number;
  evento_id?: number;
  nombre_artista: string;
  es_principal: boolean;
  fec_inicio?: string;
  fec_fin?: string;
}

export interface Evento {
  id: number;
  creador_usr_id: number;
  tipoevento_id: number;
  lugarevento_id?: number;
  nombre: string;
  descripcion?: string;
  categoria?: string; // varchar(250) libre
  fec_inicio: string;
  fec_fin: string;
  capacidad_maxima: number;
  permite_cancelar: boolean;
  horas_limite_cancelacion: number;
  estado_id: number;
  fec_alta?: string;
  // Joins y datos calculados
  tipo_nombre?: string;
  lugar_nombre?: string;
  direccion_completa?: string;
  partido?: string;
  artista_principal?: string;
  artistas?: EventoArtista[];
  asistentes_confirmados?: number;
  cupo_disponible?: 'Hay lugar' | 'Agotado';
  asiste_usuario_actual?: boolean;
}

export interface EventoAsistencia {
  id: number;
  evento_id: number;
  usr_id: number;
  estado: 'CONFIRMADO' | 'CANCELADO';
  fec_confirmacion: string;
  fec_cancelacion?: string;
}

export interface UsuarioInteres {
  id: number;
  usr_id: number;
  tipoevento_id: number;
}
