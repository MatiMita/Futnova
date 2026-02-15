import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import equiposRoutes from './routes/equipos.routes';
import jugadoresRoutes from './routes/jugadores.routes';
import partidosRoutes from './routes/partidos.routes';
import estadisticasRoutes from './routes/estadisticas.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta raíz del proyecto
app.use(express.static(path.join(__dirname, '../../')));

// Rutas
app.use('/api/equipos', equiposRoutes);
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/partidos', partidosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'FutNova API funcionando' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
