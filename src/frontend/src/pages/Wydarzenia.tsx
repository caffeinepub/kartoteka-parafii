import { useState } from 'react';
import { useGetPaginatedEvents, useUpdateEvent, useDeleteEvent } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Edit, Trash2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import EventDialog from '../components/EventDialog';
import { generateEventsPDF } from '../lib/pdfGenerator';
import type { Event } from '../backend';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Wydarzenia() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const { data: paginatedData, isLoading } = useGetPaginatedEvents(currentPage, pageSize);
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const events = paginatedData?.data || [];
  const totalCount = Number(paginatedData?.totalCount || 0);
  const pageCount = Number(paginatedData?.pageCount || 1);

  const handleAdd = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleDelete = async (event: Event) => {
    if (!confirm('Czy na pewno chcesz usunąć to wydarzenie?')) return;

    try {
      await deleteEvent.mutateAsync(event.uid);
      toast.success('Wydarzenie zostało usunięte');
    } catch (error) {
      toast.error('Błąd podczas usuwania wydarzenia');
      console.error(error);
    }
  };

  const handleSave = async (data: Event) => {
    try {
      const uid = editingEvent?.uid ?? BigInt(Date.now());
      await updateEvent.mutateAsync({ id: uid, event: { ...data, uid } });
      toast.success(editingEvent ? 'Wydarzenie zostało zaktualizowane' : 'Wydarzenie zostało dodane');
      setDialogOpen(false);
      setEditingEvent(null);
    } catch (error) {
      toast.error('Błąd podczas zapisywania');
      console.error(error);
    }
  };

  const handleExportPDF = async () => {
    if (events.length === 0) {
      toast.error('Brak wydarzeń do wyeksportowania');
      return;
    }
    
    toast.info('Generowanie PDF...');
    
    setTimeout(() => {
      try {
        generateEventsPDF(events);
        toast.success('PDF został wygenerowany - okno drukowania otworzy się automatycznie');
      } catch (error) {
        toast.error('Błąd podczas generowania PDF');
        console.error(error);
      }
    }, 100);
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

  const sortedEvents = [...events].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
  const upcomingEvents = sortedEvents.filter((e) => Number(e.timestamp) > Date.now() * 1000000);
  const pastEvents = sortedEvents.filter((e) => Number(e.timestamp) <= Date.now() * 1000000);

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
          <h1 className="text-3xl font-bold text-foreground">Wydarzenia</h1>
          <p className="text-muted-foreground mt-1">{totalCount} wydarzeń</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Eksportuj PDF
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj wydarzenie
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

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Nadchodzące wydarzenia</h2>
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Brak nadchodzących wydarzeń</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <Card key={Number(event.uid)} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {new Date(Number(event.timestamp) / 1000000).toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm">{event.description}</p>
                    {event.tasks.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Zadania:</p>
                        <ul className="text-sm space-y-1">
                          {event.tasks.map((task, taskIdx) => (
                            <li key={taskIdx} className="text-muted-foreground">
                              • {task.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edytuj
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(event)}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Usuń
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Przeszłe wydarzenia</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pastEvents.slice(0, 6).map((event) => (
                <Card key={Number(event.uid)} className="opacity-75">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {new Date(Number(event.timestamp) / 1000000).toLocaleDateString('pl-PL')}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(event)}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Usuń
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingEvent(null);
          }
        }}
        event={editingEvent}
        onSave={handleSave}
      />
    </div>
  );
}
