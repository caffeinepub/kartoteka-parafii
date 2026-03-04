import type { Anniversary, AnniversaryType, Parishioner } from "../backend";

export interface AnniversarySummary {
  type: AnniversaryType;
  eventYear: number;
  anniversaryNumber: number;
  label: string;
}

/**
 * Computes a single anniversary summary for a parishioner card
 * Priority: funeral > marriage > baptism
 * Returns null if no valid anniversary exists
 */
export function getParishionerAnniversarySummary(
  parishioner: Parishioner,
  currentYear: number,
): AnniversarySummary | null {
  const { sacraments } = parishioner;

  // Priority 1: Funeral
  if (sacraments.funeralYear) {
    const eventYear = Number(sacraments.funeralYear);
    const anniversaryNumber = currentYear - eventYear;
    if (anniversaryNumber >= 1) {
      return {
        type: "funeral" as AnniversaryType,
        eventYear,
        anniversaryNumber,
        label: getAnniversaryLabel("funeral" as AnniversaryType),
      };
    }
  }

  // Priority 2: Marriage
  if (sacraments.marriageYear) {
    const eventYear = Number(sacraments.marriageYear);
    const anniversaryNumber = currentYear - eventYear;
    if (anniversaryNumber >= 1) {
      return {
        type: "marriage" as AnniversaryType,
        eventYear,
        anniversaryNumber,
        label: getAnniversaryLabel("marriage" as AnniversaryType),
      };
    }
  }

  // Priority 3: Baptism
  if (sacraments.baptismYear) {
    const eventYear = Number(sacraments.baptismYear);
    const anniversaryNumber = currentYear - eventYear;
    if (anniversaryNumber >= 1) {
      return {
        type: "baptism" as AnniversaryType,
        eventYear,
        anniversaryNumber,
        label: getAnniversaryLabel("baptism" as AnniversaryType),
      };
    }
  }

  return null;
}

/**
 * Returns a display label for an anniversary type
 */
export function getAnniversaryLabel(type: AnniversaryType): string {
  switch (type) {
    case "baptism":
      return "Chrzest";
    case "marriage":
      return "Małżeństwo";
    case "funeral":
      return "Pogrzeb";
    default:
      return "";
  }
}

/**
 * Formats an anniversary for PDF export
 */
export function formatAnniversaryForPDF(anniversary: Anniversary): string {
  const label = getAnniversaryLabel(anniversary.anniversaryType);
  return `${anniversary.firstName} ${anniversary.lastName} - ${label}: ${Number(anniversary.eventYear)} (${Number(anniversary.anniversaryNumber)}. rocznica)`;
}
