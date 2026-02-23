export type Rol = 'admin' | 'capitan' | 'visitante';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  equipoId?: string; // solo para capitanes
  creadoEn?: unknown;
}

export interface Equipo {
  id: string;
  nombre: string;
  logo?: string;
  grupo?: string;
  fechaCreacion?: unknown;
}

export interface Jugador {
  id: string;
  nombre: string;
  apellido: string;
  numeroCamiseta?: number;
  posicion?: string;
  equipoId: string;
  equipoNombre?: string;
  goles: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  fechaRegistro?: unknown;
}

export interface Partido {
  id: string;
  equipoLocalId: string;
  equipoVisitanteId: string;
  equipoLocalNombre?: string;
  equipoVisitanteNombre?: string;
  golesLocal: number;
  golesVisitante: number;
  fecha: string;
  jornada: number;
  finalizado: boolean;
  fechaCreacion?: unknown;
}

export interface Posicion {
  equipoId: string;
  equipoNombre: string;
  logo?: string;
  grupo?: string;
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesFavor: number;
  golesContra: number;
  diferenciaGoles: number;
  puntos: number;
}
