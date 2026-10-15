import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calculator, Download, Plus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import {
  AcademicSystem,
  Course,
  GradingScaleType,
  StudentInfo,
  Term,
} from './types';
import {
  DEFAULT_SCALE_TYPE,
  EMPTY_STUDENT,
  SCALE_4,
  SCALE_5,
  STORAGE_KEY,
  defaultTermName,
  getTermResult,
  isDefaultTermName,
  newCourse,
  newTerm,
} from './constants';
import TermCard from './TermCard';
import { ReportData, downloadReportCard, drawReportCard } from './reportCard';
import ToolHeader from '../ToolHeader';
import { card, input, label, primaryButton, secondaryButton, segment, segmentGroup } from '../toolStyles';

interface SavedState {
  system: AcademicSystem;
  scaleType: GradingScaleType;
  terms: Term[];
  student: StudentInfo;
}

const initialState = (): SavedState => ({
  system: 'semester',
  scaleType: DEFAULT_SCALE_TYPE,
  terms: [newTerm('semester', 1)],
  student: EMPTY_STUDENT,
});

// Reads saved data, including the older format that stored `semesters`
// without an entry mode.
const loadState = (): SavedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const saved = JSON.parse(raw);
    const savedTerms: Partial<Term>[] = saved.terms ?? saved.semesters ?? [];
    if (!Array.isArray(savedTerms) || savedTerms.length === 0) return initialState();

    const system: AcademicSystem = saved.system === 'year' ? 'year' : 'semester';
    return {
      system,
      scaleType: saved.scaleType === '5.00' ? '5.00' : '4.00',
      student: { ...EMPTY_STUDENT, ...(saved.student ?? {}) },
      terms: savedTerms.map((term, i) => ({
        ...newTerm(system, i + 1),
        ...term,
        entry: term.entry === 'direct' ? 'direct' : 'courses',
        courses: term.courses?.length ? term.courses : [newCourse()],
      })),
    };
  } catch {
    return initialState();
  }
};

const studentFields: { key: keyof StudentInfo; label: string; placeholder: string; required?: boolean }[] = [
  { key: 'name', label: 'তোমার নাম', placeholder: 'যেমন Arman Hossain', required: true },
  { key: 'studentId', label: 'স্টুডেন্ট আইডি / রোল', placeholder: 'ঐচ্ছিক' },
  { key: 'institution', label: 'শিক্ষাপ্রতিষ্ঠান', placeholder: 'ঐচ্ছিক' },
  { key: 'program', label: 'বিভাগ / প্রোগ্রাম', placeholder: 'যেমন BBA in Accounting' },
  { key: 'session', label: 'সেশন', placeholder: 'যেমন 2020-2021' },
];

