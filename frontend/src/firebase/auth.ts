import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { Usuario, Rol } from '../types';

export const login = async (email: string, password: string): Promise<void> => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const getUsuarioPerfil = async (uid: string): Promise<Usuario | null> => {
  const snap = await getDoc(doc(db, 'usuarios', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Usuario;
};

export const crearUsuario = async (
  email: string,
  password: string,
  nombre: string,
  rol: Rol,
  equipoId?: string
): Promise<void> => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'usuarios', cred.user.uid), {
    email,
    nombre,
    rol,
    ...(equipoId ? { equipoId } : {}),
    creadoEn: serverTimestamp(),
  });
};

export const crearPerfilVisitante = async (user: User, nombre: string): Promise<void> => {
  await setDoc(doc(db, 'usuarios', user.uid), {
    email: user.email,
    nombre,
    rol: 'visitante' as Rol,
    creadoEn: serverTimestamp(),
  });
};

export { onAuthStateChanged, auth };
