import { Request, Response } from 'express';
import { pool } from '../database/connection';

// Obtener tabla de posiciones
export const getPosiciones = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.*, e.nombre as equipo_nombre, e.logo_url
      FROM posiciones p
      JOIN equipos e ON p.equipo_id = e.id
      ORDER BY p.puntos DESC, p.diferencia_goles DESC, p.goles_favor DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener posiciones' });
  }
};

// Obtener tabla de goleadores
export const getGoleadores = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT j.*, e.nombre as equipo_nombre
      FROM jugadores j
      JOIN equipos e ON j.equipo_id = e.id
      WHERE j.goles > 0
      ORDER BY j.goles DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener goleadores' });
  }
};

// Obtener tabla de tarjetas
export const getTarjetas = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT j.*, e.nombre as equipo_nombre,
        (j.tarjetas_rojas * 2 + j.tarjetas_amarillas) as puntos_tarjetas
      FROM jugadores j
      JOIN equipos e ON j.equipo_id = e.id
      WHERE j.tarjetas_amarillas > 0 OR j.tarjetas_rojas > 0
      ORDER BY puntos_tarjetas DESC, j.tarjetas_rojas DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tabla de tarjetas' });
  }
};

// Recalcular tabla de posiciones
export const recalcularPosiciones = async (req: Request, res: Response) => {
  try {
    // Recalcular posiciones basadas en resultados de partidos
    await pool.query(`
      WITH estadisticas_equipos AS (
        SELECT 
          e.id AS equipo_id,
          COUNT(p.id) AS partidos_jugados,
          COUNT(CASE 
            WHEN (p.equipo_local_id = e.id AND p.goles_local > p.goles_visitante) 
              OR (p.equipo_visitante_id = e.id AND p.goles_visitante > p.goles_local)
            THEN 1 
          END) AS partidos_ganados,
          COUNT(CASE 
            WHEN p.goles_local = p.goles_visitante 
            THEN 1 
          END) AS partidos_empatados,
          COUNT(CASE 
            WHEN (p.equipo_local_id = e.id AND p.goles_local < p.goles_visitante) 
              OR (p.equipo_visitante_id = e.id AND p.goles_visitante < p.goles_local)
            THEN 1 
          END) AS partidos_perdidos,
          COALESCE(SUM(CASE 
            WHEN p.equipo_local_id = e.id THEN p.goles_local 
            WHEN p.equipo_visitante_id = e.id THEN p.goles_visitante 
          END), 0) AS goles_favor,
          COALESCE(SUM(CASE 
            WHEN p.equipo_local_id = e.id THEN p.goles_visitante 
            WHEN p.equipo_visitante_id = e.id THEN p.goles_local 
          END), 0) AS goles_contra
        FROM equipos e
        LEFT JOIN partidos p ON (p.equipo_local_id = e.id OR p.equipo_visitante_id = e.id)
          AND p.finalizado = true
        GROUP BY e.id
      )
      INSERT INTO posiciones (
        equipo_id, partidos_jugados, partidos_ganados, partidos_empatados, 
        partidos_perdidos, goles_favor, goles_contra, diferencia_goles, puntos
      )
      SELECT 
        equipo_id,
        partidos_jugados,
        partidos_ganados,
        partidos_empatados,
        partidos_perdidos,
        goles_favor,
        goles_contra,
        goles_favor - goles_contra AS diferencia_goles,
        (partidos_ganados * 3) + partidos_empatados AS puntos
      FROM estadisticas_equipos
      ON CONFLICT (equipo_id) 
      DO UPDATE SET
        partidos_jugados = EXCLUDED.partidos_jugados,
        partidos_ganados = EXCLUDED.partidos_ganados,
        partidos_empatados = EXCLUDED.partidos_empatados,
        partidos_perdidos = EXCLUDED.partidos_perdidos,
        goles_favor = EXCLUDED.goles_favor,
        goles_contra = EXCLUDED.goles_contra,
        diferencia_goles = EXCLUDED.diferencia_goles,
        puntos = EXCLUDED.puntos,
        ultima_actualizacion = CURRENT_TIMESTAMP
    `);

    res.json({ message: 'Tabla de posiciones actualizada correctamente' });
  } catch (error) {
    console.error('Error recalculando posiciones:', error);
    res.status(500).json({ error: 'Error al recalcular posiciones' });
  }
};
