import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJugadoresByEquipo, createJugador, updateJugador, deleteJugador } from '../firebase/jugadores';
import { getEquipos } from '../firebase/equipos';
import { Jugador, Equipo } from '../types';
import './MiEquipo.css';

// Cupo recomendado por posición para una plantilla completa
const CUPO: Record<string, number> = {
  Portero: 2,
  Defensa: 3,
  Lateral: 2,
  Centrocampista: 3,
  Mediapunta: 1,
  Extremo: 2,
  Delantero: 2,
};

const POSICIONES_LIST = Object.keys(CUPO);
const TOTAL_RECOMENDADO = Object.values(CUPO).reduce((a, b) => a + b, 0);

const POS_ICON: Record<string, string> = {
  Portero: '',
  Defensa: '',
  Lateral: '',
  Centrocampista: '',
  Mediapunta: '',
  Extremo: '',
  Delantero: '',
};

const MiEquipo = () => {
  const { perfil, loading } = useAuth();
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [form, setForm] = useState({ nombre: '', apellido: '', numeroCamiseta: '', posicion: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => { if (perfil?.equipoId) loadData(); }, [perfil]);

  const loadData = async () => {
    if (!perfil?.equipoId) return;
    console.log('🔍 Cargando datos para equipoId:', perfil.equipoId);
    setLoadingData(true);
    const [equiposList, jugList] = await Promise.all([getEquipos(), getJugadoresByEquipo(perfil.equipoId)]);
    console.log('Jugadores obtenidos:', jugList);
    console.log('Cantidad de jugadores:', jugList.length);
    setEquipo(equiposList.find((e) => e.id === perfil.equipoId) || null);
    setJugadores(jugList);
    setLoadingData(false);
  };

  const flash = (text: string) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const openForm = (posicion = '') => {
    setEditId(null);
    setForm({ nombre: '', apellido: '', numeroCamiseta: '', posicion });
    setShowForm(true);
  };

  const startEdit = (j: Jugador) => {
    setEditId(j.id);
    setForm({ nombre: j.nombre, apellido: j.apellido, numeroCamiseta: String(j.numeroCamiseta || ''), posicion: j.posicion || '' });
    setShowForm(true);
    setTimeout(() => document.getElementById('form-nombre')?.focus(), 50);
  };

  const cancelForm = () => { setShowForm(false); setEditId(null); setForm({ nombre: '', apellido: '', numeroCamiseta: '', posicion: '' }); };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil?.equipoId) return;
    const data = {
      nombre: form.nombre, apellido: form.apellido,
      equipoId: perfil.equipoId,
      numeroCamiseta: form.numeroCamiseta ? Number(form.numeroCamiseta) : undefined,
      posicion: form.posicion || undefined,
      goles: 0, tarjetasAmarillas: 0, tarjetasRojas: 0,
    };
    if (editId) {
      await updateJugador(editId, { nombre: data.nombre, apellido: data.apellido, numeroCamiseta: data.numeroCamiseta, posicion: data.posicion });
      flash(' Jugador actualizado');
    } else {
      await createJugador(data);
      flash('Jugador añadido a la plantilla');
    }
    cancelForm();
    loadData();
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar jugador?')) return;
    await deleteJugador(id);
    flash('🗑️ Jugador eliminado');
    loadData();
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (!perfil || perfil.rol !== 'capitan') return <Navigate to="/" replace />;
  if (!perfil.equipoId) {
    return (
      <div className="mi-equipo-page">
        <div className="no-equipo-msg"><span>⚠️</span><p>Aún no tienes un equipo asignado. Contacta al administrador.</p></div>
      </div>
    );
  }

  // Cálculos de plantilla
  const conteo: Record<string, number> = {};
  POSICIONES_LIST.forEach((p) => { conteo[p] = jugadores.filter((j) => j.posicion === p).length; });
  const sinPosicion = jugadores.filter((j) => !j.posicion).length;
  const posicionesFaltantes = POSICIONES_LIST.filter((p) => conteo[p] < CUPO[p]);
  const progreso = Math.min(100, Math.round((jugadores.length / TOTAL_RECOMENDADO) * 100));
  const numerosUsados = new Set(jugadores.map((j) => j.numeroCamiseta).filter(Boolean));

  return (
    <div className="mi-equipo-page">

      {/* Cabecera */}
      <div className="equipo-header">
        {equipo?.logo && <img src={equipo.logo} alt={equipo.nombre} className="equipo-logo" />}
        <div className="equipo-header-info">
          <h1>{equipo?.nombre || 'Mi Equipo'}</h1>
          <div className="header-badges">
            {equipo?.grupo && <span className="grupo-badge">Grupo {equipo.grupo}</span>}
            <span className="capitan-badge">👤 {perfil.nombre}</span>
          </div>
        </div>
        <button className="btn-add-main" onClick={() => openForm()}>+ Añadir Jugador</button>
      </div>

      {/* Progreso de plantilla */}
      <div className="plantilla-progreso">
        <div className="progreso-header">
          <span className="progreso-titulo">Plantilla completa</span>
          <span className="progreso-nums">{jugadores.length} <span className="progreso-total">/ {TOTAL_RECOMENDADO} recomendados</span></span>
        </div>
        <div className="progreso-bar-wrap">
          <div className="progreso-bar" style={{ width: `${progreso}%` }} />
        </div>
        <div className="progreso-detail">
          <span>{jugadores.length >= 11 ? ' Tienes el mínimo de 11 jugadores' : ` Faltan ${11 - jugadores.length} para el mínimo de 11`}</span>
          {sinPosicion > 0 && <span className="warn-badge">⚠️ {sinPosicion} sin posición asignada</span>}
        </div>
      </div>

      {msg && !showForm && <div className="page-msg">{msg}</div>}

      {/* LISTA DE JUGADORES - Principal */}
      <div className="plantilla-lista">
        <div className="lista-header">
          <h2>📋 Jugadores Registrados ({jugadores.length})</h2>
          {jugadores.length > 0 && (
            <div className="lista-acciones">
              <button className="btn-primary-small" onClick={() => openForm()}>+ Añadir</button>
            </div>
          )}
        </div>
        
        {jugadores.length === 0 ? (
          <div className="empty-plantilla">
            <p>No hay jugadores aún.</p>
            <button className="btn-primary" onClick={() => openForm()}>+ Añadir primer jugador</button>
          </div>
        ) : (
          <>
            {POSICIONES_LIST.map((pos) => {
              const jug = jugadores.filter((j) => j.posicion === pos);
              if (jug.length === 0) return null;
              return (
                <div key={pos} className="pos-grupo">
                  <div className="pos-grupo-title">{POS_ICON[pos]} {pos} <span className="pos-grupo-count">{jug.length}/{CUPO[pos]}</span></div>
                  {jug.map((j) => (
                    <div key={j.id} className="jugador-row">
                      <span className="jrow-num">{j.numeroCamiseta || '—'}</span>
                      <span className="jrow-nombre">{j.nombre} {j.apellido}</span>
                      <div className="jrow-stats">
                        <span title="Goles">⚽ {j.goles || 0}</span>
                        <span title="Amarillas">🟡 {j.tarjetasAmarillas || 0}</span>
                        <span title="Rojas">🔴 {j.tarjetasRojas || 0}</span>
                      </div>
                      <div className="jrow-actions">
                        <button onClick={() => startEdit(j)} title="Editar">✏️</button>
                        <button onClick={() => remove(j.id)} title="Eliminar">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            {sinPosicion > 0 && (
              <div className="pos-grupo">
                <div className="pos-grupo-title warn">⚠️ Sin posición asignada <span className="pos-grupo-count">{sinPosicion}</span></div>
                {jugadores.filter((j) => !j.posicion).map((j) => (
                  <div key={j.id} className="jugador-row warn">
                    <span className="jrow-num">{j.numeroCamiseta || '—'}</span>
                    <span className="jrow-nombre">{j.nombre} {j.apellido}</span>
                    <div className="jrow-stats">
                      <span title="Goles">⚽ {j.goles || 0}</span>
                      <span title="Amarillas">🟡 {j.tarjetasAmarillas || 0}</span>
                      <span title="Rojas">🔴 {j.tarjetasRojas || 0}</span>
                    </div>
                    <div className="jrow-actions">
                      <button onClick={() => startEdit(j)} title="Editar">✏️</button>
                      <button onClick={() => remove(j.id)} title="Eliminar">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="form-overlay" onClick={(e) => e.target === e.currentTarget && cancelForm()}>
          <div className="form-modal">
            <div className="form-modal-header">
              <h3>{editId ? '✏️ Editar Jugador' : '➕ Nuevo Jugador'}</h3>
              <button className="form-close" onClick={cancelForm}>✕</button>
            </div>

            <form onSubmit={submitForm}>
              <div className="modal-fields">
                <div className="field-group">
                  <label>Nombre *</label>
                  <input id="form-nombre" placeholder="Ej: Carlos" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required autoFocus />
                </div>
                <div className="field-group">
                  <label>Apellido *</label>
                  <input placeholder="Ej: García" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
                </div>
                <div className="field-group">
                  <label>Nº Camiseta</label>
                  <input type="number" placeholder="1-99" value={form.numeroCamiseta}
                    onChange={(e) => setForm({ ...form, numeroCamiseta: e.target.value })} min={1} max={99} />
                  {form.numeroCamiseta && numerosUsados.has(Number(form.numeroCamiseta)) && !editId && (
                    <span className="field-warn">⚠️ Número ya en uso</span>
                  )}
                </div>
                <div className="field-group">
                  <label>Posición</label>
                  <div className="posicion-selector">
                    {POSICIONES_LIST.map((p) => (
                      <button key={p} type="button"
                        className={`pos-chip ${form.posicion === p ? 'selected' : ''} ${conteo[p] >= CUPO[p] ? 'llena' : ''}`}
                        onClick={() => setForm({ ...form, posicion: p })}>
                        {POS_ICON[p]} {p}
                        {conteo[p] >= CUPO[p] && <span className="chip-full">✓</span>}
                      </button>
                    ))}
                  </div>
                  {posicionesFaltantes.length > 0 && !form.posicion && (
                    <p className="pos-hint">💡 Faltan: {posicionesFaltantes.join(', ')}</p>
                  )}
                </div>
              </div>
              <div className="form-modal-footer">
                <button type="button" className="btn-secondary" onClick={cancelForm}>Cancelar</button>
                <button type="submit" className="btn-primary">{editId ? 'Guardar cambios' : 'Añadir jugador'}</button>
              </div>
            </form>
            {msg && <div className="form-msg">{msg}</div>}
          </div>
        </div>
      )}

      {/* Grid de posiciones visual */}
      {!loadingData && jugadores.length > 0 && (
        <div className="posiciones-seccion">
          <h3 className="seccion-titulo"> Resumen por Posición</h3>
          <div className="posiciones-grid">
            {POSICIONES_LIST.map((pos) => {
              const tiene = conteo[pos];
              const necesita = CUPO[pos];
              const completo = tiene >= necesita;
              return (
                <div key={pos} className={`pos-slot ${completo ? 'completo' : 'falta'}`} onClick={() => openForm(pos)}>
                  <span className="pos-icon">{POS_ICON[pos]}</span>
                  <span className="pos-nombre">{pos}</span>
                  <div className="pos-pips">
                    {Array.from({ length: necesita }).map((_, i) => (
                      <span key={i} className={`pip ${i < tiene ? 'lleno' : ''}`} />
                    ))}
                  </div>
                  <span className="pos-count">{tiene}/{necesita}</span>
                  {!completo && <span className="pos-add">+</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MiEquipo;
