import { Request, Response } from 'express';
import { pool } from '../database/connection';

// Obtener todos los jugadores
export const getJugadores = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT j.*, e.nombre as equipo_nombre 
      FROM jugadores j
      LEFT JOIN equipos e ON j.equipo_id = e.id
      ORDER BY j.apellido, j.nombre
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener jugadores' });
  }
};

// Obtener jugadores por equipo
export const getJugadoresByEquipo = async (req: Request, res: Response) => {
  const { equipoId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM jugadores WHERE equipo_id = $1 ORDER BY numero_camiseta',
      [equipoId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener jugadores del equipo' });
  }
};

// Crear jugador
export const createJugador = async (req: Request, res: Response) => {
  const { nombre, apellido, numero_camiseta, posicion, equipo_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO jugadores (nombre, apellido, numero_camiseta, posicion, equipo_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, apellido, numero_camiseta, posicion, equipo_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear jugador' });
  }
};

// Actualizar jugador
export const updateJugador = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, apellido, numero_camiseta, posicion, equipo_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE jugadores 
       SET nombre = $1, apellido = $2, numero_camiseta = $3, posicion = $4, equipo_id = $5
       WHERE id = $6 RETURNING *`,
      [nombre, apellido, numero_camiseta, posicion, equipo_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar jugador' });
  }
};

// Eliminar jugador
export const deleteJugador = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM jugadores WHERE id = $1', [id]);
    res.json({ message: 'Jugador eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar jugador' });
  }
};
