import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type BaptismRecord, BaptismRecordSortMode } from "../backend";
import BaptismDetailCard from "../components/BaptismDetailCard";
import BaptismRecordDialog from "../components/BaptismRecordDialog";
import { ExportPdfModeControl } from "../components/ExportPdfModeControl";
import {
  useDeleteBaptismRecord,
  useGetBaptismRegistry,
} from "../hooks/useQueries";
import {
  generateBaptismCertificatePDF,
  generateBaptismRegistryListPDF,
} from "../lib/pdfGenerator";
import { formatBaptismDate } from "../utils/baptismRecord";

export default function BaptismsRegistry() {
  const [page, setPage] = useState(1);
  const [pageSize, _setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<BaptismRecordSortMode>(
    BaptismRecordSortMode.newestFirst,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BaptismRecord | null>(
    null,
  );
  const [selectedRecordId, setSelectedRecordId] = useState<bigint | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<BaptismRecord | null>(
    null,
  );

  const { data: registryData, isLoading } = useGetBaptismRegistry(
    page,
    pageSize,
    search,
    sortMode,
  );
  const deleteRecord = useDeleteBaptismRecord();

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortMode(value as BaptismRecordSortMode);
    setPage(1);
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const handleEdit = (record: BaptismRecord) => {
    setEditingRecord(record);
    setDialogOpen(true);
    setDetailViewOpen(false);
  };

  const handleDelete = async (record: BaptismRecord) => {
    if (
      !confirm(
        `Czy na pewno chcesz usunąć akt chrztu: ${record.personFullName}?`,
      )
    )
      return;

    try {
      await deleteRecord.mutateAsync(record.id);
      toast.success("Akt chrztu został usunięty");
      if (selectedRecordId === record.id) {
        setSelectedRecordId(null);
      }
      if (viewingRecord?.id === record.id) {
        setDetailViewOpen(false);
        setViewingRecord(null);
      }
    } catch (error) {
      toast.error("Błąd podczas usuwania aktu chrztu");
      console.error(error);
    }
  };

  const handleViewDetails = (record: BaptismRecord) => {
    setViewingRecord(record);
    setDetailViewOpen(true);
    setSelectedRecordId(record.id);
  };

  const handleExportPDF = (record: BaptismRecord) => {
    generateBaptismCertificatePDF(record);
    toast.success("Świadectwo chrztu zostało wygenerowane");
  };

  const handleExportAll = () => {
    const records = registryData?.data || [];
    generateBaptismRegistryListPDF(records);
    toast.success("Lista aktów chrztu została wygenerowana");
  };

  const handleExportSelected = () => {
    const records = registryData?.data || [];
    const selectedRecord = records.find((r) => r.id === selectedRecordId);
    if (selectedRecord) {
      generateBaptismCertificatePDF(selectedRecord);
      toast.success("Świadectwo chrztu zostało wygenerowane");
    }
  };

  const totalPages = Number(registryData?.pageCount || 1);
  const records = registryData?.data || [];

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Księga Chrztów</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading
              ? "Ładowanie..."
              : `${registryData?.totalCount || 0} aktów`}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportPdfModeControl
            onExportAll={handleExportAll}
            onExportSelected={handleExportSelected}
            hasSelection={selectedRecordId !== null}
            isLoading={isLoading}
          />
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nowy akt chrztu
          </Button>
        </div>
      </header>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po imieniu i nazwisku..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortMode} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sortowanie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BaptismRecordSortMode.newestFirst}>
              Najnowsze
            </SelectItem>
            <SelectItem value={BaptismRecordSortMode.oldestFirst}>
              Najstarsze
            </SelectItem>
            <SelectItem value={BaptismRecordSortMode.alphabetical}>
              Alfabetycznie
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numer aktu</TableHead>
              <TableHead>Imię i nazwisko</TableHead>
              <TableHead>Data chrztu</TableHead>
              <TableHead>Miejsce chrztu</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              (["sk1", "sk2", "sk3", "sk4", "sk5"] as const).map((sk) => (
                <TableRow key={sk}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {search
                    ? "Nie znaleziono aktów pasujących do wyszukiwania"
                    : "Brak aktów chrztu"}
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow
                  key={record.id.toString()}
                  onClick={() => handleViewDetails(record)}
                  className={`cursor-pointer transition-colors ${
                    selectedRecordId === record.id
                      ? "bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <TableCell className="font-medium">
                    {record.actNumber}
                  </TableCell>
                  <TableCell>{record.personFullName}</TableCell>
                  <TableCell>{formatBaptismDate(record.baptismDate)}</TableCell>
                  <TableCell>{record.baptismPlace}</TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(record)}
                        title="Edytuj"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(record)}
                        disabled={deleteRecord.isPending}
                        title="Usuń"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && records.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Strona {page} z {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Poprzednia
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Następna
            </Button>
          </div>
        </div>
      )}

      {/* Detail View Dialog */}
      <Dialog open={detailViewOpen} onOpenChange={setDetailViewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Akt Chrztu</DialogTitle>
          </DialogHeader>
          {viewingRecord && (
            <BaptismDetailCard
              record={viewingRecord}
              onEdit={() => handleEdit(viewingRecord)}
              onDownloadPdf={() => handleExportPDF(viewingRecord)}
            />
          )}
        </DialogContent>
      </Dialog>

      <BaptismRecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={editingRecord}
      />
    </div>
  );
}
