import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Proszę podać imię i nazwisko");
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        role: role.trim() || "Pracownik",
      });
      toast.success("Profil został utworzony");
    } catch (error) {
      toast.error("Błąd podczas tworzenia profilu");
      console.error(error);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Witamy w systemie parafialnym</DialogTitle>
          <DialogDescription>
            Proszę podać swoje dane, aby kontynuować.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Imię i nazwisko *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan Kowalski"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Stanowisko</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Pracownik parafii"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? "Zapisywanie..." : "Zapisz profil"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
