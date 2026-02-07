import { useState } from 'react';
import { useGetPaginatedLocalitiesWithParishioners, useAddLocality, useUpdateLocality, useDeleteLocality, useGetCollectiveOfferingsByLocality, useAddCollectiveOffering, useUpdateCollectiveOffering, useDeleteCollectiveOffering, useGetPaginatedParishioners } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Download, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import LocalityDialog from '../components/LocalityDialog';
import CollectiveOfferingDialog from '../components/CollectiveOfferingDialog';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { Locality, CollectiveOffering, RelationType, Parishioner, FamilyMember } from '../backend';
import { generateParishPDF } from '../lib/pdfGenerator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FamilyGroup {
  parishioner: Parishioner;
  familyMembers: FamilyMember[];
}

export default function Miejscowosci() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: paginatedData, isLoading } = useGetPaginatedLocalitiesWithParishioners(currentPage, pageSize);
  const { data: parishionersPaginatedData } = useGetPaginatedParishioners(1, 1000);
  const addLocality = useAddLocality();
  const updateLocality = useUpdateLocality();
  const deleteLocality = useDeleteLocality();
  const getCollectiveOfferingsByLocality = useGetCollectiveOfferingsByLocality();
  const addCollectiveOffering = useAddCollectiveOffering();
  const updateCollectiveOffering = useUpdateCollectiveOffering();
  const deleteCollectiveOffering = useDeleteCollectiveOffering();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocality, setEditingLocality] = useState<Locality | null>(null);
  const [selectedLocality, setSelectedLocality] = useState<string | null>(null);
  const [offeringDialogOpen, setOfferingDialogOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<CollectiveOffering | null>(null);
  const [localityOfferings, setLocalityOfferings] = useState<CollectiveOffering[]>([]);

  const localities = paginatedData?.data || [];
  const allParishioners = parishionersPaginatedData?.data || [];
  const totalCount = Number(paginatedData?.totalCount || 0);
  const pageCount = Number(paginatedData?.pageCount || 1);

  const handleAdd = () => {
    setEditingLocality(null);
    setDialogOpen(true);
  };

  const handleEdit = (locality: Locality) => {
    setEditingLocality(locality);
    setDialogOpen(true);
  };

  const handleDelete = async (name: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę miejscowość?')) return;

    try {
      await deleteLocality.mutateAsync(name);
      toast.success('Miejscowość została usunięta');
    } catch (error: any) {
      toast.error(error?.message || 'Błąd podczas usuwania miejscowości');
      console.error(error);
    }
  };

  const handleSave = async (data: Locality) => {
    try {
      if (editingLocality) {
        await updateLocality.mutateAsync({ name: editingLocality.name, locality: data });
        toast.success('Miejscowość została zaktualizowana');
      } else {
        await addLocality.mutateAsync(data);
        toast.success('Miejscowość została dodana');
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Błąd podczas zapisywania miejscowości');
      console.error(error);
    }
  };

  const handleSelectLocality = async (localityName: string) => {
    setSelectedLocality(localityName);
    try {
      const offerings = await getCollectiveOfferingsByLocality.mutateAsync(localityName);
      setLocalityOfferings(offerings);
    } catch (error) {
      console.error('Error loading offerings:', error);
      setLocalityOfferings([]);
    }
  };

  const handleAddOffering = () => {
    if (!selectedLocality) return;
    setEditingOffering(null);
    setOfferingDialogOpen(true);
  };

  const handleEditOffering = (offering: CollectiveOffering) => {
    setEditingOffering(offering);
    setOfferingDialogOpen(true);
  };

  const handleDeleteOffering = async (id: bigint) => {
    if (!confirm('Czy na pewno chcesz usunąć tę ofiarę?')) return;

    try {
      await deleteCollectiveOffering.mutateAsync(id);
      toast.success('Ofiara została usunięta');
      if (selectedLocality) {
        const offerings = await getCollectiveOfferingsByLocality.mutateAsync(selectedLocality);
        setLocalityOfferings(offerings);
      }
    } catch (error) {
      toast.error('Błąd podczas usuwania ofiary');
      console.error(error);
    }
  };

  const handleSaveOffering = async (data: CollectiveOffering) => {
    try {
      if (editingOffering) {
        await updateCollectiveOffering.mutateAsync({ id: editingOffering.id, offering: data });
        toast.success('Ofiara została zaktualizowana');
      } else {
        await addCollectiveOffering.mutateAsync(data);
        toast.success('Ofiara została dodana');
      }
      setOfferingDialogOpen(false);
      if (selectedLocality) {
        const offerings = await getCollectiveOfferingsByLocality.mutateAsync(selectedLocality);
        setLocalityOfferings(offerings);
      }
    } catch (error) {
      toast.error('Błąd podczas zapisywania ofiary');
      console.error(error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pageCount) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const getRelationshipLabel = (relationType?: RelationType): string => {
    if (!relationType) return '';
    switch (relationType) {
      case 'spouse':
        return 'małżonek/małżonka';
      case 'child':
        return 'dziecko';
      case 'other':
        return 'inny';
      default:
        return '';
    }
  };

  const getFamilyGroupsForLocality = (localityName: string): FamilyGroup[] => {
    const familyGroups: FamilyGroup[] = [];
    
    allParishioners.forEach(parishioner => {
      if (parishioner.address && parishioner.address.includes(localityName)) {
        familyGroups.push({
          parishioner,
          familyMembers: parishioner.family,
        });
      }
    });
    
    familyGroups.sort((a, b) => a.parishioner.lastName.localeCompare(b.parishioner.lastName, 'pl'));
    
    return familyGroups;
  };

  const formatSacramentYears = (member: { sacraments: { birthYear?: bigint; baptismYear?: bigint; communionYear?: bigint; confirmationYear?: bigint; marriageYear?: bigint; funeralYear?: bigint } }): string => {
    const years: string[] = [];
    if (member.sacraments.birthYear) years.push(`ur. ${member.sacraments.birthYear}`);
    if (member.sacraments.baptismYear) years.push(`chr. ${member.sacraments.baptismYear}`);
    if (member.sacraments.communionYear) years.push(`kom. ${member.sacraments.communionYear}`);
    if (member.sacraments.confirmationYear) years.push(`bierz. ${member.sacraments.confirmationYear}`);
    if (member.sacraments.marriageYear) years.push(`małż. ${member.sacraments.marriageYear}`);
    if (member.sacraments.funeralYear) years.push(`pogr. ${member.sacraments.funeralYear}`);
    return years.join(', ');
  };

  const exportResidentList = async (locality: typeof localities[0]) => {
    toast.info('Generowanie PDF...');
    
    setTimeout(() => {
      const familyGroups = getFamilyGroupsForLocality(locality.name);
      
      let content = '';
      content += `MIEJSCOWOŚĆ: ${locality.name.toUpperCase()}\n\n`;
      content += `Osoba kontaktowa: ${locality.contactPerson}\n`;
      content += `Telefon: ${locality.phone}\n\n`;
      content += '═'.repeat(90) + '\n\n';
      
      content += `LISTA MIESZKAŃCÓW - GRUPOWANIE RODZINNE\n`;
      content += `Liczba rodzin: ${familyGroups.length}\n`;
      content += `Łączna liczba mieszkańców: ${locality.residents.length}\n\n`;
      
      if (familyGroups.length === 0) {
        content += `Brak zarejestrowanych mieszkańców.\n`;
      } else {
        familyGroups.forEach((group, idx) => {
          const familyName = `Rodzina ${group.parishioner.lastName}${group.parishioner.lastName.endsWith('i') ? 'ch' : group.parishioner.lastName.endsWith('a') ? '' : 'ów'}`;
          content += `${idx + 1}. ${familyName.toUpperCase()}\n`;
          content += '─'.repeat(80) + '\n';
          
          const parishionerName = `${group.parishioner.firstName} ${group.parishioner.lastName}`;
          const parishionerYears = formatSacramentYears(group.parishioner);
          content += `   • ${parishionerName}`;
          if (parishionerYears) {
            content += ` (${parishionerYears})`;
          }
          content += '\n';
          
          if (group.familyMembers.length > 0) {
            group.familyMembers.forEach(member => {
              const relationLabel = getRelationshipLabel(member.relationType);
              const memberYears = formatSacramentYears(member);
              content += `     ◦ ${member.name}`;
              if (relationLabel) {
                content += ` [${relationLabel}]`;
              }
              if (memberYears) {
                content += ` (${memberYears})`;
              }
              content += '\n';
            });
          }
          content += '\n';
        });
      }
      
      if (locality.tasks.length > 0) {
        content += '═'.repeat(90) + '\n\n';
        content += `ZADANIA WSPÓLNOTOWE\n\n`;
        locality.tasks.forEach((task, idx) => {
          content += `${idx + 1}. ${task}\n`;
        });
      }

      generateParishPDF({
        title: 'LISTA MIESZKAŃCÓW',
        subtitle: locality.name.toUpperCase(),
        content,
        footer: 'Lista mieszkańców wygenerowana automatycznie - grupowanie rodzinne'
      });

      toast.success('Lista mieszkańców została wygenerowana - okno drukowania otworzy się automatycznie');
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Miejscowości</h1>
          <p className="text-muted-foreground mt-1">{totalCount} miejscowości</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj miejscowość
        </Button>
      </header>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Wyświetl:</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">na stronę</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Strona {currentPage} z {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {localities.map((locality) => {
          const familyGroups = getFamilyGroupsForLocality(locality.name);
          const totalResidents = locality.residents.length;
          
          return (
            <Card key={locality.name}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1">
                  <CardTitle>{locality.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kontakt: {locality.contactPerson} ({locality.phone})
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Rodzin: {familyGroups.length}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      Łącznie mieszkańców: {totalResidents}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => exportResidentList(locality)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit({ name: locality.name, contactPerson: locality.contactPerson, phone: locality.phone, tasks: locality.tasks })}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(locality.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="residents" onValueChange={(value) => {
                  if (value === 'offerings') {
                    handleSelectLocality(locality.name);
                  }
                }}>
                  <TabsList>
                    <TabsTrigger value="residents">Mieszkańcy</TabsTrigger>
                    <TabsTrigger value="tasks">Zadania</TabsTrigger>
                    <TabsTrigger value="offerings">Ofiary zbiorowe</TabsTrigger>
                  </TabsList>

                  <TabsContent value="residents" className="space-y-4">
                    {familyGroups.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">Brak mieszkańców</p>
                    ) : (
                      <div className="space-y-6">
                        {familyGroups.map((group, idx) => {
                          const familyName = `Rodzina ${group.parishioner.lastName}${group.parishioner.lastName.endsWith('i') ? 'ch' : group.parishioner.lastName.endsWith('a') ? '' : 'ów'}`;
                          
                          return (
                            <div key={`family-${idx}`} className="border border-border rounded-lg p-4 bg-muted/20">
                              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                {familyName}
                              </h3>
                              
                              <div className="space-y-3 pl-4">
                                <div className="flex flex-col gap-1 pb-2 border-b border-border">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground">
                                      {group.parishioner.firstName} {group.parishioner.lastName}
                                    </span>
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                      Parafianin
                                    </span>
                                  </div>
                                  {formatSacramentYears(group.parishioner) && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatSacramentYears(group.parishioner)}
                                    </span>
                                  )}
                                </div>
                                
                                {group.familyMembers.length > 0 && (
                                  <div className="space-y-2 pl-4">
                                    {group.familyMembers.map((member, memberIdx) => {
                                      const relationLabel = getRelationshipLabel(member.relationType);
                                      const memberYears = formatSacramentYears(member);
                                      
                                      return (
                                        <div key={`member-${memberIdx}`} className="flex flex-col gap-1">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm text-foreground">
                                              {member.name}
                                            </span>
                                            {relationLabel && (
                                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                                {relationLabel}
                                              </span>
                                            )}
                                          </div>
                                          {memberYears && (
                                            <span className="text-xs text-muted-foreground">
                                              {memberYears}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tasks" className="space-y-2">
                    {locality.tasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">Brak zadań</p>
                    ) : (
                      <ul className="space-y-1">
                        {locality.tasks.map((task, idx) => (
                          <li key={idx} className="text-sm py-2 border-b border-border last:border-0">
                            {task}
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>

                  <TabsContent value="offerings" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Ofiary są automatycznie synchronizowane z budżetem
                      </p>
                      <Button variant="outline" size="sm" onClick={handleAddOffering}>
                        <Plus className="h-4 w-4 mr-2" />
                        Dodaj ofiarę
                      </Button>
                    </div>
                    {selectedLocality === locality.name && localityOfferings.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">Brak ofiar zbiorowych</p>
                    ) : selectedLocality === locality.name ? (
                      <div className="space-y-2">
                        {localityOfferings
                          .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                          .map((offering) => {
                            const date = new Date(Number(offering.timestamp) / 1000000);
                            return (
                              <div
                                key={Number(offering.id)}
                                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <p className="text-sm font-medium">
                                      {format(date, 'PPP', { locale: pl })}
                                    </p>
                                    <p className="text-lg font-bold text-primary">
                                      {Number(offering.amount)} zł
                                    </p>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{offering.description}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditOffering(offering)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteOffering(offering.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : null}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <LocalityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        locality={editingLocality}
        onSave={handleSave}
      />

      {selectedLocality && (
        <CollectiveOfferingDialog
          open={offeringDialogOpen}
          onOpenChange={setOfferingDialogOpen}
          offering={editingOffering}
          locality={selectedLocality}
          onSave={handleSaveOffering}
        />
      )}
    </div>
  );
}
