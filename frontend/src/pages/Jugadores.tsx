import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getJugadores, createJugador, updateJugador, deleteJugador } from '../firebase/jugadores';
import { getEquipos } from '../firebase/equipos';
import { Jugador, Equipo } from '../types';
import './Jugadores.css';

const POSICIONES_LIST = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];

const Jugadores = () => {
  const { perfil } = useAuth();
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEquipo, setFiltroEquipo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', numeroCamiseta: '', posicion: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  // Capitanes solo ven su propio equipo
  const esCapitan = perfil?.rol === 'capitan';
  const equipoCapitan = esCapitan ? perfil?.equipoId : undefined;

  useEffect(() => {
    load();
    if (equipoCapitan) setFiltroEquipo(equipoCapitan);
  }, []);

  const load = async () => {
    const [j, e] = await Promise.all([getJugadores(), getEquipos()]);
    setJugadores(j);
    setEquipos(e);
    setLoading(false);
  };

  const flash = (text: string) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const canEdit = perfil?.rol === 'admin' || esCapitan;

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const equipoId = equipoCapitan || filtroEquipo;
    if (!equipoId) { flash('❌ Seleccioná un equipo'); return; }
    const data = {
      nombre: form.nombre, apellido: form.apellido, equipoId,
      numeroCamiseta: form.numeroCamiseta ? Number(form.numeroCamiseta) : undefined,
      posicion: form.posicion || undefined,
      goles: 0, tarjetasAmarillas: 0, tarjetasRojas: 0,
    };
    if (editId) {
      await updateJugador(editId, data);
      flash('✅ Jugador actualizado');
      setEditId(null);
    } else {
      await createJugador(data);
      flash('✅ Jugador agregado');
    }
    setForm({ nombre: '', apellido: '', numeroCamiseta: '', posicion: '' });
    setShowForm(false);
    load();
  };

  const startEdit = (j: Jugador) => {
    setEditId(j.id);
    setForm({ nombre: j.nombre, apellido: j.apellido, numeroCamiseta: String(j.numeroCamiseta || ''), posicion: j.posicion || '' });
    setShowForm(true);
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar jugador?')) return;
    await deleteJugador(id);
    flash('🗑 Eliminado');
    load();
  };

  const equipoNombre = (id: string) => equipos.find((e) => e.id === id)?.nombre || '—';

  const jugadoresFiltrados = filtroEquipo
    ? jugadores.filter((j) => j.equipoId === filtroEquipo)
    : jugadores;

  if (loading) return <div className="loading">Cargando jugadores...</div>;

  return (
    <div className="jugadores-page">
      <div className="page-header">
        <h1>👥 Jugadores</h1>
        {canEdit && (
          <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ nombre: '', apellido: '', numeroCamiseta: '', posicion: '' }); }}>
            {showForm ? 'Cancelar' : '+ Nuevo Jugador'}
          </button>
        )}
      </div>

      {!esCapitan && (
        <div className="filtros">
          <select value={filtroEquipo} onChange={(e) => setFiltroEquipo(e.target.value)}>
            <option value="">Todos los equipos</option>
            {equipos.map((eq) => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
          </select>
        </div>
      )}

      {showForm && canEdit && (
        <form onSubmit={submitForm} className="jugador-form">
          <h3>{editId ? 'Editar Jugador' : 'Nuevo Jugador'}</h3>
          <div className="form-row">
            <input placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            <input placeholder="Apellido *" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
            <input type="number" placeholder="Nº camiseta" value={form.numeroCamiseta} onChange={(e) => setForm({ ...form, numeroCamiseta: e.target.value })} min={1} max={99} />
            <select value={form.posicion} onChange={(e) => setForm({ ...form, posicion: e.target.value })}>
              <option value="">Posición</option>
              {POSICIONES_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {!esCapitan && (
              <select value={filtroEquipo} onChange={(e) => setFiltroEquipo(e.target.value)} required>
                <option value="">Equipo *</option>
                {equipos.map((eq) => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
              </select>
            )}
          </div>
          <button type="submit" className="btn-primary">{editId ? 'Actualizar' : 'Agregar'}</button>
        </form>
      )}

      {msg && <div className="page-msg">{msg}</div>}

      <div className="jugadores-table-wrap">
        <table className="jugadores-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              {!esCapitan && <th>Equipo</th>}
              <th>Posición</th>
              <th>⚽</th>
              <th>🟡</th>
              <th>🔴</th>
              {canEdit && <th></th>}
            </tr>
          </thead>
          <tbody>
            {jugadoresFiltrados.map((j) => (
              <tr key={j.id}>
                <td className="num-cell">{j.numeroCamiseta || '—'}</td>
                <td>{j.nombre} {j.apellido}</td>
                {!esCapitan && <td>{equipoNombre(j.equipoId)}</td>}
                <td><span className="pos-badge">{j.posicion || '—'}</span></td>
                <td className="stat-cell goles">{j.goles}</td>
                <td className="stat-cell amarillas">{j.tarjetasAmarillas}</td>
                <td className="stat-cell rojas">{j.tarjetasRojas}</td>
                {canEdit && (esCapitan ? j.equipoId === equipoCapitan : true) && (
                  <td>
                    <button className="btn-edit-sm" onClick={() => startEdit(j)}>✏️</button>
                    <button className="btn-del-sm" onClick={() => remove(j.id)}>🗑</button>
                  </td>
                )}
                {canEdit && esCapitan && j.equipoId !== equipoCapitan && <td></td>}
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
