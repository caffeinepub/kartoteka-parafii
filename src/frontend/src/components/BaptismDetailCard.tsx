import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  Church,
  Download,
  Edit,
  Hash,
  Heart,
  MapPin,
  User,
  Users,
  X,
} from "lucide-react";
import type { BaptismRecord, ParentsData } from "../backend";
import { formatBaptismDate } from "../utils/baptismRecord";

interface BaptismDetailCardProps {
  record: BaptismRecord;
  onEdit: () => void;
  onDownloadPdf: () => void;
  onClose?: () => void;
}

function ParentRow({ label, data }: { label: string; data: ParentsData }) {
  if (!data.fullName && !data.age && !data.residence && !data.religion)
    return null;
  return (
    <div className="p-4 rounded-lg border bg-card space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      {data.fullName && (
        <p className="text-base font-semibold text-foreground break-words">
          {data.fullName}
        </p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {data.age && (
          <span>
            <span className="font-medium">Wiek:</span> {data.age}
          </span>
        )}
        {data.religion && (
          <span>
            <span className="font-medium">Wyznanie:</span> {data.religion}
          </span>
        )}
        {data.residence && (
          <span>
            <span className="font-medium">Zamieszkanie:</span> {data.residence}
          </span>
        )}
      </div>
    </div>
  );
}

const NAVY = "oklch(0.20 0.10 265)";
const GOLD = "oklch(0.75 0.12 80)";
const GOLD_BORDER = "oklch(0.85 0.05 80)";

export default function BaptismDetailCard({
  record,
  onEdit,
  onDownloadPdf,
  onClose,
}: BaptismDetailCardProps) {
  const annotations = record.annotations;
  const hasAnnotations =
    annotations.confirmation ||
    annotations.marriage ||
    annotations.ordination ||
    annotations.profession ||
    annotations.generalNotes;

  const hasGodparents =
    record.godfather?.fullName ||
    record.godfather?.residence ||
    record.godmother?.fullName ||
    record.godmother?.residence;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* NAGŁÓWEK — zawsze widoczny, nie scrolluje */}
      <div
        className="flex-none px-6 py-5"
        style={{ background: NAVY, borderBottom: `3px solid ${GOLD}` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Badge
            className="text-sm px-3 py-1 flex-shrink-0"
            style={{ background: GOLD, color: NAVY }}
          >
            <Hash className="h-3 w-3 mr-1" />
            {record.actNumber}
          </Badge>
        </div>
        <h2
          className="text-3xl font-bold pb-2 break-words"
          style={{ color: "#ffffff", borderBottom: `2px solid ${GOLD}` }}
        >
          {record.personFullName}
        </h2>
        <p className="text-sm mt-2" style={{ color: GOLD }}>
          {formatBaptismDate(record.baptismDate)}
        </p>
      </div>

      {/* TREŚĆ — scrollowalna */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 space-y-6">
        {/* Akt chrztu */}
        <Card className="border-2">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Church className="h-4 w-4 text-primary" />
              Dane aktu chrztu
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Data chrztu
                  </p>
                  <p className="text-base font-semibold">
                    {formatBaptismDate(record.baptismDate)}
                  </p>
                </div>
              </div>
              {record.baptismPlace && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Miejsce chrztu
                    </p>
                    <p className="text-base font-semibold break-words">
                      {record.baptismPlace}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dane ochrzczonego */}
        <Card className="border-2">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-4 w-4 text-primary" />
              Dane ochrzczonego
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {record.birthDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Data urodzenia
                    </p>
                    <p className="text-base font-semibold">
                      {record.birthDate}
                    </p>
                  </div>
                </div>
              )}
              {record.birthPlace && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Miejsce urodzenia
                    </p>
                    <p className="text-base font-semibold break-words">
                      {record.birthPlace}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rodzice naturalni */}
        <Card className="border-2">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-4 w-4 text-primary" />
              Rodzice naturalni
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <ParentRow label="Ojciec" data={record.father} />
            <ParentRow label="Matka" data={record.mother} />
          </CardContent>
        </Card>

        {/* Rodzice chrzestni */}
        {hasGodparents && (
          <Card className="border-2">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-4 w-4 text-primary" />
                Rodzice chrzestni
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {record.godfather && (
                <ParentRow label="Ojciec chrzestny" data={record.godfather} />
              )}
              {record.godmother && (
                <ParentRow label="Matka chrzestna" data={record.godmother} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Wpisy późniejsze */}
        {hasAnnotations && (
          <Card className="border-2">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-4 w-4 text-primary" />
                Wpisy późniejsze
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid md:grid-cols-2 gap-3">
                {annotations.confirmation && (
                  <div className="p-3 rounded-lg border bg-primary/5 border-primary/20">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Bierzmowanie
                    </p>
                    <p className="text-sm font-medium break-words">
                      {annotations.confirmation}
                    </p>
                  </div>
                )}
                {annotations.marriage && (
                  <div className="p-3 rounded-lg border bg-primary/5 border-primary/20">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Małżeństwo
                    </p>
                    <p className="text-sm font-medium break-words">
                      {annotations.marriage}
                    </p>
                  </div>
                )}
                {annotations.ordination && (
                  <div className="p-3 rounded-lg border bg-primary/5 border-primary/20">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Święcenia / Profesja
                    </p>
                    <p className="text-sm font-medium break-words">
                      {annotations.ordination}
                    </p>
                  </div>
                )}
                {annotations.profession && (
                  <div className="p-3 rounded-lg border bg-primary/5 border-primary/20">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Profesja zakonna
                    </p>
                    <p className="text-sm font-medium break-words">
                      {annotations.profession}
                    </p>
                  </div>
                )}
              </div>
              {annotations.generalNotes && (
                <div className="mt-3 p-3 rounded-lg border bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Uwagi
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {annotations.generalNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* STOPKA — zawsze widoczna, nie scrolluje */}
      <div
        className="flex-none px-6 py-4 flex flex-wrap gap-2 items-center justify-between"
        style={{ borderTop: `1px solid ${GOLD_BORDER}` }}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onEdit}
            className="gap-2"
            style={{ background: GOLD, color: NAVY, border: "none" }}
          >
            <Edit className="h-4 w-4" />
            Edytuj
          </Button>
          <Button
            onClick={onDownloadPdf}
            variant="outline"
            className="gap-2"
            style={{ borderColor: GOLD, color: NAVY }}
          >
            <Download className="h-4 w-4" />
            Świadectwo PDF
          </Button>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="h-4 w-4" />
            Zamknij
          </Button>
        )}
      </div>
    </div>
  );
}
