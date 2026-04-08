import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Edit, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ParishNote } from "../backend";
import NoteDialog from "../components/NoteDialog";
import {
  useDeleteParishNote,
  useGetPaginatedParishNotes,
  useUpdateParishNote,
} from "../hooks/useQueries";
import { generateParishPDF } from "../lib/pdfGenerator";

const NAVY = "oklch(0.25 0.10 265)";
const GOLD = "oklch(0.75 0.12 80)";

export default function Uwagi() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const { data: notesData, isLoading } = useGetPaginatedParishNotes(
    currentPage,
    pageSize,
  );
  const updateNote = useUpdateParishNote();
  const deleteNote = useDeleteParishNote();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{
    id: bigint;
    data: ParishNote;
  } | null>(null);
  const [viewingNote, setViewingNote] = useState<ParishNote | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const notes = notesData?.data || [];
  const totalCount = Number(notesData?.totalCount || 0);
  const pageCount = Number(notesData?.pageCount || 1);

  const handleAdd = () => {
    setEditingNote(null);
    setDialogOpen(true);
  };

  const handleEdit = (note: ParishNote) => {
    setEditingNote({ id: note.timestamp, data: note });
    setDialogOpen(true);
    setDetailOpen(false);
  };

  const handleDelete = async (note: ParishNote) => {
    if (!confirm("Czy na pewno chcesz usunąć tę notatkę?")) return;
    try {
      await deleteNote.mutateAsync(note.timestamp);
      toast.success("Notatka została usunięta");
      if (viewingNote?.timestamp === note.timestamp) {
        setDetailOpen(false);
        setViewingNote(null);
      }
    } catch (error) {
      toast.error("Błąd podczas usuwania notatki");
      console.error(error);
    }
  };

  const handleSave = async (data: ParishNote) => {
    try {
      if (editingNote) {
        await updateNote.mutateAsync({ id: editingNote.id, note: data });
        toast.success("Notatka została zaktualizowana");
      } else {
        const newId = data.timestamp;
        await updateNote.mutateAsync({ id: newId, note: data });
        toast.success("Notatka została dodana");
      }
      setDialogOpen(false);
      setEditingNote(null);
    } catch (error) {
      toast.error("Błąd podczas zapisywania");
      console.error(error);
    }
  };

  const handleCardClick = (note: ParishNote) => {
    setViewingNote(note);
    setDetailOpen(true);
  };

  const exportNotesPDF = async () => {
    toast.info("Generowanie PDF...");
    setTimeout(() => {
      const sortedNotes = [...notes].sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      );
      let content = "NOTATKI PARAFIALNE\n\n";
      content += `Łączna liczba notatek: ${totalCount}\n\n`;
      content += `${"═".repeat(90)}\n\n`;
      sortedNotes.forEach((note, idx) => {
        const date = new Date(Number(note.timestamp) / 1000000);
        content += `${(idx + 1).toString().padStart(3, " ")}. ${note.title}\n`;
        content += `     Data: ${date.toLocaleDateString("pl-PL")}\n`;
        content += `     Treść: ${note.content}\n\n`;
      });
      generateParishPDF({
        title: "NOTATKI PARAFIALNE",
        content,
        footer: "Dokument wygenerowany automatycznie",
      });
      toast.success("PDF został wygenerowany");
    }, 100);
  };

  const sortedNotes = [...notes].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

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
          <h1 className="text-3xl font-bold text-foreground">Uwagi</h1>
          <p className="text-muted-foreground mt-1">
            {totalCount} {totalCount === 1 ? "notatka" : "notatek"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportNotesPDF}>
            <Download className="h-4 w-4 mr-2" />
            Eksportuj PDF
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj notatkę
          </Button>
        </div>
      </header>

      {sortedNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Brak notatek do wyświetlenia
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedNotes.map((note) => (
            <Card
              key={note.timestamp.toString()}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCardClick(note)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <div
                    className="flex gap-1"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(note)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(
                    Number(note.timestamp) / 1000000,
                  ).toLocaleDateString("pl-PL")}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {note.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Poprzednia
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Strona {currentPage} z {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
            disabled={currentPage === pageCount}
          >
            Następna
          </Button>
        </div>
      )}

      {/* Detail wizytówka */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {viewingNote && (
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
                    {viewingNote.title}
                  </DialogTitle>
                  <p className="text-sm mt-2" style={{ color: GOLD }}>
                    {new Date(
                      Number(viewingNote.timestamp) / 1000000,
                    ).toLocaleDateString("pl-PL", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </DialogHeader>
              <div className="px-6 py-6 space-y-8 max-h-[82vh] overflow-y-auto">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Treść notatki
                  </p>
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {viewingNote.content}
                  </p>
                </div>
              </div>
              <div
                className="px-6 py-4 flex gap-3"
                style={{ borderTop: "1px solid oklch(0.90 0.02 265)" }}
              >
                <Button
                  onClick={() => handleEdit(viewingNote)}
                  style={{ background: GOLD, color: NAVY }}
                  className="hover:opacity-90"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(viewingNote)}
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
          )}
        </DialogContent>
      </Dialog>

      <NoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        note={editingNote?.data || null}
        onSave={handleSave}
      />
    </div>
  );
}
