import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Event, Task } from '../backend';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onSave: (data: Event) => void;
}

export default function EventDialog({ open, onOpenChange, event, onSave }: EventDialogProps) {
  const [formData, setFormData] = useState<Event>({
    uid: BigInt(0),
    title: '',
    timestamp: BigInt(Date.now() * 1000000),
    description: '',
    tasks: [],
  });

  const [newTaskDescription, setNewTaskDescription] = useState('');

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        uid: BigInt(0),
        title: '',
        timestamp: BigInt(Date.now() * 1000000),
        description: '',
        tasks: [],
      });
    }
    setNewTaskDescription('');
  }, [event, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTask = () => {
    if (newTaskDescription.trim()) {
      const newTask: Task = {
        description: newTaskDescription.trim(),
        assignedParishioners: [],
      };
      setFormData({ ...formData, tasks: [...formData.tasks, newTask] });
      setNewTaskDescription('');
    }
  };

  const removeTask = (index: number) => {
    setFormData({ ...formData, tasks: formData.tasks.filter((_, i) => i !== index) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Edytuj wydarzenie' : 'Dodaj wydarzenie'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

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
            <Label htmlFor="description">Opis *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Zadania</Label>
            <div className="flex gap-2">
              <Input
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Dodaj zadanie..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTask())}
              />
              <Button type="button" onClick={addTask} variant="outline">
                Dodaj
              </Button>
            </div>
            {formData.tasks.length > 0 && (
              <ul className="space-y-2 mt-2">
                {formData.tasks.map((task, index) => (
                  <li key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm">{task.description}</span>
                    <Button type="button" onClick={() => removeTask(index)} variant="ghost" size="sm">
                      Usuń
                    </Button>
                  </li>
                ))}
              </ul>
            )}
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
