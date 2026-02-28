import { useState } from 'react';
import { useCameraStore } from '@/store/cameraStore';
import CameraCard from '@/components/CameraCard';
import AddCameraDialog from '@/components/AddCameraDialog';
import RecordingsDialog from '@/components/RecordingsDialog';
import { Camera, Shield, HardDrive } from 'lucide-react';

const Index = () => {
  const cameras = useCameraStore((s) => s.cameras);
  const removeCamera = useCameraStore((s) => s.removeCamera);
  const [recordingsCameraId, setRecordingsCameraId] = useState<string | null>(null);

  const onlineCount = cameras.filter((c) => c.status === 'online').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-sm text-foreground tracking-wide">
                SURVEILLANCE CONSOLE
              </h1>
              <p className="font-mono text-[10px] text-muted-foreground">
                NVR Management System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Camera className="h-3 w-3" />
                {cameras.length} cameras
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-camera-online animate-pulse-glow" />
                {onlineCount} online
              </span>
              <span className="flex items-center gap-1.5">
                <HardDrive className="h-3 w-3" />
                3-day retention
              </span>
            </div>
            <AddCameraDialog />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {cameras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Camera className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-mono text-sm mb-1">No cameras configured</p>
            <p className="font-mono text-xs">Click "Add Camera" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cameras.map((camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onRemove={removeCamera}
                onViewRecordings={setRecordingsCameraId}
              />
            ))}
          </div>
        )}
      </main>

      <RecordingsDialog
        cameraId={recordingsCameraId}
        open={!!recordingsCameraId}
        onOpenChange={(open) => !open && setRecordingsCameraId(null)}
      />
    </div>
  );
};

export default Index;
