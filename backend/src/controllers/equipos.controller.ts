import { Request, Response } from 'express';
import { pool } from '../database/connection';

// Obtener todos los equipos
export const getEquipos = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM equipos ORDER BY nombre');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
};

// Crear equipo
export const createEquipo = async (req: Request, res: Response) => {
  const { nombre, logo_url } = req.body;
  console.log('📝 Intentando crear equipo:', { nombre, logo_url });
  
  try {
    const result = await pool.query(
      'INSERT INTO equipos (nombre, logo_url) VALUES ($1, $2) RETURNING *',
      [nombre, logo_url]
    );
    console.log('✅ Equipo creado:', result.rows[0]);
    
    // Crear registro en posiciones para el nuevo equipo
    await pool.query(
      'INSERT INTO posiciones (equipo_id) VALUES ($1)',
      [result.rows[0].id]
    );
    console.log('✅ Posición creada para equipo ID:', result.rows[0].id);
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('❌ Error al crear equipo:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Error al crear equipo: ' + error.message });
  }
};

// Obtener equipo por ID
export const getEquipoById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM equipos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener equipo' });
  }
};

// Actualizar equipo
export const updateEquipo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, logo_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE equipos SET nombre = $1, logo_url = $2 WHERE id = $3 RETURNING *',
      [nombre, logo_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar equipo' });
  }
};

// Eliminar equipo
export const deleteEquipo = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM equipos WHERE id = $1', [id]);
    res.json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar equipo' });
  }
};
