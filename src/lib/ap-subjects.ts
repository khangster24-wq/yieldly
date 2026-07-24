/**
 * The current official College Board AP course catalog (42 courses), grouped
 * the same way apstudents.collegeboard.org/courses groups them. Kept as a
 * flat list for the onboarding/settings dropdown — real course titles, not
 * invented ones.
 */
export const AP_SUBJECTS: string[] = [
  // Arts
  "AP 2-D Art and Design",
  "AP 3-D Art and Design",
  "AP Drawing",
  "AP Art History",
  "AP Music Theory",
  // English
  "AP English Language and Composition",
  "AP English Literature and Composition",
  // History and Social Sciences
  "AP African American Studies",
  "AP Comparative Government and Politics",
  "AP European History",
  "AP Human Geography",
  "AP Macroeconomics",
  "AP Microeconomics",
  "AP Psychology",
  "AP United States Government and Politics",
  "AP United States History",
  "AP World History: Modern",
  // Math and Computer Science
  "AP Calculus AB",
  "AP Calculus BC",
  "AP Computer Science A",
  "AP Computer Science Principles",
  "AP Precalculus",
  "AP Statistics",
  // Sciences
  "AP Biology",
  "AP Chemistry",
  "AP Environmental Science",
  "AP Physics 1: Algebra-Based",
  "AP Physics 2: Algebra-Based",
  "AP Physics C: Electricity and Magnetism",
  "AP Physics C: Mechanics",
  // World Languages and Cultures
  "AP Chinese Language and Culture",
  "AP French Language and Culture",
  "AP German Language and Culture",
  "AP Italian Language and Culture",
  "AP Japanese Language and Culture",
  "AP Latin",
  "AP Spanish Language and Culture",
  "AP Spanish Literature and Culture",
  // AP Capstone Diploma Program
  "AP Research",
  "AP Seminar",
  // AP Career Kickstart
  "AP Business with Personal Finance",
  "AP Cybersecurity",
];

/** Real AP score options — 1–5, plus "pending" for a class not yet exam-scored. */
export const AP_SCORE_OPTIONS: Array<{ value: 1 | 2 | 3 | 4 | 5 | "pending"; label: string }> = [
  { value: 5, label: "5" },
  { value: 4, label: "4" },
  { value: 3, label: "3" },
  { value: 2, label: "2" },
  { value: 1, label: "1" },
  { value: "pending", label: "Not yet scored" },
];
