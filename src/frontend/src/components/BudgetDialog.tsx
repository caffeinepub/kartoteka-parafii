import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TransactionType } from '../backend';
import type { BudgetTransaction } from '../backend';

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: BudgetTransaction | null;
  onSave: (data: BudgetTransaction) => void;
}

export default function BudgetDialog({ open, onOpenChange, transaction, onSave }: BudgetDialogProps) {
  const [formData, setFormData] = useState<BudgetTransaction>({
    uid: BigInt(0),
    type: TransactionType.income,
    amount: BigInt(0),
    timestamp: BigInt(Date.now() * 1000000),
    description: '',
    category: '',
    relatedParishioner: undefined,
    relatedLocality: undefined,
  });

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
    } else {
      setFormData({
        uid: BigInt(0),
        type: TransactionType.income,
        amount: BigInt(0),
        timestamp: BigInt(Date.now() * 1000000),
        description: '',
        category: '',
        relatedParishioner: undefined,
        relatedLocality: undefined,
      });
    }
  }, [transaction, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edytuj transakcję' : 'Dodaj transakcję'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Typ *</Label>
            <select
              id="type"
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
              required
            >
              <option value={TransactionType.income}>Przychód</option>
              <option value={TransactionType.expense}>Wydatek</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Kwota (zł) *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={Number(formData.amount)}
              onChange={(e) => setFormData({ ...formData, amount: BigInt(e.target.value || 0) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={new Date(Number(formData.timestamp) / 1000000).toISOString().split('T')[0]}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setFormData({ ...formData, timestamp: BigInt(date.getTime() * 1000000) });
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategoria *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Np. Ofiary, Remont, Opłaty"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Szczegółowy opis transakcji"
              required
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit">Zapisz</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
