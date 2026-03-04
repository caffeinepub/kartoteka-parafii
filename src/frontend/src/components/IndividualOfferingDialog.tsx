import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { IndividualOffering } from "../backend";

interface IndividualOfferingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offering: IndividualOffering | null;
  parishionerId: bigint;
  onSave: (data: IndividualOffering) => void;
}

export default function IndividualOfferingDialog({
  open,
  onOpenChange,
  offering,
  parishionerId,
  onSave,
}: IndividualOfferingDialogProps) {
  const [formData, setFormData] = useState<IndividualOffering>({
    id: BigInt(0),
    amount: BigInt(0),
    year: BigInt(new Date().getFullYear()),
    description: "",
    parishionerId: parishionerId,
    timestamp: BigInt(Date.now() * 1000000),
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (offering) {
      setFormData(offering);
      // Convert timestamp to Date
      const date = new Date(Number(offering.timestamp) / 1000000);
      setSelectedDate(date);
    } else {
      const now = new Date();
      setFormData({
        id: BigInt(0),
        amount: BigInt(0),
        year: BigInt(now.getFullYear()),
        description: "",
        parishionerId: parishionerId,
        timestamp: BigInt(now.getTime() * 1000000),
      });
      setSelectedDate(now);
    }
  }, [offering, parishionerId]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Convert to nanoseconds timestamp
      const timestamp = BigInt(date.getTime() * 1000000);
      setFormData({
        ...formData,
        year: BigInt(date.getFullYear()),
        timestamp,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {offering ? "Edytuj ofiarę" : "Dodaj ofiarę"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Kwota (zł) *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={Number(formData.amount)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: BigInt(e.target.value || 0),
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "PPP", { locale: pl })
                    : "Wybierz datę"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                  locale={pl}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Np. Ofiara na remont kościoła"
              required
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Anuluj
            </Button>
            <Button type="submit">Zapisz</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
