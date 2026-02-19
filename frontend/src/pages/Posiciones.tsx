import { useState, useEffect } from 'react';
import { Posicion } from '../types';
import { getPosiciones } from '../firebase/estadisticas';
import './Posiciones.css';

const Posiciones = () => {
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosiciones();
  }, []);

  const loadPosiciones = async () => {
    try {
      const data = await getPosiciones();
      setPosiciones(data);
    } catch (error) {
      console.error('Error al cargar posiciones:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando tabla de posiciones...</div>;

  return (
    <div className="posiciones-page">
      <h1>Tabla de Posiciones</h1>
      
      <div className="table-container">
        <table className="posiciones-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Equipo</th>
              <th>PJ</th>
              <th>PG</th>
              <th>PE</th>
              <th>PP</th>
              <th>GF</th>
              <th>GC</th>
              <th>DG</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {posiciones.map((pos, index) => (
              <tr key={pos.equipoId}>
                <td className="pos-number">{index + 1}</td>
                <td className="equipo-cell">
                  {pos.logo && <img src={pos.logo} alt={pos.equipoNombre} />}
                  <span>{pos.equipoNombre}</span>
                </td>
                <td>{pos.partidosJugados}</td>
                <td>{pos.partidosGanados}</td>
                <td>{pos.partidosEmpatados}</td>
                <td>{pos.partidosPerdidos}</td>
                <td>{pos.golesFavor}</td>
                <td>{pos.golesContra}</td>
                <td className={pos.diferenciaGoles >= 0 ? 'positive' : 'negative'}>
                  {pos.diferenciaGoles > 0 ? '+' : ''}{pos.diferenciaGoles}
                </td>
                <td className="puntos">{pos.puntos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {posiciones.length === 0 && (
        <p className="empty-state">No hay datos de posiciones</p>
      )}
    </div>
  );
};

export default Posiciones;
