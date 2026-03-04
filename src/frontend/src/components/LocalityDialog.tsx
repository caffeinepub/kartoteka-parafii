import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import type { Locality } from "../backend";

interface LocalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locality: Locality | null;
  onSave: (data: Locality) => void;
}

export default function LocalityDialog({
  open,
  onOpenChange,
  locality,
  onSave,
}: LocalityDialogProps) {
  const [formData, setFormData] = useState<Locality>({
    name: "",
    contactPerson: "",
    phone: "",
    tasks: [],
  });

  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    if (locality) {
      setFormData(locality);
    } else {
      setFormData({
        name: "",
        contactPerson: "",
        phone: "",
        tasks: [],
      });
    }
    setNewTask("");
  }, [locality]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTask = () => {
    if (newTask.trim()) {
      setFormData({ ...formData, tasks: [...formData.tasks, newTask.trim()] });
      setNewTask("");
    }
  };

  const removeTask = (index: number) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {locality ? "Edytuj miejscowość" : "Dodaj miejscowość"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa miejscowości *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={!!locality}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Osoba kontaktowa *</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) =>
                setFormData({ ...formData, contactPerson: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Zadania</Label>
            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Dodaj zadanie..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTask();
                  }
                }}
              />
              <Button type="button" onClick={addTask} variant="outline">
                Dodaj
              </Button>
            </div>
            {formData.tasks.length > 0 && (
              <ul className="space-y-2 mt-2">
                {formData.tasks.map((task, index) => (
                  <li
                    key={`task-${index}-${task}`}
                    className="flex items-center justify-between bg-muted p-2 rounded"
                  >
                    <span className="text-sm">{task}</span>
                    <Button
                      type="button"
                      onClick={() => removeTask(index)}
                      variant="ghost"
                      size="sm"
                    >
                      Usuń
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Anuluj
            </Button>
            <Button type="submit">Zapisz</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
