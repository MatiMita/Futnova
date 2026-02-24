import { useState, useEffect } from 'react';
import { getPartidos } from '../firebase/partidos';
import { getEquipos } from '../firebase/equipos';
import { getJugadores } from '../firebase/jugadores';
import { Partido, Equipo, Jugador } from '../types';
import './Partidos.css';

const Partidos = () => {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'pendientes' | 'finalizados'>('todos');

  useEffect(() => {
    Promise.all([getPartidos(), getEquipos(), getJugadores()]).then(([p, e, j]) => {
      setPartidos(p);
      setEquipos(e);
      setJugadores(j);
      setLoading(false);
    });
  }, []);

  const equipoNombre = (id: string) => equipos.find((e) => e.id === id)?.nombre || '—';
  const equipoLogo = (id: string) => equipos.find((e) => e.id === id)?.logo;
  const jugadorData = (id: string) => jugadores.find((j) => j.id === id);

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
            {porJornada[Number(jornada)].map((p) => {
              const goleadoresLocal = p.goleadores?.filter((g) => {
                const jugador = jugadorData(g.jugadorId);
                return jugador?.equipoId === p.equipoLocalId;
              }) || [];
              
              const goleadoresVisitante = p.goleadores?.filter((g) => {
                const jugador = jugadorData(g.jugadorId);
                return jugador?.equipoId === p.equipoVisitanteId;
              }) || [];

              const tarjetasAmarillasLocal = p.tarjetasAmarillas?.filter((id) => {
                const jugador = jugadorData(id);
                return jugador?.equipoId === p.equipoLocalId;
              }) || [];

              const tarjetasAmarillasVisitante = p.tarjetasAmarillas?.filter((id) => {
                const jugador = jugadorData(id);
                return jugador?.equipoId === p.equipoVisitanteId;
              }) || [];

              const tarjetasRojasLocal = p.tarjetasRojas?.filter((id) => {
                const jugador = jugadorData(id);
                return jugador?.equipoId === p.equipoLocalId;
              }) || [];

              const tarjetasRojasVisitante = p.tarjetasRojas?.filter((id) => {
                const jugador = jugadorData(id);
                return jugador?.equipoId === p.equipoVisitanteId;
              }) || [];

              return (
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

                {/* Detalles del partido finalizado */}
                {p.finalizado && (goleadoresLocal.length > 0 || goleadoresVisitante.length > 0 || tarjetasAmarillasLocal.length > 0 || tarjetasAmarillasVisitante.length > 0 || tarjetasRojasLocal.length > 0 || tarjetasRojasVisitante.length > 0) && (
                  <div className="partido-detalles-public">
                    <div className="detalles-equipos">
                      {/* Columna Equipo Local */}
                      <div className="detalles-equipo">
                        {goleadoresLocal.map((gol) => {
                          const jugador = jugadorData(gol.jugadorId);
                          if (!jugador) return null;
                          return (
                            <div key={gol.jugadorId} className="detalle-item gol">
                              <span className="icono">⚽</span>
                              <span className="nombre">{jugador.nombre} {jugador.apellido}</span>
                              {gol.cantidad > 1 && <span className="cantidad">x{gol.cantidad}</span>}
                            </div>
                          );
                        })}
                        {tarjetasAmarillasLocal.map((id) => {
                          const jugador = jugadorData(id);
                          if (!jugador) return null;
                          return (
                            <div key={id} className="detalle-item amarilla">
                              <span className="icono">🟡</span>
                              <span className="nombre">{jugador.nombre} {jugador.apellido}</span>
                            </div>
                          );
                        })}
                        {tarjetasRojasLocal.map((id) => {
                          const jugador = jugadorData(id);
                          if (!jugador) return null;
                          return (
                            <div key={id} className="detalle-item roja">
                              <span className="icono">🔴</span>
                              <span className="nombre">{jugador.nombre} {jugador.apellido}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Columna Equipo Visitante */}
                      <div className="detalles-equipo right">
                        {goleadoresVisitante.map((gol) => {
                          const jugador = jugadorData(gol.jugadorId);
                          if (!jugador) return null;
                          return (
                            <div key={gol.jugadorId} className="detalle-item gol">
                              <span className="nombre">{jugador.nombre} {jugador.apellido}</span>
                              {gol.cantidad > 1 && <span className="cantidad">x{gol.cantidad}</span>}
                              <span className="icono">⚽</span>
                            </div>
                          );
                        })}
                        {tarjetasAmarillasVisitante.map((id) => {
                          const jugador = jugadorData(id);
                          if (!jugador) return null;
                          return (
                            <div key={id} className="detalle-item amarilla">
                              <span className="nombre">{jugador.nombre} {jugador.apellido}</span>
                              <span className="icono">🟡</span>
                            </div>
                          );
                        })}
                        {tarjetasRojasVisitante.map((id) => {
                          const jugador = jugadorData(id);
                          if (!jugador) return null;
                          return (
                            <div key={id} className="detalle-item roja">
                              <span className="nombre">{jugador.nombre} {jugador.apellido}</span>
                              <span className="icono">🔴</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="partido-status">
                  {p.finalizado ? <span className="badge-final">Finalizado</span> : <span className="badge-pendiente">Programado</span>}
                </div>
              </div>
            )})}
          </div>
        </div>
      ))}

      {filtrados.length === 0 && <p className="empty-state">No hay partidos</p>}
    </div>
  );
};

export default Partidos;
