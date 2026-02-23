import { useState, useEffect } from 'react';
import { getTablaTargetas } from '../firebase/jugadores';
import { getEquipos } from '../firebase/equipos';
import { Jugador, Equipo } from '../types';
import './Tarjetas.css';

const Tarjetas = () => {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTablaTargetas(), getEquipos()]).then(([j, e]) => {
      setJugadores(j);
      setEquipos(e);
      setLoading(false);
    });
  }, []);

  const equipoNombre = (id: string) => equipos.find((e) => e.id === id)?.nombre || '—';

  if (loading) return <div className="loading">Cargando amonestaciones...</div>;

  return (
    <div className="tarjetas-page">
      <h1> Tabla de Amonestaciones</h1>

      {jugadores.length === 0 ? (
        <p className="empty-state">Aún no hay tarjetas registradas</p>
      ) : (
        <div className="tarjetas-table-wrap">
          <table className="tarjetas-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Jugador</th>
                <th>Equipo</th>
                <th>🟡 Amarillas</th>
                <th>🔴 Rojas</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {jugadores.map((j, i) => {
                const puntos = j.tarjetasAmarillas + j.tarjetasRojas * 2;
                return (
                  <tr key={j.id}>
                    <td className="pos-cell">{i + 1}</td>
                    <td>
                      <div className="jugador-info">
                        {j.numeroCamiseta && <span className="num-badge">{j.numeroCamiseta}</span>}
                        <span>{j.nombre} {j.apellido}</span>
                      </div>
                    </td>
                    <td>{equipoNombre(j.equipoId)}</td>
                    <td><span className="tarjeta-count amarilla">{j.tarjetasAmarillas}</span></td>
                    <td><span className="tarjeta-count roja">{j.tarjetasRojas}</span></td>
                    <td><span className="puntos-count">{puntos}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Tarjetas;
