import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Equipo } from '../types';
import './Equipos.css';

const Equipos = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', logo_url: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEquipos();
  }, []);

  const loadEquipos = async () => {
    try {
      const response = await api.get('/equipos');
      console.log('Equipos cargados:', response.data);
      setEquipos(response.data);
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
      console.log('Enviando equipo:', formData);
      const response = await api.post('/equipos', formData);
      console.log('Respuesta del servidor:', response.data);
      
      setMessage({ type: 'success', text: `¡Equipo "${formData.nombre}" creado exitosamente!` });
      setFormData({ nombre: '', logo_url: '' });
      setShowForm(false);
      await loadEquipos();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Error response:', error.response?.data);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error al crear el equipo. Por favor intenta de nuevo.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        await api.delete(`/equipos/${id}`);
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
            value={formData.logo_url}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
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
              {equipo.logo_url && <img src={equipo.logo_url} alt={equipo.nombre} />}
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
