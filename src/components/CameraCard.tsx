import { Camera } from '@/store/cameraStore';
import { Video, Wifi, WifiOff, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraCardProps {
  camera: Camera;
  onRemove: (id: string) => void;
  onViewRecordings: (id: string) => void;
}

const CameraCard = ({ camera, onRemove, onViewRecordings }: CameraCardProps) => {
  const isOnline = camera.status === 'online';

  return (
    <div className="group relative rounded-lg border border-border bg-card overflow-hidden transition-all hover:glow-primary">
      {/* Video Feed Area */}
      <div className="relative aspect-video bg-muted camera-grid-bg flex items-center justify-center overflow-hidden">
        {isOnline ? (
          <>
            <div className="absolute inset-0 scanline opacity-30" />
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Video className="h-10 w-10 text-primary opacity-50" />
              <span className="font-mono text-xs">LIVE FEED</span>
            </div>
            {/* Recording indicator */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-card/80 px-2 py-1 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-camera-recording animate-pulse-glow" />
              <span className="font-mono text-[10px] text-camera-recording">REC</span>
            </div>
            {/* Timestamp */}
            <div className="absolute bottom-2 left-2 font-mono text-[10px] text-muted-foreground bg-card/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
              {new Date().toLocaleTimeString()}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <WifiOff className="h-10 w-10 opacity-40" />
            <span className="font-mono text-xs">NO SIGNAL</span>
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-camera-online glow-online' : 'bg-camera-offline'}`} />
            <h3 className="font-medium text-sm text-foreground">{camera.name}</h3>
          </div>
          {isOnline ? (
            <Wifi className="h-3.5 w-3.5 text-camera-online" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-camera-offline" />
          )}
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {camera.ipAddress}:{camera.port}
        </p>
        <div className="flex gap-1.5 pt-1">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 h-7 text-xs font-mono"
            onClick={() => onViewRecordings(camera.id)}
          >
            <Clock className="h-3 w-3 mr-1" />
            Recordings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(camera.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraCard;
