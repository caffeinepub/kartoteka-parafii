/**
 * Utility functions for baptism record date conversions and payload normalization
 */

import type {
  BaptismAnnotations,
  BaptismRecord,
  ParentsData,
} from "../backend";

/**
 * Convert ISO date string (YYYY-MM-DD) to nanosecond timestamp
 */
export function dateToNanoseconds(dateString: string): bigint {
  const date = new Date(dateString);
  return BigInt(date.getTime() * 1000000);
}

/**
 * Convert nanosecond timestamp to ISO date string (YYYY-MM-DD)
 */
export function nanosecondsToDateString(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toISOString().split("T")[0];
}

/**
 * Convert nanosecond timestamp to localized date string for display
 */
export function formatBaptismDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Create empty ParentsData object with default values
 */
export function createEmptyParentsData(): ParentsData {
  return {
    fullName: "",
    age: "",
    religion: "",
    residence: "",
  };
}

/**
 * Create empty BaptismAnnotations object with default values
 */
export function createEmptyAnnotations(): BaptismAnnotations {
  return {
    confirmation: undefined,
    marriage: undefined,
    ordination: undefined,
    profession: undefined,
    generalNotes: undefined,
  };
}

/**
 * Build a complete BaptismRecord payload from form state
 */
export function buildBaptismRecordPayload(
  formData: {
    actNumber: string;
    baptismDate: string;
    baptismPlace: string;
    personFullName: string;
    birthDate: string;
    birthPlace: string;
    fatherFullName: string;
    fatherAge: string;
    fatherReligion: string;
    fatherResidence: string;
    motherFullName: string;
    motherAge: string;
    motherReligion: string;
    motherResidence: string;
    godfatherFullName?: string;
    godfatherAge?: string;
    godfatherReligion?: string;
    godfatherResidence?: string;
    godmotherFullName?: string;
    godmotherAge?: string;
    godmotherReligion?: string;
    godmotherResidence?: string;
    confirmation?: string;
    marriage?: string;
    ordination?: string;
    profession?: string;
    generalNotes?: string;
  },
  existingRecord?: BaptismRecord | null,
): BaptismRecord {
  const baptismTimestamp = dateToNanoseconds(formData.baptismDate);
  const createdAtTimestamp =
    existingRecord?.createdAt || BigInt(Date.now() * 1000000);

  const godfatherData = formData.godfatherFullName?.trim()
    ? {
        fullName: formData.godfatherFullName.trim(),
        age: formData.godfatherAge?.trim() || "",
        religion: formData.godfatherReligion?.trim() || "",
        residence: formData.godfatherResidence?.trim() || "",
      }
    : undefined;

  const godmotherData = formData.godmotherFullName?.trim()
    ? {
        fullName: formData.godmotherFullName.trim(),
        age: formData.godmotherAge?.trim() || "",
        religion: formData.godmotherReligion?.trim() || "",
        residence: formData.godmotherResidence?.trim() || "",
      }
    : undefined;

  return {
    id: existingRecord?.id || BigInt(0),
    actNumber: formData.actNumber.trim(),
    baptismDate: baptismTimestamp,
    baptismPlace: formData.baptismPlace.trim(),
    personFullName: formData.personFullName.trim(),
    birthDate: formData.birthDate.trim(),
    birthPlace: formData.birthPlace.trim(),
    father: {
      fullName: formData.fatherFullName.trim(),
      age: formData.fatherAge.trim(),
      religion: formData.fatherReligion.trim(),
      residence: formData.fatherResidence.trim(),
    },
    mother: {
      fullName: formData.motherFullName.trim(),
      age: formData.motherAge.trim(),
      religion: formData.motherReligion.trim(),
      residence: formData.motherResidence.trim(),
    },
    godfather: godfatherData,
    godmother: godmotherData,
    annotations: {
      confirmation: formData.confirmation?.trim() || undefined,
      marriage: formData.marriage?.trim() || undefined,
      ordination: formData.ordination?.trim() || undefined,
      profession: formData.profession?.trim() || undefined,
      generalNotes: formData.generalNotes?.trim() || undefined,
    },
    createdAt: createdAtTimestamp,
  };
}
