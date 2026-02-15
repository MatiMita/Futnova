export interface Equipo {
  id: number;
  nombre: string;
  logo_url?: string;
  fecha_creacion: string;
}

export interface Jugador {
  id: number;
  nombre: string;
  apellido: string;
  numero_camiseta?: number;
  posicion?: string;
  equipo_id: number;
  equipo_nombre?: string;
  goles: number;
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  fecha_registro: string;
}

export interface Partido {
  id: number;
  equipo_local_id: number;
  equipo_visitante_id: number;
  equipo_local?: string;
  equipo_visitante?: string;
  goles_local: number;
  goles_visitante: number;
  fecha: string;
  jornada: number;
  finalizado: boolean;
  fecha_creacion: string;
}

export interface Posicion {
  id: number;
  equipo_id: number;
  equipo_nombre: string;
  logo_url?: string;
  partidos_jugados: number;
  partidos_ganados: number;
  partidos_empatados: number;
  partidos_perdidos: number;
  goles_favor: number;
  goles_contra: number;
  diferencia_goles: number;
  puntos: number;
  ultima_actualizacion: string;
}
