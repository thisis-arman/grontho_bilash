import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Course, GradingScaleEntry, Term, TermResult } from './types';
import { input, segment, segmentGroup } from '../toolStyles';

interface TermCardProps {
  term: Term;
  termLabel: string; // "সেমিস্টার" or "ইয়ার"
  gradingScale: GradingScaleEntry[];
  maxPoints: number;
  result: TermResult;
  canRemove: boolean;
  onUpdate: (patch: Partial<Term>) => void;
  onRemove: () => void;
  onAddCourse: () => void;
  onUpdateCourse: (courseId: string, patch: Partial<Course>) => void;
  onRemoveCourse: (courseId: string) => void;
}

const toNumberOrEmpty = (value: string): number | '' => (value === '' ? '' : Number(value));

const iconButton =
  'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

export default function TermCard({
  term,
  termLabel,
  gradingScale,
  maxPoints,
  result,
  canRemove,
  onUpdate,
  onRemove,
  onAddCourse,
  onUpdateCourse,
  onRemoveCourse,
}: TermCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const directGpaInvalid =
    term.directGpa !== '' && (Number(term.directGpa) < 0 || Number(term.directGpa) > maxPoints);

  return (
    <motion.section
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`rounded-2xl border bg-white shadow-sm transition-opacity ${
        term.included ? 'border-stone-200' : 'border-dashed border-stone-300 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-4 sm:gap-3 sm:p-5">
        <input
          type="checkbox"
          checked={term.included}
          onChange={(e) => onUpdate({ included: e.target.checked })}
          aria-label={`${term.name} CGPA-তে ধরো`}
          title="CGPA-তে ধরো"
          className="h-5 w-5 flex-shrink-0 cursor-pointer rounded border-stone-300 text-amber-500 focus:ring-amber-400"
        />
        <input
          type="text"
          value={term.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          aria-label={`${termLabel}ের নাম`}
          placeholder={`${termLabel}ের নাম`}
          className="min-w-0 flex-1 rounded-lg border-0 bg-transparent px-1 py-1 font-display text-lg font-bold text-stone-900 focus:bg-stone-50 focus:ring-2 focus:ring-amber-200"
        />

        <div className="flex-shrink-0 text-right">
          <p className="font-display text-lg font-bold leading-tight text-stone-900">
            {result.credits > 0 ? result.gpa.toFixed(2) : '—'}
          </p>
          <p className="text-xs text-stone-500">{result.credits} ক্রেডিট</p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'ভাঁজ করো' : 'খোলো'}
          className={iconButton}
        >
          <ChevronDown
            size={20}
            aria-hidden="true"
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`${term.name} মুছে ফেলো`}
            className={`${iconButton} hover:bg-red-50 hover:text-red-600`}
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 p-4 sm:p-5">
              <div className={`${segmentGroup} mb-4 sm:max-w-sm`} role="group" aria-label="রেজাল্ট দেওয়ার ধরন">
                <button
                  type="button"
                  aria-pressed={term.entry === 'courses'}
                  onClick={() => onUpdate({ entry: 'courses' })}
                  className={segment(term.entry === 'courses')}
                >
                  কোর্স ধরে
                </button>
                <button
                  type="button"
                  aria-pressed={term.entry === 'direct'}
                  onClick={() => onUpdate({ entry: 'direct' })}
                  className={segment(term.entry === 'direct')}
                >
                  সরাসরি GPA
                </button>
              </div>

              {term.entry === 'direct' ? (
                <div>
                  <div className="grid gap-3 sm:max-w-md sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold text-stone-700">
                        এই {termLabel}ের GPA
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={maxPoints}
                        step="0.01"
                        value={term.directGpa}
                        onChange={(e) => onUpdate({ directGpa: toNumberOrEmpty(e.target.value) })}
                        placeholder={`0 – ${maxPoints.toFixed(2)}`}
                        aria-invalid={directGpaInvalid}
                        className={`${input} ${directGpaInvalid ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold text-stone-700">
                        মোট ক্রেডিট
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.5"
                        value={term.directCredits}
                        onChange={(e) => onUpdate({ directCredits: toNumberOrEmpty(e.target.value) })}
                        placeholder="যেমন 18"
                        className={input}
                      />
                    </label>
                  </div>
                  <p className={`mt-2 text-xs ${directGpaInvalid ? 'text-red-600' : 'text-stone-500'}`}>
                    {directGpaInvalid
                      ? `GPA 0 থেকে ${maxPoints.toFixed(2)} এর মধ্যে হতে হবে।`
                      : 'ক্রেডিট লাগে, কারণ CGPA হিসাব হয় ক্রেডিটের ওজন ধরে।'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {term.courses.map((course, index) => (
                        <motion.div
                          key={course.id}
                          layout="position"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.18 }}
                          className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_6.5rem_8.5rem_auto]"
                        >
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) => onUpdateCourse(course.id, { name: e.target.value })}
                            aria-label={`কোর্স ${index + 1} এর নাম`}
                            placeholder={`কোর্স ${index + 1} (ঐচ্ছিক)`}
                            className={`${input} col-span-3 sm:col-span-1`}
                          />
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="0.5"
                            value={course.credits}
                            onChange={(e) => onUpdateCourse(course.id, { credits: toNumberOrEmpty(e.target.value) })}
                            aria-label={`কোর্স ${index + 1} এর ক্রেডিট`}
                            placeholder="ক্রেডিট"
                            className={input}
                          />
                          <select
                            value={course.grade}
                            onChange={(e) => onUpdateCourse(course.id, { grade: e.target.value })}
                            aria-label={`কোর্স ${index + 1} এর গ্রেড`}
                            className={`${input} cursor-pointer`}
                          >
                            <option value="">গ্রেড</option>
                            {gradingScale.map((g) => (
                              <option key={g.grade} value={g.grade}>
                                {g.grade} ({g.points.toFixed(2)})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => onRemoveCourse(course.id)}
                            disabled={term.courses.length === 1}
                            aria-label={`কোর্স ${index + 1} মুছে ফেলো`}
                            className={`${iconButton} hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30`}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    onClick={onAddCourse}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:w-auto"
                  >
                    <Plus size={16} aria-hidden="true" /> কোর্স যোগ করো
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
