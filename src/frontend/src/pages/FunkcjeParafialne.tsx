import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Edit, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  ParishFunctionAssignment,
  ParishFunctionLocalityAssignment,
} from "../backend";
import { ExportPdfModeControl } from "../components/ExportPdfModeControl";
import FunctionAssignmentDialog from "../components/FunctionAssignmentDialog";
import FunctionLocalityDialog from "../components/FunctionLocalityDialog";
import {
  useDeleteParishFunctionAssignment,
  useDeleteParishFunctionLocalityAssignment,
  useGetPaginatedParishFunctionAssignments,
  useGetPaginatedParishFunctionLocalityAssignments,
  useUpdateParishFunctionAssignment,
  useUpdateParishFunctionLocalityAssignment,
} from "../hooks/useQueries";
import {
  generateParishPDF,
  generateSingleParishFunctionAssignmentPDF,
  generateSingleParishFunctionLocalityAssignmentPDF,
} from "../lib/pdfGenerator";

const NAVY = "oklch(0.25 0.10 265)";
const GOLD = "oklch(0.75 0.12 80)";

export default function FunkcjeParafialne() {
  const [currentPageIndividual, setCurrentPageIndividual] = useState(1);
  const [pageSizeIndividual, setPageSizeIndividual] = useState(20);
  const [currentPageLocality, setCurrentPageLocality] = useState(1);
  const [pageSizeLocality, setPageSizeLocality] = useState(20);
  const [activeTab, setActiveTab] = useState<"individual" | "locality">(
    "individual",
  );
  const [selectedIndividualId, setSelectedIndividualId] = useState<
    bigint | null
  >(null);
  const [selectedLocalityId, setSelectedLocalityId] = useState<bigint | null>(
    null,
  );

  const [viewingIndividual, setViewingIndividual] =
    useState<ParishFunctionAssignment | null>(null);
  const [viewingLocality, setViewingLocality] =
    useState<ParishFunctionLocalityAssignment | null>(null);
  const [detailIndividualOpen, setDetailIndividualOpen] = useState(false);
  const [detailLocalityOpen, setDetailLocalityOpen] = useState(false);

  const { data: individualPaginatedData, isLoading: loadingIndividual } =
    useGetPaginatedParishFunctionAssignments(
      currentPageIndividual,
      pageSizeIndividual,
    );
  const { data: localityPaginatedData, isLoading: loadingLocality } =
    useGetPaginatedParishFunctionLocalityAssignments(
      currentPageLocality,
      pageSizeLocality,
    );

  const updateIndividual = useUpdateParishFunctionAssignment();
  const deleteIndividual = useDeleteParishFunctionAssignment();
  const updateLocality = useUpdateParishFunctionLocalityAssignment();
  const deleteLocality = useDeleteParishFunctionLocalityAssignment();

  const [individualDialogOpen, setIndividualDialogOpen] = useState(false);
  const [localityDialogOpen, setLocalityDialogOpen] = useState(false);
  const [editingIndividual, setEditingIndividual] =
    useState<ParishFunctionAssignment | null>(null);
  const [editingLocality, setEditingLocality] =
    useState<ParishFunctionLocalityAssignment | null>(null);

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
  const handleEditIndividual = (a: ParishFunctionAssignment) => {
    setEditingIndividual(a);
    setIndividualDialogOpen(true);
    setDetailIndividualOpen(false);
  };
  const handleDeleteIndividual = async (a: ParishFunctionAssignment) => {
    if (!confirm("Czy na pewno chcesz usunąć to przypisanie?")) return;
    try {
      await deleteIndividual.mutateAsync(a.uid);
      toast.success("Przypisanie zostało usunięte");
      if (selectedIndividualId === a.uid) setSelectedIndividualId(null);
      if (viewingIndividual?.uid === a.uid) {
        setDetailIndividualOpen(false);
        setViewingIndividual(null);
      }
    } catch (error) {
      toast.error("Błąd podczas usuwania");
      console.error(error);
    }
  };
  const handleSaveIndividual = async (data: ParishFunctionAssignment) => {
    try {
      const uid = editingIndividual?.uid ?? BigInt(Date.now());
      await updateIndividual.mutateAsync({
        id: uid,
        assignment: { ...data, uid },
      });
      toast.success(
        editingIndividual ? "Przypisanie zaktualizowane" : "Przypisanie dodane",
      );
      setIndividualDialogOpen(false);
      setEditingIndividual(null);
    } catch (error) {
      toast.error("Błąd podczas zapisywania");
      console.error(error);
    }
  };

  const handleAddLocality = () => {
    setEditingLocality(null);
    setLocalityDialogOpen(true);
  };
  const handleEditLocality = (a: ParishFunctionLocalityAssignment) => {
    setEditingLocality(a);
    setLocalityDialogOpen(true);
    setDetailLocalityOpen(false);
  };
  const handleDeleteLocality = async (a: ParishFunctionLocalityAssignment) => {
    if (!confirm("Czy na pewno chcesz usunąć to przypisanie?")) return;
    try {
      await deleteLocality.mutateAsync(a.uid);
      toast.success("Przypisanie zostało usunięte");
      if (selectedLocalityId === a.uid) setSelectedLocalityId(null);
      if (viewingLocality?.uid === a.uid) {
        setDetailLocalityOpen(false);
        setViewingLocality(null);
      }
    } catch (error) {
      toast.error("Błąd podczas usuwania");
      console.error(error);
    }
  };
  const handleSaveLocality = async (data: ParishFunctionLocalityAssignment) => {
    try {
      const uid = editingLocality?.uid ?? BigInt(Date.now());
      await updateLocality.mutateAsync({
        id: uid,
        assignment: { ...data, uid },
      });
      toast.success(
        editingLocality ? "Przypisanie zaktualizowane" : "Przypisanie dodane",
      );
      setLocalityDialogOpen(false);
      setEditingLocality(null);
    } catch (error) {
      toast.error("Błąd podczas zapisywania");
      console.error(error);
    }
  };

  const handleExportAll = () => {
    if (
      individualAssignments.length === 0 &&
      localityAssignments.length === 0
    ) {
      toast.error("Brak danych do wyeksportowania");
      return;
    }
    let content = "FUNKCJE PARAFIALNE\n\n";
    content += `${"─".repeat(90)}\n\n`;
    if (individualAssignments.length > 0) {
      content += `PRZYPISANIA INDYWIDUALNE (${individualAssignments.length}):\n\n`;
      individualAssignments.forEach((a, idx) => {
        content += `${(idx + 1).toString().padStart(3, " ")}. ${a.title}\n`;
        content += `     Opis: ${a.description}\n     Adres: ${a.address}\n`;
        if (a.contacts.length > 0) {
          content += "     Kontakty:\n";
          for (const c of a.contacts) content += `       • ${c}\n`;
        }
        content += "\n";
      });
    }
    if (localityAssignments.length > 0) {
      content += `\nPRZYPISANIA WEDŁUG MIEJSCOWOŚCI (${localityAssignments.length}):\n\n`;
      localityAssignments.forEach((a, idx) => {
        content += `${(idx + 1).toString().padStart(3, " ")}. ${a.localityName}\n`;
        content += `     Opis: ${a.description}\n`;
        if (a.contacts.length > 0) {
          content += "     Kontakty:\n";
          for (const c of a.contacts) content += `       • ${c}\n`;
        }
        content += "\n";
      });
    }
    generateParishPDF({
      title: "FUNKCJE PARAFIALNE",
      content,
      footer: "Dokument wygenerowany automatycznie",
    });
    toast.success("PDF został wygenerowany");
  };

  const handleExportSelected = () => {
    if (activeTab === "individual") {
      const selected = individualAssignments.find(
        (a) => a.uid === selectedIndividualId,
      );
      if (selected) {
        generateSingleParishFunctionAssignmentPDF(selected);
        toast.success("PDF wygenerowany");
      }
    } else {
      const selected = localityAssignments.find(
        (a) => a.uid === selectedLocalityId,
      );
      if (selected) {
        generateSingleParishFunctionLocalityAssignmentPDF(selected);
        toast.success("PDF wygenerowany");
      }
    }
  };

  const hasSelection =
    activeTab === "individual"
      ? selectedIndividualId !== null
      : selectedLocalityId !== null;

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

  const PaginationBar = ({
    currentPage,
    pageCount,
    onPageChange,
    pageSize: ps,
    onPageSizeChange,
  }: {
    currentPage: number;
    pageCount: number;
    onPageChange: (p: number) => void;
    pageSize: number;
    onPageSizeChange: (v: string) => void;
  }) => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/50 p-4 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Wyświetl:</span>
        <Select value={ps.toString()} onValueChange={onPageSizeChange}>
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
          onClick={() => onPageChange(currentPage - 1)}
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
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Funkcje Parafialne
          </h1>
          <p className="text-muted-foreground mt-1">
            Zarządzanie funkcjami i obowiązkami
          </p>
        </div>
        <ExportPdfModeControl
          onExportAll={handleExportAll}
          onExportSelected={handleExportSelected}
          hasSelection={hasSelection}
          isLoading={loadingIndividual || loadingLocality}
        />
      </header>

      <Tabs
        defaultValue="individual"
        className="w-full"
        onValueChange={(v) => setActiveTab(v as "individual" | "locality")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">
            Indywidualne ({totalIndividual})
          </TabsTrigger>
          <TabsTrigger value="locality">
            Według miejscowości ({totalLocality})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <PaginationBar
            currentPage={currentPageIndividual}
            pageCount={pageCountIndividual}
            onPageChange={(p) => {
              if (p >= 1 && p <= pageCountIndividual)
                setCurrentPageIndividual(p);
            }}
            pageSize={pageSizeIndividual}
            onPageSizeChange={(v) => {
              setPageSizeIndividual(Number(v));
              setCurrentPageIndividual(1);
            }}
          />
          <div className="flex justify-end">
            <Button onClick={handleAddIndividual}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj przypisanie
            </Button>
          </div>
          {individualAssignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Brak przypisań indywidualnych
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {individualAssignments.map((assignment) => (
                <Card
                  key={Number(assignment.uid)}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedIndividualId === assignment.uid
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedIndividualId(assignment.uid);
                    setViewingIndividual(assignment);
                    setDetailIndividualOpen(true);
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {assignment.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">{assignment.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Adres: {assignment.address}
                    </p>
                    {assignment.contacts.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Kontakty:</p>
                        <ul className="text-sm text-muted-foreground">
                          {assignment.contacts.map((c, ci) => (
                            <li key={`c-${ci}-${c}`}>• {c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div
                      className="flex gap-2 pt-2"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditIndividual(assignment)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edytuj
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteIndividual(assignment)}
                      >
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
          <PaginationBar
            currentPage={currentPageLocality}
            pageCount={pageCountLocality}
            onPageChange={(p) => {
              if (p >= 1 && p <= pageCountLocality) setCurrentPageLocality(p);
            }}
            pageSize={pageSizeLocality}
            onPageSizeChange={(v) => {
              setPageSizeLocality(Number(v));
              setCurrentPageLocality(1);
            }}
          />
          <div className="flex justify-end">
            <Button onClick={handleAddLocality}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj przypisanie
            </Button>
          </div>
          {localityAssignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Brak przypisań według miejscowości
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {localityAssignments.map((assignment) => (
                <Card
                  key={Number(assignment.uid)}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedLocalityId === assignment.uid
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedLocalityId(assignment.uid);
                    setViewingLocality(assignment);
                    setDetailLocalityOpen(true);
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {assignment.localityName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">{assignment.description}</p>
                    {assignment.contacts.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Kontakty:</p>
                        <ul className="text-sm text-muted-foreground">
                          {assignment.contacts.map((c, ci) => (
                            <li key={`lc-${ci}-${c}`}>• {c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div
                      className="flex gap-2 pt-2"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLocality(assignment)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edytuj
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLocality(assignment)}
                      >
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

      {/* Detail wizytówka — Indywidualne */}
      <Dialog
        open={detailIndividualOpen}
        onOpenChange={setDetailIndividualOpen}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {viewingIndividual && (
            <>
              <DialogHeader className="p-0">
                <div
                  className="px-6 py-5"
                  style={{
                    background: NAVY,
                    borderBottom: `3px solid ${GOLD}`,
                  }}
                >
                  <DialogTitle
                    className="text-2xl font-light tracking-tight"
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      color: "white",
                    }}
                  >
                    {viewingIndividual.title}
                  </DialogTitle>
                  {viewingIndividual.address && (
                    <p className="text-sm mt-2" style={{ color: GOLD }}>
                      Adres: {viewingIndividual.address}
                    </p>
                  )}
                </div>
              </DialogHeader>
              <div className="px-6 py-6 space-y-8 max-h-[82vh] overflow-y-auto">
                {viewingIndividual.description && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Opis
                    </p>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {viewingIndividual.description}
                    </p>
                  </div>
                )}
                {viewingIndividual.contacts.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Kontakty
                    </p>
                    <ul className="space-y-1">
                      {viewingIndividual.contacts.map((c, ci) => (
                        <li key={`vc-${ci}-${c}`} className="flex gap-2">
                          <span style={{ color: GOLD }}>•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div
                className="px-6 py-4 flex gap-3"
                style={{ borderTop: "1px solid oklch(0.90 0.02 265)" }}
              >
                <Button
                  onClick={() => handleEditIndividual(viewingIndividual)}
                  style={{ background: GOLD, color: NAVY }}
                  className="hover:opacity-90"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteIndividual(viewingIndividual)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Usuń
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDetailIndividualOpen(false)}
                  className="ml-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Zamknij
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail wizytówka — Miejscowości */}
      <Dialog open={detailLocalityOpen} onOpenChange={setDetailLocalityOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {viewingLocality && (
            <>
              <DialogHeader className="p-0">
                <div
                  className="px-6 py-5"
                  style={{
                    background: NAVY,
                    borderBottom: `3px solid ${GOLD}`,
                  }}
                >
                  <DialogTitle
                    className="text-2xl font-light tracking-tight"
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      color: "white",
                    }}
                  >
                    {viewingLocality.localityName}
                  </DialogTitle>
                </div>
              </DialogHeader>
              <div className="px-6 py-6 space-y-8 max-h-[82vh] overflow-y-auto">
                {viewingLocality.description && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Opis
                    </p>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {viewingLocality.description}
                    </p>
                  </div>
                )}
                {viewingLocality.contacts.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Kontakty
                    </p>
                    <ul className="space-y-1">
                      {viewingLocality.contacts.map((c, ci) => (
                        <li key={`vlc-${ci}-${c}`} className="flex gap-2">
                          <span style={{ color: GOLD }}>•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div
                className="px-6 py-4 flex gap-3"
                style={{ borderTop: "1px solid oklch(0.90 0.02 265)" }}
              >
                <Button
                  onClick={() => handleEditLocality(viewingLocality)}
                  style={{ background: GOLD, color: NAVY }}
                  className="hover:opacity-90"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteLocality(viewingLocality)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Usuń
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDetailLocalityOpen(false)}
                  className="ml-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Zamknij
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <FunctionAssignmentDialog
        open={individualDialogOpen}
        onOpenChange={(open) => {
          setIndividualDialogOpen(open);
          if (!open) setEditingIndividual(null);
        }}
        assignment={editingIndividual}
        onSave={handleSaveIndividual}
      />
      <FunctionLocalityDialog
        open={localityDialogOpen}
        onOpenChange={(open) => {
          setLocalityDialogOpen(open);
          if (!open) setEditingLocality(null);
        }}
        assignment={editingLocality}
        onSave={handleSaveLocality}
      />
    </div>
  );
}
