import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Equipos from './pages/Equipos';
import Jugadores from './pages/Jugadores';
import Partidos from './pages/Partidos';
import Posiciones from './pages/Posiciones';
import Goleadores from './pages/Goleadores';
import Tarjetas from './pages/Tarjetas';
import Admin from './pages/Admin';
import MiEquipo from './pages/MiEquipo';
import './App.css';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/equipos" element={<Equipos />} />
              <Route path="/jugadores" element={<Jugadores />} />
              <Route path="/partidos" element={<Partidos />} />
              <Route path="/posiciones" element={<Posiciones />} />
              <Route path="/goleadores" element={<Goleadores />} />
              <Route path="/tarjetas" element={<Tarjetas />} />

              {/* Solo Admin */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              } />

              {/* Solo Capitán */}
              <Route path="/mi-equipo" element={
                <ProtectedRoute roles={['capitan']}>
                  <MiEquipo />
                </ProtectedRoute>
              } />

              {/* Legacy redirect */}
              <Route path="/panel-control" element={
                <ProtectedRoute roles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
