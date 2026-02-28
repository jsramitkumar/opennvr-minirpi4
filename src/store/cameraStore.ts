import { create } from 'zustand';

export interface Camera {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  streamUrl: string;
  status: 'online' | 'offline';
  addedAt: Date;
}

export interface Recording {
  id: string;
  cameraId: string;
  timestamp: Date;
  duration: number; // seconds
  thumbnailSeed: number;
}

function generateRecordings(camera: Camera): Recording[] {
  const recordings: Recording[] = [];
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  
  let current = new Date(threeDaysAgo);
  // Round to nearest 10 min
  current.setMinutes(Math.ceil(current.getMinutes() / 10) * 10, 0, 0);

  while (current < now) {
    recordings.push({
      id: `${camera.id}-${current.getTime()}`,
      cameraId: camera.id,
      timestamp: new Date(current),
      duration: 600,
      thumbnailSeed: Math.random(),
    });
    current = new Date(current.getTime() + 10 * 60 * 1000);
  }
  return recordings;
}

interface CameraStore {
  cameras: Camera[];
  recordings: Map<string, Recording[]>;
  addCamera: (camera: Omit<Camera, 'id' | 'status' | 'addedAt'>) => void;
  removeCamera: (id: string) => void;
  getRecordings: (cameraId: string) => Recording[];
}

const defaultCameras: Camera[] = [
  {
    id: 'cam-1',
    name: 'Front Door',
    ipAddress: '192.168.1.101',
    port: 554,
    streamUrl: 'rtsp://192.168.1.101:554/stream1',
    status: 'online',
    addedAt: new Date(),
  },
  {
    id: 'cam-2',
    name: 'Parking Lot',
    ipAddress: '192.168.1.102',
    port: 554,
    streamUrl: 'rtsp://192.168.1.102:554/stream1',
    status: 'online',
    addedAt: new Date(),
  },
  {
    id: 'cam-3',
    name: 'Backyard',
    ipAddress: '192.168.1.103',
    port: 554,
    streamUrl: 'rtsp://192.168.1.103:554/stream1',
    status: 'offline',
    addedAt: new Date(),
  },
];

export const useCameraStore = create<CameraStore>((set, get) => {
  const initialRecordings = new Map<string, Recording[]>();
  defaultCameras.forEach(cam => {
    if (cam.status === 'online') {
      initialRecordings.set(cam.id, generateRecordings(cam));
    }
  });

  return {
    cameras: defaultCameras,
    recordings: initialRecordings,
    addCamera: (data) => {
      const camera: Camera = {
        ...data,
        id: `cam-${Date.now()}`,
        status: 'online',
        addedAt: new Date(),
      };
      set((state) => {
        const newRecordings = new Map(state.recordings);
        newRecordings.set(camera.id, generateRecordings(camera));
        return {
          cameras: [...state.cameras, camera],
          recordings: newRecordings,
        };
      });
    },
    removeCamera: (id) => {
      set((state) => {
        const newRecordings = new Map(state.recordings);
        newRecordings.delete(id);
        return {
          cameras: state.cameras.filter((c) => c.id !== id),
          recordings: newRecordings,
        };
      });
    },
    getRecordings: (cameraId) => {
      return get().recordings.get(cameraId) || [];
    },
  };
});
