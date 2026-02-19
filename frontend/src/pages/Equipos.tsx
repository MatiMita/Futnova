import { useState, useEffect } from 'react';
import { Equipo } from '../types';
import { getEquipos, createEquipo, deleteEquipo } from '../firebase/equipos';
import './Equipos.css';

const Equipos = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', logo: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEquipos();
  }, []);

  const loadEquipos = async () => {
    try {
      const data = await getEquipos();
      setEquipos(data);
    } catch (error) {
      console.error('Error al cargar equipos:', error);
      setMessage({ type: 'error', text: 'Error al cargar los equipos' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await createEquipo({ nombre: formData.nombre, logo: formData.logo || undefined });
      setMessage({ type: 'success', text: `¡Equipo "${formData.nombre}" creado exitosamente!` });
      setFormData({ nombre: '', logo: '' });
      setShowForm(false);
      await loadEquipos();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error al crear equipo:', error);
      setMessage({ type: 'error', text: 'Error al crear el equipo. Por favor intenta de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        await deleteEquipo(id);
        setMessage({ type: 'success', text: 'Equipo eliminado exitosamente' });
        await loadEquipos();
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error('Error al eliminar equipo:', error);
        setMessage({ type: 'error', text: 'Error al eliminar el equipo' });
      }
    }
  };

  if (loading) return <div className="loading">Cargando equipos...</div>;

  return (
    <div className="equipos-page">
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="page-header">
        <h1>Equipos</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Nuevo Equipo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>Nuevo Equipo</h3>
          <input
            type="text"
            placeholder="Nombre del equipo"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            disabled={submitting}
          />
          <input
            type="text"
            placeholder="URL del logo (opcional)"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            disabled={submitting}
          />
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      )}

      <div className="equipos-grid">
        {equipos.map((equipo) => (
          <div key={equipo.id} className="equipo-card">
            <div className="equipo-header">
              {equipo.logo && <img src={equipo.logo} alt={equipo.nombre} />}
              <h3>{equipo.nombre}</h3>
            </div>
            <button onClick={() => handleDelete(equipo.id)} className="btn-delete">
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {equipos.length === 0 && (
        <p className="empty-state">No hay equipos registrados</p>
      )}
    </div>
  );
};

export default Equipos;
