import { useState } from 'react';
import { useGetPaginatedStatisticEntries, useUpdateStatisticEntry, useDeleteStatisticEntry, useGetAllParishioners } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import StatisticDialog from '../components/StatisticDialog';
import type { StatisticEntry } from '../backend';
import { generateParishPDF } from '../lib/pdfGenerator';

export default function Statystyki() {
  const { data: statisticsData, isLoading } = useGetPaginatedStatisticEntries(1, 1000);
  const { data: parishioners = [] } = useGetAllParishioners();
  const updateStatistic = useUpdateStatisticEntry();
  const deleteStatistic = useDeleteStatisticEntry();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStatistic, setEditingStatistic] = useState<{ id: bigint; data: StatisticEntry } | null>(null);

  const statistics = statisticsData?.data || [];

  const totalFamilyMembers = parishioners.reduce((sum, p) => sum + p.family.length, 0);
  const totalParishionerCount = parishioners.length + totalFamilyMembers;

  // Count sacraments from both main parishioners and family members
  const sacramentCounts = {
    baptism: parishioners.filter((p) => p.sacraments.baptismYear).length +
      parishioners.reduce((sum, p) => sum + p.family.filter(f => f.sacraments.baptismYear).length, 0),
    communion: parishioners.filter((p) => p.sacraments.communionYear).length +
      parishioners.reduce((sum, p) => sum + p.family.filter(f => f.sacraments.communionYear).length, 0),
    confirmation: parishioners.filter((p) => p.sacraments.confirmationYear).length +
      parishioners.reduce((sum, p) => sum + p.family.filter(f => f.sacraments.confirmationYear).length, 0),
    marriage: parishioners.filter((p) => p.sacraments.marriageYear).length +
      parishioners.reduce((sum, p) => sum + p.family.filter(f => f.sacraments.marriageYear).length, 0),
    funeral: parishioners.filter((p) => p.sacraments.funeralYear).length +
      parishioners.reduce((sum, p) => sum + p.family.filter(f => f.sacraments.funeralYear).length, 0),
  };

  const handleAdd = () => {
    setEditingStatistic(null);
    setDialogOpen(true);
  };

  const handleEdit = (statistic: StatisticEntry) => {
    setEditingStatistic({ id: statistic.timestamp, data: statistic });
    setDialogOpen(true);
  };

  const handleDelete = async (statistic: StatisticEntry) => {
    if (!confirm('Czy na pewno chcesz usunąć ten wpis?')) return;

    try {
      await deleteStatistic.mutateAsync(statistic.timestamp);
      toast.success('Wpis został usunięty');
    } catch (error) {
      toast.error('Błąd podczas usuwania wpisu');
      console.error(error);
    }
  };

  const handleSave = async (data: StatisticEntry) => {
    try {
      if (editingStatistic) {
        // Use existing ID for update
        await updateStatistic.mutateAsync({ id: editingStatistic.id, entry: data });
        toast.success('Wpis został zaktualizowany');
      } else {
        // For new entries, use timestamp as ID
        const newId = data.timestamp;
        await updateStatistic.mutateAsync({ id: newId, entry: data });
        toast.success('Wpis został dodany');
      }
      setDialogOpen(false);
      setEditingStatistic(null);
    } catch (error) {
      toast.error('Błąd podczas zapisywania');
      console.error(error);
    }
  };

  const exportStatisticsPDF = () => {
    let content = '';
    
    content += `LICZBA PARAFIAN\n\n`;
    content += `Łącznie:              ${totalParishionerCount.toString().padStart(10)}\n`;
    content += `Zarejestrowanych:     ${parishioners.length.toString().padStart(10)}\n`;
    content += `Członków rodzin:      ${totalFamilyMembers.toString().padStart(10)}\n\n`;
    content += '═'.repeat(90) + '\n\n';

    content += `STATYSTYKI SAKRAMENTÓW (OGÓŁEM)\n\n`;
    content += `Chrzty:               ${sacramentCounts.baptism.toString().padStart(10)}\n`;
    content += `Komunia Święta:       ${sacramentCounts.communion.toString().padStart(10)}\n`;
    content += `Bierzmowanie:         ${sacramentCounts.confirmation.toString().padStart(10)}\n`;
    content += `Małżeństwa:           ${sacramentCounts.marriage.toString().padStart(10)}\n`;
    content += `Pogrzeby:             ${sacramentCounts.funeral.toString().padStart(10)}\n\n`;
    content += '─'.repeat(90) + '\n\n';

    if (statistics.length > 0) {
      content += `FREKWENCJA NIEDZIELNA\n\n`;
      const sortedStats = [...statistics].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      sortedStats.forEach((stat) => {
        const date = new Date(Number(stat.timestamp) / 1000000);
        content += `${date.toLocaleDateString('pl-PL').padEnd(15)}: `;
        content += `Frekwencja: ${Number(stat.sundayAttendance).toString().padStart(6)}  `;
        content += `Komunia: ${Number(stat.communionCount).toString().padStart(6)}\n`;
      });
    }

    generateParishPDF({
      title: 'RAPORT STATYSTYCZNY',
      content,
      footer: 'Raport statystyczny wygenerowany automatycznie'
    });

    toast.success('Raport statystyczny został wygenerowany - okno drukowania otworzy się automatycznie');
  };

  const sortedStatistics = [...statistics].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

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
          <h1 className="text-3xl font-bold text-foreground">Statystyki</h1>
          <p className="text-muted-foreground mt-1">Dane statystyczne parafii</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportStatisticsPDF}>
            <Download className="h-4 w-4 mr-2" />
            Eksportuj PDF
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj wpis
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Liczba parafian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Łącznie</span>
              <span className="text-lg font-bold">{totalParishionerCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Zarejestrowanych</span>
              <span className="text-sm font-medium">{parishioners.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Członków rodzin</span>
              <span className="text-sm font-medium">{totalFamilyMembers}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statystyki sakramentów (ogółem)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Chrzty</span>
              <span className="text-sm font-medium">{sacramentCounts.baptism}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Komunia Święta</span>
              <span className="text-sm font-medium">{sacramentCounts.communion}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bierzmowanie</span>
              <span className="text-sm font-medium">{sacramentCounts.confirmation}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Małżeństwa</span>
              <span className="text-sm font-medium">{sacramentCounts.marriage}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pogrzeby</span>
              <span className="text-sm font-medium">{sacramentCounts.funeral}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Frekwencja niedzielna</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedStatistics.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak wpisów statystycznych</p>
            ) : (
              <div className="space-y-3">
                {sortedStatistics.slice(0, 3).map((stat) => (
                  <div key={stat.timestamp.toString()} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(Number(stat.timestamp) / 1000000).toLocaleDateString('pl-PL')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Frekwencja: {Number(stat.sundayAttendance)} | Komunia: {Number(stat.communionCount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wszystkie wpisy statystyczne</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sortedStatistics.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Brak wpisów do wyświetlenia</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Data</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Frekwencja</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Komunia</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStatistics.map((stat) => (
                    <tr key={stat.timestamp.toString()} className="border-b border-border hover:bg-muted/30">
                      <td className="p-4 text-sm">
                        {new Date(Number(stat.timestamp) / 1000000).toLocaleDateString('pl-PL')}
                      </td>
                      <td className="p-4 text-sm">{Number(stat.sundayAttendance)}</td>
                      <td className="p-4 text-sm">{Number(stat.communionCount)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(stat)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(stat)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <StatisticDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        statistic={editingStatistic?.data || null}
        onSave={handleSave}
      />
    </div>
  );
}
