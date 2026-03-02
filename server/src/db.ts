import pg from 'pg';

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'opennvr',
  user: process.env.DB_USER || 'opennvr',
  password: process.env.DB_PASSWORD || 'opennvr',
});

export default pool;
