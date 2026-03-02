import { create } from 'zustand';
import { api, CameraDTO, RecordingDTO, StorageConfigDTO } from '@/lib/api';

export interface Camera {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  streamUrl: string;
  status: 'online' | 'offline';
  group: string;
  recordingIntervalMin: number;
  retentionDays: number;
  addedAt: Date;
}

export interface Recording {
  id: string;
  cameraId: string;
  timestamp: Date;
  duration: number;
  filePath?: string;
  storageType?: string;
}

function dtoToCamera(dto: CameraDTO): Camera {
  return {
    id: dto.id,
    name: dto.name,
    ipAddress: dto.ip_address,
    port: dto.port,
    streamUrl: dto.stream_url,
    status: dto.status as 'online' | 'offline',
    group: dto.group_name || '',
    recordingIntervalMin: dto.recording_interval_min,
    retentionDays: dto.retention_days,
    addedAt: new Date(dto.added_at),
  };
}

function dtoToRecording(dto: RecordingDTO): Recording {
  return {
    id: dto.id,
    cameraId: dto.camera_id,
    timestamp: new Date(dto.timestamp),
    duration: dto.duration,
    filePath: dto.file_path || undefined,
    storageType: dto.storage_type,
  };
}

interface CameraStore {
  cameras: Camera[];
  groups: string[];
  loading: boolean;
  error: string | null;

  fetchCameras: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  addCamera: (camera: Omit<Camera, 'id' | 'status' | 'addedAt'>) => Promise<void>;
  removeCamera: (id: string) => Promise<void>;
  updateCamera: (id: string, data: Partial<Pick<Camera, 'name' | 'group' | 'recordingIntervalMin' | 'retentionDays'>>) => Promise<void>;
  getRecordings: (cameraId: string) => Promise<Recording[]>;
  addGroup: (name: string) => Promise<void>;
  removeGroup: (name: string) => Promise<void>;
}

export const useCameraStore = create<CameraStore>((set, get) => ({
  cameras: [],
  groups: [],
  loading: false,
  error: null,

  fetchCameras: async () => {
    set({ loading: true, error: null });
    try {
      const dtos = await api.getCameras();
      set({ cameras: dtos.map(dtoToCamera), loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchGroups: async () => {
    try {
      const groups = await api.getGroups();
      set({ groups });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addCamera: async (data) => {
    try {
      const dto = await api.createCamera({
        name: data.name,
        ip_address: data.ipAddress,
        port: data.port,
        stream_url: data.streamUrl,
        group_name: data.group || null,
        recording_interval_min: data.recordingIntervalMin,
        retention_days: data.retentionDays,
      });
      const camera = dtoToCamera(dto);
      set((state) => ({
        cameras: [...state.cameras, camera],
        groups: camera.group && !state.groups.includes(camera.group)
          ? [...state.groups, camera.group] : state.groups,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  removeCamera: async (id) => {
    try {
      await api.deleteCamera(id);
      set((state) => ({
        cameras: state.cameras.filter((c) => c.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateCamera: async (id, data) => {
    try {
      const dto = await api.updateCamera(id, {
        name: data.name,
        group_name: data.group !== undefined ? (data.group || null) : undefined,
        recording_interval_min: data.recordingIntervalMin,
        retention_days: data.retentionDays,
      });
      const updated = dtoToCamera(dto);
      set((state) => ({
        cameras: state.cameras.map((c) => c.id === id ? updated : c),
        groups: updated.group && !state.groups.includes(updated.group)
          ? [...state.groups, updated.group] : state.groups,
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  getRecordings: async (cameraId) => {
    try {
      const dtos = await api.getRecordings(cameraId);
      return dtos.map(dtoToRecording);
    } catch {
      return [];
    }
  },

  addGroup: async (name) => {
    try {
      await api.createGroup(name);
      set((state) => ({
        groups: state.groups.includes(name) ? state.groups : [...state.groups, name],
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  removeGroup: async (name) => {
    try {
      await api.deleteGroup(name);
      set((state) => ({
        groups: state.groups.filter((g) => g !== name),
        cameras: state.cameras.map((c) => c.group === name ? { ...c, group: '' } : c),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
