import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HardDrive, Plus, Trash2, TestTube, Check, Loader2 } from 'lucide-react';
import { api, StorageConfigDTO } from '@/lib/api';
import { toast } from 'sonner';

const StorageConfigDialog = () => {
  const [open, setOpen] = useState(false);
  const [configs, setConfigs] = useState<StorageConfigDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // New config form
  const [type, setType] = useState('s3');
  const [name, setName] = useState('');
  const [configFields, setConfigFields] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const data = await api.getStorageConfigs();
      setConfigs(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchConfigs();
  }, [open]);

  const fieldsByType: Record<string, { key: string; label: string; type?: string }[]> = {
    s3: [
      { key: 'endpoint', label: 'Endpoint URL' },
      { key: 'bucket', label: 'Bucket Name' },
      { key: 'region', label: 'Region' },
      { key: 'accessKey', label: 'Access Key' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' },
    ],
    ftp: [
      { key: 'host', label: 'Host' },
      { key: 'port', label: 'Port' },
      { key: 'username', label: 'Username' },
      { key: 'password', label: 'Password', type: 'password' },
      { key: 'path', label: 'Remote Path' },
    ],
    http: [
      { key: 'url', label: 'Upload URL' },
      { key: 'authHeader', label: 'Auth Header' },
      { key: 'authValue', label: 'Auth Value', type: 'password' },
    ],
    local: [
      { key: 'path', label: 'Local Path' },
    ],
  };

  const handleAdd = async () => {
    if (!name) { toast.error('Name is required'); return; }
    try {
      const created = await api.createStorageConfig({ type, name, config: configFields, is_active: false });
      setConfigs([...configs, created]);
      setName('');
      setConfigFields({});
      toast.success('Storage config added');
    } catch {
      toast.error('Failed to add config');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.updateStorageConfig(id, { is_active: true });
      setConfigs(configs.map(c => ({ ...c, is_active: c.id === id })));
      toast.success('Storage activated');
    } catch {
      toast.error('Failed to activate');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteStorageConfig(id);
      setConfigs(configs.filter(c => c.id !== id));
      toast.success('Config deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await api.testStorageConfig({ type, config: configFields });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    } catch {
      toast.error('Connection test failed');
    }
    setTesting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5">
          <HardDrive className="h-3.5 w-3.5" />
          Storage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary" />
            Recording Storage Configuration
          </DialogTitle>
        </DialogHeader>

        {/* Existing Configs */}
        <div className="space-y-2">
          <p className="font-mono text-xs text-muted-foreground">Configured Storage Backends</p>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : configs.length === 0 ? (
            <p className="font-mono text-xs text-muted-foreground py-4 text-center">No storage backends configured. Recordings stored locally by default.</p>
          ) : (
            <div className="space-y-1.5">
              {configs.map((cfg) => (
                <div key={cfg.id} className="flex items-center justify-between p-2.5 rounded-md border border-border bg-card">
                  <div className="flex items-center gap-2">
                    {cfg.is_active && <Check className="h-3.5 w-3.5 text-primary" />}
                    <div>
                      <span className="font-mono text-xs font-medium text-foreground">{cfg.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground ml-2 uppercase">{cfg.type}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!cfg.is_active && (
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] font-mono"
                        onClick={() => handleActivate(cfg.id)}>
                        Activate
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(cfg.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Config */}
        <div className="border-t border-border pt-4 space-y-3">
          <p className="font-mono text-xs font-semibold text-foreground">Add Storage Backend</p>

          <div className="space-y-2">
            <Label className="font-mono text-[10px]">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My MinIO Server" className="font-mono text-xs h-8" />
          </div>

          <Tabs value={type} onValueChange={(v) => { setType(v); setConfigFields({}); }}>
            <TabsList className="grid grid-cols-4 h-8">
              <TabsTrigger value="s3" className="font-mono text-[10px]">S3</TabsTrigger>
              <TabsTrigger value="ftp" className="font-mono text-[10px]">FTP</TabsTrigger>
              <TabsTrigger value="http" className="font-mono text-[10px]">HTTP</TabsTrigger>
              <TabsTrigger value="local" className="font-mono text-[10px]">Local</TabsTrigger>
            </TabsList>

            {Object.entries(fieldsByType).map(([storageType, fields]) => (
              <TabsContent key={storageType} value={storageType} className="space-y-2 mt-3">
                {fields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label className="font-mono text-[10px]">{field.label}</Label>
                    <Input
                      type={field.type || 'text'}
                      value={configFields[field.key] || ''}
                      onChange={(e) => setConfigFields({ ...configFields, [field.key]: e.target.value })}
                      className="font-mono text-xs h-8"
                    />
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="font-mono text-xs gap-1.5 flex-1"
              onClick={handleTest} disabled={testing}>
              {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <TestTube className="h-3 w-3" />}
              Test Connection
            </Button>
            <Button size="sm" className="font-mono text-xs gap-1.5 flex-1" onClick={handleAdd}>
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StorageConfigDialog;
