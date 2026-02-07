import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { StatisticEntry } from '../backend';

interface StatisticDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statistic: StatisticEntry | null;
  onSave: (data: StatisticEntry) => void;
}

export default function StatisticDialog({ open, onOpenChange, statistic, onSave }: StatisticDialogProps) {
  const [formData, setFormData] = useState<StatisticEntry>({
    sundayAttendance: BigInt(0),
    communionCount: BigInt(0),
    timestamp: BigInt(Date.now() * 1000000),
  });

  useEffect(() => {
    if (statistic) {
      setFormData(statistic);
    } else {
      setFormData({
        sundayAttendance: BigInt(0),
        communionCount: BigInt(0),
        timestamp: BigInt(Date.now() * 1000000),
      });
    }
  }, [statistic, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{statistic ? 'Edytuj wpis' : 'Dodaj wpis statystyczny'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={new Date(Number(formData.timestamp) / 1000000).toISOString().split('T')[0]}
              onChange={(e) =>
                setFormData({ ...formData, timestamp: BigInt(new Date(e.target.value).getTime() * 1000000) })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sundayAttendance">Frekwencja niedzielna *</Label>
            <Input
              id="sundayAttendance"
              type="number"
              value={Number(formData.sundayAttendance)}
              onChange={(e) => setFormData({ ...formData, sundayAttendance: BigInt(e.target.value || 0) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="communionCount">Liczba komunii *</Label>
            <Input
              id="communionCount"
              type="number"
              value={Number(formData.communionCount)}
              onChange={(e) => setFormData({ ...formData, communionCount: BigInt(e.target.value || 0) })}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit">Zapisz</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
