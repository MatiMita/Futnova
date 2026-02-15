import { Link } from 'react-router-dom';
import logo from '../assets/futnova5.jpeg';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="tournament-flag">⚽</div>
          <h1>NovaCup 2026</h1>
          <p className="hero-subtitle">TEMPORADA 2026 • TORNEO OFICIAL</p>
          
          <div className="tournament-logo">
            <img src={logo} alt="NovaCup" className="logo-image" />
          </div>

          <div className="cta-buttons">
            <Link to="/equipos" className="btn btn-primary">Ver Equipos</Link>
            <Link to="/posiciones" className="btn btn-secondary">Ver Tabla</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">15+</div>
            <div className="stat-label">Equipos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">50+</div>
            <div className="stat-label">Partidos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">10</div>
            <div className="stat-label">Jornadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">200+</div>
            <div className="stat-label">Jugadores</div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <h2 className="section-title">⚽ Nuestra Historia</h2>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">🏆</div>
            <h3>Formato Competitivo</h3>
            <p>Torneo de liga con sistema todos contra todos. Los mejores equipos clasifican a las fases finales donde se define al campeón.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <h3>Pasión y Tradición</h3>
            <p>NovaCup nace de la pasión por el fútbol y el deseo de crear un espacio donde los equipos puedan competir en un ambiente profesional.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">👥</div>
            <h3>Comunidad Unida</h3>
            <p>Nuestro torneo se ha convertido en una tradición que une a la comunidad, fomentando valores como el respeto y el trabajo en equipo.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📊</div>
            <h3>Estadísticas en Vivo</h3>
            <p>Sigue todos los resultados, goleadores y estadísticas actualizadas en tiempo real. Todo lo que necesitas saber del torneo.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">⚡</div>
            <h3>Partidos Emocionantes</h3>
            <p>Cada jornada trae partidos inolvidables, jugadas espectaculares y momentos que quedarán grabados en la memoria de todos.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🎖️</div>
            <h3>Premios y Reconocimientos</h3>
            <p>Premios al campeón y reconocimientos individuales: Goleador, Mejor Jugador, equipo más disciplinado y más.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
