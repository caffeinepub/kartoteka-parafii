import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Download, Edit, Plus, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Letter } from "../backend";
import { ExportPdfModeControl } from "../components/ExportPdfModeControl";
import LetterDialog from "../components/LetterDialog";
import {
  useAddLetter,
  useDeleteLetter,
  useGetAllLetters,
  useUpdateLetter,
} from "../hooks/useQueries";
import { generateLetterPDF, generateParishPDF } from "../lib/pdfGenerator";

const NAVY = "oklch(0.25 0.10 265)";
const GOLD = "oklch(0.75 0.12 80)";

export default function Korespondencja() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetterId, setSelectedLetterId] = useState<bigint | null>(null);
  const [viewingLetter, setViewingLetter] = useState<Letter | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: letters = [], isLoading } = useGetAllLetters();
  const addLetterMutation = useAddLetter();
  const updateLetterMutation = useUpdateLetter();
  const deleteLetterMutation = useDeleteLetter();

  const handleAdd = () => {
    setEditingLetter(null);
    setDialogOpen(true);
  };

  const handleEdit = (letter: Letter) => {
    setEditingLetter(letter);
    setDialogOpen(true);
    setDetailOpen(false);
  };

  const handleDelete = async (letter: Letter) => {
    const letterNumber = `KP-${letter.year}-${letter.number.toString().padStart(3, "0")}`;
    if (!confirm(`Czy na pewno chcesz usunąć pismo ${letterNumber}?`)) return;
    try {
      await deleteLetterMutation.mutateAsync(letter.uid);
      toast.success("Pismo zostało usunięte");
      if (selectedLetterId === letter.uid) setSelectedLetterId(null);
      if (viewingLetter?.uid === letter.uid) {
        setDetailOpen(false);
        setViewingLetter(null);
      }
    } catch (error) {
      toast.error("Błąd podczas usuwania pisma");
      console.error(error);
    }
  };

  const handleSave = async (data: {
    title: string;
    body: string;
    adresat: string;
  }) => {
    try {
      if (editingLetter) {
        await updateLetterMutation.mutateAsync({
          uid: editingLetter.uid,
          title: data.title,
          body: data.body,
          adresat: data.adresat || undefined,
        });
        toast.success("Pismo zostało zaktualizowane");
      } else {
        const currentYear = BigInt(new Date().getFullYear());
        await addLetterMutation.mutateAsync({
          title: data.title,
          body: data.body,
          year: currentYear,
          adresat: data.adresat || undefined,
        });
        toast.success("Pismo zostało utworzone");
      }
      setDialogOpen(false);
      setEditingLetter(null);
    } catch (error) {
      toast.error(
        editingLetter
          ? "Błąd podczas aktualizacji"
          : "Błąd podczas zapisywania",
      );
      console.error(error);
    }
  };

  const handleExportPDF = (letter: Letter) => {
    const letterNumber = `KP-${letter.year}-${letter.number.toString().padStart(3, "0")}`;
    generateLetterPDF({
      number: letterNumber,
      title: letter.title,
      body: letter.body,
      timestamp: letter.date || BigInt(0),
    });
    toast.success("PDF został wygenerowany");
  };

  const handleExportAll = () => {
    if (letters.length === 0) {
      toast.error("Brak pism do wyeksportowania");
      return;
    }
    let content = "KORESPONDENCJA\n\n";
    content += `Liczba pism: ${letters.length}\n\n`;
    content += `${"─".repeat(90)}\n\n`;
    const sortedLetters = [...letters].sort((a, b) => {
      if (a.year !== b.year) return Number(b.year) - Number(a.year);
      return Number(b.number) - Number(a.number);
    });
    sortedLetters.forEach((letter, idx) => {
      const letterNumber = `KP-${letter.year}-${letter.number.toString().padStart(3, "0")}`;
      content += `${(idx + 1).toString().padStart(3, " ")}. ${letterNumber}\n`;
      if (letter.adresat) content += `     Adresat: ${letter.adresat}\n`;
      content += `     Tytuł: ${letter.title}\n\n`;
    });
    generateParishPDF({
      title: "KORESPONDENCJA",
      content,
      footer: "Dokument wygenerowany automatycznie",
    });
    toast.success("Lista korespondencji została wygenerowana");
  };

  const handleExportSelected = () => {
    const selectedLetter = letters.find((l) => l.uid === selectedLetterId);
    if (selectedLetter) handleExportPDF(selectedLetter);
  };

  const filteredLetters = letters.filter((letter) => {
    const query = searchQuery.toLowerCase();
    const letterNumber = `KP-${letter.year}-${letter.number.toString().padStart(3, "0")}`;
    return (
      letterNumber.toLowerCase().includes(query) ||
      letter.title.toLowerCase().includes(query) ||
      letter.body.toLowerCase().includes(query) ||
      (letter.adresat ?? "").toLowerCase().includes(query)
    );
  });

  const sortedLetters = [...filteredLetters].sort((a, b) => {
    if (a.year !== b.year) return Number(b.year) - Number(a.year);
    return Number(b.number) - Number(a.number);
  });

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Korespondencja</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading
              ? "Ładowanie..."
              : `${letters.length} ${letters.length === 1 ? "pismo" : "pism"}`}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportPdfModeControl
            onExportAll={handleExportAll}
            onExportSelected={handleExportSelected}
            hasSelection={selectedLetterId !== null}
            isLoading={isLoading}
          />
          <Button onClick={handleAdd} data-ocid="letter.primary_button">
            <Plus className="h-4 w-4 mr-2" />
            Nowe pismo
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj po numerze, adresacie, tytule lub treści..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-ocid="letter.search_input"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Ładowanie pism...</p>
          </CardContent>
        </Card>
      ) : sortedLetters.length === 0 ? (
        <Card data-ocid="letter.empty_state">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "Nie znaleziono pism pasujących do wyszukiwania"
                : "Brak pism do wyświetlenia"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedLetters.map((letter, index) => {
            const letterNumber = `KP-${letter.year}-${letter.number.toString().padStart(3, "0")}`;
            const isSelected = selectedLetterId === letter.uid;
            return (
              <Card
                key={letter.uid.toString()}
                data-ocid={`letter.item.${index + 1}`}
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  setSelectedLetterId(
                    letter.uid === selectedLetterId ? null : letter.uid,
                  );
                  setViewingLetter(letter);
                  setDetailOpen(true);
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono font-semibold text-primary bg-primary/10 px-3 py-1 rounded">
                          {letterNumber}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {letter.year.toString()}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{letter.title}</CardTitle>
                      {letter.adresat && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Adresat:</span>{" "}
                          {letter.adresat}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                    {letter.body}
                  </div>
                  <div
                    className="flex gap-2 pt-2"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(letter)}
                      disabled={updateLetterMutation.isPending}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edytuj
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPDF(letter)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Eksportuj PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(letter)}
                      disabled={deleteLetterMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Usuń
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail wizytówka */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {viewingLetter &&
            (() => {
              const letterNumber = `KP-${viewingLetter.year}-${viewingLetter.number.toString().padStart(3, "0")}`;
              return (
                <>
                  <DialogHeader className="p-0">
                    <div
                      className="px-6 py-5"
                      style={{
                        background: NAVY,
                        borderBottom: `3px solid ${GOLD}`,
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="text-sm font-mono font-semibold px-3 py-1 rounded"
                          style={{ background: GOLD, color: NAVY }}
                        >
                          {letterNumber}
                        </span>
                      </div>
                      <DialogTitle
                        className="text-2xl font-light tracking-tight"
                        style={{
                          fontFamily: "'Fraunces', Georgia, serif",
                          color: "white",
                        }}
                      >
                        {viewingLetter.title}
                      </DialogTitle>
                      {viewingLetter.adresat && (
                        <p className="text-sm mt-2" style={{ color: GOLD }}>
                          Adresat: {viewingLetter.adresat}
                        </p>
                      )}
                    </div>
                  </DialogHeader>
                  <div className="px-6 py-6 space-y-8 max-h-[82vh] overflow-y-auto">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Treść pisma
                      </p>
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {viewingLetter.body}
                      </p>
                    </div>
                  </div>
                  <div
                    className="px-6 py-4 flex gap-3"
                    style={{ borderTop: "1px solid oklch(0.90 0.02 265)" }}
                  >
                    <Button
                      onClick={() => handleEdit(viewingLetter)}
                      style={{ background: GOLD, color: NAVY }}
                      className="hover:opacity-90"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edytuj
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportPDF(viewingLetter)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Eksportuj PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(viewingLetter)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Usuń
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDetailOpen(false)}
                      className="ml-auto"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Zamknij
                    </Button>
                  </div>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      <LetterDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingLetter(null);
        }}
        onSave={handleSave}
        editingLetter={editingLetter}
      />
    </div>
  );
}
