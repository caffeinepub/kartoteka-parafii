import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ParishFunctionLocalityAssignment } from '../backend';

interface FunctionLocalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: ParishFunctionLocalityAssignment | null;
  onSave: (data: ParishFunctionLocalityAssignment) => void;
}

export default function FunctionLocalityDialog({ open, onOpenChange, assignment, onSave }: FunctionLocalityDialogProps) {
  const [formData, setFormData] = useState<ParishFunctionLocalityAssignment>({
    uid: BigInt(0),
    localityName: '',
    description: '',
    assignedParishioners: [],
    contacts: [],
  });

  const [newContact, setNewContact] = useState('');

  useEffect(() => {
    if (assignment) {
      setFormData(assignment);
    } else {
      setFormData({
        uid: BigInt(0),
        localityName: '',
        description: '',
        assignedParishioners: [],
        contacts: [],
      });
    }
    setNewContact('');
  }, [assignment, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addContact = () => {
    if (newContact.trim()) {
      setFormData({ ...formData, contacts: [...formData.contacts, newContact.trim()] });
      setNewContact('');
    }
  };

  const removeContact = (index: number) => {
    setFormData({ ...formData, contacts: formData.contacts.filter((_, i) => i !== index) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{assignment ? 'Edytuj przypisanie' : 'Dodaj przypisanie'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="localityName">Nazwa miejscowości *</Label>
            <Input
              id="localityName"
              value={formData.localityName}
              onChange={(e) => setFormData({ ...formData, localityName: e.target.value })}
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
            <Label>Kontakty</Label>
            <div className="flex gap-2">
              <Input
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="Dodaj kontakt..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContact())}
              />
              <Button type="button" onClick={addContact} variant="outline">
                Dodaj
              </Button>
            </div>
            {formData.contacts.length > 0 && (
              <ul className="space-y-2 mt-2">
                {formData.contacts.map((contact, index) => (
                  <li key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm">{contact}</span>
                    <Button type="button" onClick={() => removeContact(index)} variant="ghost" size="sm">
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
