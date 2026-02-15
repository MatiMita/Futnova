import { pool } from './connection';

const createTables = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Tabla de Equipos
    await client.query(`
      CREATE TABLE IF NOT EXISTS equipos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        logo_url VARCHAR(255),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Jugadores
    await client.query(`
      CREATE TABLE IF NOT EXISTS jugadores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        numero_camiseta INTEGER,
        posicion VARCHAR(50),
        equipo_id INTEGER REFERENCES equipos(id) ON DELETE CASCADE,
        goles INTEGER DEFAULT 0,
        tarjetas_amarillas INTEGER DEFAULT 0,
        tarjetas_rojas INTEGER DEFAULT 0,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Partidos
    await client.query(`
      CREATE TABLE IF NOT EXISTS partidos (
        id SERIAL PRIMARY KEY,
        equipo_local_id INTEGER REFERENCES equipos(id) ON DELETE CASCADE,
        equipo_visitante_id INTEGER REFERENCES equipos(id) ON DELETE CASCADE,
        goles_local INTEGER DEFAULT 0,
        goles_visitante INTEGER DEFAULT 0,
        fecha DATE NOT NULL,
        jornada INTEGER NOT NULL,
        finalizado BOOLEAN DEFAULT false,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Goles (para detalle de goleadores)
    await client.query(`
      CREATE TABLE IF NOT EXISTS goles (
        id SERIAL PRIMARY KEY,
        partido_id INTEGER REFERENCES partidos(id) ON DELETE CASCADE,
        jugador_id INTEGER REFERENCES jugadores(id) ON DELETE CASCADE,
        minuto INTEGER,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Tarjetas
    await client.query(`
      CREATE TABLE IF NOT EXISTS tarjetas (
        id SERIAL PRIMARY KEY,
        partido_id INTEGER REFERENCES partidos(id) ON DELETE CASCADE,
        jugador_id INTEGER REFERENCES jugadores(id) ON DELETE CASCADE,
        tipo VARCHAR(10) CHECK (tipo IN ('amarilla', 'roja')),
        minuto INTEGER,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Posiciones (vista materializada calculada automáticamente)
    await client.query(`
      CREATE TABLE IF NOT EXISTS posiciones (
        id SERIAL PRIMARY KEY,
        equipo_id INTEGER REFERENCES equipos(id) ON DELETE CASCADE UNIQUE,
        partidos_jugados INTEGER DEFAULT 0,
        partidos_ganados INTEGER DEFAULT 0,
        partidos_empatados INTEGER DEFAULT 0,
        partidos_perdidos INTEGER DEFAULT 0,
        goles_favor INTEGER DEFAULT 0,
        goles_contra INTEGER DEFAULT 0,
        diferencia_goles INTEGER DEFAULT 0,
        puntos INTEGER DEFAULT 0,
        ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Tablas creadas exitosamente');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al crear tablas:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Ejecutar migraciones
createTables()
  .then(() => {
    console.log('🎉 Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  });
