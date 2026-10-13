export interface Course {
  id: string;
  name: string;
  credits: number | '';
  grade: string;
}

// How a term's result is entered: course by course, or as one GPA figure
// (for students who only have the published GPA of a semester/year).
export type TermEntry = 'courses' | 'direct';

// A semester or an academic year, depending on the chosen system.
export interface Term {
  id: string;
  name: string;
  included: boolean;
  entry: TermEntry;
  courses: Course[];
  directGpa: number | '';
  directCredits: number | '';
}

export type AcademicSystem = 'semester' | 'year';

export interface StudentInfo {
  name: string;
  studentId: string;
  institution: string;
  program: string;
  session: string;
}

export interface GradingScaleEntry {
  grade: string;
  points: number;
}

export type GradingScaleType = '4.00' | '5.00';

export interface TermResult {
  gpa: number;
  credits: number;
  points: number;
}
