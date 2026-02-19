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
} from 'firebase/firestore';
import { db } from './config';
import { Equipo } from '../types';

const COLLECTION = 'equipos';

export const getEquipos = async (): Promise<Equipo[]> => {
  const q = query(collection(db, COLLECTION), orderBy('nombre'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Equipo));
};

export const getEquipo = async (id: string): Promise<Equipo | null> => {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Equipo;
};

export const createEquipo = async (data: { nombre: string; logo?: string; grupo?: string }): Promise<Equipo> => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    fechaCreacion: serverTimestamp(),
  });
  return { id: ref.id, ...data } as Equipo;
};

export const updateEquipo = async (id: string, data: Partial<Equipo>): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), { ...data });
};

export const deleteEquipo = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};
