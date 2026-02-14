import { useState } from 'react';
import { useGetPaginatedParishioners, useUpdateParishioner, useDeleteParishioner, useGetPaginatedIndividualOfferings } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Grid, List, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import ParishionerDialog from '../components/ParishionerDialog';
import type { Parishioner } from '../backend';
import { generateParishPDF, generateSingleParishionerPDF } from '../lib/pdfGenerator';
import { getParishionerAnniversarySummary } from '../utils/anniversaries';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExportPdfModeControl } from '../components/ExportPdfModeControl';

type ViewMode = 'card' | 'list';

export default function Kartoteka() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParishioner, setEditingParishioner] = useState<Parishioner | null>(null);
  const [selectedParishionerId, setSelectedParishionerId] = useState<bigint | null>(null);

  const { data: paginatedData, isLoading } = useGetPaginatedParishioners(currentPage, pageSize);
  const { data: offeringsPaginatedData } = useGetPaginatedIndividualOfferings(1, 1000);
  const updateParishioner = useUpdateParishioner();
  const deleteParishioner = useDeleteParishioner();

  const parishioners = paginatedData?.data || [];
  const individualOfferings = offeringsPaginatedData?.data || [];
  const totalCount = Number(paginatedData?.totalCount || 0);
  const pageCount = Number(paginatedData?.pageCount || 1);

  const currentYear = new Date().getFullYear();

  const filteredParishioners = parishioners.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(query) ||
      p.lastName.toLowerCase().includes(query) ||
      p.address?.toLowerCase().includes(query)
    );
  });

  const handleAdd = () => {
    setEditingParishioner(null);
    setDialogOpen(true);
  };

  const handleEdit = (parishioner: Parishioner) => {
    setEditingParishioner(parishioner);
    setDialogOpen(true);
  };

  const handleDelete = async (parishioner: Parishioner) => {
    if (!confirm('Czy na pewno chcesz usunąć tego parafianina?')) return;

    try {
      await deleteParishioner.mutateAsync(parishioner.uid);
      toast.success('Parafianin został usunięty');
      if (selectedParishionerId === parishioner.uid) {
        setSelectedParishionerId(null);
      }
    } catch (error) {
      toast.error('Błąd podczas usuwania parafianina');
      console.error(error);
    }
  };

  const handleSave = async (data: Parishioner) => {
    try {
      const uid = editingParishioner?.uid ?? BigInt(Date.now());
      await updateParishioner.mutateAsync({ id: uid, parishioner: { ...data, uid } });
      toast.success(editingParishioner ? 'Parafianin został zaktualizowany' : 'Parafianin został dodany');
      setDialogOpen(false);
      setEditingParishioner(null);
    } catch (error) {
      toast.error('Błąd podczas zapisywania');
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

  const handleCardClick = (parishioner: Parishioner) => {
    setSelectedParishionerId(parishioner.uid === selectedParishionerId ? null : parishioner.uid);
  };

  const exportParishionersPDF = async () => {
    toast.info('Generowanie PDF...');
    
    setTimeout(() => {
      let content = '';
      
      content += `LICZBA PARAFIAN: ${totalCount}\n\n`;
      content += '─'.repeat(90) + '\n\n';

      parishioners.forEach((p, idx) => {
        content += `${(idx + 1).toString().padStart(3, ' ')}. ${p.firstName} ${p.lastName}\n`;
        
        if (p.birthYear) {
          content += `     Rok urodzenia: ${Number(p.birthYear)}\n`;
        }
        if (p.address) {
          content += `     Adres: ${p.address}\n`;
        }
        if (p.phone) {
          content += `     Telefon: ${p.phone}\n`;
        }
        if (p.email) {
          content += `     Email: ${p.email}\n`;
        }
        if (p.profession) {
          content += `     Zawód: ${p.profession}\n`;
        }
        
        const parishionerOfferings = individualOfferings.filter(
          o => o.parishionerId === p.uid
        );
        
        if (parishionerOfferings.length > 0) {
          content += `     Ofiary (${parishionerOfferings.length}):\n`;
          parishionerOfferings.forEach((offer) => {
            content += `       • ${Number(offer.year)}: ${Number(offer.amount)} zł - ${offer.description}\n`;
          });
        }
        
        if (p.family.length > 0) {
          content += `     Rodzina: ${p.family.length} osób\n`;
        }
        
        content += '\n';
      });

      generateParishPDF({
        title: 'KARTOTEKA PARAFIAN',
        content,
        footer: 'Dokument wygenerowany automatycznie'
      });

      toast.success('Kartoteka została wygenerowana - okno drukowania otworzy się automatycznie');
    }, 100);
  };

  const exportSelectedParishionerPDF = () => {
    const selectedParishioner = parishioners.find(p => p.uid === selectedParishionerId);
    if (!selectedParishioner) return;

    const parishionerOfferings = individualOfferings.filter(
      o => o.parishionerId === selectedParishioner.uid
    );

    generateSingleParishionerPDF(selectedParishioner, parishionerOfferings);
    toast.success('Karta parafianina została wygenerowana');
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
          <h1 className="text-3xl font-bold text-foreground">Kartoteka Parafian</h1>
          <p className="text-muted-foreground mt-1">{totalCount} zarejestrowanych osób</p>
        </div>
        <div className="flex gap-2">
          <ExportPdfModeControl
            onExportAll={exportParishionersPDF}
            onExportSelected={exportSelectedParishionerPDF}
            hasSelection={selectedParishionerId !== null}
            isLoading={isLoading}
          />
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj parafianina
          </Button>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po imieniu, nazwisku lub adresie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('card')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

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

      {filteredParishioners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Brak parafian do wyświetlenia</p>
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredParishioners.map((p) => {
            const offerings = individualOfferings.filter(o => o.parishionerId === p.uid);
            const anniversary = getParishionerAnniversarySummary(p, currentYear);
            const isSelected = selectedParishionerId === p.uid;
            
            return (
              <Card
                key={Number(p.uid)}
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCardClick(p)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {p.firstName} {p.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {p.birthYear && (
                    <p className="text-sm text-muted-foreground">Rok urodzenia: {Number(p.birthYear)}</p>
                  )}
                  {p.address && (
                    <p className="text-sm text-muted-foreground">Adres: {p.address}</p>
                  )}
                  {p.phone && (
                    <p className="text-sm text-muted-foreground">Telefon: {p.phone}</p>
                  )}
                  {p.email && (
                    <p className="text-sm text-muted-foreground">Email: {p.email}</p>
                  )}
                  {p.profession && (
                    <p className="text-sm text-muted-foreground">Zawód: {p.profession}</p>
                  )}
                  {offerings.length > 0 && (
                    <p className="text-sm text-muted-foreground">Ofiary: {offerings.length}</p>
                  )}
                  {p.family.length > 0 && (
                    <p className="text-sm text-muted-foreground">Rodzina: {p.family.length} osób</p>
                  )}
                  {anniversary && (
                    <p className="text-sm font-medium text-primary mt-2">
                      {anniversary.label}: {anniversary.eventYear} ({anniversary.anniversaryNumber}. rocznica)
                    </p>
                  )}
                  <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(p)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edytuj
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(p)}
                      disabled={deleteParishioner.isPending}
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
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-semibold">Imię i nazwisko</th>
                <th className="text-left p-4 font-semibold">Adres</th>
                <th className="text-left p-4 font-semibold">Telefon</th>
                <th className="text-right p-4 font-semibold">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filteredParishioners.map((p) => {
                const isSelected = selectedParishionerId === p.uid;
                return (
                  <tr
                    key={Number(p.uid)}
                    onClick={() => handleCardClick(p)}
                    className={`border-t cursor-pointer transition-colors ${
                      isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                  >
                    <td className="p-4">{p.firstName} {p.lastName}</td>
                    <td className="p-4 text-muted-foreground">{p.address || '-'}</td>
                    <td className="p-4 text-muted-foreground">{p.phone || '-'}</td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p)}
                          disabled={deleteParishioner.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ParishionerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        parishioner={editingParishioner}
        onSave={handleSave}
      />
    </div>
  );
}
