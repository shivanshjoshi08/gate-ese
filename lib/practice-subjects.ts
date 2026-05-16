/**
 * Practice filter subjects (10 buckets). Question `subject` in DB may vary;
 * {@link resolvePracticeSubject} maps rows into these buckets.
 */
export const PRACTICE_FILTER_SUBJECTS = [
  "Soil Mechanics",
  "Structural Analysis",
  "RCC + Steel Design",
  "Fluid Mechanics + Hydraulics",
  "Environmental Engineering",
  "Transportation Engineering",
  "Surveying",
  "Geotechnical (Foundation Design)",
  "SOM (Strength of Materials)",
  "Engineering Mathematics",
] as const;

export type PracticeFilterSubject = (typeof PRACTICE_FILTER_SUBJECTS)[number];

/** Map bundled / Mongo subject strings → practice filter bucket. */
const SUBJECT_ALIASES: Record<string, PracticeFilterSubject> = {
  "Soil Mechanics": "Soil Mechanics",
  "Geotechnical Engineering": "Geotechnical (Foundation Design)",
  "Structural Analysis": "Structural Analysis",
  "Structural Engineering": "RCC + Steel Design",
  "RCC": "RCC + Steel Design",
  "Design of Concrete Structures": "RCC + Steel Design",
  "Design of Steel Structures": "RCC + Steel Design",
  "Steel Structures": "RCC + Steel Design",
  "RCC Design": "RCC + Steel Design",
  "Building Materials": "RCC + Steel Design",
  "Construction Materials and Management": "RCC + Steel Design",
  "Fluid Mechanics": "Fluid Mechanics + Hydraulics",
  "Fluid Mechanics & Hydraulics": "Fluid Mechanics + Hydraulics",
  "Hydraulics": "Fluid Mechanics + Hydraulics",
  Hydrology: "Fluid Mechanics + Hydraulics",
  "Irrigation Engineering": "Fluid Mechanics + Hydraulics",
  "Environmental Engineering": "Environmental Engineering",
  "Transportation Engineering": "Transportation Engineering",
  Surveying: "Surveying",
  "Surveying & Geology": "Surveying",
  "Geotechnical (Foundation Design)": "Geotechnical (Foundation Design)",
  "Foundation Engineering": "Geotechnical (Foundation Design)",
  "Solid Mechanics": "SOM (Strength of Materials)",
  "Strength of Materials": "SOM (Strength of Materials)",
  "SOM (Strength of Materials)": "SOM (Strength of Materials)",
  "Engineering Mechanics": "SOM (Strength of Materials)",
  "Engineering Mathematics": "Engineering Mathematics",
  "Engineering Mathematics & Numerical Analysis": "Engineering Mathematics",
};

function matchByKeyword(
  normalized: string,
): PracticeFilterSubject | undefined {
  if (normalized.includes("soil mech")) return "Soil Mechanics";
  if (normalized.includes("structural anal")) return "Structural Analysis";
  if (
    normalized.includes("steel struct") ||
    normalized.includes("rcc") ||
    normalized.includes("concrete struct") ||
    normalized.includes("structural eng") ||
    normalized.includes("construction material") ||
    normalized.includes("building material")
  ) {
    return "RCC + Steel Design";
  }
  if (
    normalized.includes("fluid") ||
    normalized.includes("hydraul") ||
    normalized.includes("hydrolog") ||
    normalized.includes("irrigation")
  ) {
    return "Fluid Mechanics + Hydraulics";
  }
  if (normalized.includes("environment")) return "Environmental Engineering";
  if (normalized.includes("transport")) return "Transportation Engineering";
  if (normalized.includes("survey")) return "Surveying";
  if (
    normalized.includes("foundation") ||
    normalized.includes("geotech") ||
    normalized.includes("bearing") ||
    normalized.includes("pile")
  ) {
    return "Geotechnical (Foundation Design)";
  }
  if (
    normalized.includes("strength of material") ||
    normalized.includes("solid mech") ||
    normalized.includes("som")
  ) {
    return "SOM (Strength of Materials)";
  }
  if (
    normalized.includes("math") ||
    normalized.includes("calculus") ||
    normalized.includes("probability")
  ) {
    return "Engineering Mathematics";
  }
  return undefined;
}

