import { Link } from 'react-router-dom';
import logo from '../assets/futnova5.jpeg';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="FutNova" className="logo-img" />
          <span>FutNova</span>
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/equipos">Equipos</Link></li>
          <li><Link to="/jugadores">Jugadores</Link></li>
          <li><Link to="/partidos">Partidos</Link></li>
          <li><Link to="/posiciones">Posiciones</Link></li>
          <li><Link to="/goleadores">Goleadores</Link></li>
          <li><Link to="/tarjetas">Tarjetas</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
