import { useState, useEffect } from 'react';
import { getJugadores } from '../firebase/jugadores';
import { getEquipos } from '../firebase/equipos';
import { Jugador, Equipo } from '../types';
import './Jugadores.css';

const GRUPOS = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D'];

const Jugadores = () => {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroEquipo, setFiltroEquipo] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [j, e] = await Promise.all([getJugadores(), getEquipos()]);
    setJugadores(j);
    setEquipos(e);
    setLoading(false);
  };

  const equipoNombre = (id: string) => equipos.find((e) => e.id === id)?.nombre || '—';

  // Filtrar equipos por grupo
  const equiposFiltrados = filtroGrupo
    ? filtroGrupo === 'Sin Grupo'
      ? equipos.filter((e) => !e.grupo)
      : equipos.filter((e) => e.grupo === filtroGrupo)
    : equipos;

  // Filtrar jugadores por equipo
  const jugadoresFiltrados = filtroEquipo
    ? jugadores.filter((j) => j.equipoId === filtroEquipo)
    : jugadores;

  // Cuando cambia el grupo, resetear el filtro de equipo
  const handleGrupoChange = (nuevoGrupo: string) => {
    setFiltroGrupo(nuevoGrupo);
    setFiltroEquipo(''); // Resetear equipo al cambiar grupo
  };

  if (loading) return <div className="loading">Cargando jugadores...</div>;

  return (
    <div className="jugadores-page">
      <div className="page-header">
        <h1>👥 Jugadores</h1>
      </div>

      <div className="filtros">
        <div className="filtro-item">
          <label>Filtrar por Grupo:</label>
          <select value={filtroGrupo} onChange={(e) => handleGrupoChange(e.target.value)}>
            <option value="">Todos los grupos</option>
            {GRUPOS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
            <option value="Sin Grupo">Sin Grupo</option>
          </select>
        </div>

        <div className="filtro-item">
          <label>Filtrar por Equipo:</label>
          <select 
            value={filtroEquipo} 
            onChange={(e) => setFiltroEquipo(e.target.value)}
            disabled={equiposFiltrados.length === 0}
          >
            <option value="">
              {filtroGrupo ? 'Todos los equipos del grupo' : 'Todos los equipos'}
            </option>
            {equiposFiltrados.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="jugadores-table-wrap">
        <table className="jugadores-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              <th>Equipo</th>
              <th>Posición</th>
              <th>⚽</th>
              <th>🟡</th>
              <th>🔴</th>
            </tr>
          </thead>
          <tbody>
            {jugadoresFiltrados.map((j) => (
              <tr key={j.id}>
                <td className="num-cell">{j.numeroCamiseta || '—'}</td>
                <td>{j.nombre} {j.apellido}</td>
                <td>{equipoNombre(j.equipoId)}</td>
                <td><span className="pos-badge">{j.posicion || '—'}</span></td>
                <td className="stat-cell goles">{j.goles}</td>
                <td className="stat-cell amarillas">{j.tarjetasAmarillas}</td>
                <td className="stat-cell rojas">{j.tarjetasRojas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {jugadoresFiltrados.length === 0 && <p className="empty-state">No hay jugadores registrados</p>}
    </div>
  );
};

export default Jugadores;
