import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Course, GradingScaleEntry, Semester } from './types';
import CourseRow from './CourseRow';

interface SemesterCardProps {
  semester: Semester;
  gradingScale: GradingScaleEntry[];
  onUpdateSemester: (id: string, field: keyof Semester, value: any) => void;
  onRemoveSemester: (id: string) => void;
  onAddCourse: (semesterId: string) => void;
  onUpdateCourse: (semesterId: string, courseId: string, field: keyof Course, value: any) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  semesterGpa: number;
  totalCredits: number;
}

export default function SemesterCard({
  semester,
  gradingScale,
  onUpdateSemester,
  onRemoveSemester,
  onAddCourse,
  onUpdateCourse,
  onRemoveCourse,
  semesterGpa,
  totalCredits
}: SemesterCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`bg-card border rounded-2xl shadow-sm transition-all mb-6 ${!semester.included ? 'opacity-60 border-dashed' : 'border-border'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3 flex-1">
          <input 
            type="checkbox" 
            checked={semester.included}
            onChange={(e) => onUpdateSemester(semester.id, 'included', e.target.checked)}
            className="w-5 h-5 rounded border-border text-yellow-600 focus:ring-yellow-500 cursor-pointer"
            title="Include in total CGPA"
          />
          <input
            type="text"
            value={semester.name}
            onChange={(e) => onUpdateSemester(semester.id, 'name', e.target.value)}
            className="font-bold text-lg bg-transparent border-none focus:ring-0 p-0 text-foreground w-full max-w-[200px]"
            placeholder="Semester Name"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm text-muted-foreground">GPA: <strong className="text-foreground">{semesterGpa.toFixed(2)}</strong></span>
            <span className="text-xs text-muted-foreground">Credits: {totalCredits}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <button
              onClick={() => onRemoveSemester(semester.id)}
              className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-colors"
              title="Remove Semester"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="p-4 bg-muted/30">
          <div className="sm:hidden flex justify-between items-center mb-4 px-3 py-3 bg-muted rounded-lg">
            <span className="text-sm font-medium text-foreground">GPA: {semesterGpa.toFixed(2)}</span>
            <span className="text-sm font-medium text-foreground">Credits: {totalCredits}</span>
          </div>

          <div className="space-y-1">
            {semester.courses.map((course, index) => (
              <CourseRow
                key={course.id}
                index={index}
                course={course}
                gradingScale={gradingScale}
                onUpdate={(courseId, field, value) => onUpdateCourse(semester.id, courseId, field, value)}
                onRemove={(courseId) => onRemoveCourse(semester.id, courseId)}
              />
            ))}
          </div>

          <button
            onClick={() => onAddCourse(semester.id)}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40 px-4 py-2.5 rounded-xl transition-colors w-full justify-center sm:w-auto border border-yellow-200 dark:border-yellow-900/30"
          >
            <Plus size={16} /> Add Course
          </button>
        </div>
      )}
    </div>
  );
}
