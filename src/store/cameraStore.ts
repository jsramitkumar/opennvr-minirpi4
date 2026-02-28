import { create } from 'zustand';

export interface Camera {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  streamUrl: string;
  status: 'online' | 'offline';
  group: string;
  recordingIntervalMin: number; // minutes
  retentionDays: number;
  addedAt: Date;
}

export interface Recording {
  id: string;
  cameraId: string;
  timestamp: Date;
  duration: number;
  thumbnailSeed: number;
}

function generateRecordings(camera: Camera): Recording[] {
  const recordings: Recording[] = [];
  const now = new Date();
  const cutoff = new Date(now.getTime() - camera.retentionDays * 24 * 60 * 60 * 1000);

  let current = new Date(cutoff);
  current.setMinutes(Math.ceil(current.getMinutes() / camera.recordingIntervalMin) * camera.recordingIntervalMin, 0, 0);

  while (current < now) {
    recordings.push({
      id: `${camera.id}-${current.getTime()}`,
      cameraId: camera.id,
      timestamp: new Date(current),
      duration: camera.recordingIntervalMin * 60,
      thumbnailSeed: Math.random(),
    });
    current = new Date(current.getTime() + camera.recordingIntervalMin * 60 * 1000);
  }
  return recordings;
}

interface CameraStore {
  cameras: Camera[];
  recordings: Map<string, Recording[]>;
  groups: string[];
  addCamera: (camera: Omit<Camera, 'id' | 'status' | 'addedAt'>) => void;
  removeCamera: (id: string) => void;
  updateCamera: (id: string, data: Partial<Pick<Camera, 'name' | 'group' | 'recordingIntervalMin' | 'retentionDays'>>) => void;
  getRecordings: (cameraId: string) => Recording[];
  addGroup: (name: string) => void;
  removeGroup: (name: string) => void;
}

const defaultGroups = ['Exterior', 'Interior', 'Perimeter'];

const defaultCameras: Camera[] = [
  {
    id: 'cam-1', name: 'Front Door', ipAddress: '192.168.1.101', port: 554,
    streamUrl: 'rtsp://192.168.1.101:554/stream1', status: 'online',
    group: 'Exterior', recordingIntervalMin: 10, retentionDays: 3, addedAt: new Date(),
  },
  {
    id: 'cam-2', name: 'Parking Lot', ipAddress: '192.168.1.102', port: 554,
    streamUrl: 'rtsp://192.168.1.102:554/stream1', status: 'online',
    group: 'Exterior', recordingIntervalMin: 10, retentionDays: 3, addedAt: new Date(),
  },
  {
    id: 'cam-3', name: 'Backyard', ipAddress: '192.168.1.103', port: 554,
    streamUrl: 'rtsp://192.168.1.103:554/stream1', status: 'offline',
    group: 'Perimeter', recordingIntervalMin: 15, retentionDays: 5, addedAt: new Date(),
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
    groups: defaultGroups,
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
        const newGroups = camera.group && !state.groups.includes(camera.group)
          ? [...state.groups, camera.group] : state.groups;
        return { cameras: [...state.cameras, camera], recordings: newRecordings, groups: newGroups };
      });
    },
    removeCamera: (id) => {
      set((state) => {
        const newRecordings = new Map(state.recordings);
        newRecordings.delete(id);
        return { cameras: state.cameras.filter((c) => c.id !== id), recordings: newRecordings };
      });
    },
    updateCamera: (id, data) => {
      set((state) => {
        const cameras = state.cameras.map((c) => {
          if (c.id !== id) return c;
          const updated = { ...c, ...data };
          return updated;
        });
        // Regenerate recordings if interval/retention changed
        const cam = cameras.find(c => c.id === id);
        const newRecordings = new Map(state.recordings);
        if (cam && (data.recordingIntervalMin !== undefined || data.retentionDays !== undefined)) {
          newRecordings.set(id, generateRecordings(cam));
        }
        const newGroups = data.group && !state.groups.includes(data.group)
          ? [...state.groups, data.group] : state.groups;
        return { cameras, recordings: newRecordings, groups: newGroups };
      });
    },
    getRecordings: (cameraId) => get().recordings.get(cameraId) || [],
    addGroup: (name) => {
      set((state) => ({
        groups: state.groups.includes(name) ? state.groups : [...state.groups, name],
      }));
    },
    removeGroup: (name) => {
      set((state) => ({
        groups: state.groups.filter((g) => g !== name),
        cameras: state.cameras.map((c) => c.group === name ? { ...c, group: '' } : c),
      }));
    },
  };
});
