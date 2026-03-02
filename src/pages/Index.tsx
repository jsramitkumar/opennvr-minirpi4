import { useState, useEffect, useMemo } from 'react';
import { useCameraStore } from '@/store/cameraStore';
import CameraCard from '@/components/CameraCard';
import AddCameraDialog from '@/components/AddCameraDialog';
import RecordingsDialog from '@/components/RecordingsDialog';
import StorageConfigDialog from '@/components/StorageConfigDialog';
import { Camera, Shield, HardDrive, Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const cameras = useCameraStore((s) => s.cameras);
  const groups = useCameraStore((s) => s.groups);
  const loading = useCameraStore((s) => s.loading);
  const fetchCameras = useCameraStore((s) => s.fetchCameras);
  const fetchGroups = useCameraStore((s) => s.fetchGroups);
  const removeCamera = useCameraStore((s) => s.removeCamera);
  const [recordingsCameraId, setRecordingsCameraId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  useEffect(() => {
    fetchCameras();
    fetchGroups();
  }, [fetchCameras, fetchGroups]);

  const onlineCount = cameras.filter((c) => c.status === 'online').length;

  const filteredCameras = useMemo(() => {
    if (!activeGroup) return cameras;
    if (activeGroup === '') return cameras.filter(c => !c.group);
    return cameras.filter((c) => c.group === activeGroup);
  }, [cameras, activeGroup]);

  const usedGroups = useMemo(() => {
    const set = new Set(cameras.map(c => c.group).filter(Boolean));
    return groups.filter(g => set.has(g));
  }, [cameras, groups]);

  const ungroupedCount = cameras.filter(c => !c.group).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-sm text-foreground tracking-wide">SURVEILLANCE CONSOLE</h1>
              <p className="font-mono text-[10px] text-muted-foreground">NVR Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Camera className="h-3 w-3" />{cameras.length} cameras
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-camera-online animate-pulse-glow" />{onlineCount} online
              </span>
            </div>
            <StorageConfigDialog />
            <AddCameraDialog />
          </div>
        </div>
      </header>

      {(usedGroups.length > 0 || ungroupedCount > 0) && (
        <div className="border-b border-border bg-card/30">
          <div className="container mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
            <Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Button variant={activeGroup === null ? 'default' : 'ghost'} size="sm"
              className="h-6 text-[11px] font-mono px-2.5" onClick={() => setActiveGroup(null)}>
              All ({cameras.length})
            </Button>
            {usedGroups.map((g) => {
              const count = cameras.filter(c => c.group === g).length;
              return (
                <Button key={g} variant={activeGroup === g ? 'default' : 'ghost'} size="sm"
                  className="h-6 text-[11px] font-mono px-2.5" onClick={() => setActiveGroup(g)}>
                  {g} ({count})
                </Button>
              );
            })}
            {ungroupedCount > 0 && (
              <Button variant={activeGroup === '' ? 'default' : 'ghost'} size="sm"
                className="h-6 text-[11px] font-mono px-2.5" onClick={() => setActiveGroup('')}>
                Ungrouped ({ungroupedCount})
              </Button>
            )}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="font-mono text-xs text-muted-foreground">Loading cameras...</p>
          </div>
        ) : cameras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Camera className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-mono text-sm mb-1">No cameras configured</p>
            <p className="font-mono text-xs">Click "Add Camera" to get started</p>
          </div>
        ) : filteredCameras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="font-mono text-sm">No cameras in this group</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCameras.map((camera) => (
              <CameraCard key={camera.id} camera={camera} onRemove={removeCamera}
                onViewRecordings={setRecordingsCameraId} />
            ))}
          </div>
        )}
      </main>

      <RecordingsDialog cameraId={recordingsCameraId} open={!!recordingsCameraId}
        onOpenChange={(open) => !open && setRecordingsCameraId(null)} />
    </div>
  );
};

export default Index;
