import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT name FROM groups ORDER BY name');
    res.json(result.rows.map((r: any) => r.name));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    await pool.query('INSERT INTO groups (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
    res.status(201).json({ name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

router.delete('/:name', async (req, res) => {
  try {
    await pool.query('UPDATE cameras SET group_name = NULL WHERE group_name = $1', [req.params.name]);
    await pool.query('DELETE FROM groups WHERE name = $1', [req.params.name]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

export default router;
