import type { ExamType } from "./types";

export const GATE_SUBJECTS = [
  "Structural Engineering",
  "Geotechnical Engineering",
  "Fluid Mechanics & Hydraulics",
  "Environmental Engineering",
  "Transportation Engineering",
  "Surveying",
  "Engineering Mathematics",
  "General Aptitude",
] as const;

export const ESE_P1_SUBJECTS = [
  "Current Affairs & General Studies",
  "Engineering Aptitude",
  "Engineering Mathematics & Numerical Analysis",
  "General Principles of Design & Safety",
  "Standards & Quality Practices",
  "Project Management",
  "Material Science",
  "Information & Communication Technologies",
] as const;

export const ESE_P2_SUBJECTS = [
  "Building Materials",
  "Solid Mechanics",
  "Structural Analysis",
  "Design of Steel Structures",
  "Design of Concrete Structures",
  "Geotechnical Engineering",
  "Fluid Mechanics & Hydraulics",
  "Irrigation & Water Resources",
  "Environmental Engineering",
  "Transportation Engineering",
  "Surveying & Geology",
  "Construction Management",
] as const;

export const SUBJECT_SHORT: Record<string, string> = {
  "Structural Engineering": "Structural",
  "Geotechnical Engineering": "Geotechnical",
  "Fluid Mechanics & Hydraulics": "Fluid Mechanics",
  "Environmental Engineering": "Environmental",
  "Transportation Engineering": "Transportation",
  Surveying: "Surveying",
  "Engineering Mathematics": "Engg Maths",
  "General Aptitude": "General Aptitude",
  "Current Affairs & General Studies": "Current Affairs",
  "Engineering Aptitude": "Engg Aptitude",
  "Engineering Mathematics & Numerical Analysis": "Engg Maths",
  "General Principles of Design & Safety": "Design & Safety",
  "Standards & Quality Practices": "Standards",
  "Project Management": "Project Mgmt",
  "Material Science": "Materials",
  "Information & Communication Technologies": "ICT",
  "Building Materials": "Materials",
  "Solid Mechanics": "Solid Mech",
  "Structural Analysis": "Struct Analysis",
  "Design of Steel Structures": "Steel Design",
  "Design of Concrete Structures": "Concrete Design",
  "Irrigation & Water Resources": "Irrigation",
  "Surveying & Geology": "Surveying",
  "Construction Management": "Construction",
};

export const SUBJECT_ICONS: Record<string, string> = {
  "Structural Engineering": "🏗️",
  "Geotechnical Engineering": "⛰️",
  "Fluid Mechanics & Hydraulics": "💧",
  "Environmental Engineering": "🌿",
  "Transportation Engineering": "🛣️",
  Surveying: "📐",
  "Engineering Mathematics": "📊",
  "General Aptitude": "🧠",
  "Current Affairs & General Studies": "📰",
  "Engineering Aptitude": "⚙️",
  "Engineering Mathematics & Numerical Analysis": "📐",
  "General Principles of Design & Safety": "🛡️",
  "Standards & Quality Practices": "✅",
  "Project Management": "📋",
  "Material Science": "🔬",
  "Information & Communication Technologies": "💻",
  "Building Materials": "🧱",
  "Solid Mechanics": "🔩",
  "Structural Analysis": "📊",
  "Design of Steel Structures": "🏗️",
  "Design of Concrete Structures": "🏛️",
  "Irrigation & Water Resources": "🌊",
  "Surveying & Geology": "🗺️",
  "Construction Management": "👷",
};

export const PROGRESS_KEYS: Record<ExamType, string> = {
  GATE: "progress_gate",
  ESE: "progress_ese",
};

export const LEGACY_STORAGE_KEY = "gate-ce-progress";

/** Stable anonymous id for syncing progress when MongoDB is configured. */
export const LEARNER_PUBLIC_ID_KEY = "gate_learner_public_id";

export const MOCK_GATE_DURATION_SEC = 3 * 60 * 60;
export const MOCK_GATE_TOTAL = 65;
export const MOCK_ESE_PRE_DURATION_SEC = 2 * 60 * 60;
export const MOCK_ESE_PRE_TOTAL = 120;
export const MOCK_ESE_P2_DURATION_SEC = 3 * 60 * 60;
export const MOCK_ESE_P2_TARGET_MARKS = 150;

export const ESE_PAPER_LABELS: Record<string, string> = {
  All: "All Papers",
  PRE: "Prelims",
  P1: "Paper 1",
  P2: "Paper 2",
};

export function getSubjectsForExam(exam: ExamType, paper: string): string[] {
  if (exam === "GATE") return [...GATE_SUBJECTS];
  if (paper === "P2") return [...ESE_P2_SUBJECTS];
  return [...ESE_P1_SUBJECTS];
}

export function getSubjectShort(subject: string): string {
  return SUBJECT_SHORT[subject] ?? subject;
}
