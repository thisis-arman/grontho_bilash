import { Trash2 } from 'lucide-react';
import { Course, GradingScaleEntry } from './types';

interface CourseRowProps {
  index: number;
  course: Course;
  gradingScale: GradingScaleEntry[];
  onUpdate: (id: string, field: keyof Course, value: any) => void;
  onRemove: (id: string) => void;
}

export default function CourseRow({ index, course, gradingScale, onUpdate, onRemove }: CourseRowProps) {
  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 mb-3 bg-card p-2 rounded-xl border border-border transition-all">
      <div className="w-8 flex-shrink-0 text-center text-sm text-muted-foreground font-medium">
        {index + 1}
      </div>
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          placeholder="Course Name (Optional)"
          value={course.name}
          onChange={(e) => onUpdate(course.id, 'name', e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
        />
      </div>
      <div className="w-24 flex-shrink-0">
        <input
          type="number"
          placeholder="Credits"
          min="0"
          step="0.5"
          defaultValue={4}
          value={course.credits}
          onChange={(e) => onUpdate(course.id, 'credits', e.target.value === '' ? '' : Number(e.target.value))}
          className={`w-full bg-background border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
            course.credits === 0 ? 'border-red-400 focus:ring-red-400' : 'border-border'
          }`}
        />
      </div>
      <div className="w-28 flex-shrink-0">
        <select
          value={course.grade}
          onChange={(e) => onUpdate(course.id, 'grade', e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50 cursor-pointer"
        >
          <option value="" disabled>Grade</option>
          {gradingScale.map((g) => (
            <option key={g.grade} value={g.grade}>
              {g.grade} ({g.points.toFixed(2)})
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => onRemove(course.id)}
        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        title="Remove Course"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
