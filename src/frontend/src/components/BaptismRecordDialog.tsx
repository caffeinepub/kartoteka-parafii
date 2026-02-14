import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCreateBaptismRecord, useUpdateBaptismRecord } from '../hooks/useQueries';
import { buildBaptismRecordPayload, nanosecondsToDateString } from '../utils/baptismRecord';
import type { BaptismRecord } from '../backend';

interface BaptismRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: BaptismRecord | null;
}

export default function BaptismRecordDialog({ open, onOpenChange, record }: BaptismRecordDialogProps) {
  // Act data
  const [actNumber, setActNumber] = useState('');
  const [baptismDate, setBaptismDate] = useState('');
  const [baptismPlace, setBaptismPlace] = useState('');

  // Baptized person data
  const [personFullName, setPersonFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');

  // Father data
  const [fatherFullName, setFatherFullName] = useState('');
  const [fatherAge, setFatherAge] = useState('');
  const [fatherReligion, setFatherReligion] = useState('');
  const [fatherResidence, setFatherResidence] = useState('');

  // Mother data
  const [motherFullName, setMotherFullName] = useState('');
  const [motherAge, setMotherAge] = useState('');
  const [motherReligion, setMotherReligion] = useState('');
  const [motherResidence, setMotherResidence] = useState('');

  // Later annotations (optional)
  const [confirmation, setConfirmation] = useState('');
  const [marriage, setMarriage] = useState('');
  const [ordination, setOrdination] = useState('');
  const [profession, setProfession] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createRecord = useCreateBaptismRecord();
  const updateRecord = useUpdateBaptismRecord();

  useEffect(() => {
    if (record) {
      // Act data
      setActNumber(record.actNumber);
      setBaptismDate(nanosecondsToDateString(record.baptismDate));
      setBaptismPlace(record.baptismPlace);

      // Baptized person
      setPersonFullName(record.personFullName);
      setBirthDate(record.birthDate);
      setBirthPlace(record.birthPlace);

      // Father
      setFatherFullName(record.father.fullName);
      setFatherAge(record.father.age);
      setFatherReligion(record.father.religion);
      setFatherResidence(record.father.residence);

      // Mother
      setMotherFullName(record.mother.fullName);
      setMotherAge(record.mother.age);
      setMotherReligion(record.mother.religion);
      setMotherResidence(record.mother.residence);

      // Annotations
      setConfirmation(record.annotations.confirmation || '');
      setMarriage(record.annotations.marriage || '');
      setOrdination(record.annotations.ordination || '');
      setProfession(record.annotations.profession || '');
      setGeneralNotes(record.annotations.generalNotes || '');
    } else {
      // Reset all fields
      setActNumber('');
      setBaptismDate('');
      setBaptismPlace('');
      setPersonFullName('');
      setBirthDate('');
      setBirthPlace('');
      setFatherFullName('');
      setFatherAge('');
      setFatherReligion('');
      setFatherResidence('');
      setMotherFullName('');
      setMotherAge('');
      setMotherReligion('');
      setMotherResidence('');
      setConfirmation('');
      setMarriage('');
      setOrdination('');
      setProfession('');
      setGeneralNotes('');
    }
  }, [record, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!actNumber.trim()) {
      toast.error('Numer aktu jest wymagany');
      return;
    }
    if (!baptismDate) {
      toast.error('Data chrztu jest wymagana');
      return;
    }
    if (!baptismPlace.trim()) {
      toast.error('Miejsce chrztu jest wymagane');
      return;
    }
    if (!personFullName.trim()) {
      toast.error('Imię i nazwisko ochrzczonego jest wymagane');
      return;
    }
    if (!birthDate.trim()) {
      toast.error('Data urodzenia jest wymagana');
      return;
    }
    if (!birthPlace.trim()) {
      toast.error('Miejsce urodzenia jest wymagane');
      return;
    }
    if (!fatherFullName.trim()) {
      toast.error('Imię i nazwisko ojca jest wymagane');
      return;
    }
    if (!fatherAge.trim()) {
      toast.error('Wiek ojca jest wymagany');
      return;
    }
    if (!fatherReligion.trim()) {
      toast.error('Wyznanie ojca jest wymagane');
      return;
    }
    if (!fatherResidence.trim()) {
      toast.error('Miejsce zamieszkania ojca jest wymagane');
      return;
    }
    if (!motherFullName.trim()) {
      toast.error('Imię i nazwisko matki jest wymagane');
      return;
    }
    if (!motherAge.trim()) {
      toast.error('Wiek matki jest wymagany');
      return;
    }
    if (!motherReligion.trim()) {
      toast.error('Wyznanie matki jest wymagane');
      return;
    }
    if (!motherResidence.trim()) {
      toast.error('Miejsce zamieszkania matki jest wymagane');
      return;
    }

    setIsSubmitting(true);

    try {
      const recordData = buildBaptismRecordPayload(
        {
          actNumber,
          baptismDate,
          baptismPlace,
          personFullName,
          birthDate,
          birthPlace,
          fatherFullName,
          fatherAge,
          fatherReligion,
          fatherResidence,
          motherFullName,
          motherAge,
          motherReligion,
          motherResidence,
          confirmation,
          marriage,
          ordination,
          profession,
          generalNotes,
        },
        record
      );

      if (record) {
        await updateRecord.mutateAsync({ id: record.id, record: recordData });
        toast.success('Wpis chrztu został pomyślnie zaktualizowany');
      } else {
        await createRecord.mutateAsync(recordData);
        toast.success('Wpis chrztu został pomyślnie utworzony');
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(record ? 'Błąd podczas aktualizacji wpisu chrztu' : 'Błąd podczas tworzenia wpisu chrztu');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? 'Edytuj Wpis Chrztu' : 'Dodaj Nowy Wpis Chrztu'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Act Data Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Dane Aktu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actNumber">Numer Aktu *</Label>
                <Input
                  id="actNumber"
                  value={actNumber}
                  onChange={(e) => setActNumber(e.target.value)}
                  placeholder="np. 123/2026"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baptismDate">Data Chrztu *</Label>
                <Input
                  id="baptismDate"
                  type="date"
                  value={baptismDate}
                  onChange={(e) => setBaptismDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baptismPlace">Miejsce Chrztu *</Label>
              <Input
                id="baptismPlace"
                value={baptismPlace}
                onChange={(e) => setBaptismPlace(e.target.value)}
                placeholder="np. Kościół św. Marii"
                required
              />
            </div>
          </div>

          <Separator />

          {/* Baptized Person Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Ochrzczony/a</h3>
            <div className="space-y-2">
              <Label htmlFor="personFullName">Imię i Nazwisko *</Label>
              <Input
                id="personFullName"
                value={personFullName}
                onChange={(e) => setPersonFullName(e.target.value)}
                placeholder="np. Jan Michał Kowalski"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data Urodzenia *</Label>
                <Input
                  id="birthDate"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  placeholder="np. 15 stycznia 2026"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Miejsce Urodzenia *</Label>
                <Input
                  id="birthPlace"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="np. Szpital Miejski"
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Natural Parents Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Rodzice Naturalni</h3>
            
            {/* Father */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Ojciec</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherFullName">Imię i Nazwisko *</Label>
                  <Input
                    id="fatherFullName"
                    value={fatherFullName}
                    onChange={(e) => setFatherFullName(e.target.value)}
                    placeholder="np. Piotr Kowalski"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherAge">Wiek *</Label>
                  <Input
                    id="fatherAge"
                    value={fatherAge}
                    onChange={(e) => setFatherAge(e.target.value)}
                    placeholder="np. 35 lat"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherReligion">Wyznanie *</Label>
                  <Input
                    id="fatherReligion"
                    value={fatherReligion}
                    onChange={(e) => setFatherReligion(e.target.value)}
                    placeholder="np. rzymskokatolickie"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherResidence">Miejsce Zamieszkania *</Label>
                  <Input
                    id="fatherResidence"
                    value={fatherResidence}
                    onChange={(e) => setFatherResidence(e.target.value)}
                    placeholder="np. ul. Główna 10, Warszawa"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Mother */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Matka</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motherFullName">Imię i Nazwisko *</Label>
                  <Input
                    id="motherFullName"
                    value={motherFullName}
                    onChange={(e) => setMotherFullName(e.target.value)}
                    placeholder="np. Anna Kowalska"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherAge">Wiek *</Label>
                  <Input
                    id="motherAge"
                    value={motherAge}
                    onChange={(e) => setMotherAge(e.target.value)}
                    placeholder="np. 32 lata"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motherReligion">Wyznanie *</Label>
                  <Input
                    id="motherReligion"
                    value={motherReligion}
                    onChange={(e) => setMotherReligion(e.target.value)}
                    placeholder="np. rzymskokatolickie"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherResidence">Miejsce Zamieszkania *</Label>
                  <Input
                    id="motherResidence"
                    value={motherResidence}
                    onChange={(e) => setMotherResidence(e.target.value)}
                    placeholder="np. ul. Główna 10, Warszawa"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Later Annotations Section (Optional) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Adnotacje Późniejsze (opcjonalne)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="confirmation">Bierzmowanie</Label>
                <Input
                  id="confirmation"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="np. 15.05.2040, Kościół św. Jana"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marriage">Małżeństwo</Label>
                <Input
                  id="marriage"
                  value={marriage}
                  onChange={(e) => setMarriage(e.target.value)}
                  placeholder="np. 20.06.2050, Kościół św. Piotra"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ordination">Święcenia</Label>
                <Input
                  id="ordination"
                  value={ordination}
                  onChange={(e) => setOrdination(e.target.value)}
                  placeholder="np. 10.05.2055, Katedra"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">Profesja Zakonna</Label>
                <Input
                  id="profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="np. 01.08.2048, Klasztor"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* General Notes Section (Optional) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Uwagi (opcjonalne)</h3>
            <div className="space-y-2">
              <Label htmlFor="generalNotes">Uwagi Ogólne</Label>
              <Textarea
                id="generalNotes"
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Dodatkowe informacje lub uwagi..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Zapisywanie...' : record ? 'Aktualizuj' : 'Utwórz'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
