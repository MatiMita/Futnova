import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged, auth, getUsuarioPerfil } from '../firebase/auth';
import { Usuario } from '../types';

interface AuthContextType {
  user: User | null;
  perfil: Usuario | null;
  loading: boolean;
  refrescarPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  perfil: null,
  loading: true,
  refrescarPerfil: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const refrescarPerfil = async () => {
    if (user) {
      const p = await getUsuarioPerfil(user.uid);
      setPerfil(p);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await getUsuarioPerfil(firebaseUser.uid);
        setPerfil(p);
      } else {
        setPerfil(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, perfil, loading, refrescarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
};
