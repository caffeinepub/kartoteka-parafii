import { useState } from 'react';
import { Download, FileText, Files } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ExportPdfModeControlProps {
  onExportAll: () => void | Promise<void>;
  onExportSelected: () => void | Promise<void>;
  hasSelection: boolean;
  isLoading?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Reusable export control that provides two PDF export modes:
 * - Export all: generates PDF for the entire dataset
 * - Export selected: generates PDF for exactly one selected record
 */
export function ExportPdfModeControl({
  onExportAll,
  onExportSelected,
  hasSelection,
  isLoading = false,
  variant = 'outline',
  size = 'sm',
  className = '',
}: ExportPdfModeControlProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      await onExportAll();
    } catch (error) {
      console.error('Export all error:', error);
      toast.error('Błąd podczas eksportu PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSelected = async () => {
    if (!hasSelection) {
      toast.error('Nie wybrano żadnego rekordu. Proszę zaznaczyć rekord do eksportu.');
      return;
    }

    setIsExporting(true);
    try {
      await onExportSelected();
    } catch (error) {
      console.error('Export selected error:', error);
      toast.error('Błąd podczas eksportu PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isLoading || isExporting}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          Eksportuj PDF
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportAll} disabled={isExporting}>
          <Files className="h-4 w-4 mr-2" />
          Eksportuj wszystko
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportSelected} disabled={isExporting || !hasSelection}>
          <FileText className="h-4 w-4 mr-2" />
          Eksportuj zaznaczone
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
