import { useState, useMemo } from 'react';
import { useGetPaginatedBudgetTransactionsByDateRange, useGetAllBudgetTransactionsByYear, useAddBudgetTransaction, useUpdateBudgetTransaction, useDeleteBudgetTransaction } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, Edit, Trash2, Download, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import BudgetDialog from '../components/BudgetDialog';
import { TransactionType } from '../backend';
import type { BudgetTransaction } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { generateParishPDF } from '../lib/pdfGenerator';
import { Skeleton } from '@/components/ui/skeleton';

export default function Budzet() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { startTimestamp, endTimestamp } = useMemo(() => {
    const start = new Date(selectedYear, selectedMonth, 1);
    const end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
    return {
      startTimestamp: BigInt(start.getTime() * 1000000),
      endTimestamp: BigInt(end.getTime() * 1000000),
    };
  }, [selectedMonth, selectedYear]);

  const { data: paginatedData, isLoading: monthlyLoading } = useGetPaginatedBudgetTransactionsByDateRange(
    startTimestamp,
    endTimestamp,
    currentPage,
    pageSize
  );

  const { data: yearlyTransactions = [], isLoading: yearlyLoading } = useGetAllBudgetTransactionsByYear(selectedYear);

  const addTransaction = useAddBudgetTransaction();
  const updateTransaction = useUpdateBudgetTransaction();
  const deleteTransaction = useDeleteBudgetTransaction();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<{ tid: bigint; data: BudgetTransaction } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<bigint | null>(null);

  const transactions = paginatedData?.data || [];
  const totalCount = Number(paginatedData?.totalCount || 0);
  const pageCount = Number(paginatedData?.pageCount || 1);

  // Monthly calculations (from paginated data for selected month)
  const monthlyIncome = transactions
    .filter((t) => t.type === TransactionType.income)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyExpense = transactions
    .filter((t) => t.type === TransactionType.expense)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyBalance = monthlyIncome - monthlyExpense;

  // Yearly calculations (from all transactions for selected year)
  const yearlyIncome = yearlyTransactions
    .filter((t) => t.type === TransactionType.income)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const yearlyExpense = yearlyTransactions
    .filter((t) => t.type === TransactionType.expense)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const yearlyBalance = yearlyIncome - yearlyExpense;

  const handleAdd = () => {
    setEditingTransaction(null);
    setDialogOpen(true);
  };

  const handleEdit = (transaction: BudgetTransaction) => {
    setEditingTransaction({ tid: transaction.uid, data: transaction });
    setDialogOpen(true);
  };

  const handleDeleteClick = (tid: bigint) => {
    setTransactionToDelete(tid);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (transactionToDelete === null) return;

    try {
      await deleteTransaction.mutateAsync(transactionToDelete);
      toast.success('Transakcja została usunięta');
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error: any) {
      toast.error(error?.message || 'Błąd podczas usuwania transakcji');
      console.error(error);
    }
  };

  const handleSave = async (data: BudgetTransaction) => {
    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({ uid: editingTransaction.tid, transaction: data });
        toast.success('Transakcja została zaktualizowana');
      } else {
        await addTransaction.mutateAsync(data);
        toast.success('Transakcja została dodana');
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Błąd podczas zapisywania transakcji');
      console.error(error);
    }
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

  const exportMonthlyReport = async () => {
    toast.info('Generowanie PDF...');
    
    setTimeout(() => {
      const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

      let content = '';
      content += `PODSUMOWANIE FINANSOWE\n\n`;
      content += `Przychody:  ${monthlyIncome.toLocaleString('pl-PL').padStart(15)} zł\n`;
      content += `Wydatki:    ${monthlyExpense.toLocaleString('pl-PL').padStart(15)} zł\n`;
      content += `${'─'.repeat(35)}\n`;
      content += `Saldo:      ${monthlyBalance.toLocaleString('pl-PL').padStart(15)} zł\n\n`;
      content += '═'.repeat(90) + '\n\n';

      content += `SZCZEGÓŁOWA LISTA TRANSAKCJI\n\n`;
      
      if (transactions.length === 0) {
        content += `Brak transakcji w tym okresie.\n`;
      } else {
        transactions.forEach((t, idx) => {
          const date = new Date(Number(t.timestamp) / 1000000);
          const typeLabel = t.type === TransactionType.income ? 'PRZYCHÓD' : 'WYDATEK';
          
          content += `${(idx + 1).toString().padStart(3, ' ')}. ${date.toLocaleDateString('pl-PL')} | ${typeLabel}\n`;
          content += `     Kategoria: ${t.category}\n`;
          content += `     Kwota: ${Number(t.amount).toLocaleString('pl-PL')} zł\n`;
          content += `     Opis: ${t.description}\n`;
          if (t.relatedLocality) {
            content += `     Miejscowość: ${t.relatedLocality}\n`;
          }
          content += `     ID: ${t.uid}\n\n`;
        });
      }

      generateParishPDF({
        title: 'RAPORT MIESIĘCZNY',
        subtitle: monthName.toUpperCase(),
        content,
        footer: 'Raport finansowy wygenerowany automatycznie'
      });

      toast.success('Raport miesięczny został wygenerowany - okno drukowania otworzy się automatycznie');
    }, 100);
  };

  const exportYearlyReport = async () => {
    toast.info('Generowanie PDF...');
    
    setTimeout(() => {
      let content = '';
      content += `PODSUMOWANIE ROCZNE\n\n`;
      content += `Rok: ${selectedYear}\n\n`;
      content += '═'.repeat(90) + '\n\n';

      content += `DANE ZA CAŁY ROK ${selectedYear}\n\n`;
      content += `Przychody:         ${yearlyIncome.toLocaleString('pl-PL').padStart(15)} zł\n`;
      content += `Wydatki:           ${yearlyExpense.toLocaleString('pl-PL').padStart(15)} zł\n`;
      content += `${'─'.repeat(40)}\n`;
      content += `Saldo roczne:      ${yearlyBalance.toLocaleString('pl-PL').padStart(15)} zł\n`;
      content += `Liczba transakcji: ${yearlyTransactions.length.toString().padStart(15)}\n\n`;

      generateParishPDF({
        title: 'RAPORT ROCZNY',
        subtitle: selectedYear.toString(),
        content,
        footer: 'Raport finansowy wygenerowany automatycznie'
      });

      toast.success('Raport roczny został wygenerowany - okno drukowania otworzy się automatycznie');
    }, 100);
  };

  const sortedTransactions = [...transactions].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  const yearOptions = Array.from({ length: 21 }, (_, i) => currentDate.getFullYear() - 10 + i);
  const monthOptions = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budżet Parafii</h1>
          <p className="text-muted-foreground mt-1">
            {monthlyLoading ? 'Ładowanie...' : `${totalCount} transakcji w wybranym miesiącu`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportMonthlyReport} disabled={monthlyLoading}>
            <Download className="h-4 w-4 mr-2" />
            Raport miesięczny
          </Button>
          <Button variant="outline" size="sm" onClick={exportYearlyReport} disabled={yearlyLoading}>
            <Download className="h-4 w-4 mr-2" />
            Raport roczny
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj transakcję
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtruj według okresu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Miesiąc</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => {
                  setSelectedMonth(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Rok</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => {
                  setSelectedYear(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
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
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Podsumowanie miesięczne
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Przychody</span>
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    {monthlyIncome.toLocaleString('pl-PL')} zł
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-muted-foreground">Wydatki</span>
                  </div>
                  <span className="text-lg font-semibold text-red-600">
                    {monthlyExpense.toLocaleString('pl-PL')} zł
                  </span>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Saldo</span>
                    <span className={`text-xl font-bold ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {monthlyBalance.toLocaleString('pl-PL')} zł
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Podsumowanie roczne
            </CardTitle>
          </CardHeader>
          <CardContent>
            {yearlyLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Przychody</span>
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    {yearlyIncome.toLocaleString('pl-PL')} zł
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-muted-foreground">Wydatki</span>
                  </div>
                  <span className="text-lg font-semibold text-red-600">
                    {yearlyExpense.toLocaleString('pl-PL')} zł
                  </span>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Saldo</span>
                    <span className={`text-xl font-bold ${yearlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {yearlyBalance.toLocaleString('pl-PL')} zł
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transakcje</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : sortedTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Brak transakcji w wybranym okresie
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {sortedTransactions.map((transaction) => (
                  <div
                    key={transaction.uid.toString()}
                    className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {transaction.type === TransactionType.income ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium text-sm">
                          {transaction.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(Number(transaction.timestamp) / 1000000).toLocaleDateString('pl-PL')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                      {transaction.relatedLocality && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Miejscowość: {transaction.relatedLocality}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-lg font-semibold ${
                          transaction.type === TransactionType.income ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {Number(transaction.amount).toLocaleString('pl-PL')} zł
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(transaction.uid)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Pokaż</span>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    na stronę (Łącznie: {totalCount})
                  </span>
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
                  <span className="text-sm text-muted-foreground px-2">
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
            </>
          )}
        </CardContent>
      </Card>

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editingTransaction?.data || null}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę transakcję?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Transakcja zostanie trwale usunięta z bazy danych.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