export default function CgpaCalculator() {
  const [state, setState] = useState<SavedState>(loadState);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { system, scaleType, terms, student } = state;
  const activeScale = scaleType === '4.00' ? SCALE_4 : SCALE_5;
  const maxPoints = Number(scaleType);
  const termLabel = system === 'year' ? 'ইয়ার' : 'সেমিস্টার';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode); the tool still works.
    }
  }, [state]);

  const setTerms = (update: (terms: Term[]) => Term[]) =>
    setState((prev) => ({ ...prev, terms: update(prev.terms) }));

  const updateTerm = (id: string, patch: Partial<Term>) =>
    setTerms((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const updateCourses = (termId: string, update: (courses: Course[]) => Course[]) =>
    setTerms((list) => list.map((t) => (t.id === termId ? { ...t, courses: update(t.courses) } : t)));

  const changeSystem = (next: AcademicSystem) =>
    setState((prev) => ({
      ...prev,
      system: next,
      // Auto-generated names follow the system; names the student typed stay.
      terms: prev.terms.map((t, i) =>
        isDefaultTermName(t.name) ? { ...t, name: defaultTermName(next, i + 1) } : t
      ),
    }));

  const resetAll = () => {
    setState((prev) => ({ ...initialState(), system: prev.system, scaleType: prev.scaleType, terms: [newTerm(prev.system, 1)] }));
    setConfirmingReset(false);
  };

  const results = useMemo(
    () => terms.map((term) => getTermResult(term, activeScale, maxPoints)),
    [terms, activeScale, maxPoints]
  );

  const { cgpa, totalCredits } = useMemo(() => {
    let credits = 0;
    let points = 0;
    terms.forEach((term, i) => {
      if (!term.included) return;
      credits += results[i].credits;
      points += results[i].points;
    });
    return { cgpa: credits > 0 ? points / credits : 0, totalCredits: credits };
  }, [terms, results]);

  const reportData = useMemo<ReportData>(
    () => ({
      student,
      system,
      scaleLabel: scaleType,
      cgpa,
      credits: totalCredits,
      terms: terms.flatMap((term, i) => {
        const result = results[i];
        if (!term.included || result.credits === 0) return [];
        return [{
          name: term.name,
          gpa: result.gpa,
          credits: result.credits,
          rows:
            term.entry === 'direct'
              ? undefined
              : term.courses.flatMap((course) => {
                  const grade = activeScale.find((g) => g.grade === course.grade);
                  const credits = Number(course.credits);
                  return course.credits !== '' && credits > 0 && grade
                    ? [{ name: course.name.trim(), credits, grade: grade.grade, points: grade.points }]
                    : [];
                }),
        }];
      }),
    }),
    [student, system, scaleType, cgpa, totalCredits, terms, results, activeScale]
  );

  // Keep the on-page preview in step with the data. It is the same canvas
  // that gets downloaded, so what you see is what you get.
  useEffect(() => {
    if (canvasRef.current) drawReportCard(canvasRef.current, reportData);
  }, [reportData]);

  const canDownload = student.name.trim() !== '' && totalCredits > 0;

  const handleDownload = async () => {
    if (!canvasRef.current || !canDownload) return;
    setIsDownloading(true);
    try {
      await drawReportCard(canvasRef.current, reportData);
      await downloadReportCard(canvasRef.current, student.name);
      toast.success('রিপোর্ট কার্ড ডাউনলোড হয়েছে');
    } catch {
      toast.error('ডাউনলোড করা যায়নি, আবার চেষ্টা করো');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <ToolHeader
        icon={Calculator}
        title="CGPA ক্যালকুলেটর"
        desc="সেমিস্টার বা ইয়ার, যেভাবে তোমার রেজাল্ট হয় সেভাবেই হিসাব করো। শেষে নিজের নামে রিপোর্ট কার্ড ডাউনলোড করতে পারবে।"
      />

      {/* Settings */}
      <div className={`${card} mb-6 grid gap-5 sm:grid-cols-2`}>
        <div>
          <p className={label}>তোমার রেজাল্ট হয়</p>
          <div className={segmentGroup} role="group" aria-label="একাডেমিক পদ্ধতি">
            <button type="button" aria-pressed={system === 'semester'} onClick={() => changeSystem('semester')} className={segment(system === 'semester')}>
              সেমিস্টার ভিত্তিক
            </button>
            <button type="button" aria-pressed={system === 'year'} onClick={() => changeSystem('year')} className={segment(system === 'year')}>
              ইয়ার ভিত্তিক
            </button>
          </div>
        </div>
        <div>
          <p className={label}>গ্রেডিং স্কেল</p>
          <div className={segmentGroup} role="group" aria-label="গ্রেডিং স্কেল">
            {(['4.00', '5.00'] as GradingScaleType[]).map((scale) => (
              <button
                key={scale}
                type="button"
                aria-pressed={scaleType === scale}
                onClick={() => setState((prev) => ({ ...prev, scaleType: scale }))}
                className={segment(scaleType === scale)}
              >
                {scale} স্কেল
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live result, pinned while scrolling through terms */}
      <div className="scheme-fixed sticky top-20 z-30 mb-6 rounded-2xl bg-stone-900 p-4 text-white shadow-lg ring-1 ring-white/10 sm:p-5" aria-live="polite">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-stone-400">মোট CGPA</p>
            <p className="font-display text-4xl font-extrabold leading-none text-amber-400 sm:text-5xl">
              {totalCredits > 0 ? cgpa.toFixed(2) : '0.00'}
              <span className="ml-2 text-base font-semibold text-stone-500">/ {scaleType}</span>
            </p>
          </div>
          <p className="text-right text-sm text-stone-400">
            মোট ক্রেডিট
            <span className="block font-display text-2xl font-bold text-white">{totalCredits}</span>
          </p>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-amber-400"
            animate={{ width: `${Math.min(100, (cgpa / maxPoints) * 100)}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      {/* Terms */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {terms.map((term, i) => (
            <TermCard
              key={term.id}
              term={term}
              termLabel={termLabel}
              gradingScale={activeScale}
              maxPoints={maxPoints}
              result={results[i]}
              canRemove={terms.length > 1}
              onUpdate={(patch) => updateTerm(term.id, patch)}
              onRemove={() => setTerms((list) => list.filter((t) => t.id !== term.id))}
              onAddCourse={() => updateCourses(term.id, (courses) => [...courses, newCourse()])}
              onUpdateCourse={(courseId, patch) =>
                updateCourses(term.id, (courses) => courses.map((c) => (c.id === courseId ? { ...c, ...patch } : c)))
              }
              onRemoveCourse={(courseId) =>
                updateCourses(term.id, (courses) => courses.filter((c) => c.id !== courseId))
              }
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setTerms((list) => [...list, newTerm(system, list.length + 1)])}
          className={primaryButton}
        >
          <Plus size={18} aria-hidden="true" /> {termLabel} যোগ করো
        </button>

        {confirmingReset ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-stone-600">সব রেজাল্ট মুছে যাবে।</span>
            <button type="button" onClick={resetAll} className="rounded-lg bg-red-600 px-3 py-2 font-semibold text-white transition hover:bg-red-700">
              হ্যাঁ, মুছো
            </button>
            <button type="button" onClick={() => setConfirmingReset(false)} className="rounded-lg px-3 py-2 font-semibold text-stone-600 transition hover:bg-stone-200">
              না
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmingReset(true)} className={secondaryButton}>
            <RotateCcw size={16} aria-hidden="true" /> সব রিসেট করো
          </button>
        )}
      </div>

      {/* Report card */}
      <section className="mt-14" aria-labelledby="report-heading">
        <h2 id="report-heading" className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">
          তোমার রিপোর্ট কার্ড
        </h2>
        <p className="mt-2 max-w-2xl text-stone-600">
          নিচে তথ্য দাও, পাশে রিপোর্ট কার্ড সাথে সাথে তৈরি হবে। এটা তোমার নিজের
          হিসাবের সারাংশ, অফিসিয়াল ট্রান্সক্রিপ্ট নয়।
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <div className={card}>
            <div className="space-y-4">
              {studentFields.map((field) => (
                <label key={field.key} className="block">
                  <span className={label}>
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </span>
                  <input
                    type="text"
                    value={student[field.key]}
                    maxLength={80}
                    autoComplete={field.key === 'name' ? 'name' : 'off'}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, student: { ...prev.student, [field.key]: e.target.value } }))
                    }
                    placeholder={field.placeholder}
                    className={input}
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!canDownload || isDownloading}
              className={`${primaryButton} mt-6 w-full`}
            >
              <Download size={18} aria-hidden="true" />
              {isDownloading ? 'তৈরি হচ্ছে...' : 'রিপোর্ট কার্ড ডাউনলোড করো (PNG)'}
            </button>
            {!canDownload && (
              <p className="mt-2 text-center text-xs text-stone-500">
                {totalCredits === 0
                  ? 'আগে উপরে অন্তত একটা রেজাল্ট দাও।'
                  : 'ডাউনলোড করতে তোমার নাম লেখো।'}
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="রিপোর্ট কার্ডের প্রিভিউ"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </section>
    </>
  );
}
