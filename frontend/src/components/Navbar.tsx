import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/futnova5.jpeg';
import { useAuth } from '../context/AuthContext';
import { logout } from '../firebase/auth';
import './Navbar.css';

const ROL_LABEL: Record<string, string> = {
  admin: 'Admin',
  capitan: 'Capitán',
  visitante: 'Usuario',
};

const Navbar = () => {
  const { user, perfil } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="FutNova" className="logo-img" />
          <span>FutNova</span>
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/equipos">Equipos</Link></li>
          <li><Link to="/jugadores">Jugadores</Link></li>
          <li><Link to="/partidos">Partidos</Link></li>
          <li><Link to="/posiciones">Posiciones</Link></li>
          <li><Link to="/goleadores">Goleadores</Link></li>
          <li><Link to="/tarjetas">Tarjetas</Link></li>
          {perfil?.rol === 'admin' && <li><Link to="/admin">Panel Admin</Link></li>}
          {perfil?.rol === 'capitan' && <li><Link to="/mi-equipo">Mi Equipo</Link></li>}
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
  );
};

export default Navbar;
