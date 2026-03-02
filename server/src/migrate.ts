import pool from './db.js';

const migrations = `
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  ip_address VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL DEFAULT 554,
  stream_url TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'online',
  group_name VARCHAR(255) REFERENCES groups(name) ON DELETE SET NULL,
  recording_interval_min INTEGER NOT NULL DEFAULT 10,
  retention_days INTEGER NOT NULL DEFAULT 3,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_id UUID NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  file_path TEXT,
  storage_type VARCHAR(50) DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recordings_camera ON recordings(camera_id);
CREATE INDEX IF NOT EXISTS idx_recordings_timestamp ON recordings(timestamp);
CREATE INDEX IF NOT EXISTS idx_cameras_group ON cameras(group_name);

CREATE TABLE IF NOT EXISTS storage_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 's3', 'ftp', 'http', 'local'
  name VARCHAR(255) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default groups
INSERT INTO groups (name) VALUES ('Exterior'), ('Interior'), ('Perimeter')
ON CONFLICT (name) DO NOTHING;
`;

async function migrate() {
  console.log('Running migrations...');
  await pool.query(migrations);
  console.log('Migrations complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
