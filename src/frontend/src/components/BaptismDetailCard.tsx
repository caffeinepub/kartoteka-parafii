import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import type { BaptismRecord, ParentsData } from "../backend";
import { formatBaptismDate } from "../utils/baptismRecord";

interface BaptismDetailCardProps {
  record: BaptismRecord;
  onEdit: () => void;
  onDownloadPdf: () => void;
}

function ParentRow({ label, data }: { label: string; data: ParentsData }) {
  if (!data.fullName && !data.age && !data.residence && !data.religion)
    return null;
  return (
    <div className="p-4 rounded-lg border bg-card space-y-2">
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      {data.fullName && (
        <p className="text-lg font-semibold text-foreground">{data.fullName}</p>
      )}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
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
            <span className="font-medium">Miejsce zamieszkania:</span>{" "}
            {data.residence}
          </span>
        )}
      </div>
    </div>
  );
}

export default function BaptismDetailCard({
  record,
  onEdit,
  onDownloadPdf,
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
    <div className="space-y-6 max-h-[82vh] overflow-y-auto px-1">
      {/* Header — navy background with white text for perfect contrast */}
      <div
        className="rounded-xl p-6 -mx-1"
        style={{ background: "oklch(0.20 0.10 265)" }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <Badge
                className="text-base px-3 py-1"
                style={{
                  background: "oklch(0.70 0.14 85)",
                  color: "oklch(0.20 0.10 265)",
                }}
              >
                <Hash className="h-4 w-4 mr-1" />
                {record.actNumber}
              </Badge>
            </div>
            <h2
              className="text-4xl font-bold pb-3"
              style={{
                color: "#ffffff",
                borderBottom: "2px solid oklch(0.70 0.14 85)",
              }}
            >
              {record.personFullName}
            </h2>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadPdf}
              className="gap-2"
              style={{
                borderColor: "oklch(0.70 0.14 85)",
                color: "oklch(0.70 0.14 85)",
                background: "transparent",
              }}
            >
              <Download className="h-4 w-4" />
              Świadectwo PDF
            </Button>
            <Button
              size="sm"
              onClick={onEdit}
              className="gap-2"
              style={{
                background: "oklch(0.70 0.14 85)",
                color: "oklch(0.20 0.10 265)",
                border: "none",
              }}
            >
              <Edit className="h-4 w-4" />
              Edytuj
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Akt chrztu */}
      <Card className="border-2">
        <CardHeader className="bg-muted/30 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Church className="h-5 w-5 text-primary" />
            Dane aktu chrztu
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Data chrztu
                </p>
                <p className="text-lg font-semibold">
                  {formatBaptismDate(record.baptismDate)}
                </p>
              </div>
            </div>
            {record.baptismPlace && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Miejsce chrztu
                  </p>
                  <p className="text-lg font-semibold">{record.baptismPlace}</p>
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
            <User className="h-5 w-5 text-primary" />
            Dane ochrzczonego
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid md:grid-cols-2 gap-6">
            {record.birthDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Data urodzenia
                  </p>
                  <p className="text-lg font-semibold">{record.birthDate}</p>
                </div>
              </div>
            )}
            {record.birthPlace && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Miejsce urodzenia
                  </p>
                  <p className="text-lg font-semibold">{record.birthPlace}</p>
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
            <Users className="h-5 w-5 text-primary" />
            Rodzice naturalni
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-3">
          <ParentRow label="Ojciec" data={record.father} />
          <ParentRow label="Matka" data={record.mother} />
        </CardContent>
      </Card>

      {/* Rodzice chrzestni */}
      {hasGodparents && (
        <Card className="border-2">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-primary" />
              Rodzice chrzestni
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-3">
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
              <BookOpen className="h-5 w-5 text-primary" />
              Wpisy późniejsze
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid md:grid-cols-2 gap-4">
              {annotations.confirmation && (
                <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Bierzmowanie
                  </p>
                  <p className="text-base font-medium">
                    {annotations.confirmation}
                  </p>
                </div>
              )}
              {annotations.marriage && (
                <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Małżeństwo
                  </p>
                  <p className="text-base font-medium">
                    {annotations.marriage}
                  </p>
                </div>
              )}
              {annotations.ordination && (
                <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Święcenia / Profesja
                  </p>
                  <p className="text-base font-medium">
                    {annotations.ordination}
                  </p>
                </div>
              )}
              {annotations.profession && (
                <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Profesja zakonna
                  </p>
                  <p className="text-base font-medium">
                    {annotations.profession}
                  </p>
                </div>
              )}
            </div>
            {annotations.generalNotes && (
              <div className="mt-4 p-4 rounded-lg border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Uwagi
                </p>
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {annotations.generalNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
