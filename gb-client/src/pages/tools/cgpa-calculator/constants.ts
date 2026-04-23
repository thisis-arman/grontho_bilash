import { GradingScaleEntry } from './types';

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

export const DEFAULT_SCALE_TYPE = '4.00';
