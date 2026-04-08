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
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Event } from "../backend";
import EventDialog from "../components/EventDialog";
import { ExportPdfModeControl } from "../components/ExportPdfModeControl";
import {
  useDeleteEvent,
  useGetPaginatedEvents,
  useUpdateEvent,
} from "../hooks/useQueries";
import { generateParishPDF, generateSingleEventPDF } from "../lib/pdfGenerator";

const NAVY = "oklch(0.25 0.10 265)";
const GOLD = "oklch(0.75 0.12 80)";

export default function Wydarzenia() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedEventId, setSelectedEventId] = useState<bigint | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: paginatedData, isLoading } = useGetPaginatedEvents(
    currentPage,
    pageSize,
  );
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
    setDetailOpen(false);
  };

  const handleDelete = async (event: Event) => {
    if (!confirm("Czy na pewno chcesz usunąć to wydarzenie?")) return;
    try {
      await deleteEvent.mutateAsync(event.uid);
      toast.success("Wydarzenie zostało usunięte");
      if (selectedEventId === event.uid) setSelectedEventId(null);
      if (viewingEvent?.uid === event.uid) {
        setDetailOpen(false);
        setViewingEvent(null);
      }
    } catch (error) {
      toast.error("Błąd podczas usuwania wydarzenia");
      console.error(error);
    }
  };

  const handleSave = async (data: Event) => {
    try {
      const uid = editingEvent?.uid ?? BigInt(Date.now());
      await updateEvent.mutateAsync({ id: uid, event: { ...data, uid } });
      toast.success(
        editingEvent
          ? "Wydarzenie zostało zaktualizowane"
          : "Wydarzenie zostało dodane",
      );
      setDialogOpen(false);
      setEditingEvent(null);
    } catch (error) {
      toast.error("Błąd podczas zapisywania");
      console.error(error);
    }
  };

  const handleCardClick = (event: Event) => {
    setSelectedEventId(event.uid);
    setViewingEvent(event);
    setDetailOpen(true);
  };

  const handleExportAll = () => {
    if (events.length === 0) {
      toast.error("Brak wydarzeń do wyeksportowania");
      return;
    }
    let content = "WYDARZENIA\n\n";
    content += `Liczba wydarzeń: ${events.length}\n\n`;
    content += `${"─".repeat(90)}\n\n`;
    events.forEach((event, idx) => {
      const eventDate = new Date(Number(event.timestamp) / 1000000);
      const formattedDate = eventDate.toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      content += `${(idx + 1).toString().padStart(3, " ")}. ${event.title}\n`;
      content += `     Data: ${formattedDate}\n`;
      content += `     Opis: ${event.description}\n`;
      if (event.tasks.length > 0) {
        content += `     Zadania: ${event.tasks.length}\n`;
        event.tasks.forEach((task, ti) => {
          content += `       ${ti + 1}. ${task.description}\n`;
        });
      }
      content += "\n";
    });
    generateParishPDF({
      title: "WYDARZENIA",
      content,
      footer: "Dokument wygenerowany automatycznie",
    });
    toast.success("PDF został wygenerowany");
  };

  const handleExportSelected = () => {
    const selectedEvent = events.find((e) => e.uid === selectedEventId);
    if (selectedEvent) {
      generateSingleEventPDF(selectedEvent);
      toast.success("PDF wydarzenia został wygenerowany");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pageCount) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const sortedEvents = [...events].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp),
  );
  const now = Date.now() * 1000000;
  const upcomingEvents = sortedEvents.filter((e) => Number(e.timestamp) > now);
  const pastEvents = sortedEvents.filter((e) => Number(e.timestamp) <= now);

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

  const EventCard = ({
    event,
    past = false,
  }: { event: Event; past?: boolean }) => {
    const isSelected = selectedEventId === event.uid;
    return (
      <Card
        className={`transition-all cursor-pointer ${
          past ? "opacity-75" : "hover:shadow-lg"
        } ${isSelected ? "ring-2 ring-primary" : ""}`}
        onClick={() => handleCardClick(event)}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center gap-2 ${past ? "text-base" : ""}`}
          >
            <Calendar
              className={`${past ? "h-4 w-4 text-muted-foreground" : "h-5 w-5 text-primary"}`}
            />
            {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {new Date(Number(event.timestamp) / 1000000).toLocaleDateString(
              "pl-PL",
              {
                weekday: past ? undefined : "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          </p>
          {!past && <p className="text-sm">{event.description}</p>}
          {!past && event.tasks.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1">Zadania:</p>
              <ul className="text-sm space-y-1">
                {event.tasks.map((task, ti) => (
                  <li
                    key={`task-${ti}-${task.description}`}
                    className="text-muted-foreground"
                  >
                    • {task.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div
            className="flex gap-2 pt-2"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {!past && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(event)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edytuj
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(event)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Usuń
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wydarzenia</h1>
          <p className="text-muted-foreground mt-1">{totalCount} wydarzeń</p>
        </div>
        <div className="flex gap-2">
          <ExportPdfModeControl
            onExportAll={handleExportAll}
            onExportSelected={handleExportSelected}
            hasSelection={selectedEventId !== null}
            isLoading={isLoading}
          />
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
          <Select
            value={pageSize.toString()}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setCurrentPage(1);
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
                <p className="text-muted-foreground">
                  Brak nadchodzących wydarzeń
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <EventCard key={Number(event.uid)} event={event} />
              ))}
            </div>
          )}
        </div>

        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Przeszłe wydarzenia</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pastEvents.slice(0, 6).map((event) => (
                <EventCard key={Number(event.uid)} event={event} past />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail wizytówka */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {viewingEvent && (
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
                    {viewingEvent.title}
                  </DialogTitle>
                  <p className="text-sm mt-2" style={{ color: GOLD }}>
                    {new Date(
                      Number(viewingEvent.timestamp) / 1000000,
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
                {viewingEvent.description && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Opis
                    </p>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {viewingEvent.description}
                    </p>
                  </div>
                )}
                {viewingEvent.tasks.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Zadania ({viewingEvent.tasks.length})
                    </p>
                    <ul className="space-y-2">
                      {viewingEvent.tasks.map((task, ti) => (
                        <li
                          key={`vtask-${ti}-${task.description}`}
                          className="flex gap-2"
                        >
                          <span style={{ color: GOLD }} className="font-bold">
                            {ti + 1}.
                          </span>
                          <span>{task.description}</span>
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
                  onClick={() => handleEdit(viewingEvent)}
                  style={{ background: GOLD, color: NAVY }}
                  className="hover:opacity-90"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(viewingEvent)}
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

      <EventDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingEvent(null);
        }}
        event={editingEvent}
        onSave={handleSave}
      />
    </div>
  );
}
