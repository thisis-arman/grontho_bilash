import {
  AcademicSystem,
  Course,
  GradingScaleEntry,
  GradingScaleType,
  StudentInfo,
  Term,
  TermResult,
} from './types';

export const SCALE_4: GradingScaleEntry[] = [
  { grade: 'A+', points: 4.0 },
  { grade: 'A', points: 3.75 },
  { grade: 'A-', points: 3.5 },
  { grade: 'B+', points: 3.25 },
  { grade: 'B', points: 3.0 },
  { grade: 'B-', points: 2.75 },
  { grade: 'C+', points: 2.5 },
  { grade: 'C', points: 2.25 },
  { grade: 'D', points: 2.0 },
  { grade: 'F', points: 0.0 },
];

export const SCALE_5: GradingScaleEntry[] = [
  { grade: 'A+', points: 5.0 },
  { grade: 'A', points: 4.0 },
  { grade: 'A-', points: 3.5 },
  { grade: 'B', points: 3.0 },
  { grade: 'C', points: 2.0 },
  { grade: 'D', points: 1.0 },
  { grade: 'F', points: 0.0 },
];

export const DEFAULT_SCALE_TYPE: GradingScaleType = '4.00';

export const STORAGE_KEY = 'gb_cgpa_data';

export const EMPTY_STUDENT: StudentInfo = {
  name: '',
  studentId: '',
  institution: '',
  program: '',
  session: '',
};

export const generateId = () => Math.random().toString(36).substring(2, 10);

const ordinal = (n: number) => {
  const suffix = n % 10 === 1 && n % 100 !== 11 ? 'st'
    : n % 10 === 2 && n % 100 !== 12 ? 'nd'
    : n % 10 === 3 && n % 100 !== 13 ? 'rd'
    : 'th';
  return `${n}${suffix}`;
};

export const defaultTermName = (system: AcademicSystem, position: number) =>
  system === 'year' ? `${ordinal(position)} Year` : `Semester ${position}`;

// True when a name is still one of the auto-generated ones, in either
// system, so switching system can rename it without touching custom names.
export const isDefaultTermName = (name: string) =>
  /^Semester \d+$/.test(name) || /^\d+(st|nd|rd|th) Year$/.test(name);

export const newCourse = (): Course => ({ id: generateId(), name: '', credits: 3, grade: '' });

export const newTerm = (system: AcademicSystem, position: number): Term => ({
  id: generateId(),
  name: defaultTermName(system, position),
  included: true,
  entry: 'courses',
  courses: [newCourse(), newCourse(), newCourse()],
  directGpa: '',
  directCredits: '',
});

// A term's GPA, credits and quality points. Rows that are incomplete or out
// of range are skipped rather than counted as zero.
export const getTermResult = (
  term: Term,
  scale: GradingScaleEntry[],
  maxPoints: number
): TermResult => {
  if (term.entry === 'direct') {
    const gpa = Number(term.directGpa);
    const credits = Number(term.directCredits);
    const valid =
      term.directGpa !== '' && term.directCredits !== '' &&
      gpa >= 0 && gpa <= maxPoints && credits > 0;
    return valid ? { gpa, credits, points: gpa * credits } : { gpa: 0, credits: 0, points: 0 };
  }

  let credits = 0;
  let points = 0;
  for (const course of term.courses) {
    const creditVal = Number(course.credits);
    const gradeEntry = scale.find((g) => g.grade === course.grade);
    if (course.credits !== '' && creditVal > 0 && gradeEntry) {
      credits += creditVal;
      points += creditVal * gradeEntry.points;
    }
  }
  return { gpa: credits > 0 ? points / credits : 0, credits, points };
};
