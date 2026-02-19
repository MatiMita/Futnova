import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJugadoresByEquipo, createJugador, updateJugador, deleteJugador } from '../firebase/jugadores';
import { getEquipos } from '../firebase/equipos';
import { Jugador, Equipo } from '../types';
import './MiEquipo.css';

const POSICIONES_LIST = ['Portero', 'Defensa', 'Lateral', 'Centrocampista', 'Mediapunta', 'Extremo', 'Delantero'];

const MiEquipo = () => {
  const { perfil, loading } = useAuth();
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [form, setForm] = useState({ nombre: '', apellido: '', numeroCamiseta: '', posicion: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!perfil?.equipoId) return;
    loadData();
  }, [perfil]);

  const loadData = async () => {
    if (!perfil?.equipoId) return;
    setLoadingData(true);
    const [equiposList, jugList] = await Promise.all([
      getEquipos(),
      getJugadoresByEquipo(perfil.equipoId),
    ]);
    const eq = equiposList.find((e) => e.id === perfil.equipoId) || null;
    setEquipo(eq);
    setJugadores(jugList);
    setLoadingData(false);
  };

  const flash = (text: string) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil?.equipoId) return;
    const data = {
      nombre: form.nombre,
      apellido: form.apellido,
      equipoId: perfil.equipoId,
      numeroCamiseta: form.numeroCamiseta ? Number(form.numeroCamiseta) : undefined,
      posicion: form.posicion || undefined,
      goles: 0,
      tarjetasAmarillas: 0,
      tarjetasRojas: 0,
    };
    if (editId) {
      await updateJugador(editId, { nombre: data.nombre, apellido: data.apellido, numeroCamiseta: data.numeroCamiseta, posicion: data.posicion });
      flash('✅ Jugador actualizado');
      setEditId(null);
    } else {
      await createJugador(data);
      flash('✅ Jugador añadido');
    }
    setForm({ nombre: '', apellido: '', numeroCamiseta: '', posicion: '' });
    loadData();
  };

  const startEdit = (j: Jugador) => {
    setEditId(j.id);
    setForm({ nombre: j.nombre, apellido: j.apellido, numeroCamiseta: String(j.numeroCamiseta || ''), posicion: j.posicion || '' });
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar jugador?')) return;
    await deleteJugador(id);
    flash('🗑 Jugador eliminado');
    loadData();
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (!perfil || perfil.rol !== 'capitan') return <Navigate to="/" replace />;
  if (!perfil.equipoId) {
    return (
      <div className="mi-equipo-page">
        <div className="no-equipo-msg">
          <span>⚠️</span>
          <p>Aún no tienes un equipo asignado. Contacta al administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mi-equipo-page">
      {/* Cabecera del equipo */}
      <div className="equipo-header">
        {equipo?.logo && <img src={equipo.logo} alt={equipo.nombre} className="equipo-logo" />}
        <div>
          <h1>{equipo?.nombre || 'Mi Equipo'}</h1>
          {equipo?.grupo && <span className="grupo-badge">Grupo {equipo.grupo}</span>}
          <p className="capitan-label">👤 Capitán: {perfil.nombre}</p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {!loadingData && (
        <div className="equipo-stats">
          <div className="stat-card">
            <span className="stat-num">{jugadores.length}</span>
            <span className="stat-label">Jugadores</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{jugadores.reduce((s, j) => s + (j.goles || 0), 0)}</span>
            <span className="stat-label">⚽ Goles</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{jugadores.reduce((s, j) => s + (j.tarjetasAmarillas || 0), 0)}</span>
            <span className="stat-label">🟡 Amarillas</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{jugadores.reduce((s, j) => s + (j.tarjetasRojas || 0), 0)}</span>
            <span className="stat-label">🔴 Rojas</span>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="jugador-form-section">
        <h2>{editId ? 'Editar Jugador' : 'Añadir Jugador'}</h2>
        <form onSubmit={submitForm} className="jugador-form">
          <input
            placeholder="Nombre *"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <input
            placeholder="Apellido *"
            value={form.apellido}
            onChange={(e) => setForm({ ...form, apellido: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Nº camiseta"
            value={form.numeroCamiseta}
            onChange={(e) => setForm({ ...form, numeroCamiseta: e.target.value })}
            min={1}
            max={99}
          />
          <select value={form.posicion} onChange={(e) => setForm({ ...form, posicion: e.target.value })}>
            <option value="">Posición</option>
            {POSICIONES_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="form-actions">
            <button type="submit" className="btn-primary">{editId ? 'Actualizar' : 'Añadir'}</button>
            {editId && (
              <button type="button" className="btn-secondary" onClick={() => { setEditId(null); setForm({ nombre: '', apellido: '', numeroCamiseta: '', posicion: '' }); }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
        {msg && <div className="form-msg">{msg}</div>}
      </div>

      {/* Lista de jugadores */}
      <div className="jugadores-section">
        <h2>Plantilla ({jugadores.length} jugadores)</h2>
        {loadingData ? (
          <p className="loading-text">Cargando jugadores...</p>
        ) : jugadores.length === 0 ? (
          <p className="empty-text">No hay jugadores registrados. ¡Añade el primero!</p>
        ) : (
          <div className="jugadores-grid">
            {jugadores.map((j) => (
              <div key={j.id} className="jugador-card">
                <div className="jugador-numero">{j.numeroCamiseta || '—'}</div>
                <div className="jugador-info">
                  <span className="jugador-nombre">{j.nombre} {j.apellido}</span>
                  <span className="jugador-posicion">{j.posicion || 'Sin posición'}</span>
                </div>
                <div className="jugador-stats-mini">
                  <span title="Goles">⚽ {j.goles || 0}</span>
                  <span title="Amarillas">🟡 {j.tarjetasAmarillas || 0}</span>
                  <span title="Rojas">🔴 {j.tarjetasRojas || 0}</span>
                </div>
                <div className="jugador-actions">
                  <button className="btn-edit-sm" onClick={() => startEdit(j)}>Editar</button>
                  <button className="btn-delete-sm" onClick={() => remove(j.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MiEquipo;
