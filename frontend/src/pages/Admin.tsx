import { useState } from 'react';
import './Admin.css';

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Contraseña temporal - deberías cambiarla por autenticación real
    if (password === 'futnova2026') {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  if (!authenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="login-header">
            <div className="admin-icon">⚙️</div>
            <h1>Panel de Administración</h1>
            <p>Acceso Restringido</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                autoFocus
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-login">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>⚽ Panel de Administración - FutNova</h1>
        <button onClick={() => setAuthenticated(false)} className="btn-logout">
          Cerrar Sesión
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-grid">
          <div className="admin-card">
            <div className="card-icon">🏆</div>
            <h3>Gestión de Equipos</h3>
            <p>Agregar, editar o eliminar equipos del torneo</p>
            <button className="btn-card">Gestionar Equipos</button>
          </div>

          <div className="admin-card">
            <div className="card-icon">👥</div>
            <h3>Gestión de Jugadores</h3>
            <p>Administrar jugadores y asignarlos a equipos</p>
            <button className="btn-card">Gestionar Jugadores</button>
          </div>

          <div className="admin-card">
            <div className="card-icon">⚽</div>
            <h3>Registro de Partidos</h3>
            <p>Ingresar resultados y estadísticas de partidos</p>
            <button className="btn-card">Registrar Partido</button>
          </div>

          <div className="admin-card">
            <div className="card-icon">📊</div>
            <h3>Estadísticas</h3>
            <p>Ver y gestionar estadísticas del torneo</p>
            <button className="btn-card">Ver Estadísticas</button>
          </div>

          <div className="admin-card">
            <div className="card-icon">📅</div>
            <h3>Programación</h3>
            <p>Crear y modificar el fixture del torneo</p>
            <button className="btn-card">Gestionar Fixture</button>
          </div>

          <div className="admin-card">
            <div className="card-icon">🎯</div>
            <h3>Goleadores y Tarjetas</h3>
            <p>Actualizar tabla de goleadores y tarjetas</p>
            <button className="btn-card">Actualizar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
