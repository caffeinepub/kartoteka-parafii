import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Circle,
  Download,
  Edit,
  Heart,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";
import type { IndividualOffering, Parishioner, RelationType } from "../backend";

interface ParishionerDetailCardProps {
  parishioner: Parishioner;
  offerings: IndividualOffering[];
  onEdit: () => void;
  onDownloadPdf?: () => void;
  onClose?: () => void;
}

const relationTypeLabels: Record<RelationType, string> = {
  spouse: "Małżonek/Małżonka",
  child: "Dziecko",
  other: "Inny",
};

const NAVY = "oklch(0.20 0.10 265)";
const GOLD = "oklch(0.75 0.12 80)";
const GOLD_BORDER = "oklch(0.85 0.05 80)";

export default function ParishionerDetailCard({
  parishioner,
  offerings,
  onEdit,
  onDownloadPdf,
  onClose,
}: ParishionerDetailCardProps) {
  const photoUrl = parishioner.photo?.getDirectURL();

  const sacramentsList = [
    {
      key: "birthYear",
      label: "Urodzenie",
      year: parishioner.sacraments.birthYear,
    },
    {
      key: "baptismYear",
      label: "Chrzest",
      year: parishioner.sacraments.baptismYear,
    },
    {
      key: "communionYear",
      label: "Komunia",
      year: parishioner.sacraments.communionYear,
    },
    {
      key: "confirmationYear",
      label: "Bierzmowanie",
      year: parishioner.sacraments.confirmationYear,
    },
    {
      key: "marriageYear",
      label: "Małżeństwo",
      year: parishioner.sacraments.marriageYear,
    },
    {
      key: "funeralYear",
      label: "Pogrzeb",
      year: parishioner.sacraments.funeralYear,
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* NAGŁÓWEK — zawsze widoczny, nie scrolluje */}
      <div
        className="flex-none px-6 py-5"
        style={{ background: NAVY, borderBottom: `3px solid ${GOLD}` }}
      >
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {photoUrl && (
            <div className="flex-shrink-0">
              <img
                src={photoUrl}
                alt={`${parishioner.firstName} ${parishioner.lastName}`}
                className="w-24 h-24 rounded-xl object-cover shadow-lg border-4"
                style={{ borderColor: GOLD }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2
              className="text-3xl font-bold pb-2 mb-1 break-words"
              style={{ color: "#ffffff", borderBottom: `2px solid ${GOLD}` }}
            >
              {parishioner.firstName} {parishioner.lastName}
            </h2>
            {parishioner.profession && (
              <p
                className="text-base mt-2 flex items-center gap-2"
                style={{ color: GOLD }}
              >
                <Briefcase className="h-4 w-4 flex-shrink-0" />
                {parishioner.profession}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* TREŚĆ — scrollowalna */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 space-y-6">
        {/* Personal Information */}
        <Card className="border-2">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-4 w-4 text-primary" />
              Informacje osobiste
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              {parishioner.birthYear && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Rok urodzenia
                    </p>
                    <p className="text-base font-semibold">
                      {Number(parishioner.birthYear)}
                    </p>
                  </div>
                </div>
              )}
              {parishioner.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Adres
                    </p>
                    <p className="text-base break-words">
                      {parishioner.address}
                    </p>
                  </div>
                </div>
              )}
              {parishioner.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Telefon
                    </p>
                    <p className="text-base">{parishioner.phone}</p>
                  </div>
                </div>
              )}
              {parishioner.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="text-base break-all">{parishioner.email}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sacraments */}
        <Card className="border-2">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Sakramenty
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sacramentsList.map((sacrament) => (
                <div
                  key={sacrament.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                    sacrament.year
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/30 border-muted"
                  }`}
                >
                  {sacrament.year ? (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{sacrament.label}</p>
                    <p
                      className={`text-base font-semibold ${sacrament.year ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {sacrament.year ? Number(sacrament.year) : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Family */}
        {parishioner.family.length > 0 && (
          <Card className="border-2">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-4 w-4 text-primary" />
                Rodzina ({parishioner.family.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {parishioner.family.map((member) => (
                <div
                  key={`fam-${member.relationType}-${member.name}`}
                  className="p-4 rounded-lg border-2 bg-card space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-base font-semibold break-words">
                      {member.name}
                    </h4>
                    <Badge
                      variant="secondary"
                      className="text-xs flex-shrink-0"
                    >
                      {relationTypeLabels[member.relationType]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {member.sacraments.birthYear && (
                      <span>
                        <span className="text-muted-foreground">
                          Urodzenie:
                        </span>{" "}
                        <span className="font-medium">
                          {Number(member.sacraments.birthYear)}
                        </span>
                      </span>
                    )}
                    {member.sacraments.baptismYear && (
                      <span>
                        <span className="text-muted-foreground">Chrzest:</span>{" "}
                        <span className="font-medium">
                          {Number(member.sacraments.baptismYear)}
                        </span>
                      </span>
                    )}
                    {member.sacraments.communionYear && (
                      <span>
                        <span className="text-muted-foreground">Komunia:</span>{" "}
                        <span className="font-medium">
                          {Number(member.sacraments.communionYear)}
                        </span>
                      </span>
                    )}
                    {member.sacraments.confirmationYear && (
                      <span>
                        <span className="text-muted-foreground">
                          Bierzmowanie:
                        </span>{" "}
                        <span className="font-medium">
                          {Number(member.sacraments.confirmationYear)}
                        </span>
                      </span>
                    )}
                    {member.sacraments.marriageYear && (
                      <span>
                        <span className="text-muted-foreground">
                          Małżeństwo:
                        </span>{" "}
                        <span className="font-medium">
                          {Number(member.sacraments.marriageYear)}
                        </span>
                      </span>
                    )}
                    {member.sacraments.funeralYear && (
                      <span>
                        <span className="text-muted-foreground">Pogrzeb:</span>{" "}
                        <span className="font-medium">
                          {Number(member.sacraments.funeralYear)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Offerings */}
        {offerings.length > 0 && (
          <Card className="border-2">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-4 w-4 text-primary" />
                Ofiary ({offerings.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {offerings
                  .sort((a, b) => Number(b.year) - Number(a.year))
                  .map((offering) => (
                    <div
                      key={Number(offering.id)}
                      className="flex items-center justify-between p-3 rounded-lg border-2 bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-semibold text-base break-words">
                          {offering.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rok {Number(offering.year)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-primary">
                          {Number(offering.amount)} zł
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pastoral Notes */}
        {parishioner.pastoralNotes && (
          <Card className="border-2">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="text-lg">Notatki duszpasterskie</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                {parishioner.pastoralNotes}
              </p>
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
            Edytuj dane
          </Button>
          {onDownloadPdf && (
            <Button
              onClick={onDownloadPdf}
              variant="outline"
              className="gap-2"
              style={{ borderColor: GOLD, color: NAVY }}
            >
              <Download className="h-4 w-4" />
              Pobierz PDF
            </Button>
          )}
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="gap-2">
            Zamknij
          </Button>
        )}
      </div>
    </div>
  );
}
