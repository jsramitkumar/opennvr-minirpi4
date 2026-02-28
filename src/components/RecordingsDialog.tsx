import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCameraStore, Recording } from '@/store/cameraStore';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';
import { Film, Calendar } from 'lucide-react';

interface RecordingsDialogProps {
  cameraId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RecordingsDialog = ({ cameraId, open, onOpenChange }: RecordingsDialogProps) => {
  const cameras = useCameraStore((s) => s.cameras);
  const getRecordings = useCameraStore((s) => s.getRecordings);

  const camera = cameras.find((c) => c.id === cameraId);
  const recordings = cameraId ? getRecordings(cameraId) : [];

  const groupedRecordings = useMemo(() => {
    const groups = new Map<string, Recording[]>();
    const sorted = [...recordings].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    sorted.forEach((rec) => {
      const dayKey = startOfDay(rec.timestamp).toISOString();
      if (!groups.has(dayKey)) groups.set(dayKey, []);
      groups.get(dayKey)!.push(rec);
    });
    return groups;
  }, [recordings]);

  const formatDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMM d');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-mono flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            {camera?.name} — Recordings
          </DialogTitle>
          <p className="text-xs text-muted-foreground font-mono">
            {camera?.recordingIntervalMin}-min intervals • {camera?.retentionDays}-day retention • {recordings.length} clips
          </p>
        </DialogHeader>
        <ScrollArea className="h-[50vh] pr-3">
          {recordings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Film className="h-8 w-8 mb-2 opacity-40" />
              <span className="font-mono text-sm">No recordings available</span>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from(groupedRecordings.entries()).map(([day, recs]) => (
                <div key={day}>
                  <div className="flex items-center gap-2 mb-2 sticky top-0 bg-popover py-1 z-10">
                    <Calendar className="h-3 w-3 text-primary" />
                    <span className="font-mono text-xs font-semibold text-primary">
                      {formatDayLabel(day)}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      ({recs.length} clips)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {recs.map((rec) => (
                      <button
                        key={rec.id}
                        className="group relative aspect-video rounded bg-muted camera-grid-bg flex items-center justify-center border border-border hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <Film className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="absolute bottom-0.5 left-0.5 font-mono text-[8px] text-muted-foreground group-hover:text-foreground">
                          {format(rec.timestamp, 'HH:mm')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingsDialog;
