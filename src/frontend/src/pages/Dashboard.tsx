import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type AnniversaryType, TransactionType } from "../backend";
import {
  useGetAllBudgetTransactionsByYear,
  useGetAllParishioners,
  useGetAnniversariesForYearPaginated,
  useGetAnniversariesForYearPdfExport,
  useGetOverallBudgetBalance,
  useGetPaginatedEvents,
} from "../hooks/useQueries";
import { generateParishPDF } from "../lib/pdfGenerator";
import { getAnniversaryLabel } from "../utils/anniversaries";

type AnniversaryFilterType = "all" | AnniversaryType;

export default function Dashboard() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [anniversariesPage, setAnniversariesPage] = useState(1);
  const [anniversaryFilter, setAnniversaryFilter] =
    useState<AnniversaryFilterType>("all");
  const anniversariesPageSize = 10;

  const { data: parishioners = [], isLoading: parishionersLoading } =
    useGetAllParishioners();
  const { data: transactions = [], isLoading: transactionsLoading } =
    useGetAllBudgetTransactionsByYear(currentYear);
  const { data: balanceFromBackend = BigInt(0), isLoading: balanceLoading } =
    useGetOverallBudgetBalance();
  const { data: eventsData, isLoading: eventsLoading } = useGetPaginatedEvents(
    1,
    100,
  );

  const anniversaryTypeFilter =
    anniversaryFilter === "all" ? undefined : anniversaryFilter;

  const { data: anniversariesData, isLoading: anniversariesLoading } =
    useGetAnniversariesForYearPaginated({
      year: BigInt(selectedYear),
      anniversaryType: anniversaryTypeFilter,
      page: BigInt(anniversariesPage),
      pageSize: BigInt(anniversariesPageSize),
    });

  const { data: pdfExportData } = useGetAnniversariesForYearPdfExport({
    year: BigInt(selectedYear),
    anniversaryType: anniversaryTypeFilter,
  });

  // Calculate income and expense totals from ALL transactions without any exclusions
  const totalIncome = transactions
    .filter((t) => t.type === TransactionType.income)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === TransactionType.expense)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Use backend-calculated balance for guaranteed accuracy
  const balance = Number(balanceFromBackend);

  const events = eventsData?.data || [];
  const upcomingEvents = events
    .filter((e) => Number(e.timestamp) > Date.now() * 1000000)
    .slice(0, 5);

  // Count parishioners including family members with their sacramental data
  const totalFamilyMembers = parishioners.reduce(
    (sum, p) => sum + p.family.length,
    0,
  );
  const totalParishionerCount = parishioners.length + totalFamilyMembers;

  // Count sacraments from both main parishioners and family members
  const sacramentCounts = {
    baptism:
      parishioners.filter((p) => p.sacraments.baptismYear).length +
      parishioners.reduce(
        (sum, p) =>
          sum + p.family.filter((f) => f.sacraments.baptismYear).length,
        0,
      ),
    communion:
      parishioners.filter((p) => p.sacraments.communionYear).length +
      parishioners.reduce(
        (sum, p) =>
          sum + p.family.filter((f) => f.sacraments.communionYear).length,
        0,
      ),
    confirmation:
      parishioners.filter((p) => p.sacraments.confirmationYear).length +
      parishioners.reduce(
        (sum, p) =>
          sum + p.family.filter((f) => f.sacraments.confirmationYear).length,
        0,
      ),
    marriage:
      parishioners.filter((p) => p.sacraments.marriageYear).length +
      parishioners.reduce(
        (sum, p) =>
          sum + p.family.filter((f) => f.sacraments.marriageYear).length,
        0,
      ),
  };

  const anniversaries = anniversariesData?.data || [];
  const anniversariesTotalCount = Number(anniversariesData?.totalCount || 0);
  const anniversariesPageCount = Number(anniversariesData?.pageCount || 1);

  const handleAnniversariesPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= anniversariesPageCount) {
      setAnniversariesPage(newPage);
    }
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(Number(value));
    setAnniversariesPage(1);
  };

  const handleFilterChange = (value: string) => {
    setAnniversaryFilter(value as AnniversaryFilterType);
    setAnniversariesPage(1);
  };

  const exportAnniversariesPDF = async () => {
    if (!pdfExportData) {
      toast.error("Brak danych do eksportu");
      return;
    }

    toast.info("Generowanie PDF...");

    try {
      const filterLabel =
        anniversaryFilter === "all"
          ? "Wszystkie"
          : getAnniversaryLabel(anniversaryFilter as AnniversaryType);

      let content = `ROCZNICE W ROKU ${selectedYear}\n`;
      content += `Filtr: ${filterLabel}\n`;
      content += `${"=".repeat(90)}\n\n`;
      content += `Łączna liczba rocznic: ${pdfExportData.anniversaries.length}\n\n`;
      content += `${"─".repeat(90)}\n\n`;

      pdfExportData.anniversaries.forEach((anniversary, idx) => {
        const label = getAnniversaryLabel(anniversary.anniversaryType);
        content += `${(idx + 1).toString().padStart(3, " ")}. ${anniversary.firstName} ${anniversary.lastName}\n`;
        content += `     ${label}: ${Number(anniversary.eventYear)} → ${Number(anniversary.anniversaryNumber)}. rocznica\n`;
        if (anniversary.address) {
          content += `     Adres: ${anniversary.address}\n`;
        }
        content += "\n";
      });

      generateParishPDF({
        title: `Rocznice w roku ${selectedYear}`,
        subtitle: `Lista rocznic sakramentalnych - ${filterLabel}`,
        content,
        footer: "Dokument wygenerowany automatycznie",
      });

      toast.success(
        "PDF został wygenerowany - okno drukowania otworzy się automatycznie",
      );
    } catch (error) {
      console.error("Error exporting anniversaries:", error);
      toast.error("Błąd podczas generowania PDF");
    }
  };

  // Generate year options (current year ± 10 years)
  const yearOptions = Array.from(
    { length: 21 },
    (_, i) => currentYear - 10 + i,
  );

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Przegląd parafii</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Parafianie</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {parishionersLoading ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {totalParishionerCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {parishioners.length} zarejestrowanych + {totalFamilyMembers}{" "}
                  członków rodzin
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo budżetu</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balanceLoading || transactionsLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div
                  className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {balance.toLocaleString("pl-PL")} zł
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Przychody: {totalIncome.toLocaleString("pl-PL")} zł | Wydatki:{" "}
                  {totalExpense.toLocaleString("pl-PL")} zł
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wydarzenia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {upcomingEvents.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Nadchodzące wydarzenia
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sakramenty</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {parishionersLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {sacramentCounts.baptism}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Chrztów w bazie
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nadchodzące wydarzenia</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                  >
                    <Skeleton className="h-5 w-5 rounded mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Brak nadchodzących wydarzeń
              </p>
            ) : (
              <ul className="space-y-3">
                {upcomingEvents.map((event) => (
                  <li
                    key={event.uid.toString()}
                    className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                  >
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          Number(event.timestamp) / 1000000,
                        ).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statystyki sakramentów</CardTitle>
          </CardHeader>
          <CardContent>
            {parishionersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Chrzty</span>
                  <span className="text-sm font-medium">
                    {sacramentCounts.baptism}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Komunia Święta
                  </span>
                  <span className="text-sm font-medium">
                    {sacramentCounts.communion}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Bierzmowanie
                  </span>
                  <span className="text-sm font-medium">
                    {sacramentCounts.confirmation}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Małżeństwa
                  </span>
                  <span className="text-sm font-medium">
                    {sacramentCounts.marriage}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Anniversaries Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <CardTitle>Rocznice w tym roku</CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={anniversaryFilter}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="baptism">Chrzest</SelectItem>
                <SelectItem value="marriage">Małżeństwo</SelectItem>
                <SelectItem value="funeral">Pogrzeb</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAnniversariesPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Eksportuj PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {anniversariesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                >
                  <Skeleton className="h-5 w-5 rounded mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : anniversaries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Brak rocznic w roku {selectedYear}
              {anniversaryFilter !== "all" &&
                ` (${getAnniversaryLabel(anniversaryFilter as AnniversaryType)})`}
            </p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {anniversaries.map((anniversary) => {
                  const label = getAnniversaryLabel(
                    anniversary.anniversaryType,
                  );
                  return (
                    <div
                      key={`${anniversary.parishionerId}-${anniversary.anniversaryType}`}
                      className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                    >
                      <CalendarDays className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">
                          {anniversary.firstName} {anniversary.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {label}: {Number(anniversary.eventYear)} →{" "}
                          {Number(anniversary.anniversaryNumber)}. rocznica
                        </p>
                        {anniversary.address && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {anniversary.address}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Łącznie: {anniversariesTotalCount} rocznic
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleAnniversariesPageChange(anniversariesPage - 1)
                    }
                    disabled={anniversariesPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    {anniversariesPage} / {anniversariesPageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleAnniversariesPageChange(anniversariesPage + 1)
                    }
                    disabled={anniversariesPage === anniversariesPageCount}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
