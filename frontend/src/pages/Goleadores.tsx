import { useState, useEffect } from 'react';
import { getGoleadores } from '../firebase/jugadores';
import { getEquipos } from '../firebase/equipos';
import { Jugador, Equipo } from '../types';
import './Goleadores.css';

const Goleadores = () => {
  const [goleadores, setGoleadores] = useState<Jugador[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getGoleadores(), getEquipos()]).then(([g, e]) => {
      setGoleadores(g);
      setEquipos(e);
      setLoading(false);
    });
  }, []);

  const equipoNombre = (id: string) => equipos.find((e) => e.id === id)?.nombre || '—';
  const equipoLogo = (id: string) => equipos.find((e) => e.id === id)?.logo;

  if (loading) return <div className="loading">Cargando goleadores...</div>;

  return (
    <div className="goleadores-page">
      <h1>⚽ Tabla de Goleadores</h1>

      {goleadores.length === 0 ? (
        <p className="empty-state">Aún no hay goles registrados</p>
      ) : (
        <div className="goleadores-table-wrap">
          <table className="goleadores-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Jugador</th>
                <th>Equipo</th>
                <th>⚽ Goles</th>
              </tr>
            </thead>
            <tbody>
              {goleadores.map((j, i) => (
                <tr key={j.id} className={i < 3 ? `top-${i + 1}` : ''}>
                  <td className="pos-cell">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td>
                    <div className="jugador-info">
                      {j.numeroCamiseta && <span className="num-badge">{j.numeroCamiseta}</span>}
                      <span>{j.nombre} {j.apellido}</span>
                    </div>
                  </td>
                  <td>
                    <div className="equipo-info">
                      {equipoLogo(j.equipoId) && <img src={equipoLogo(j.equipoId)} alt="" />}
                      <span>{equipoNombre(j.equipoId)}</span>
                    </div>
                  </td>
                  <td className="goles-cell">{j.goles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Goleadores;
