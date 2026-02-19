import { useState } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Users, User, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  useGetPaginatedLocalitiesWithParishioners,
  useAddLocality,
  useUpdateLocality,
  useDeleteLocality,
  useGetCollectiveOfferingsByLocality,
  useAddCollectiveOffering,
  useUpdateCollectiveOffering,
  useDeleteCollectiveOffering,
} from '../hooks/useQueries';
import type { Locality, LocalityWithParishioners, RelationType, CollectiveOffering } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateLocalitiesListPDF, generateSingleLocalityPDF } from '../lib/pdfGenerator';
import { ExportPdfModeControl } from '../components/ExportPdfModeControl';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import CollectiveOfferingDialog from '../components/CollectiveOfferingDialog';

export default function Miejscowosci() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocality, setEditingLocality] = useState<Locality | null>(null);
  const [selectedLocalityName, setSelectedLocalityName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('residents');

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    tasks: [] as string[],
  });

  // Collective offerings state
  const [offeringDialogOpen, setOfferingDialogOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<CollectiveOffering | null>(null);
  const [deleteOfferingDialogOpen, setDeleteOfferingDialogOpen] = useState(false);
  const [offeringToDelete, setOfferingToDelete] = useState<bigint | null>(null);

  const { data: paginatedData, isLoading } = useGetPaginatedLocalitiesWithParishioners(
    currentPage,
    pageSize
  );
  const addLocality = useAddLocality();
  const updateLocality = useUpdateLocality();
  const deleteLocality = useDeleteLocality();

  const addOffering = useAddCollectiveOffering();
  const updateOffering = useUpdateCollectiveOffering();
  const deleteOffering = useDeleteCollectiveOffering();

  const localities = paginatedData?.data || [];
  const totalCount = Number(paginatedData?.totalCount || 0);
  const pageCount = Number(paginatedData?.pageCount || 1);

  const handleAdd = () => {
    setEditingLocality(null);
    setFormData({ name: '', contactPerson: '', phone: '', tasks: [] });
    setDialogOpen(true);
  };

  const handleEdit = (locality: LocalityWithParishioners) => {
    const localityData: Locality = {
      name: locality.name,
      contactPerson: locality.contactPerson,
      phone: locality.phone,
      tasks: locality.tasks,
    };
    setEditingLocality(localityData);
    setFormData({
      name: locality.name,
      contactPerson: locality.contactPerson,
      phone: locality.phone,
      tasks: locality.tasks,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (locality: LocalityWithParishioners) => {
    if (!confirm(`Czy na pewno chcesz usunąć miejscowość: ${locality.name}?`)) return;

    try {
      await deleteLocality.mutateAsync(locality.name);
      toast.success('Miejscowość została usunięta');
      if (selectedLocalityName === locality.name) {
        setSelectedLocalityName(null);
      }
    } catch (error) {
      toast.error('Błąd podczas usuwania miejscowości');
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.contactPerson || !formData.phone) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      const localityData: Locality = {
        name: formData.name,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        tasks: formData.tasks,
      };

      if (editingLocality) {
        await updateLocality.mutateAsync({
          name: editingLocality.name,
          locality: localityData,
        });
        toast.success('Miejscowość została zaktualizowana');
      } else {
        await addLocality.mutateAsync(localityData);
        toast.success('Miejscowość została dodana');
      }

      setDialogOpen(false);
      setFormData({ name: '', contactPerson: '', phone: '', tasks: [] });
    } catch (error) {
      toast.error('Błąd podczas zapisywania miejscowości');
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

  const handleCardClick = (locality: LocalityWithParishioners) => {
    setSelectedLocalityName(locality.name === selectedLocalityName ? null : locality.name);
    setActiveTab('residents');
  };

  const handleExportAll = () => {
    generateLocalitiesListPDF(localities);
    toast.success('Lista miejscowości została wygenerowana');
  };

  const handleExportSelected = () => {
    const selectedLocality = localities.find(l => l.name === selectedLocalityName);
    if (selectedLocality) {
      generateSingleLocalityPDF(selectedLocality);
      toast.success('Karta miejscowości została wygenerowana');
    }
  };

  const getRelationTypeLabel = (relationType: RelationType): string => {
    if (relationType === 'spouse') return 'Małżonek/ka';
    if (relationType === 'child') return 'Dziecko';
    if (relationType === 'other') return 'Inny';
    return '';
  };

  // Collective offerings handlers
  const handleAddOffering = () => {
    if (!selectedLocalityName) return;
    setEditingOffering(null);
    setOfferingDialogOpen(true);
  };

  const handleEditOffering = (offering: CollectiveOffering) => {
    setEditingOffering(offering);
    setOfferingDialogOpen(true);
  };

  const handleDeleteOfferingClick = (offeringId: bigint) => {
    setOfferingToDelete(offeringId);
    setDeleteOfferingDialogOpen(true);
  };

  const handleDeleteOfferingConfirm = async () => {
    if (offeringToDelete === null) return;

    try {
      await deleteOffering.mutateAsync(offeringToDelete);
      toast.success('Ofiara zbiorowa została usunięta, budżet zaktualizowany');
      setDeleteOfferingDialogOpen(false);
      setOfferingToDelete(null);
    } catch (error: any) {
      toast.error(error?.message || 'Błąd podczas usuwania ofiary');
      console.error(error);
    }
  };

  const handleSaveOffering = async (data: CollectiveOffering) => {
    try {
      if (editingOffering) {
        await updateOffering.mutateAsync({ id: editingOffering.id, offering: data });
        toast.success('Ofiara zbiorowa została zaktualizowana, budżet zsynchronizowany');
      } else {
        await addOffering.mutateAsync(data);
        toast.success('Ofiara zbiorowa została dodana, budżet zaktualizowany');
      }
      setOfferingDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Błąd podczas zapisywania ofiary');
      console.error(error);
    }
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
        <div className="flex gap-2">
          <ExportPdfModeControl
            onExportAll={handleExportAll}
            onExportSelected={handleExportSelected}
            hasSelection={selectedLocalityName !== null}
            isLoading={isLoading}
          />
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj miejscowość
          </Button>
        </div>
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

      {localities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Brak miejscowości do wyświetlenia</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {localities.map((locality) => {
            const isSelected = selectedLocalityName === locality.name;
            
            return (
              <LocalityCard
                key={locality.name}
                locality={locality}
                isSelected={isSelected}
                activeTab={activeTab}
                onCardClick={handleCardClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTabChange={setActiveTab}
                onAddOffering={handleAddOffering}
                onEditOffering={handleEditOffering}
                onDeleteOffering={handleDeleteOfferingClick}
                getRelationTypeLabel={getRelationTypeLabel}
                deleteLocalityPending={deleteLocality.isPending}
              />
            );
          })}
        </div>
      )}

      {/* Dialog for Add/Edit Locality */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLocality ? 'Edytuj miejscowość' : 'Dodaj miejscowość'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa miejscowości *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!!editingLocality}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Osoba kontaktowa *</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tasks">Zadania (po jednym w linii)</Label>
              <Textarea
                id="tasks"
                value={formData.tasks.join('\n')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tasks: e.target.value.split('\n').filter((t) => t.trim()),
                  })
                }
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleSave}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collective Offering Dialog */}
      {selectedLocalityName && (
        <CollectiveOfferingDialog
          open={offeringDialogOpen}
          onOpenChange={setOfferingDialogOpen}
          offering={editingOffering}
          locality={selectedLocalityName}
          onSave={handleSaveOffering}
        />
      )}

      {/* Delete Offering Confirmation Dialog */}
      <AlertDialog open={deleteOfferingDialogOpen} onOpenChange={setDeleteOfferingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę ofiarę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja usunie ofiarę zbiorową oraz powiązaną transakcję budżetową. Nie można tego cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOfferingConfirm}>
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Separate component for locality card to keep the main component clean
function LocalityCard({
  locality,
  isSelected,
  activeTab,
  onCardClick,
  onEdit,
  onDelete,
  onTabChange,
  onAddOffering,
  onEditOffering,
  onDeleteOffering,
  getRelationTypeLabel,
  deleteLocalityPending,
}: {
  locality: LocalityWithParishioners;
  isSelected: boolean;
  activeTab: string;
  onCardClick: (locality: LocalityWithParishioners) => void;
  onEdit: (locality: LocalityWithParishioners) => void;
  onDelete: (locality: LocalityWithParishioners) => void;
  onTabChange: (tab: string) => void;
  onAddOffering: () => void;
  onEditOffering: (offering: CollectiveOffering) => void;
  onDeleteOffering: (offeringId: bigint) => void;
  getRelationTypeLabel: (relationType: RelationType) => string;
  deleteLocalityPending: boolean;
}) {
  const { data: offerings = [], isLoading: offeringsLoading } = useGetCollectiveOfferingsByLocality(
    locality.name
  );

  return (
    <Card
      className={`hover:shadow-lg transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onCardClick(locality)}
    >
      <CardHeader>
        <CardTitle className="text-lg">{locality.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Osoba kontaktowa: {locality.contactPerson}
        </p>
        <p className="text-sm text-muted-foreground">Telefon: {locality.phone}</p>
        <p className="text-sm text-muted-foreground">
          Parafianie: {Number(locality.totalParishioners)}
        </p>
        <p className="text-sm text-muted-foreground">
          Mieszkańcy (z rodziną): {locality.residents.length}
        </p>
        {locality.tasks.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Zadania: {locality.tasks.length}
          </p>
        )}

        {/* Expanded content with tabs when selected */}
        {isSelected && (
          <div className="mt-4 pt-4 border-t border-border" onClick={(e) => e.stopPropagation()}>
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="residents">
                  <Users className="h-4 w-4 mr-2" />
                  Mieszkańcy
                </TabsTrigger>
                <TabsTrigger value="offerings">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Ofiary zbiorowe
                </TabsTrigger>
              </TabsList>

              <TabsContent value="residents" className="mt-4">
                {locality.residents.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic text-center py-4">
                    Brak mieszkańców w tej miejscowości
                  </p>
                ) : (
                  <ScrollArea className="h-[200px] w-full rounded-md border p-3">
                    <div className="space-y-2">
                      {locality.residents.map((resident, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <div className="flex-1">
                            <span className="font-medium">{resident.name}</span>
                            {resident.isFamilyMember && resident.relationType && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {getRelationTypeLabel(resident.relationType)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="offerings" className="mt-4">
                <div className="space-y-3">
                  <Button
                    size="sm"
                    onClick={onAddOffering}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj ofiarę zbiorową
                  </Button>

                  {offeringsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : offerings.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-4">
                      Brak ofiar zbiorowych
                    </p>
                  ) : (
                    <ScrollArea className="h-[200px] w-full rounded-md border p-3">
                      <div className="space-y-2">
                        {offerings.map((offering) => (
                          <div
                            key={offering.id.toString()}
                            className="flex items-start justify-between p-3 border border-border rounded-md hover:bg-accent/50 transition-colors"
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
                            <div className="flex gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditOffering(offering)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteOffering(offering.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" onClick={() => onEdit(locality)}>
            <Edit className="h-4 w-4 mr-1" />
            Edytuj
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(locality)}
            disabled={deleteLocalityPending}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Usuń
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
