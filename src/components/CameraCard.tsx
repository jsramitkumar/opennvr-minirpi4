import { useState } from 'react';
import { Camera, useCameraStore } from '@/store/cameraStore';
import { Video, Wifi, WifiOff, Trash2, Clock, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface CameraCardProps {
  camera: Camera;
  onRemove: (id: string) => void;
  onViewRecordings: (id: string) => void;
}

const CameraCard = ({ camera, onRemove, onViewRecordings }: CameraCardProps) => {
  const isOnline = camera.status === 'online';
  const updateCamera = useCameraStore((s) => s.updateCamera);
  const groups = useCameraStore((s) => s.groups);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
            <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-card/80 px-2 py-1 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-camera-recording animate-pulse-glow" />
              <span className="font-mono text-[10px] text-camera-recording">REC</span>
            </div>
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
        {/* Group badge */}
        {camera.group && (
          <div className="absolute top-2 left-2 font-mono text-[10px] bg-accent/80 text-accent-foreground px-1.5 py-0.5 rounded backdrop-blur-sm">
            {camera.group}
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
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            {camera.ipAddress}:{camera.port}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">
            {camera.recordingIntervalMin}min / {camera.retentionDays}d
          </p>
        </div>
        <div className="flex gap-1.5 pt-1">
          <Button variant="secondary" size="sm" className="flex-1 h-7 text-xs font-mono"
            onClick={() => onViewRecordings(camera.id)}>
            <Clock className="h-3 w-3 mr-1" />Recordings
          </Button>
          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary">
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-3" align="end">
              <p className="font-mono text-xs font-semibold text-foreground">Camera Settings</p>
              <div className="space-y-2">
                <Label className="font-mono text-[10px]">Group</Label>
                <Select value={camera.group || 'none'} onValueChange={(v) => {
                  updateCamera(camera.id, { group: v === 'none' ? '' : v });
                }}>
                  <SelectTrigger className="font-mono text-xs h-7">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Group</SelectItem>
                    {groups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="font-mono text-[10px]">Interval</Label>
                  <Select value={String(camera.recordingIntervalMin)} onValueChange={(v) => {
                    updateCamera(camera.id, { recordingIntervalMin: parseInt(v) });
                    toast.success('Recording interval updated');
                  }}>
                    <SelectTrigger className="font-mono text-xs h-7"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5,10,15,30,60].map(m => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="font-mono text-[10px]">Retention</Label>
                  <Select value={String(camera.retentionDays)} onValueChange={(v) => {
                    updateCamera(camera.id, { retentionDays: parseInt(v) });
                    toast.success('Retention updated');
                  }}>
                    <SelectTrigger className="font-mono text-xs h-7"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,3,5,7,14,30].map(d => <SelectItem key={d} value={String(d)}>{d} day{d>1?'s':''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(camera.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraCard;
