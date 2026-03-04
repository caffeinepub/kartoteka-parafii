import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import type { ParishNote } from "../backend";

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: ParishNote | null;
  onSave: (data: ParishNote) => void;
}

export default function NoteDialog({
  open,
  onOpenChange,
  note,
  onSave,
}: NoteDialogProps) {
  const [formData, setFormData] = useState<ParishNote>({
    title: "",
    timestamp: BigInt(Date.now() * 1000000),
    content: "",
  });

  useEffect(() => {
    if (note) {
      setFormData(note);
    } else {
      setFormData({
        title: "",
        timestamp: BigInt(Date.now() * 1000000),
        content: "",
      });
    }
  }, [note]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{note ? "Edytuj notatkę" : "Dodaj notatkę"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={
                new Date(Number(formData.timestamp) / 1000000)
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  timestamp: BigInt(
                    new Date(e.target.value).getTime() * 1000000,
                  ),
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Treść *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              rows={8}
            />
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
