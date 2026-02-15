import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Equipos from './pages/Equipos';
import Posiciones from './pages/Posiciones';
import Admin from './pages/Admin';
import './App.css';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/posiciones" element={<Posiciones />} />
            <Route path="/jugadores" element={<div className="coming-soon">Próximamente: Jugadores</div>} />
            <Route path="/partidos" element={<div className="coming-soon">Próximamente: Partidos</div>} />
            <Route path="/goleadores" element={<div className="coming-soon">Próximamente: Goleadores</div>} />
            <Route path="/tarjetas" element={<div className="coming-soon">Próximamente: Tarjetas</div>} />
            <Route path="/panel-control" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
