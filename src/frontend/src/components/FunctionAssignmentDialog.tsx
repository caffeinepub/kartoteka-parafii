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
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ParishFunctionAssignment } from "../backend";

interface FunctionAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: ParishFunctionAssignment | null;
  onSave: (data: ParishFunctionAssignment) => void;
}

export default function FunctionAssignmentDialog({
  open,
  onOpenChange,
  assignment,
  onSave,
}: FunctionAssignmentDialogProps) {
  const [formData, setFormData] = useState<ParishFunctionAssignment>({
    uid: BigInt(0),
    title: "",
    description: "",
    assignedParishioner: BigInt(0),
    address: "",
    contacts: [],
  });

  useEffect(() => {
    if (assignment) {
      setFormData(assignment);
    } else {
      setFormData({
        uid: BigInt(0),
        title: "",
        description: "",
        assignedParishioner: BigInt(0),
        address: "",
        contacts: [],
      });
    }
  }, [assignment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, ""],
    });
  };

  const handleRemoveContact = (index: number) => {
    const newContacts = formData.contacts.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      contacts: newContacts,
    });
  };

  const handleContactChange = (index: number, value: string) => {
    const newContacts = [...formData.contacts];
    newContacts[index] = value;
    setFormData({
      ...formData,
      contacts: newContacts,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignment ? "Edytuj przypisanie" : "Dodaj przypisanie"}
          </DialogTitle>
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
            <Label htmlFor="description">Opis *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adres *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Kontakty</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddContact}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Dodaj kontakt
              </Button>
            </div>

            {formData.contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Brak kontaktów. Kliknij "Dodaj kontakt" aby dodać.
              </p>
            ) : (
              <div className="space-y-2">
                {formData.contacts.map((contact, index) => (
                  <div
                    key={`contact-${index}-${contact}`}
                    className="flex gap-2"
                  >
                    <Input
                      value={contact}
                      onChange={(e) =>
                        handleContactChange(index, e.target.value)
                      }
                      placeholder={`Kontakt ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveContact(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
