import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { Jugador } from '../types';

const COLLECTION = 'jugadores';

export const getJugadores = async (): Promise<Jugador[]> => {
  const q = query(collection(db, COLLECTION), orderBy('apellido'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Jugador));
};

export const getJugadoresByEquipo = async (equipoId: string): Promise<Jugador[]> => {
  console.log('🔍 Buscando jugadores para equipoId:', equipoId);
  const q = query(
    collection(db, COLLECTION),
    where('equipoId', '==', equipoId)
  );
  const snapshot = await getDocs(q);
  console.log('📦 Documentos encontrados:', snapshot.size);
  const jugadores = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Jugador));
  // Ordenar manualmente por numeroCamiseta (permite undefined)
  jugadores.sort((a, b) => (a.numeroCamiseta || 999) - (b.numeroCamiseta || 999));
  console.log('✅ Jugadores procesados:', jugadores);
  return jugadores;
};

export const getJugador = async (id: string): Promise<Jugador | null> => {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Jugador;
};

export const createJugador = async (data: Omit<Jugador, 'id' | 'fechaRegistro'>): Promise<Jugador> => {
  const payload = {
    ...data,
    goles: 0,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0,
    fechaRegistro: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return { id: ref.id, ...payload } as unknown as Jugador;
};

export const updateJugador = async (id: string, data: Partial<Jugador>): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), { ...data });
};

export const deleteJugador = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};

export const getGoleadores = async (): Promise<Jugador[]> => {
  const jugadores = await getJugadores();
  const { getPartidosFinalizados } = await import('./partidos');
  const partidosFinalizados = await getPartidosFinalizados();
  
  // Calcular goles desde los partidos finalizados
  const golesMap = new Map<string, number>();
  
  partidosFinalizados.forEach((partido) => {
    if (partido.goleadores) {
      partido.goleadores.forEach((gol) => {
        const golesActuales = golesMap.get(gol.jugadorId) || 0;
        golesMap.set(gol.jugadorId, golesActuales + gol.cantidad);
      });
    }
  });
  
  // Actualizar el campo goles con los valores calculados
  const jugadoresConGoles = jugadores.map((j) => ({
    ...j,
    goles: golesMap.get(j.id) || 0
  }));
  
  return jugadoresConGoles
    .filter((j) => j.goles > 0)
    .sort((a, b) => b.goles - a.goles)
    .slice(0, 10);
};

export const getTablaTargetas = async (): Promise<Jugador[]> => {
  const jugadores = await getJugadores();
  const { getPartidosFinalizados } = await import('./partidos');
  const partidosFinalizados = await getPartidosFinalizados();
  
  // Calcular tarjetas desde los partidos finalizados
  const tarjetasMap = new Map<string, { amarillas: number; rojas: number }>();
  
  partidosFinalizados.forEach((partido) => {
    if (partido.tarjetasAmarillas) {
      partido.tarjetasAmarillas.forEach((jugadorId) => {
        const actual = tarjetasMap.get(jugadorId) || { amarillas: 0, rojas: 0 };
        tarjetasMap.set(jugadorId, { ...actual, amarillas: actual.amarillas + 1 });
      });
    }
    if (partido.tarjetasRojas) {
      partido.tarjetasRojas.forEach((jugadorId) => {
        const actual = tarjetasMap.get(jugadorId) || { amarillas: 0, rojas: 0 };
        tarjetasMap.set(jugadorId, { ...actual, rojas: actual.rojas + 1 });
      });
    }
  });
  
  // Actualizar los campos de tarjetas con los valores calculados
  const jugadoresConTarjetas = jugadores.map((j) => {
    const tarjetas = tarjetasMap.get(j.id) || { amarillas: 0, rojas: 0 };
    return {
      ...j,
      tarjetasAmarillas: tarjetas.amarillas,
      tarjetasRojas: tarjetas.rojas
    };
  });
  
  return jugadoresConTarjetas
    .filter((j) => j.tarjetasAmarillas > 0 || j.tarjetasRojas > 0)
    .sort(
      (a, b) =>
        b.tarjetasRojas * 2 + b.tarjetasAmarillas - (a.tarjetasRojas * 2 + a.tarjetasAmarillas)
    )
    .slice(0, 10);
};
