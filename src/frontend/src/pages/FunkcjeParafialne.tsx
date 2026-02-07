import { useState } from 'react';
import {
  useGetPaginatedParishFunctionAssignments,
  useGetPaginatedParishFunctionLocalityAssignments,
  useUpdateParishFunctionAssignment,
  useUpdateParishFunctionLocalityAssignment,
  useDeleteParishFunctionAssignment,
  useDeleteParishFunctionLocalityAssignment,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import FunctionAssignmentDialog from '../components/FunctionAssignmentDialog';
import FunctionLocalityDialog from '../components/FunctionLocalityDialog';
import { generateParishFunctionsPDF } from '../lib/pdfGenerator';
import type { ParishFunctionAssignment, ParishFunctionLocalityAssignment } from '../backend';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function FunkcjeParafialne() {
  const [currentPageIndividual, setCurrentPageIndividual] = useState(1);
  const [pageSizeIndividual, setPageSizeIndividual] = useState(20);
  const [currentPageLocality, setCurrentPageLocality] = useState(1);
  const [pageSizeLocality, setPageSizeLocality] = useState(20);

  const { data: individualPaginatedData, isLoading: loadingIndividual } = useGetPaginatedParishFunctionAssignments(
    currentPageIndividual,
    pageSizeIndividual
  );
  const { data: localityPaginatedData, isLoading: loadingLocality } = useGetPaginatedParishFunctionLocalityAssignments(
    currentPageLocality,
    pageSizeLocality
  );

  const updateIndividual = useUpdateParishFunctionAssignment();
  const deleteIndividual = useDeleteParishFunctionAssignment();

  const updateLocality = useUpdateParishFunctionLocalityAssignment();
  const deleteLocality = useDeleteParishFunctionLocalityAssignment();

  const [individualDialogOpen, setIndividualDialogOpen] = useState(false);
  const [localityDialogOpen, setLocalityDialogOpen] = useState(false);
  const [editingIndividual, setEditingIndividual] = useState<ParishFunctionAssignment | null>(null);
  const [editingLocality, setEditingLocality] = useState<ParishFunctionLocalityAssignment | null>(null);

  const individualAssignments = individualPaginatedData?.data || [];
  const localityAssignments = localityPaginatedData?.data || [];
  const totalIndividual = Number(individualPaginatedData?.totalCount || 0);
  const totalLocality = Number(localityPaginatedData?.totalCount || 0);
  const pageCountIndividual = Number(individualPaginatedData?.pageCount || 1);
  const pageCountLocality = Number(localityPaginatedData?.pageCount || 1);

  const handleAddIndividual = () => {
    setEditingIndividual(null);
    setIndividualDialogOpen(true);
  };

  const handleEditIndividual = (assignment: ParishFunctionAssignment) => {
    setEditingIndividual(assignment);
    setIndividualDialogOpen(true);
  };

  const handleDeleteIndividual = async (assignment: ParishFunctionAssignment) => {
    if (!confirm('Czy na pewno chcesz usunąć to przypisanie?')) return;

    try {
      await deleteIndividual.mutateAsync(assignment.uid);
      toast.success('Przypisanie zostało usunięte');
    } catch (error) {
      toast.error('Błąd podczas usuwania');
      console.error(error);
    }
  };

  const handleSaveIndividual = async (data: ParishFunctionAssignment) => {
    try {
      const uid = editingIndividual?.uid ?? BigInt(Date.now());
      await updateIndividual.mutateAsync({ id: uid, assignment: { ...data, uid } });
      toast.success(editingIndividual ? 'Przypisanie zostało zaktualizowane' : 'Przypisanie zostało dodane');
      setIndividualDialogOpen(false);
      setEditingIndividual(null);
    } catch (error) {
      toast.error('Błąd podczas zapisywania');
      console.error(error);
    }
  };

  const handleAddLocality = () => {
    setEditingLocality(null);
    setLocalityDialogOpen(true);
  };

  const handleEditLocality = (assignment: ParishFunctionLocalityAssignment) => {
    setEditingLocality(assignment);
    setLocalityDialogOpen(true);
  };

  const handleDeleteLocality = async (assignment: ParishFunctionLocalityAssignment) => {
    if (!confirm('Czy na pewno chcesz usunąć to przypisanie?')) return;

    try {
      await deleteLocality.mutateAsync(assignment.uid);
      toast.success('Przypisanie zostało usunięte');
    } catch (error) {
      toast.error('Błąd podczas usuwania');
      console.error(error);
    }
  };

  const handleSaveLocality = async (data: ParishFunctionLocalityAssignment) => {
    try {
      const uid = editingLocality?.uid ?? BigInt(Date.now());
      await updateLocality.mutateAsync({ id: uid, assignment: { ...data, uid } });
      toast.success(editingLocality ? 'Przypisanie zostało zaktualizowane' : 'Przypisanie zostało dodane');
      setLocalityDialogOpen(false);
      setEditingLocality(null);
    } catch (error) {
      toast.error('Błąd podczas zapisywania');
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    if (individualAssignments.length === 0 && localityAssignments.length === 0) {
      toast.error('Brak danych do wyeksportowania');
      return;
    }

    try {
      generateParishFunctionsPDF(individualAssignments, localityAssignments);
      toast.success('Generowanie PDF...');
    } catch (error) {
      toast.error('Błąd podczas generowania PDF');
      console.error(error);
    }
  };

  const handlePageChangeIndividual = (newPage: number) => {
    if (newPage >= 1 && newPage <= pageCountIndividual) {
      setCurrentPageIndividual(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageChangeLocality = (newPage: number) => {
    if (newPage >= 1 && newPage <= pageCountLocality) {
      setCurrentPageLocality(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loadingIndividual || loadingLocality) {
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
          <h1 className="text-3xl font-bold text-foreground">Funkcje Parafialne</h1>
          <p className="text-muted-foreground mt-1">Zarządzanie funkcjami i obowiązkami</p>
        </div>
        <Button onClick={handleExportPDF} variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Eksportuj PDF
        </Button>
      </header>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Indywidualne ({totalIndividual})</TabsTrigger>
          <TabsTrigger value="locality">Według miejscowości ({totalLocality})</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Wyświetl:</span>
              <Select
                value={pageSizeIndividual.toString()}
                onValueChange={(value) => {
                  setPageSizeIndividual(Number(value));
                  setCurrentPageIndividual(1);
                }}
              >
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
                onClick={() => handlePageChangeIndividual(currentPageIndividual - 1)}
                disabled={currentPageIndividual === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Strona {currentPageIndividual} z {pageCountIndividual}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChangeIndividual(currentPageIndividual + 1)}
                disabled={currentPageIndividual === pageCountIndividual}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAddIndividual}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj przypisanie
            </Button>
          </div>

          {individualAssignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Brak przypisań indywidualnych</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {individualAssignments.map((assignment) => (
                <Card key={Number(assignment.uid)}>
                  <CardHeader>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">{assignment.description}</p>
                    <p className="text-sm text-muted-foreground">Adres: {assignment.address}</p>
                    {assignment.contacts.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Kontakty:</p>
                        <ul className="text-sm text-muted-foreground">
                          {assignment.contacts.map((contact, cIdx) => (
                            <li key={cIdx}>• {contact}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditIndividual(assignment)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edytuj
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteIndividual(assignment)}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Usuń
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="locality" className="space-y-4">
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Wyświetl:</span>
              <Select
                value={pageSizeLocality.toString()}
                onValueChange={(value) => {
                  setPageSizeLocality(Number(value));
                  setCurrentPageLocality(1);
                }}
              >
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
                onClick={() => handlePageChangeLocality(currentPageLocality - 1)}
                disabled={currentPageLocality === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Strona {currentPageLocality} z {pageCountLocality}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChangeLocality(currentPageLocality + 1)}
                disabled={currentPageLocality === pageCountLocality}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAddLocality}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj przypisanie
            </Button>
          </div>

          {localityAssignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Brak przypisań według miejscowości</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {localityAssignments.map((assignment) => (
                <Card key={Number(assignment.uid)}>
                  <CardHeader>
                    <CardTitle className="text-lg">{assignment.localityName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">{assignment.description}</p>
                    {assignment.contacts.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Kontakty:</p>
                        <ul className="text-sm text-muted-foreground">
                          {assignment.contacts.map((contact, cIdx) => (
                            <li key={cIdx}>• {contact}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditLocality(assignment)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edytuj
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteLocality(assignment)}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Usuń
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <FunctionAssignmentDialog
        open={individualDialogOpen}
        onOpenChange={(open) => {
          setIndividualDialogOpen(open);
          if (!open) {
            setEditingIndividual(null);
          }
        }}
        assignment={editingIndividual}
        onSave={handleSaveIndividual}
      />

      <FunctionLocalityDialog
        open={localityDialogOpen}
        onOpenChange={(open) => {
          setLocalityDialogOpen(open);
          if (!open) {
            setEditingLocality(null);
          }
        }}
        assignment={editingLocality}
        onSave={handleSaveLocality}
      />
    </div>
  );
}
