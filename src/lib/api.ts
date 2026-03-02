const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export interface CameraDTO {
  id: string;
  name: string;
  ip_address: string;
  port: number;
  stream_url: string;
  status: string;
  group_name: string | null;
  recording_interval_min: number;
  retention_days: number;
  added_at: string;
}

export interface RecordingDTO {
  id: string;
  camera_id: string;
  timestamp: string;
  duration: number;
  file_path: string | null;
  storage_type: string;
}

export interface StorageConfigDTO {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  is_active: boolean;
}

export const api = {
  // Cameras
  getCameras: () => request<CameraDTO[]>('/api/cameras'),
  createCamera: (data: Partial<CameraDTO>) => request<CameraDTO>('/api/cameras', { method: 'POST', body: JSON.stringify(data) }),
  updateCamera: (id: string, data: Partial<CameraDTO>) => request<CameraDTO>(`/api/cameras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCamera: (id: string) => request(`/api/cameras/${id}`, { method: 'DELETE' }),

  // Groups
  getGroups: () => request<string[]>('/api/groups'),
  createGroup: (name: string) => request('/api/groups', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteGroup: (name: string) => request(`/api/groups/${encodeURIComponent(name)}`, { method: 'DELETE' }),

  // Recordings
  getRecordings: (cameraId: string) => request<RecordingDTO[]>(`/api/recordings/${cameraId}`),

  // Storage
  getStorageConfigs: () => request<StorageConfigDTO[]>('/api/storage'),
  createStorageConfig: (data: Partial<StorageConfigDTO>) => request<StorageConfigDTO>('/api/storage', { method: 'POST', body: JSON.stringify(data) }),
  updateStorageConfig: (id: string, data: Partial<StorageConfigDTO>) => request<StorageConfigDTO>(`/api/storage/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStorageConfig: (id: string) => request(`/api/storage/${id}`, { method: 'DELETE' }),
  testStorageConfig: (data: { type: string; config: Record<string, any> }) => request<{ success: boolean; message: string }>('/api/storage/test', { method: 'POST', body: JSON.stringify(data) }),
};
