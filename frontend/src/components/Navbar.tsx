import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/futnova5.jpeg';
import logoFutnova from '../assets/logofutnova.jpeg';
import { useAuth } from '../context/AuthContext';
import { logout } from '../firebase/auth';
import { getEquipos } from '../firebase/equipos';
import { Equipo } from '../types';
import './Navbar.css';

const ROL_LABEL: Record<string, string> = {
  admin: 'Admin',
  capitan: 'Capitán',
  visitante: 'Usuario',
};

const Navbar = () => {
  const { user, perfil } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [equipoCapitan, setEquipoCapitan] = useState<Equipo | null>(null);

  // Cargar el equipo del capitán
  useEffect(() => {
    const cargarEquipo = async () => {
      if (perfil?.rol === 'capitan' && perfil.equipoId) {
        const equipos = await getEquipos();
        const equipo = equipos.find(e => e.id === perfil.equipoId);
        setEquipoCapitan(equipo || null);
      } else {
        setEquipoCapitan(null);
      }
    };
    cargarEquipo();
  }, [perfil]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    // Pequeña pausa para mostrar la pantalla de carga
    await new Promise(resolve => setTimeout(resolve, 800));
    navigate('/');
    setIsLoggingOut(false);
  };

  return (
    <>
      {isLoggingOut && (
        <div className="logout-loading-overlay">
          <div className="logout-loading-content">
            <img src={logoFutnova} alt="FutNova" className="logout-logo" />
            <div className="logout-spinner"></div>
            <p>Cerrando sesión...</p>
          </div>
        </div>
      )}
      
      <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="FutNova" className="logo-img" />
          <span>FutNova</span>
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/equipos" className={location.pathname === '/equipos' ? 'active' : ''}>Equipos</Link></li>
          <li><Link to="/jugadores" className={location.pathname === '/jugadores' ? 'active' : ''}>Jugadores</Link></li>
          <li><Link to="/partidos" className={location.pathname === '/partidos' ? 'active' : ''}>Partidos</Link></li>
          <li><Link to="/posiciones" className={location.pathname === '/posiciones' ? 'active' : ''}>Posiciones</Link></li>
          <li><Link to="/goleadores" className={location.pathname === '/goleadores' ? 'active' : ''}>Goleadores</Link></li>
          <li><Link to="/tarjetas" className={location.pathname === '/tarjetas' ? 'active' : ''}>Tarjetas</Link></li>
          {perfil?.rol === 'admin' && <li><Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Panel Admin</Link></li>}
          {perfil?.rol === 'capitan' && (
            <li>
              <Link to="/mi-equipo" className={location.pathname === '/mi-equipo' ? 'active' : ''}>
                {equipoCapitan?.nombre || 'Mi Equipo'}
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-auth">
          {user && perfil ? (
            <div className="user-menu">
              <span className={`role-badge role-${perfil.rol}`}>
                {ROL_LABEL[perfil.rol]}
              </span>
              <span className="user-name">{perfil.nombre}</span>
              <button className="btn-logout" onClick={handleLogout}>Log Out</button>
            </div>
          ) : (
            <Link to="/login" className="btn-navbar-login">Iniciar Sesión</Link>
          )}
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
