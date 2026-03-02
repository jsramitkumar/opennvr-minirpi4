import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET recordings for a camera
router.get('/:cameraId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM recordings WHERE camera_id = $1 ORDER BY timestamp DESC',
      [req.params.cameraId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
});

// POST create recording
router.post('/', async (req, res) => {
  try {
    const { camera_id, timestamp, duration, file_path, storage_type } = req.body;
    const result = await pool.query(
      `INSERT INTO recordings (camera_id, timestamp, duration, file_path, storage_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [camera_id, timestamp, duration, file_path || null, storage_type || 'local']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create recording' });
  }
});

export default router;
