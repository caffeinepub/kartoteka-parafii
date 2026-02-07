import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Download, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import LetterDialog from '../components/LetterDialog';
import { generateLetterPDF } from '../lib/pdfGenerator';
import { useGetAllLetters, useAddLetter, useUpdateLetter, useDeleteLetter } from '../hooks/useQueries';
import type { Letter } from '../backend';

export default function Korespondencja() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch letters from backend
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
  };

  const handleDelete = async (letter: Letter) => {
    const letterNumber = `KP-${letter.year}-${letter.number.toString().padStart(3, '0')}`;
    if (!confirm(`Czy na pewno chcesz usunąć pismo ${letterNumber}?`)) return;

    try {
      await deleteLetterMutation.mutateAsync(letter.uid);
      toast.success('Pismo zostało usunięte');
    } catch (error) {
      toast.error('Błąd podczas usuwania pisma');
      console.error(error);
    }
  };

  const handleSave = async (data: { title: string; body: string }) => {
    try {
      if (editingLetter) {
        // Update existing letter
        await updateLetterMutation.mutateAsync({
          uid: editingLetter.uid,
          title: data.title,
          body: data.body,
        });
        toast.success('Pismo zostało zaktualizowane');
      } else {
        // Create new letter
        await addLetterMutation.mutateAsync(data);
        toast.success('Pismo zostało utworzone');
      }
      
      setDialogOpen(false);
      setEditingLetter(null);
    } catch (error) {
      toast.error(editingLetter ? 'Błąd podczas aktualizacji' : 'Błąd podczas zapisywania');
      console.error(error);
    }
  };

  const handleExportPDF = (letter: Letter) => {
    const letterNumber = `KP-${letter.year}-${letter.number.toString().padStart(3, '0')}`;
    const letterForPDF = {
      uid: letter.uid,
      number: letterNumber,
      title: letter.title,
      body: letter.body,
      timestamp: letter.date || BigInt(0), // Use date field for timestamp
    };
    generateLetterPDF(letterForPDF);
    toast.success('PDF został wygenerowany - okno drukowania otworzy się automatycznie');
  };

  // Filter letters based on search query
  const filteredLetters = letters.filter(letter => {
    const query = searchQuery.toLowerCase();
    const letterNumber = `KP-${letter.year}-${letter.number.toString().padStart(3, '0')}`;
    return (
      letterNumber.toLowerCase().includes(query) ||
      letter.title.toLowerCase().includes(query) ||
      letter.body.toLowerCase().includes(query)
    );
  });

  // Sort by year and number (newest first)
  const sortedLetters = [...filteredLetters].sort((a, b) => {
    if (a.year !== b.year) {
      return Number(b.year) - Number(a.year);
    }
    return Number(b.number) - Number(a.number);
  });

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Korespondencja</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading ? 'Ładowanie...' : `${letters.length} ${letters.length === 1 ? 'pismo' : 'pism'}`}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Nowe pismo
        </Button>
      </header>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj po numerze, tytule lub treści..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Letters List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Ładowanie pism...</p>
          </CardContent>
        </Card>
      ) : sortedLetters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'Nie znaleziono pism pasujących do wyszukiwania' : 'Brak pism do wyświetlenia'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedLetters.map((letter) => {
            const letterNumber = `KP-${letter.year}-${letter.number.toString().padStart(3, '0')}`;
            return (
              <Card key={letter.uid.toString()} className="hover:shadow-lg transition-shadow">
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
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                    {letter.body}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(letter)}
                      disabled={updateLetterMutation.isPending}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edytuj
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportPDF(letter)}>
                      <Download className="h-3 w-3 mr-1" />
                      Eksportuj do PDF (druk)
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

      <LetterDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingLetter(null);
          }
        }}
        onSave={handleSave}
        editingLetter={editingLetter}
      />
    </div>
  );
}
