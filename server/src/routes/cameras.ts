import { Router } from 'express';
import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET all cameras
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cameras ORDER BY added_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cameras:', err);
    res.status(500).json({ error: 'Failed to fetch cameras' });
  }
});

// POST create camera
router.post('/', async (req, res) => {
  try {
    const { name, ip_address, port, stream_url, group_name, recording_interval_min, retention_days } = req.body;
    const id = uuidv4();
    const url = stream_url || `rtsp://${ip_address}:${port || 554}/stream1`;

    // Ensure group exists if provided
    if (group_name) {
      await pool.query(
        'INSERT INTO groups (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [group_name]
      );
    }

    const result = await pool.query(
      `INSERT INTO cameras (id, name, ip_address, port, stream_url, group_name, recording_interval_min, retention_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, name, ip_address, port || 554, url, group_name || null, recording_interval_min || 10, retention_days || 3]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating camera:', err);
    res.status(500).json({ error: 'Failed to create camera' });
  }
});

// PUT update camera
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, group_name, recording_interval_min, retention_days, status } = req.body;

    if (group_name) {
      await pool.query(
        'INSERT INTO groups (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [group_name]
      );
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (group_name !== undefined) { fields.push(`group_name = $${idx++}`); values.push(group_name || null); }
    if (recording_interval_min !== undefined) { fields.push(`recording_interval_min = $${idx++}`); values.push(recording_interval_min); }
    if (retention_days !== undefined) { fields.push(`retention_days = $${idx++}`); values.push(retention_days); }
    if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    values.push(id);
    const result = await pool.query(
      `UPDATE cameras SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Camera not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating camera:', err);
    res.status(500).json({ error: 'Failed to update camera' });
  }
});

// DELETE camera
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM cameras WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Camera not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting camera:', err);
    res.status(500).json({ error: 'Failed to delete camera' });
  }
});

export default router;
