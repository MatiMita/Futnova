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
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from './config';
import { Partido } from '../types';

const COLLECTION = 'partidos';

export const getPartidos = async (): Promise<Partido[]> => {
  const q = query(collection(db, COLLECTION), orderBy('fecha', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Partido));
};

export const getPartidosByJornada = async (jornada: number): Promise<Partido[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('jornada', '==', jornada),
    orderBy('fecha')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Partido));
};

export const getPartidosFinalizados = async (): Promise<Partido[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('finalizado', '==', true),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Partido));
};

export const getPartido = async (id: string): Promise<Partido | null> => {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Partido;
};

export const createPartido = async (
  data: Omit<Partido, 'id' | 'fechaCreacion' | 'golesLocal' | 'golesVisitante' | 'finalizado'>
): Promise<Partido> => {
  const payload = {
    ...data,
    golesLocal: 0,
    golesVisitante: 0,
    finalizado: false,
    fechaCreacion: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return { id: ref.id, ...payload } as unknown as Partido;
};

export const updateResultado = async (
  id: string,
  golesLocal: number,
  golesVisitante: number,
  finalizado: boolean,
  goleadores?: Array<{ jugadorId: string; cantidad: number }>,
  tarjetasAmarillas?: string[],
  tarjetasRojas?: string[]
): Promise<void> => {
  const updateData: any = { 
    golesLocal, 
    golesVisitante, 
    finalizado,
    goleadores: goleadores || [],
    tarjetasAmarillas: tarjetasAmarillas || [],
    tarjetasRojas: tarjetasRojas || []
  };
  
  await updateDoc(doc(db, COLLECTION, id), updateData);
};

export const deletePartido = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};
