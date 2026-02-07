import { useState } from 'react';
import { useGetAllParishNotes, useUpdateParishNote, useDeleteParishNote } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import NoteDialog from '../components/NoteDialog';
import type { ParishNote } from '../backend';
import { generateParishPDF } from '../lib/pdfGenerator';

export default function Uwagi() {
  const { data: notesMap = new Map(), isLoading } = useGetAllParishNotes();
  const updateNote = useUpdateParishNote();
  const deleteNote = useDeleteParishNote();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{ id: bigint; data: ParishNote } | null>(null);

  const handleAdd = () => {
    setEditingNote(null);
    setDialogOpen(true);
  };

  const handleEdit = (id: bigint, note: ParishNote) => {
    setEditingNote({ id, data: note });
    setDialogOpen(true);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Czy na pewno chcesz usunąć tę notatkę?')) return;

    try {
      await deleteNote.mutateAsync(id);
      toast.success('Notatka została usunięta');
    } catch (error) {
      toast.error('Błąd podczas usuwania notatki');
      console.error(error);
    }
  };

  const handleSave = async (data: ParishNote) => {
    try {
      if (editingNote) {
        // Use existing ID for update
        await updateNote.mutateAsync({ id: editingNote.id, note: data });
        toast.success('Notatka została zaktualizowana');
      } else {
        // For new entries, use timestamp as ID
        const newId = data.timestamp;
        await updateNote.mutateAsync({ id: newId, note: data });
        toast.success('Notatka została dodana');
      }
      setDialogOpen(false);
      setEditingNote(null);
    } catch (error) {
      toast.error('Błąd podczas zapisywania');
      console.error(error);
    }
  };

  const exportNotesPDF = () => {
    const sortedNotes = Array.from(notesMap.entries())
      .sort((a, b) => Number(b[1].timestamp) - Number(a[1].timestamp));
    
    let content = '';
    content += `LICZBA NOTATEK: ${notesMap.size}\n\n`;
    content += '─'.repeat(90) + '\n\n';

    if (sortedNotes.length === 0) {
      content += `Brak notatek do wyświetlenia.\n`;
    } else {
      sortedNotes.forEach(([id, note], idx) => {
        const date = new Date(Number(note.timestamp) / 1000000);
        const dateStr = date.toLocaleDateString('pl-PL', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        content += `${(idx + 1).toString().padStart(3, ' ')}. ${note.title}\n`;
        content += `     Data: ${dateStr}\n\n`;
        
        // Format content with proper indentation
        const lines = note.content.split('\n');
        lines.forEach(line => {
          content += `     ${line}\n`;
        });
        
        content += '\n' + '─'.repeat(90) + '\n\n';
      });
    }

    generateParishPDF({
      title: 'NOTATKI PARAFIALNE',
      content,
      footer: 'Dziennik parafialny wygenerowany automatycznie'
    });

    toast.success('Notatki zostały wygenerowane - okno drukowania otworzy się automatycznie');
  };

  const sortedNotes = Array.from(notesMap.entries())
    .sort((a, b) => Number(b[1].timestamp) - Number(a[1].timestamp));

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
          <p className="text-muted-foreground mt-1">{notesMap.size} notatek</p>
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
            <p className="text-muted-foreground">Brak notatek do wyświetlenia</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sortedNotes.map(([id, note]) => (
            <Card key={id.toString()} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{note.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(Number(note.timestamp) / 1000000).toLocaleDateString('pl-PL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(id, note)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edytuj
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(id)}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Usuń
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NoteDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingNote(null);
          }
        }}
        note={editingNote?.data || null}
        onSave={handleSave}
      />
    </div>
  );
}
