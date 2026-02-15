import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Posicion } from '../types';
import './Posiciones.css';

const Posiciones = () => {
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosiciones();
  }, []);

  const loadPosiciones = async () => {
    try {
      const response = await api.get('/estadisticas/posiciones');
      setPosiciones(response.data);
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
              <tr key={pos.id}>
                <td className="pos-number">{index + 1}</td>
                <td className="equipo-cell">
                  {pos.logo_url && <img src={pos.logo_url} alt={pos.equipo_nombre} />}
                  <span>{pos.equipo_nombre}</span>
                </td>
                <td>{pos.partidos_jugados}</td>
                <td>{pos.partidos_ganados}</td>
                <td>{pos.partidos_empatados}</td>
                <td>{pos.partidos_perdidos}</td>
                <td>{pos.goles_favor}</td>
                <td>{pos.goles_contra}</td>
                <td className={pos.diferencia_goles >= 0 ? 'positive' : 'negative'}>
                  {pos.diferencia_goles > 0 ? '+' : ''}{pos.diferencia_goles}
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
