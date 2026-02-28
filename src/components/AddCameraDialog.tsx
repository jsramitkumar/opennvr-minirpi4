import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCameraStore } from '@/store/cameraStore';
import { toast } from 'sonner';

const AddCameraDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('554');
  const [streamUrl, setStreamUrl] = useState('');
  const [group, setGroup] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [recordingInterval, setRecordingInterval] = useState('10');
  const [retentionDays, setRetentionDays] = useState('3');
  const addCamera = useCameraStore((s) => s.addCamera);
  const groups = useCameraStore((s) => s.groups);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ipAddress) {
      toast.error('Name and IP address are required');
      return;
    }
    const portNum = parseInt(port) || 554;
    const url = streamUrl || `rtsp://${ipAddress}:${portNum}/stream1`;
    const finalGroup = group === '__new__' ? newGroup : group;
    addCamera({
      name, ipAddress, port: portNum, streamUrl: url,
      group: finalGroup || '',
      recordingIntervalMin: parseInt(recordingInterval) || 10,
      retentionDays: parseInt(retentionDays) || 3,
    });
    toast.success(`Camera "${name}" added successfully`);
    setName(''); setIpAddress(''); setPort('554'); setStreamUrl('');
    setGroup(''); setNewGroup(''); setRecordingInterval('10'); setRetentionDays('3');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-mono text-sm gap-2">
          <Plus className="h-4 w-4" />
          Add Camera
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono">Add New IP Camera</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-mono text-xs">Camera Name</Label>
            <Input id="name" placeholder="e.g. Front Door" value={name}
              onChange={(e) => setName(e.target.value)} className="font-mono text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="ip" className="font-mono text-xs">IP Address</Label>
              <Input id="ip" placeholder="192.168.1.100" value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)} className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port" className="font-mono text-xs">Port</Label>
              <Input id="port" placeholder="554" value={port}
                onChange={(e) => setPort(e.target.value)} className="font-mono text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stream" className="font-mono text-xs">Stream URL (optional)</Label>
            <Input id="stream" placeholder="rtsp://192.168.1.100:554/stream1" value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)} className="font-mono text-sm" />
          </div>

          {/* Group */}
          <div className="space-y-2">
            <Label className="font-mono text-xs">Group</Label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger className="font-mono text-sm">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Group</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
                <SelectItem value="__new__">+ New Group</SelectItem>
              </SelectContent>
            </Select>
            {group === '__new__' && (
              <Input placeholder="Enter group name" value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)} className="font-mono text-sm mt-2" />
            )}
          </div>

          {/* Recording Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-mono text-xs">Recording Interval</Label>
              <Select value={recordingInterval} onValueChange={setRecordingInterval}>
                <SelectTrigger className="font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-xs">Retention</Label>
              <Select value={retentionDays} onValueChange={setRetentionDays}>
                <SelectTrigger className="font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full font-mono">Connect Camera</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCameraDialog;
