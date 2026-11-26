// Fourth-year courses of the 2013-2014 Honours curriculum, which students
// sitting the 4th year exams until the new curriculum reaches 4th year still
// follow. Copied from the National University "Syllabus for Four Year
// Honours Course, Effective from the Session 2013-2014" paper tables (copies
// hosted by affiliated colleges, e.g. scd.edu.bd/scd/SyllabusesPDF/), and
// checked against the course codes in NU's routine for the 2024 Honours 4th
// year exam (notice 5451, 11 March 2026). A title ending in "…" is cut off in
// the source PDF itself.
import type { TCurriculumYear } from "../curriculum.model";

const course = (code: string, title: string) => ({ code, title, marks: 100, credits: 4 });

const year4 = (courses: ReturnType<typeof course>[]): TCurriculumYear => ({
  year: 4,
  session: "2013-2014",
  courses,
});

// Keyed by "<program>/<department>" as in nuHonours2024.ts.
export const NU_HONOURS_4TH_YEAR_2013: Record<string, TCurriculumYear> = {
  "BBA/Accounting": year4([
    course("242501", "Accounting Theory"),
    course("242503", "Advanced Auditing & Professional Ethics"),
    course("242505", "Accounting Information Systems"),
    course("242507", "Organizational Behavior"),
    course("242509", "Corporate Law and Practices"),
    course("242511", "Working Capital Management and Financial Statement Analysis"),
    course("242513", "Advanced Accounting-II"),
    course("242515", "Investment Analysis and Portfolio Management"),
    course("242517", "Research Methodology (In English)"),
    course("242518", "Viva-voce"),
  ]),
  "BBA/Management": year4([
    course("242601", "Bank Management"),
    course("242603", "Financial Management (In English)"),
    course("242605", "Supply Chain Management"),
    course("242607", "Industrial Relations"),
    course("242609", "Project Management"),
    course("242611", "International Trade"),
    course("242613", "Investment Management"),
    course("242615", "Bangladesh Economy"),
    course("242617", "Entrepreneurship"),
    course("242618", "Viva-voce"),
  ]),
  "BA/Bangla": year4([
    course("241001", "History of Bangla Literature-3 (Development of Bangladeshi Literature Since 1947 to 2000)"),
    course("241003", "Bangla Novel-3"),
    course("241005", "Western Literary Theories and Methods of …"),
    course("241007", "Bangla Drama-2"),
    course("241009", "Classical Literature (Translated)"),
    course("241011", "Bangla Short-Stories-2"),
    course("241013", "Bangla Poetry-3"),
    course("241015", "Phonetics and Linguistics"),
    course("241017", "Literature on Bangladesh Liberation War"),
    course("241018", "Viva-voce"),
  ]),
  "BSS/Political Science": year4([
    course("241901", "Political Theories: Changes and Continuities"),
    course("241903", "Local Government and Rural Development in …"),
    course("241905", "Introduction to Public Policy"),
    course("241907", "Government and Politics in East Asia: China, Japan …"),
    course("241909", "Environment and Development"),
    course("241911", "Foreign Relations of Bangladesh"),
    course("241913", "Legislative Process in Bangladesh"),
    course("241915", "Globalization, Regionalism and International Financial Institutions"),
    course("241917", "Modern Political Thought"),
    course("241918", "Viva-voce"),
  ]),
};
