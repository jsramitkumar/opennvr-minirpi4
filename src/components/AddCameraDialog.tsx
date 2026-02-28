import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useCameraStore } from '@/store/cameraStore';
import { toast } from 'sonner';

const AddCameraDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('554');
  const [streamUrl, setStreamUrl] = useState('');
  const addCamera = useCameraStore((s) => s.addCamera);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ipAddress) {
      toast.error('Name and IP address are required');
      return;
    }
    const portNum = parseInt(port) || 554;
    const url = streamUrl || `rtsp://${ipAddress}:${portNum}/stream1`;
    addCamera({ name, ipAddress, port: portNum, streamUrl: url });
    toast.success(`Camera "${name}" added successfully`);
    setName('');
    setIpAddress('');
    setPort('554');
    setStreamUrl('');
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
            <Input
              id="name"
              placeholder="e.g. Front Door"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="ip" className="font-mono text-xs">IP Address</Label>
              <Input
                id="ip"
                placeholder="192.168.1.100"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port" className="font-mono text-xs">Port</Label>
              <Input
                id="port"
                placeholder="554"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stream" className="font-mono text-xs">Stream URL (optional)</Label>
            <Input
              id="stream"
              placeholder="rtsp://192.168.1.100:554/stream1"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <Button type="submit" className="w-full font-mono">
            Connect Camera
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCameraDialog;
