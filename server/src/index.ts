import express from 'express';
import cors from 'cors';
import cameraRoutes from './routes/cameras.js';
import groupRoutes from './routes/groups.js';
import recordingRoutes from './routes/recordings.js';
import storageRoutes from './routes/storage.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/cameras', cameraRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/storage', storageRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`OpenNVR server running on port ${PORT}`);
});
