import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Letter } from '../backend';

interface LetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; body: string }) => void;
  editingLetter?: Letter | null;
}

export default function LetterDialog({ open, onOpenChange, onSave, editingLetter }: LetterDialogProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (open && editingLetter) {
      // Load existing letter data for editing
      setTitle(editingLetter.title);
      setBody(editingLetter.body);
    } else if (!open) {
      // Clear form when dialog closes
      setTitle('');
      setBody('');
    }
  }, [open, editingLetter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    onSave({ title: title.trim(), body: body.trim() });
  };

  const isEditMode = !!editingLetter;
  const dialogTitle = isEditMode ? 'Edytuj pismo' : 'Nowe pismo';
  const submitButtonText = isEditMode ? 'Zapisz zmiany' : 'Utwórz pismo';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {isEditMode && editingLetter && (
            <p className="text-sm text-muted-foreground mt-2">
              Numer pisma: KP-{editingLetter.year.toString()}-{editingLetter.number.toString().padStart(3, '0')}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł pisma *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wprowadź tytuł pisma..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Treść pisma</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Wprowadź treść pisma..."
              rows={15}
              className="font-serif"
            />
            <p className="text-xs text-muted-foreground">
              Treść zostanie sformatowana w stylu EB Garamond w eksportowanym PDF
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit">
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
