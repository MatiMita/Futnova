import { useState, useEffect } from 'react';
import { getPartidos } from '../firebase/partidos';
import { getEquipos } from '../firebase/equipos';
import { Partido, Equipo } from '../types';
import './Partidos.css';

const Partidos = () => {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'pendientes' | 'finalizados'>('todos');

  useEffect(() => {
    Promise.all([getPartidos(), getEquipos()]).then(([p, e]) => {
      setPartidos(p);
      setEquipos(e);
      setLoading(false);
    });
  }, []);

  const equipoNombre = (id: string) => equipos.find((e) => e.id === id)?.nombre || '—';
  const equipoLogo = (id: string) => equipos.find((e) => e.id === id)?.logo;

  const filtrados = partidos.filter((p) => {
    if (filtro === 'pendientes') return !p.finalizado;
    if (filtro === 'finalizados') return p.finalizado;
    return true;
  });

  // Agrupar por jornada
  const porJornada = filtrados.reduce<Record<number, Partido[]>>((acc, p) => {
    if (!acc[p.jornada]) acc[p.jornada] = [];
    acc[p.jornada].push(p);
    return acc;
  }, {});

  if (loading) return <div className="loading">Cargando partidos...</div>;

  return (
    <div className="partidos-page">
      <div className="page-header">
        <h1>⚽ Partidos</h1>
      </div>

      <div className="filtros">
        {(['todos', 'pendientes', 'finalizados'] as const).map((f) => (
          <button key={f} className={`filtro-btn ${filtro === f ? 'active' : ''}`} onClick={() => setFiltro(f)}>
            {{ todos: 'Todos', pendientes: 'Pendientes', finalizados: 'Finalizados' }[f]}
          </button>
        ))}
      </div>

      {Object.keys(porJornada).sort((a, b) => Number(a) - Number(b)).map((jornada) => (
        <div key={jornada} className="jornada-block">
          <h2 className="jornada-title">Jornada {jornada}</h2>
          <div className="partidos-grid">
            {porJornada[Number(jornada)].map((p) => (
              <div key={p.id} className={`partido-card ${p.finalizado ? 'finalizado' : 'pendiente'}`}>
                <div className="partido-fecha">
                  {new Date(p.fecha).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {' • '}
                  {new Date(p.fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="partido-equipos">
                  <div className="equipo-side">
                    {equipoLogo(p.equipoLocalId) && <img src={equipoLogo(p.equipoLocalId)} alt="" />}
                    <span>{equipoNombre(p.equipoLocalId)}</span>
                  </div>
                  <div className="marcador">
                    {p.finalizado
                      ? <span className="score">{p.golesLocal} — {p.golesVisitante}</span>
                      : <span className="vs-text">VS</span>
                    }
                  </div>
                  <div className="equipo-side right">
                    <span>{equipoNombre(p.equipoVisitanteId)}</span>
                    {equipoLogo(p.equipoVisitanteId) && <img src={equipoLogo(p.equipoVisitanteId)} alt="" />}
                  </div>
                </div>
                <div className="partido-status">
                  {p.finalizado ? <span className="badge-final">Finalizado</span> : <span className="badge-pendiente">Programado</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtrados.length === 0 && <p className="empty-state">No hay partidos</p>}
    </div>
  );
};

export default Partidos;
