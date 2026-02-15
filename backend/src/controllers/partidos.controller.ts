import { Request, Response } from 'express';
import { pool } from '../database/connection';

// Obtener todos los partidos
export const getPartidos = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
        el.nombre as equipo_local, 
        ev.nombre as equipo_visitante
      FROM partidos p
      JOIN equipos el ON p.equipo_local_id = el.id
      JOIN equipos ev ON p.equipo_visitante_id = ev.id
      ORDER BY p.fecha DESC, p.jornada DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener partidos' });
  }
};

// Crear partido
export const createPartido = async (req: Request, res: Response) => {
  const { equipo_local_id, equipo_visitante_id, fecha, jornada } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO partidos (equipo_local_id, equipo_visitante_id, fecha, jornada) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [equipo_local_id, equipo_visitante_id, fecha, jornada]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear partido' });
  }
};

// Actualizar partido (información básica)
export const updatePartido = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { equipo_local_id, equipo_visitante_id, fecha, jornada } = req.body;
  try {
    const result = await pool.query(
      `UPDATE partidos 
       SET equipo_local_id = $1, equipo_visitante_id = $2, fecha = $3, jornada = $4
       WHERE id = $5 RETURNING *`,
      [equipo_local_id, equipo_visitante_id, fecha, jornada, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar partido' });
  }
};

// Eliminar partido
export const deletePartido = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM partidos WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    res.json({ message: 'Partido eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar partido' });
  }
};


// Actualizar resultado del partido
export const updateResultado = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { goles_local, goles_visitante, finalizado } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Actualizar resultado del partido
    const result = await client.query(
      `UPDATE partidos 
       SET goles_local = $1, goles_visitante = $2, finalizado = $3
       WHERE id = $4 RETURNING *`,
      [goles_local, goles_visitante, finalizado, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    const partido = result.rows[0];

    // Si el partido está finalizado, actualizar tabla de posiciones
    if (finalizado) {
      await actualizarPosiciones(client, partido);
    }

    await client.query('COMMIT');
    res.json(partido);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error al actualizar resultado' });
  } finally {
    client.release();
  }
};

// Función auxiliar para actualizar posiciones
const actualizarPosiciones = async (client: any, partido: any) => {
  const { equipo_local_id, equipo_visitante_id, goles_local, goles_visitante } = partido;

  // Determinar resultado
  let puntosLocal = 0, puntosVisitante = 0;
  let ganadosLocal = 0, ganadosVisitante = 0;
  let empatadosLocal = 0, empatadosVisitante = 0;
  let perdidosLocal = 0, perdidosVisitante = 0;

  if (goles_local > goles_visitante) {
    puntosLocal = 3;
    ganadosLocal = 1;
    perdidosVisitante = 1;
  } else if (goles_visitante > goles_local) {
    puntosVisitante = 3;
    ganadosVisitante = 1;
    perdidosLocal = 1;
  } else {
    puntosLocal = 1;
    puntosVisitante = 1;
    empatadosLocal = 1;
    empatadosVisitante = 1;
  }

  // Actualizar equipo local
  await client.query(`
    UPDATE posiciones 
    SET partidos_jugados = partidos_jugados + 1,
        partidos_ganados = partidos_ganados + $1,
        partidos_empatados = partidos_empatados + $2,
        partidos_perdidos = partidos_perdidos + $3,
        goles_favor = goles_favor + $4,
        goles_contra = goles_contra + $5,
        diferencia_goles = (goles_favor + $4) - (goles_contra + $5),
        puntos = puntos + $6,
        ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE equipo_id = $7
  `, [ganadosLocal, empatadosLocal, perdidosLocal, goles_local, goles_visitante, puntosLocal, equipo_local_id]);

  // Actualizar equipo visitante
  await client.query(`
    UPDATE posiciones 
    SET partidos_jugados = partidos_jugados + 1,
        partidos_ganados = partidos_ganados + $1,
        partidos_empatados = partidos_empatados + $2,
        partidos_perdidos = partidos_perdidos + $3,
        goles_favor = goles_favor + $4,
        goles_contra = goles_contra + $5,
        diferencia_goles = (goles_favor + $4) - (goles_contra + $5),
        puntos = puntos + $6,
        ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE equipo_id = $7
  `, [ganadosVisitante, empatadosVisitante, perdidosVisitante, goles_visitante, goles_local, puntosVisitante, equipo_visitante_id]);
};
