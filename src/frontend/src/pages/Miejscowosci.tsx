import { useState } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  useGetPaginatedLocalitiesWithParishioners,
  useAddLocality,
  useUpdateLocality,
  useDeleteLocality,
} from '../hooks/useQueries';
import type { Locality, LocalityWithParishioners } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { generateLocalitiesListPDF, generateSingleLocalityPDF } from '../lib/pdfGenerator';
import { ExportPdfModeControl } from '../components/ExportPdfModeControl';

export default function Miejscowosci() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocality, setEditingLocality] = useState<Locality | null>(null);
  const [selectedLocalityName, setSelectedLocalityName] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    tasks: [] as string[],
  });

  const { data: paginatedData, isLoading } = useGetPaginatedLocalitiesWithParishioners(
    currentPage,
    pageSize
  );
  const addLocality = useAddLocality();
  const updateLocality = useUpdateLocality();
  const deleteLocality = useDeleteLocality();

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
              <Card
                key={locality.name}
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCardClick(locality)}
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
                  <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(locality)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edytuj
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(locality)}
                      disabled={deleteLocality.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Usuń
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog for Add/Edit */}
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
    </div>
  );
}
