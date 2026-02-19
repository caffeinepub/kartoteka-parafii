import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { RelationType } from '../backend';
import type { Parishioner, FamilyMember, IndividualOffering, Sacraments } from '../backend';
import { useGetIndividualOfferingsByParishioner, useAddIndividualOffering, useUpdateIndividualOffering, useDeleteIndividualOffering } from '../hooks/useQueries';
import { toast } from 'sonner';
import IndividualOfferingDialog from './IndividualOfferingDialog';

interface ParishionerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parishioner: Parishioner | null;
  onSave: (data: Parishioner) => void;
}

export default function ParishionerDialog({ open, onOpenChange, parishioner, onSave }: ParishionerDialogProps) {
  const [formData, setFormData] = useState<Parishioner>({
    uid: BigInt(0),
    firstName: '',
    lastName: '',
    birthYear: undefined,
    profession: undefined,
    phone: undefined,
    email: undefined,
    address: undefined,
    sacraments: {
      birthYear: undefined,
      baptismYear: undefined,
      communionYear: undefined,
      confirmationYear: undefined,
      marriageYear: undefined,
      funeralYear: undefined,
    },
    family: [],
    offers: [],
    pastoralNotes: undefined,
  });

  const [offeringDialogOpen, setOfferingDialogOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<IndividualOffering | null>(null);

  // Use the query hook with the parishioner's ID
  const { data: parishionerOfferings = [], refetch: refetchOfferings } = useGetIndividualOfferingsByParishioner(
    parishioner?.uid || BigInt(0)
  );
  
  const addIndividualOffering = useAddIndividualOffering();
  const updateIndividualOffering = useUpdateIndividualOffering();
  const deleteIndividualOffering = useDeleteIndividualOffering();

  useEffect(() => {
    if (parishioner) {
      setFormData(parishioner);
      // Refetch offerings when parishioner changes
      refetchOfferings();
    } else {
      setFormData({
        uid: BigInt(0),
        firstName: '',
        lastName: '',
        birthYear: undefined,
        profession: undefined,
        phone: undefined,
        email: undefined,
        address: undefined,
        sacraments: {
          birthYear: undefined,
          baptismYear: undefined,
          communionYear: undefined,
          confirmationYear: undefined,
          marriageYear: undefined,
          funeralYear: undefined,
        },
        family: [],
        offers: [],
        pastoralNotes: undefined,
      });
    }
  }, [parishioner, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addFamilyMember = () => {
    setFormData({
      ...formData,
      family: [
        ...formData.family,
        {
          name: '',
          relationType: RelationType.other,
          sacraments: {
            birthYear: undefined,
            baptismYear: undefined,
            communionYear: undefined,
            confirmationYear: undefined,
            marriageYear: undefined,
            funeralYear: undefined,
          },
        },
      ],
    });
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: any) => {
    const newFamily = [...formData.family];
    newFamily[index] = { ...newFamily[index], [field]: value };
    setFormData({ ...formData, family: newFamily });
  };

  const updateFamilyMemberSacrament = (index: number, field: keyof Sacraments, value: bigint | undefined) => {
    const newFamily = [...formData.family];
    newFamily[index] = {
      ...newFamily[index],
      sacraments: {
        ...newFamily[index].sacraments,
        [field]: value,
      },
    };
    setFormData({ ...formData, family: newFamily });
  };

  const removeFamilyMember = (index: number) => {
    setFormData({ ...formData, family: formData.family.filter((_, i) => i !== index) });
  };

  const handleAddOffering = () => {
    setEditingOffering(null);
    setOfferingDialogOpen(true);
  };

  const handleEditOffering = (offering: IndividualOffering) => {
    setEditingOffering(offering);
    setOfferingDialogOpen(true);
  };

  const handleDeleteOffering = async (id: bigint) => {
    if (!confirm('Czy na pewno chcesz usunąć tę ofiarę?')) return;

    try {
      await deleteIndividualOffering.mutateAsync(id);
      toast.success('Ofiara została usunięta');
      // Reload offerings
      await refetchOfferings();
    } catch (error) {
      toast.error('Błąd podczas usuwania ofiary');
      console.error(error);
    }
  };

  const handleSaveOffering = async (data: IndividualOffering) => {
    try {
      if (editingOffering) {
        await updateIndividualOffering.mutateAsync({ id: editingOffering.id, offering: data });
        toast.success('Ofiara została zaktualizowana');
      } else {
        await addIndividualOffering.mutateAsync(data);
        toast.success('Ofiara została dodana');
      }
      setOfferingDialogOpen(false);
      // Reload offerings
      await refetchOfferings();
    } catch (error) {
      toast.error('Błąd podczas zapisywania ofiary');
      console.error(error);
    }
  };

  const isNewParishioner = !parishioner || parishioner.uid === BigInt(0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{parishioner ? 'Edytuj parafianina' : 'Dodaj parafianina'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Podstawowe</TabsTrigger>
                <TabsTrigger value="sacraments">Sakramenty</TabsTrigger>
                <TabsTrigger value="family">Rodzina</TabsTrigger>
                <TabsTrigger value="offers">Ofiary</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Imię *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nazwisko *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthYear">Rok urodzenia</Label>
                    <Input
                      id="birthYear"
                      type="number"
                      value={formData.birthYear ? Number(formData.birthYear) : ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          birthYear: e.target.value ? BigInt(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profession">Zawód</Label>
                    <Input
                      id="profession"
                      value={formData.profession || ''}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value || undefined })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value || undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value || undefined })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value || undefined })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pastoralNotes">Notatki duszpasterskie</Label>
                  <Textarea
                    id="pastoralNotes"
                    value={formData.pastoralNotes || ''}
                    onChange={(e) => setFormData({ ...formData, pastoralNotes: e.target.value || undefined })}
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="sacraments" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baptismYear">Rok chrztu</Label>
                    <Input
                      id="baptismYear"
                      type="number"
                      placeholder="np. 2000"
                      value={formData.sacraments.baptismYear ? Number(formData.sacraments.baptismYear) : ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sacraments: {
                            ...formData.sacraments,
                            baptismYear: e.target.value ? BigInt(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="communionYear">Rok Komunii Świętej</Label>
                    <Input
                      id="communionYear"
                      type="number"
                      placeholder="np. 2008"
                      value={formData.sacraments.communionYear ? Number(formData.sacraments.communionYear) : ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sacraments: {
                            ...formData.sacraments,
                            communionYear: e.target.value ? BigInt(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="confirmationYear">Rok bierzmowania</Label>
                    <Input
                      id="confirmationYear"
                      type="number"
                      placeholder="np. 2015"
                      value={formData.sacraments.confirmationYear ? Number(formData.sacraments.confirmationYear) : ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sacraments: {
                            ...formData.sacraments,
                            confirmationYear: e.target.value ? BigInt(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marriageYear">Rok małżeństwa</Label>
                    <Input
                      id="marriageYear"
                      type="number"
                      placeholder="np. 2020"
                      value={formData.sacraments.marriageYear ? Number(formData.sacraments.marriageYear) : ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sacraments: {
                            ...formData.sacraments,
                            marriageYear: e.target.value ? BigInt(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="funeralYear">Rok pogrzebu</Label>
                  <Input
                    id="funeralYear"
                    type="number"
                    placeholder="np. 2023"
                    value={formData.sacraments.funeralYear ? Number(formData.sacraments.funeralYear) : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sacraments: {
                          ...formData.sacraments,
                          funeralYear: e.target.value ? BigInt(e.target.value) : undefined,
                        },
                      })
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="family" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Członkowie rodziny są wliczani do statystyk parafii
                  </p>
                  <Button type="button" onClick={addFamilyMember} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj członka rodziny
                  </Button>
                </div>
                {formData.family.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Brak członków rodziny
                  </div>
                ) : (
                  formData.family.map((member, index) => (
                    <div key={index} className="border border-border rounded-lg p-5 space-y-4 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Członek rodziny #{index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeFamilyMember(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Imię i nazwisko</Label>
                          <Input
                            value={member.name}
                            onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                            placeholder="np. Jan Kowalski"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Relacja</Label>
                          <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            value={member.relationType}
                            onChange={(e) =>
                              updateFamilyMember(index, 'relationType', e.target.value as RelationType)
                            }
                          >
                            <option value={RelationType.spouse}>Małżonek</option>
                            <option value={RelationType.child}>Dziecko</option>
                            <option value={RelationType.other}>Inny</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border">
                        <h5 className="text-sm font-medium mb-3 text-muted-foreground">Dane sakramentalne</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Rok urodzenia</Label>
                            <Input
                              type="number"
                              placeholder="np. 1995"
                              value={member.sacraments.birthYear ? Number(member.sacraments.birthYear) : ''}
                              onChange={(e) =>
                                updateFamilyMemberSacrament(
                                  index,
                                  'birthYear',
                                  e.target.value ? BigInt(e.target.value) : undefined
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Rok chrztu</Label>
                            <Input
                              type="number"
                              placeholder="np. 1995"
                              value={member.sacraments.baptismYear ? Number(member.sacraments.baptismYear) : ''}
                              onChange={(e) =>
                                updateFamilyMemberSacrament(
                                  index,
                                  'baptismYear',
                                  e.target.value ? BigInt(e.target.value) : undefined
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Rok Komunii Świętej</Label>
                            <Input
                              type="number"
                              placeholder="np. 2003"
                              value={member.sacraments.communionYear ? Number(member.sacraments.communionYear) : ''}
                              onChange={(e) =>
                                updateFamilyMemberSacrament(
                                  index,
                                  'communionYear',
                                  e.target.value ? BigInt(e.target.value) : undefined
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Rok bierzmowania</Label>
                            <Input
                              type="number"
                              placeholder="np. 2010"
                              value={member.sacraments.confirmationYear ? Number(member.sacraments.confirmationYear) : ''}
                              onChange={(e) =>
                                updateFamilyMemberSacrament(
                                  index,
                                  'confirmationYear',
                                  e.target.value ? BigInt(e.target.value) : undefined
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Rok małżeństwa</Label>
                            <Input
                              type="number"
                              placeholder="np. 2015"
                              value={member.sacraments.marriageYear ? Number(member.sacraments.marriageYear) : ''}
                              onChange={(e) =>
                                updateFamilyMemberSacrament(
                                  index,
                                  'marriageYear',
                                  e.target.value ? BigInt(e.target.value) : undefined
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Rok pogrzebu</Label>
                            <Input
                              type="number"
                              placeholder="np. 2020"
                              value={member.sacraments.funeralYear ? Number(member.sacraments.funeralYear) : ''}
                              onChange={(e) =>
                                updateFamilyMemberSacrament(
                                  index,
                                  'funeralYear',
                                  e.target.value ? BigInt(e.target.value) : undefined
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="offers" className="space-y-4">
                {isNewParishioner ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Zapisz parafianina, aby móc dodawać ofiary
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Ofiary indywidualne od tego parafianina
                      </p>
                      <Button type="button" onClick={handleAddOffering} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Dodaj ofiarę
                      </Button>
                    </div>
                    {parishionerOfferings.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        Brak ofiar
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {parishionerOfferings.map((offering) => (
                          <div
                            key={offering.id.toString()}
                            className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-green-600">
                                  {Number(offering.amount).toLocaleString('pl-PL')} zł
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(Number(offering.timestamp) / 1000000).toLocaleDateString('pl-PL')}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {offering.description || 'Brak opisu'}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditOffering(offering)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOffering(offering.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Anuluj
              </Button>
              <Button type="submit">Zapisz</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {parishioner && (
        <IndividualOfferingDialog
          open={offeringDialogOpen}
          onOpenChange={setOfferingDialogOpen}
          offering={editingOffering}
          parishionerId={parishioner.uid}
          onSave={handleSaveOffering}
        />
      )}
    </>
  );
}
