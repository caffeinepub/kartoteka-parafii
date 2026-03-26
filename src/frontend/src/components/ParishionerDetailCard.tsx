import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
}

const relationTypeLabels: Record<RelationType, string> = {
  spouse: "Małżonek/Małżonka",
  child: "Dziecko",
  other: "Inny",
};

export default function ParishionerDetailCard({
  parishioner,
  offerings,
  onEdit,
  onDownloadPdf,
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
    <div className="space-y-8 max-h-[85vh] overflow-y-auto px-2">
      {/* Header Section — navy background with white text for perfect contrast */}
      <div
        className="rounded-xl p-6 -mx-1"
        style={{ background: "oklch(0.20 0.10 265)" }}
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {photoUrl && (
            <div className="flex-shrink-0">
              <img
                src={photoUrl}
                alt={`${parishioner.firstName} ${parishioner.lastName}`}
                className="w-36 h-36 rounded-xl object-cover shadow-lg border-4"
                style={{ borderColor: "oklch(0.70 0.14 85)" }}
              />
            </div>
          )}
          <div className="flex-1 space-y-4">
            <div>
              <h2
                className="text-4xl font-bold pb-3 mb-1"
                style={{
                  color: "#ffffff",
                  borderBottom: "2px solid oklch(0.70 0.14 85)",
                }}
              >
                {parishioner.firstName} {parishioner.lastName}
              </h2>
              {parishioner.profession && (
                <p
                  className="text-lg mt-2 flex items-center gap-2"
                  style={{ color: "oklch(0.85 0.08 80)" }}
                >
                  <Briefcase className="h-5 w-5" />
                  {parishioner.profession}
                </p>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={onEdit}
                size="lg"
                className="gap-2"
                style={{
                  background: "oklch(0.70 0.14 85)",
                  color: "oklch(0.20 0.10 265)",
                  border: "none",
                }}
              >
                <Edit className="h-5 w-5" />
                Edytuj dane
              </Button>
              {onDownloadPdf && (
                <Button
                  onClick={onDownloadPdf}
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  style={{
                    borderColor: "oklch(0.70 0.14 85)",
                    color: "oklch(0.70 0.14 85)",
                    background: "transparent",
                  }}
                >
                  <Download className="h-5 w-5" />
                  Pobierz PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Personal Information Section */}
      <Card className="border-2">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary" />
            Informacje osobiste
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {parishioner.birthYear && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Rok urodzenia
                  </p>
                  <p className="text-lg font-semibold">
                    {Number(parishioner.birthYear)}
                  </p>
                </div>
              </div>
            )}
            {parishioner.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Adres
                  </p>
                  <p className="text-lg">{parishioner.address}</p>
                </div>
              </div>
            )}
            {parishioner.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Telefon
                  </p>
                  <p className="text-lg">{parishioner.phone}</p>
                </div>
              </div>
            )}
            {parishioner.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-lg">{parishioner.email}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sacraments Section */}
      <Card className="border-2">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Sakramenty
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sacramentsList.map((sacrament) => (
              <div
                key={sacrament.key}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  sacrament.year
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/30 border-muted"
                }`}
              >
                {sacrament.year ? (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium text-sm">{sacrament.label}</p>
                  <p
                    className={`text-lg font-semibold ${
                      sacrament.year ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {sacrament.year ? Number(sacrament.year) : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Family Section */}
      {parishioner.family.length > 0 && (
        <Card className="border-2">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              Rodzina ({parishioner.family.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {parishioner.family.map((member, index) => (
              <div
                key={`family-${index}-${member.name}`}
                className="p-5 rounded-lg border-2 bg-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">{member.name}</h4>
                  <Badge variant="secondary" className="text-sm">
                    {relationTypeLabels[member.relationType]}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {member.sacraments.birthYear && (
                    <div>
                      <span className="text-muted-foreground">Urodzenie:</span>
                      <span className="ml-2 font-medium">
                        {Number(member.sacraments.birthYear)}
                      </span>
                    </div>
                  )}
                  {member.sacraments.baptismYear && (
                    <div>
                      <span className="text-muted-foreground">Chrzest:</span>
                      <span className="ml-2 font-medium">
                        {Number(member.sacraments.baptismYear)}
                      </span>
                    </div>
                  )}
                  {member.sacraments.communionYear && (
                    <div>
                      <span className="text-muted-foreground">Komunia:</span>
                      <span className="ml-2 font-medium">
                        {Number(member.sacraments.communionYear)}
                      </span>
                    </div>
                  )}
                  {member.sacraments.confirmationYear && (
                    <div>
                      <span className="text-muted-foreground">
                        Bierzmowanie:
                      </span>
                      <span className="ml-2 font-medium">
                        {Number(member.sacraments.confirmationYear)}
                      </span>
                    </div>
                  )}
                  {member.sacraments.marriageYear && (
                    <div>
                      <span className="text-muted-foreground">Małżeństwo:</span>
                      <span className="ml-2 font-medium">
                        {Number(member.sacraments.marriageYear)}
                      </span>
                    </div>
                  )}
                  {member.sacraments.funeralYear && (
                    <div>
                      <span className="text-muted-foreground">Pogrzeb:</span>
                      <span className="ml-2 font-medium">
                        {Number(member.sacraments.funeralYear)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Offerings Section */}
      {offerings.length > 0 && (
        <Card className="border-2">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Heart className="h-5 w-5 text-primary" />
              Ofiary ({offerings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {offerings
                .sort((a, b) => Number(b.year) - Number(a.year))
                .map((offering) => (
                  <div
                    key={Number(offering.id)}
                    className="flex items-center justify-between p-4 rounded-lg border-2 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-lg">
                        {offering.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Rok {Number(offering.year)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {Number(offering.amount)} zł
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pastoral Notes Section */}
      {parishioner.pastoralNotes && (
        <Card className="border-2">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-xl">Notatki duszpasterskie</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {parishioner.pastoralNotes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