export function resolvePracticeSubject(raw: string): PracticeFilterSubject | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const exact = SUBJECT_ALIASES[trimmed];
  if (exact) return exact;
  const normalized = trimmed.toLowerCase();
  return matchByKeyword(normalized) ?? null;
}

export function questionMatchesPracticeSubject(
  questionSubject: string,
  filterSubject: string,
): boolean {
  if (filterSubject === "All") return true;
  return resolvePracticeSubject(questionSubject) === filterSubject;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** DB `subject` patterns per bucket (import JSON uses varied labels). */
const BUCKET_SUBJECT_REGEX: Record<PracticeFilterSubject, RegExp[]> = {
  "Soil Mechanics": [/soil mech/i],
  "Structural Analysis": [/structural anal/i],
  "RCC + Steel Design": [
    /\brcc\b/i,
    /steel struct/i,
    /structural engineering/i,
    /design of (steel|concrete)/i,
    /building material/i,
    /construction material/i,
  ],
  "Fluid Mechanics + Hydraulics": [
    /fluid mech/i,
    /hydraul/i,
    /hydrolog/i,
    /irrigation/i,
  ],
  "Environmental Engineering": [/environment/i],
  "Transportation Engineering": [/transport/i],
  Surveying: [/survey/i],
  "Geotechnical (Foundation Design)": [
    /geotech/i,
    /foundation eng/i,
    /\bfoundation\b/i,
  ],
  "SOM (Strength of Materials)": [
    /strength of material/i,
    /solid mech/i,
    /\bsom\b/i,
    /engineering mechanics/i,
  ],
  "Engineering Mathematics": [/engineering math/i, /\bmath/i, /calculus/i],
};

function exactAliasSubjectsForBucket(
  bucket: PracticeFilterSubject,
): string[] {
  const terms = new Set<string>([bucket]);
  for (const [alias, target] of Object.entries(SUBJECT_ALIASES)) {
    if (target === bucket) terms.add(alias);
  }
  return Array.from(terms);
}

/** Admin / Mongo list filter — avoids broken regex on `RCC + Steel Design` (`+` is special). */
export function buildMongoSubjectFilter(
  subjectQuery: string,
): Record<string, unknown> | null {
  const q = subjectQuery.trim();
  if (!q) return null;

  const bucket = PRACTICE_FILTER_SUBJECTS.includes(
    q as PracticeFilterSubject,
  )
    ? (q as PracticeFilterSubject)
    : resolvePracticeSubject(q);

  if (!bucket) {
    return { subject: new RegExp(escapeRegExp(q), "i") };
  }

  const or: Record<string, unknown>[] = [
    ...exactAliasSubjectsForBucket(bucket).map((term) => ({
      subject: new RegExp(`^${escapeRegExp(term)}$`, "i"),
    })),
    ...BUCKET_SUBJECT_REGEX[bucket].map((rx) => ({ subject: rx })),
  ];

  return or.length === 1 ? or[0]! : { $or: or };
}

function subjectFilterLabel(value: PracticeFilterSubject): string {
  return value;
}

export function getPracticeSubjectFilterOptions(): {
  value: string;
  label: string;
}[] {
  return [
    { value: "All", label: "All subjects" },
    ...PRACTICE_FILTER_SUBJECTS.map((value) => ({
      value,
      label: subjectFilterLabel(value),
    })),
  ];
}

/** Subjects that have at least one question in the pool (after bucket mapping). */
export function getPracticeSubjectFilterOptionsForPool(
  pool: { subject: string }[],
): { value: string; label: string }[] {
  const present = new Set<PracticeFilterSubject>();
  for (const q of pool) {
    const bucket = resolvePracticeSubject(q.subject);
    if (bucket) present.add(bucket);
  }
  const subjects = PRACTICE_FILTER_SUBJECTS.filter((s) => present.has(s));
  if (subjects.length === 0) return [];
  if (subjects.length === 1) {
    return [
      {
        value: subjects[0]!,
        label: subjectFilterLabel(subjects[0]!),
      },
    ];
  }
  return [
    { value: "All", label: "All subjects" },
    ...subjects.map((value) => ({
      value,
      label: subjectFilterLabel(value),
    })),
  ];
}

export function isPracticeSubjectFilterActive(filters: {
  subject?: string;
}): boolean {
  return !!filters.subject && filters.subject !== "All";
}
