import pkg from 'pg';
const { Client } = pkg;

const createDatabase = async () => {
  // Conectar a postgres (base de datos por defecto)
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Verificar si la base de datos existe
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'Torneo'"
    );

    if (checkDb.rows.length === 0) {
      // Crear la base de datos
      await client.query('CREATE DATABASE "Torneo"');
      console.log('✅ Base de datos "Torneo" creada exitosamente');
    } else {
      console.log('ℹ️  La base de datos "Torneo" ya existe');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
};

createDatabase();
