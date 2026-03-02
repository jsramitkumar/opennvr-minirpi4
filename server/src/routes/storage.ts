import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET all storage configs
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM storage_config ORDER BY created_at');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch storage configs' });
  }
});

// POST create storage config
router.post('/', async (req, res) => {
  try {
    const { type, name, config, is_active } = req.body;

    // If setting active, deactivate others
    if (is_active) {
      await pool.query('UPDATE storage_config SET is_active = false');
    }

    const result = await pool.query(
      `INSERT INTO storage_config (type, name, config, is_active)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [type, name, config || {}, is_active || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create storage config' });
  }
});

// PUT update storage config
router.put('/:id', async (req, res) => {
  try {
    const { type, name, config, is_active } = req.body;

    if (is_active) {
      await pool.query('UPDATE storage_config SET is_active = false');
    }

    const result = await pool.query(
      `UPDATE storage_config SET type = COALESCE($1, type), name = COALESCE($2, name),
       config = COALESCE($3, config), is_active = COALESCE($4, is_active), updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [type, name, config, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Config not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update storage config' });
  }
});

// DELETE storage config
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM storage_config WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete storage config' });
  }
});

// POST test storage connection
router.post('/test', async (req, res) => {
  const { type, config } = req.body;
  try {
    // Basic validation per type
    if (type === 's3') {
      if (!config.endpoint || !config.bucket || !config.accessKey || !config.secretKey) {
        return res.status(400).json({ success: false, message: 'Missing S3 fields: endpoint, bucket, accessKey, secretKey' });
      }
    } else if (type === 'ftp') {
      if (!config.host || !config.username || !config.password) {
        return res.status(400).json({ success: false, message: 'Missing FTP fields: host, username, password' });
      }
    } else if (type === 'http') {
      if (!config.url) {
        return res.status(400).json({ success: false, message: 'Missing HTTP field: url' });
      }
    }
    // In production, you'd actually test the connection here
    res.json({ success: true, message: 'Configuration validated (connection test not yet implemented)' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Test failed' });
  }
});

export default router;
