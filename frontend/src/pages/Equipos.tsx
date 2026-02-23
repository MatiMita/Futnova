import { useState, useEffect } from 'react';
import { Equipo } from '../types';
import { getEquipos, deleteEquipo } from '../firebase/equipos';
import { useAuth } from '../context/AuthContext';
import './Equipos.css';

const GRUPOS = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Sin Grupo'];

const Equipos = () => {
  const { perfil } = useAuth();
  const isAdmin = perfil?.rol === 'admin';
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadEquipos();
  }, []);

  const loadEquipos = async () => {
    try {
      const data = await getEquipos();
      setEquipos(data);
    } catch (error) {
      console.error('Error al cargar equipos:', error);
      setMessage({ type: 'error', text: 'Error al cargar los equipos' });
    } finally {
      setLoading(false);
    }
  };

  // Agrupar equipos por grupo
  const agruparPorGrupo = () => {
    const grupos: Record<string, Equipo[]> = {};
    GRUPOS.forEach(g => { grupos[g] = []; });
    
    equipos.forEach(equipo => {
      const grupo = equipo.grupo || 'Sin Grupo';
      if (grupos[grupo]) {
        grupos[grupo].push(equipo);
      } else {
        grupos['Sin Grupo'].push(equipo);
      }
    });
    
    return grupos;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        await deleteEquipo(id);
        setMessage({ type: 'success', text: 'Equipo eliminado exitosamente' });
        await loadEquipos();
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error('Error al eliminar equipo:', error);
        setMessage({ type: 'error', text: 'Error al eliminar el equipo' });
      }
    }
  };

  if (loading) return <div className="loading">Cargando equipos...</div>;

  const grupos = agruparPorGrupo();

  return (
    <div className="equipos-page">
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="page-header">
        <h1>Equipos</h1>
      </div>

      {equipos.length === 0 ? (
        <p className="empty-state">No hay equipos registrados</p>
      ) : (
        <div className="equipos-por-grupos">
          {GRUPOS.map(nombreGrupo => {
            const equiposGrupo = grupos[nombreGrupo];
            if (equiposGrupo.length === 0) return null;
            
            return (
              <div key={nombreGrupo} className="grupo-container">
                <h2 className="grupo-title">{nombreGrupo}</h2>
                <div className="equipos-grid">
                  {equiposGrupo.map((equipo) => (
                    <div key={equipo.id} className="equipo-card">
                      <div className="equipo-header">
                        {equipo.logo && <img src={equipo.logo} alt={equipo.nombre} />}
                        <h3>{equipo.nombre}</h3>
                      </div>
                      {isAdmin && (
                        <button onClick={() => handleDelete(equipo.id)} className="btn-delete">
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Equipos;
