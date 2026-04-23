export interface Course {
  id: string;
  name: string;
  credits: number | '';
  grade: string;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
  included: boolean;
}

export interface GradingScaleEntry {
  grade: string;
  points: number;
}

export type GradingScaleType = '4.00' | '5.00' | 'custom';
