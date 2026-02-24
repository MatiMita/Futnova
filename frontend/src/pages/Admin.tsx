import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getEquipos, createEquipo, deleteEquipo, updateEquipo } from '../firebase/equipos';
import { getJugadores, createJugador, updateJugador, deleteJugador } from '../firebase/jugadores';
import { getPartidos, createPartido, updateResultado, deletePartido } from '../firebase/partidos';
import { crearUsuario } from '../firebase/auth';
import { subirLogoEquipo } from '../firebase/storage';
import { Equipo, Jugador, Partido } from '../types';
import './Admin.css';

type Tab = 'equipos' | 'jugadores' | 'partidos' | 'usuarios';

const GRUPOS = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D'];
const POSICIONES_LIST = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];

const Admin = () => {
  const { perfil, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('equipos');

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);

  const [equipoForm, setEquipoForm] = useState({ nombre: '', logo: '', grupo: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editEquipoId, setEditEquipoId] = useState<string | null>(null);
  const [equipoMsg, setEquipoMsg] = useState('');

  const [jugadorForm, setJugadorForm] = useState({ nombre: '', apellido: '', equipoId: '', numeroCamiseta: '', posicion: '' });
  const [editJugadorId, setEditJugadorId] = useState<string | null>(null);
  const [jugadorMsg, setJugadorMsg] = useState('');

  const [partidoForm, setPartidoForm] = useState({ equipoLocalId: '', equipoVisitanteId: '', fecha: '', jornada: '' });
  const [partidoMsg, setPartidoMsg] = useState('');
  const [resultadoForm, setResultadoForm] = useState<Record<string, { golesLocal: string; golesVisitante: string; finalizado: boolean }>>({});
  const [partidoDetalles, setPartidoDetalles] = useState<Record<string, { 
    goleadores: Array<{ jugadorId: string; cantidad: number }>;
    tarjetasAmarillas: string[];
    tarjetasRojas: string[];
  }>>({});
  const [partidosExpandidos, setPartidosExpandidos] = useState<Record<string, boolean>>({});

  const [usuarioForm, setUsuarioForm] = useState({ email: '', password: '', nombre: '', equipoId: '' });
  const [usuarioMsg, setUsuarioMsg] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [e, j, p] = await Promise.all([getEquipos(), getJugadores(), getPartidos()]);
    setEquipos(e);
    setJugadores(j);
    setPartidos(p);
    const res: typeof resultadoForm = {};
    const det: typeof partidoDetalles = {};
    p.forEach((pt) => { 
      res[pt.id] = { golesLocal: String(pt.golesLocal), golesVisitante: String(pt.golesVisitante), finalizado: pt.finalizado };
      det[pt.id] = {
        goleadores: pt.goleadores || [],
        tarjetasAmarillas: pt.tarjetasAmarillas || [],
        tarjetasRojas: pt.tarjetasRojas || []
      };
    });
    setResultadoForm(res);
    setPartidoDetalles(det);
  };

  const flash = (setter: (s: string) => void, text: string) => { setter(text); setTimeout(() => setter(''), 3000); };

  // ---- EQUIPOS ----
  const submitEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploadingLogo(true);
      let logoURL = equipoForm.logo;
      
      // Si se seleccionó un archivo, convertirlo a Base64
      if (logoFile) {
        logoURL = await subirLogoEquipo(logoFile);
      }
      
      if (editEquipoId) {
        await updateEquipo(editEquipoId, { nombre: equipoForm.nombre, logo: logoURL || undefined, grupo: equipoForm.grupo || undefined });
        flash(setEquipoMsg, ' Equipo actualizado');
        setEditEquipoId(null);
      } else {
        await createEquipo({ nombre: equipoForm.nombre, logo: logoURL || undefined, grupo: equipoForm.grupo || undefined });
        flash(setEquipoMsg, ' Equipo creado');
      }
      setEquipoForm({ nombre: '', logo: '', grupo: '' });
      setLogoFile(null);
      loadAll();
    } catch (error: any) {
      flash(setEquipoMsg, `❌ ${error.message || 'Error al procesar el logo'}`);
    } finally {
      setUploadingLogo(false);
    }
  };
  const startEditEquipo = (eq: Equipo) => { setEditEquipoId(eq.id); setEquipoForm({ nombre: eq.nombre, logo: eq.logo || '', grupo: eq.grupo || '' }); setLogoFile(null); };
  const removeEquipo = async (id: string) => { if (!confirm('¿Eliminar equipo?')) return; await deleteEquipo(id); flash(setEquipoMsg, '🗑 Eliminado'); loadAll(); };

  // ---- JUGADORES ----
  const submitJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { nombre: jugadorForm.nombre, apellido: jugadorForm.apellido, equipoId: jugadorForm.equipoId, numeroCamiseta: jugadorForm.numeroCamiseta ? Number(jugadorForm.numeroCamiseta) : undefined, posicion: jugadorForm.posicion || undefined, goles: 0, tarjetasAmarillas: 0, tarjetasRojas: 0 };
    if (editJugadorId) {
      await updateJugador(editJugadorId, data);
      flash(setJugadorMsg, ' Jugador actualizado');
      setEditJugadorId(null);
    } else {
      await createJugador(data);
      flash(setJugadorMsg, ' Jugador creado');
    }
    setJugadorForm({ nombre: '', apellido: '', equipoId: '', numeroCamiseta: '', posicion: '' });
    loadAll();
  };
  const startEditJugador = (j: Jugador) => { setEditJugadorId(j.id); setJugadorForm({ nombre: j.nombre, apellido: j.apellido, equipoId: j.equipoId, numeroCamiseta: String(j.numeroCamiseta || ''), posicion: j.posicion || '' }); };
  const removeJugador = async (id: string) => { if (!confirm('¿Eliminar jugador?')) return; await deleteJugador(id); flash(setJugadorMsg, '🗑 Eliminado'); loadAll(); };
  const updateStats = async (id: string, campo: 'goles' | 'tarjetasAmarillas' | 'tarjetasRojas', delta: number) => {
    const j = jugadores.find((x) => x.id === id);
    if (!j) return;
    await updateJugador(id, { [campo]: Math.max(0, (j[campo] || 0) + delta) });
    loadAll();
  };

  // ---- PARTIDOS ----
  const submitPartido = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPartido({ equipoLocalId: partidoForm.equipoLocalId, equipoVisitanteId: partidoForm.equipoVisitanteId, fecha: partidoForm.fecha, jornada: Number(partidoForm.jornada) });
    flash(setPartidoMsg, ' Partido creado');
    setPartidoForm({ equipoLocalId: '', equipoVisitanteId: '', fecha: '', jornada: '' });
    loadAll();
  };
  const saveResultado = async (partidoId: string) => {
    const r = resultadoForm[partidoId];
    const d = partidoDetalles[partidoId];
    if (!r) return;
    await updateResultado(
      partidoId, 
      Number(r.golesLocal), 
      Number(r.golesVisitante), 
      r.finalizado,
      d?.goleadores,
      d?.tarjetasAmarillas,
      d?.tarjetasRojas
    );
    flash(setPartidoMsg, '✅ Resultado guardado');
    loadAll();
  };

  const agregarGoleador = (partidoId: string, jugadorId: string) => {
    if (!jugadorId) return;
    setPartidoDetalles((prev) => {
      const current = prev[partidoId] || { goleadores: [], tarjetasAmarillas: [], tarjetasRojas: [] };
      const existenteIndex = current.goleadores.findIndex((g) => g.jugadorId === jugadorId);
      
      if (existenteIndex !== -1) {
        // Crear una nueva copia del array con el goleador actualizado
        const nuevosGoleadores = current.goleadores.map((g, idx) => 
          idx === existenteIndex ? { ...g, cantidad: g.cantidad + 1 } : g
        );
        return { ...prev, [partidoId]: { ...current, goleadores: nuevosGoleadores } };
      }
      
      // Agregar nuevo goleador
      return { ...prev, [partidoId]: { ...current, goleadores: [...current.goleadores, { jugadorId, cantidad: 1 }] } };
    });
  };

  const quitarGoleador = (partidoId: string, jugadorId: string) => {
    setPartidoDetalles((prev) => {
      const current = prev[partidoId] || { goleadores: [], tarjetasAmarillas: [], tarjetasRojas: [] };
      const existenteIndex = current.goleadores.findIndex((g) => g.jugadorId === jugadorId);
      
      if (existenteIndex !== -1) {
        const goleador = current.goleadores[existenteIndex];
        if (goleador.cantidad > 1) {
          // Decrementar la cantidad
          const nuevosGoleadores = current.goleadores.map((g, idx) => 
            idx === existenteIndex ? { ...g, cantidad: g.cantidad - 1 } : g
          );
          return { ...prev, [partidoId]: { ...current, goleadores: nuevosGoleadores } };
        } else {
          // Eliminar el goleador si la cantidad es 1
          return { ...prev, [partidoId]: { ...current, goleadores: current.goleadores.filter((g) => g.jugadorId !== jugadorId) } };
        }
      }
      
      return prev;
    });
  };

  const toggleTarjeta = (partidoId: string, jugadorId: string, tipo: 'amarilla' | 'roja') => {
    if (!jugadorId) return;
    setPartidoDetalles((prev) => {
      const current = prev[partidoId] || { goleadores: [], tarjetasAmarillas: [], tarjetasRojas: [] };
      const key = tipo === 'amarilla' ? 'tarjetasAmarillas' : 'tarjetasRojas';
      const lista = current[key];
      const existe = lista.includes(jugadorId);
      return {
        ...prev,
        [partidoId]: {
          ...current,
          [key]: existe ? lista.filter((id) => id !== jugadorId) : [...lista, jugadorId]
        }
      };
    });
  };

  const togglePartidoExpandido = (partidoId: string) => {
    setPartidosExpandidos((prev) => ({
      ...prev,
      [partidoId]: !prev[partidoId]
    }));
  };

  const removePartido = async (id: string) => { if (!confirm('¿Eliminar partido?')) return; await deletePartido(id); flash(setPartidoMsg, '🗑 Eliminado'); loadAll(); };

  // ---- USUARIOS ----
  const submitUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearUsuario(usuarioForm.email, usuarioForm.password, usuarioForm.nombre, 'capitan', usuarioForm.equipoId || undefined);
      flash(setUsuarioMsg, ' Capitán creado');
      setUsuarioForm({ email: '', password: '', nombre: '', equipoId: '' });
    } catch {
      flash(setUsuarioMsg, '❌ Error: el email ya puede estar en uso');
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (!perfil || perfil.rol !== 'admin') return <Navigate to="/" replace />;

  const equipoNombre = (id: string) => equipos.find((e) => e.id === id)?.nombre || id;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <span className="admin-subtitle">NovaCup 2026</span>
      </div>

      <div className="admin-tabs">
        {(['equipos', 'jugadores', 'partidos', 'usuarios'] as Tab[]).map((t) => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {{ equipos: ' Equipos', jugadores: ' Jugadores', partidos: ' Partidos', usuarios: ' Capitanes' }[t]}
          </button>
        ))}
      </div>

      {/* EQUIPOS */}
      {tab === 'equipos' && (
        <div className="admin-section">
          <form onSubmit={submitEquipo} className="admin-form">
            <h3>{editEquipoId ? 'Editar Equipo' : 'Nuevo Equipo'}</h3>
            <div className="form-row">
              <input placeholder="Nombre del equipo *" value={equipoForm.nombre} onChange={(e) => setEquipoForm({ ...equipoForm, nombre: e.target.value })} required />
              <select value={equipoForm.grupo} onChange={(e) => setEquipoForm({ ...equipoForm, grupo: e.target.value })}>
                <option value="">Sin grupo</option>
                {GRUPOS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                  📤 Subir logo desde tu computador <span style={{ fontSize: '0.8rem', color: '#999' }}>(máx. 500KB)</span>
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoFile(file);
                      setEquipoForm({ ...equipoForm, logo: '' }); // Limpiar URL si se selecciona archivo
                    }
                  }} 
                />
                {logoFile && <span style={{ fontSize: '0.85rem', color: '#4caf50', marginLeft: '0.5rem' }}>✓ {logoFile.name}</span>}
              </div>
            </div>
            <div className="form-row">
              <input 
                placeholder="O pega la URL del logo" 
                value={equipoForm.logo} 
                onChange={(e) => {
                  setEquipoForm({ ...equipoForm, logo: e.target.value });
                  if (e.target.value) setLogoFile(null); // Limpiar archivo si se ingresa URL
                }} 
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={uploadingLogo}>
                {uploadingLogo ? 'Subiendo...' : editEquipoId ? 'Actualizar' : 'Crear'}
              </button>
              {editEquipoId && <button type="button" className="btn-secondary" onClick={() => { setEditEquipoId(null); setEquipoForm({ nombre: '', logo: '', grupo: '' }); setLogoFile(null); }}>Cancelar</button>}
            </div>
          </form>
          {equipoMsg && <div className="admin-msg">{equipoMsg}</div>}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Logo</th><th>Nombre</th><th>Grupo</th><th>Acciones</th></tr></thead>
              <tbody>
                {equipos.map((eq) => (
                  <tr key={eq.id}>
                    <td>{eq.logo ? <img src={eq.logo} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} /> : '—'}</td>
                    <td>{eq.nombre}</td>
                    <td><span className="grupo-badge">{eq.grupo || '—'}</span></td>
                    <td>
                      <button className="btn-edit" onClick={() => startEditEquipo(eq)}>Editar</button>
                      <button className="btn-delete" onClick={() => removeEquipo(eq.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JUGADORES */}
      {tab === 'jugadores' && (
        <div className="admin-section">
          <form onSubmit={submitJugador} className="admin-form">
            <h3>{editJugadorId ? 'Editar Jugador' : 'Nuevo Jugador'}</h3>
            <div className="form-row">
              <input placeholder="Nombre *" value={jugadorForm.nombre} onChange={(e) => setJugadorForm({ ...jugadorForm, nombre: e.target.value })} required />
              <input placeholder="Apellido *" value={jugadorForm.apellido} onChange={(e) => setJugadorForm({ ...jugadorForm, apellido: e.target.value })} required />
              <select value={jugadorForm.equipoId} onChange={(e) => setJugadorForm({ ...jugadorForm, equipoId: e.target.value })} required>
                <option value="">Equipo *</option>
                {equipos.map((eq) => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
              </select>
              <input type="number" placeholder="Nº camiseta" value={jugadorForm.numeroCamiseta} onChange={(e) => setJugadorForm({ ...jugadorForm, numeroCamiseta: e.target.value })} min={1} max={99} />
              <select value={jugadorForm.posicion} onChange={(e) => setJugadorForm({ ...jugadorForm, posicion: e.target.value })}>
                <option value="">Posición</option>
                {POSICIONES_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">{editJugadorId ? 'Actualizar' : 'Crear'}</button>
              {editJugadorId && <button type="button" className="btn-secondary" onClick={() => { setEditJugadorId(null); setJugadorForm({ nombre: '', apellido: '', equipoId: '', numeroCamiseta: '', posicion: '' }); }}>Cancelar</button>}
            </div>
          </form>
          {jugadorMsg && <div className="admin-msg">{jugadorMsg}</div>}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>#</th><th>Jugador</th><th>Equipo</th><th>Pos</th><th>⚽ Goles</th><th>🟡 Amar.</th><th>🔴 Rojas</th><th>Acciones</th></tr></thead>
              <tbody>
                {jugadores.map((j) => (
                  <tr key={j.id}>
                    <td>{j.numeroCamiseta || '—'}</td>
                    <td>{j.nombre} {j.apellido}</td>
                    <td>{equipoNombre(j.equipoId)}</td>
                    <td>{j.posicion || '—'}</td>
                    <td><div className="stat-ctrl"><button onClick={() => updateStats(j.id, 'goles', -1)}>−</button><span>{j.goles}</span><button onClick={() => updateStats(j.id, 'goles', 1)}>+</button></div></td>
                    <td><div className="stat-ctrl"><button onClick={() => updateStats(j.id, 'tarjetasAmarillas', -1)}>−</button><span>{j.tarjetasAmarillas}</span><button onClick={() => updateStats(j.id, 'tarjetasAmarillas', 1)}>+</button></div></td>
                    <td><div className="stat-ctrl"><button onClick={() => updateStats(j.id, 'tarjetasRojas', -1)}>−</button><span>{j.tarjetasRojas}</span><button onClick={() => updateStats(j.id, 'tarjetasRojas', 1)}>+</button></div></td>
                    <td>
                      <button className="btn-edit" onClick={() => startEditJugador(j)}>Editar</button>
                      <button className="btn-delete" onClick={() => removeJugador(j.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PARTIDOS */}
      {tab === 'partidos' && (
        <div className="admin-section">
          <form onSubmit={submitPartido} className="admin-form">
            <h3>Nuevo Partido</h3>
            <div className="form-row">
              <select value={partidoForm.equipoLocalId} onChange={(e) => setPartidoForm({ ...partidoForm, equipoLocalId: e.target.value })} required>
                <option value="">Equipo Local *</option>
                {equipos.map((eq) => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
              </select>
              <select value={partidoForm.equipoVisitanteId} onChange={(e) => setPartidoForm({ ...partidoForm, equipoVisitanteId: e.target.value })} required>
                <option value="">Equipo Visitante *</option>
                {equipos.filter((eq) => eq.id !== partidoForm.equipoLocalId).map((eq) => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
              </select>
              <input type="datetime-local" value={partidoForm.fecha} onChange={(e) => setPartidoForm({ ...partidoForm, fecha: e.target.value })} required />
              <input type="number" placeholder="Jornada *" value={partidoForm.jornada} onChange={(e) => setPartidoForm({ ...partidoForm, jornada: e.target.value })} required min={1} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Crear Partido</button>
            </div>
          </form>
          {partidoMsg && <div className="admin-msg">{partidoMsg}</div>}
          <div className="partidos-list">
            {partidos.map((p) => {
              const jugadoresLocal = jugadores.filter((j) => j.equipoId === p.equipoLocalId);
              const jugadoresVisitante = jugadores.filter((j) => j.equipoId === p.equipoVisitanteId);
              const detalle = partidoDetalles[p.id] || { goleadores: [], tarjetasAmarillas: [], tarjetasRojas: [] };
              
              return (
                <div key={p.id} className={`partido-admin-card ${p.finalizado ? 'finalizado' : ''}`}>
                  <div className="partido-info">
                    <span className="jornada-badge">J{p.jornada}</span>
                    <span>{equipoNombre(p.equipoLocalId)}</span>
                    <span className="vs">VS</span>
                    <span>{equipoNombre(p.equipoVisitanteId)}</span>
                    <span className="fecha-text">{new Date(p.fecha).toLocaleDateString('es')}</span>
                    {p.finalizado && <span className="fin-badge">✓ Final</span>}
                  </div>
                  
                  <div className="resultado-ctrl">
                    <input type="number" min={0} style={{ width: 52 }} value={resultadoForm[p.id]?.golesLocal ?? p.golesLocal} onChange={(e) => setResultadoForm({ ...resultadoForm, [p.id]: { ...resultadoForm[p.id], golesLocal: e.target.value } })} />
                    <span style={{ color: '#aaa' }}>—</span>
                    <input type="number" min={0} style={{ width: 52 }} value={resultadoForm[p.id]?.golesVisitante ?? p.golesVisitante} onChange={(e) => setResultadoForm({ ...resultadoForm, [p.id]: { ...resultadoForm[p.id], golesVisitante: e.target.value } })} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#aaa', cursor: 'pointer' }}>
                      <input type="checkbox" checked={resultadoForm[p.id]?.finalizado ?? p.finalizado} onChange={(e) => setResultadoForm({ ...resultadoForm, [p.id]: { ...resultadoForm[p.id], finalizado: e.target.checked } })} />
                      Final
                    </label>
                    <button className="btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => saveResultado(p.id)}>Guardar</button>
                    <button className="btn-delete" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => removePartido(p.id)}>✕</button>
                    <button 
                      className="btn-toggle-detalles" 
                      onClick={() => togglePartidoExpandido(p.id)}
                      title={partidosExpandidos[p.id] ? "Ocultar detalles" : "Mostrar detalles"}
                    >
                      {partidosExpandidos[p.id] ? '▼' : '▶'}
                    </button>
                  </div>

                  {/* Sección de Goleadores y Tarjetas */}
                  {partidosExpandidos[p.id] && (
                  <div className="partido-detalles">
                    {/* GOLEADORES */}
                    <div className="detalle-seccion">
                      <h4>⚽ Goleadores</h4>
                      <div className="equipos-container">
                        {/* Equipo Local */}
                        <div className="equipo-lista">
                          <h5 className="equipo-titulo">{equipoNombre(p.equipoLocalId)}</h5>
                          <div className="jugadores-columna">
                            {jugadoresLocal.map((j) => {
                              const gol = detalle.goleadores.find((g) => g.jugadorId === j.id);
                              const cantidad = gol?.cantidad || 0;
                              return (
                                <div key={j.id} className="jugador-selector">
                                  <span className="jugador-nombre">
                                    {j.numeroCamiseta && <span className="num-mini">{j.numeroCamiseta}</span>}
                                    {j.nombre} {j.apellido}
                                  </span>
                                  <div className="contador-goles">
                                    {cantidad > 0 && (
                                      <>
                                        <button className="btn-mini" onClick={() => quitarGoleador(p.id, j.id)}>−</button>
                                        <span className="cantidad-badge">{cantidad}</span>
                                      </>
                                    )}
                                    <button className="btn-mini add" onClick={() => agregarGoleador(p.id, j.id)}>+</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Equipo Visitante */}
                        <div className="equipo-lista">
                          <h5 className="equipo-titulo">{equipoNombre(p.equipoVisitanteId)}</h5>
                          <div className="jugadores-columna">
                            {jugadoresVisitante.map((j) => {
                              const gol = detalle.goleadores.find((g) => g.jugadorId === j.id);
                              const cantidad = gol?.cantidad || 0;
                              return (
                                <div key={j.id} className="jugador-selector">
                                  <span className="jugador-nombre">
                                    {j.numeroCamiseta && <span className="num-mini">{j.numeroCamiseta}</span>}
                                    {j.nombre} {j.apellido}
                                  </span>
                                  <div className="contador-goles">
                                    {cantidad > 0 && (
                                      <>
                                        <button className="btn-mini" onClick={() => quitarGoleador(p.id, j.id)}>−</button>
                                        <span className="cantidad-badge">{cantidad}</span>
                                      </>
                                    )}
                                    <button className="btn-mini add" onClick={() => agregarGoleador(p.id, j.id)}>+</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TARJETAS AMARILLAS */}
                    <div className="detalle-seccion">
                      <h4>🟡 Tarjetas Amarillas</h4>
                      <div className="equipos-container">
                        {/* Equipo Local */}
                        <div className="equipo-lista">
                          <h5 className="equipo-titulo">{equipoNombre(p.equipoLocalId)}</h5>
                          <div className="jugadores-columna">
                            {jugadoresLocal.map((j) => {
                              const tiene = detalle.tarjetasAmarillas.includes(j.id);
                              return (
                                <div key={j.id} className={`jugador-selector ${tiene ? 'seleccionado' : ''}`} onClick={() => toggleTarjeta(p.id, j.id, 'amarilla')}>
                                  <span className="jugador-nombre">
                                    {j.numeroCamiseta && <span className="num-mini">{j.numeroCamiseta}</span>}
                                    {j.nombre} {j.apellido}
                                  </span>
                                  {tiene && <span className="check-icon">✓</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Equipo Visitante */}
                        <div className="equipo-lista">
                          <h5 className="equipo-titulo">{equipoNombre(p.equipoVisitanteId)}</h5>
                          <div className="jugadores-columna">
                            {jugadoresVisitante.map((j) => {
                              const tiene = detalle.tarjetasAmarillas.includes(j.id);
                              return (
                                <div key={j.id} className={`jugador-selector ${tiene ? 'seleccionado' : ''}`} onClick={() => toggleTarjeta(p.id, j.id, 'amarilla')}>
                                  <span className="jugador-nombre">
                                    {j.numeroCamiseta && <span className="num-mini">{j.numeroCamiseta}</span>}
                                    {j.nombre} {j.apellido}
                                  </span>
                                  {tiene && <span className="check-icon">✓</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TARJETAS ROJAS */}
                    <div className="detalle-seccion">
                      <h4>🔴 Tarjetas Rojas</h4>
                      <div className="equipos-container">
                        {/* Equipo Local */}
                        <div className="equipo-lista">
                          <h5 className="equipo-titulo">{equipoNombre(p.equipoLocalId)}</h5>
                          <div className="jugadores-columna">
                            {jugadoresLocal.map((j) => {
                              const tiene = detalle.tarjetasRojas.includes(j.id);
                              return (
                                <div key={j.id} className={`jugador-selector ${tiene ? 'seleccionado roja' : ''}`} onClick={() => toggleTarjeta(p.id, j.id, 'roja')}>
                                  <span className="jugador-nombre">
                                    {j.numeroCamiseta && <span className="num-mini">{j.numeroCamiseta}</span>}
                                    {j.nombre} {j.apellido}
                                  </span>
                                  {tiene && <span className="check-icon">✓</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Equipo Visitante */}
                        <div className="equipo-lista">
                          <h5 className="equipo-titulo">{equipoNombre(p.equipoVisitanteId)}</h5>
                          <div className="jugadores-columna">
                            {jugadoresVisitante.map((j) => {
                              const tiene = detalle.tarjetasRojas.includes(j.id);
                              return (
                                <div key={j.id} className={`jugador-selector ${tiene ? 'seleccionado roja' : ''}`} onClick={() => toggleTarjeta(p.id, j.id, 'roja')}>
                                  <span className="jugador-nombre">
                                    {j.numeroCamiseta && <span className="num-mini">{j.numeroCamiseta}</span>}
                                    {j.nombre} {j.apellido}
                                  </span>
                                  {tiene && <span className="check-icon">✓</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* USUARIOS / CAPITANES */}
      {tab === 'usuarios' && (
        <div className="admin-section">
          <form onSubmit={submitUsuario} className="admin-form">
            <h3>Crear cuenta de Capitán</h3>
            <div className="form-row">
              <input placeholder="Nombre completo *" value={usuarioForm.nombre} onChange={(e) => setUsuarioForm({ ...usuarioForm, nombre: e.target.value })} required />
              <input type="email" placeholder="Email *" value={usuarioForm.email} onChange={(e) => setUsuarioForm({ ...usuarioForm, email: e.target.value })} required />
              <input type="password" placeholder="Contraseña (mín. 6) *" value={usuarioForm.password} onChange={(e) => setUsuarioForm({ ...usuarioForm, password: e.target.value })} required minLength={6} />
              <select value={usuarioForm.equipoId} onChange={(e) => setUsuarioForm({ ...usuarioForm, equipoId: e.target.value })}>
                <option value="">Asignar equipo</option>
                {equipos.map((eq) => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Crear Capitán</button>
            </div>
          </form>
          {usuarioMsg && <div className="admin-msg">{usuarioMsg}</div>}
          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '1rem' }}>
            Los capitanes pueden iniciar sesión y gestionar jugadores de su equipo asignado.
          </p>
        </div>
      )}
    </div>
  );
};

export default Admin;

