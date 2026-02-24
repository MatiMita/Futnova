import { useState, useEffect } from 'react';
import { Equipo, Jugador } from '../types';
import { getEquipos, deleteEquipo } from '../firebase/equipos';
import { getJugadoresByEquipo } from '../firebase/jugadores';
import { useAuth } from '../context/AuthContext';
import './Equipos.css';

const GRUPOS = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Sin Grupo'];

const Equipos = () => {
  const { perfil } = useAuth();
  const isAdmin = perfil?.rol === 'admin';
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);
  const [jugadoresModal, setJugadoresModal] = useState<Jugador[]>([]);

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

  const abrirModal = async (equipo: Equipo) => {
    setEquipoSeleccionado(equipo);
    setModalAbierto(true);
    try {
      const jugadores = await getJugadoresByEquipo(equipo.id);
      setJugadoresModal(jugadores);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      setJugadoresModal([]);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEquipoSeleccionado(null);
    setJugadoresModal([]);
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
                      <div 
                        className="equipo-header" 
                        onClick={() => abrirModal(equipo)}
                        style={{ cursor: 'pointer' }}
                      >
                        {equipo.logo && <img src={equipo.logo} alt={equipo.nombre} />}
                        <h3>{equipo.nombre}</h3>
                        <span className="expand-icon"></span>
                      </div>
                      
                      {isAdmin && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(equipo.id);
                          }} 
                          className="btn-delete"
                        >
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

      {/* Modal de jugadores */}
      {modalAbierto && equipoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {equipoSeleccionado.logo && (
                <img src={equipoSeleccionado.logo} alt={equipoSeleccionado.nombre} className="modal-logo" />
              )}
              <h2>{equipoSeleccionado.nombre} - Plantel</h2>
              <button className="btn-cerrar" onClick={cerrarModal}>✕</button>
            </div>
            <div className="modal-body">
              {jugadoresModal.length === 0 ? (
                <p className="no-jugadores">No hay jugadores registrados</p>
              ) : (
                <div className="jugadores-container">
                  {jugadoresModal.map((jugador) => (
                    <div key={jugador.id} className="jugador-item">
                      {jugador.numeroCamiseta && (
                        <span className="numero-camiseta">{jugador.numeroCamiseta}</span>
                      )}
                      <div className="jugador-info">
                        <span className="jugador-nombre">{jugador.nombre} {jugador.apellido}</span>
                        {jugador.posicion && (
                          <span className="jugador-posicion">{jugador.posicion}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipos;
