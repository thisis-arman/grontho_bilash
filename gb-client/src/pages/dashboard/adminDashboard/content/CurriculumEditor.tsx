import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDown, ArrowUp, ClipboardPaste, ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { btn, ConfirmDialog, errorMessage, ErrorState, Field, inputClass, LoadingRows, Panel } from "../../../../components/dashboard/ui";
import { EditorHeader, SidePanel, useUnsavedChangesWarning } from "../../../../components/content/EditorParts";
import {
  Course,
  Curriculum,
  CurriculumYear,
  useDeleteCurriculumMutation,
  useGetAdminCurriculumQuery,
  useSaveCurriculumMutation,
} from "../../../../redux/features/hub/hubApi";

type Draft = Omit<Curriculum, "_id" | "slug" | "updatedAt">;

const EMPTY: Draft = {
  institution: "National University",
  institutionBn: "জাতীয় বিশ্ববিদ্যালয়",
  level: "Honours",
  program: "",
  programName: "",
  programNameBn: "",
  department: "",
  departmentBn: "",
  years: [],
  status: "published",
};

const fromDoc = (d: Curriculum): Draft => ({
  institution: d.institution,
  institutionBn: d.institutionBn ?? "",
  level: d.level,
  program: d.program,
  programName: d.programName ?? "",
  programNameBn: d.programNameBn ?? "",
  department: d.department,
  departmentBn: d.departmentBn ?? "",
  years: [...(d.years ?? [])].sort((a, b) => a.year - b.year).map((y) => ({ ...y, courses: [...(y.courses ?? [])] })),
  status: d.status ?? "published",
});

// One course per line. Accepted: "212501 Principles of Accounting 100 4",
// "212501 - Principles of Accounting", or just "Principles of Accounting".
const parsePasted = (text: string): Course[] =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      let rest = line;
      const code = rest.match(/^([0-9]{3,8}|[A-Z]{2,5}[- ]?\d{2,4})\b\s*[-–:]?\s*/);
      if (code) rest = rest.slice(code[0].length);
      const nums = rest.match(/\s+(\d{2,3})\s+(\d(?:\.\d+)?)\s*$/);
      if (nums) rest = rest.slice(0, nums.index).trim();
      return {
        ...(code ? { code: code[1].replace(/\s/g, "") } : {}),
        title: rest.replace(/^[-–:]\s*/, "").trim(),
        marks: nums ? Number(nums[1]) : null,
        credits: nums ? Number(nums[2]) : null,
      };
    })
    .filter((c) => c.title.length >= 2);

const yearName = (y: number) => ["", "1st year", "2nd year", "3rd year", "4th year", "5th year"][y] ?? `Year ${y}`;

const CurriculumEditor = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetAdminCurriculumQuery(id ?? "", { skip: isNew });
  const [save, { isLoading: saving }] = useSaveCurriculumMutation();
  const [remove, { isLoading: removing }] = useDeleteCurriculumMutation();
  const saved = data?.data;

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [baseline, setBaseline] = useState<Draft>(EMPTY);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (saved) {
      const next = fromDoc(saved);
      setDraft(next);
      setBaseline(next);
      setActiveYear((y) => y ?? next.years[0]?.year ?? null);
    }
  }, [saved]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline]);
  useUnsavedChangesWarning(dirty);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const year = draft.years.find((y) => y.year === activeYear);
  const setYear = (changes: Partial<CurriculumYear>) =>
    setDraft((d) => ({ ...d, years: d.years.map((y) => (y.year === activeYear ? { ...y, ...changes } : y)) }));
  const setCourse = (i: number, changes: Partial<Course>) =>
    year && setYear({ courses: year.courses.map((c, j) => (j === i ? { ...c, ...changes } : c)) });
  const moveCourse = (i: number, delta: number) => {
    if (!year) return;
    const courses = [...year.courses];
    const j = i + delta;
    if (j < 0 || j >= courses.length) return;
    [courses[i], courses[j]] = [courses[j], courses[i]];
    setYear({ courses });
  };

  const addYear = () => {
    const next = [1, 2, 3, 4, 5].find((y) => !draft.years.some((x) => x.year === y));
    if (!next) return void toast.error("All five years already exist.");
    const prev = draft.years[draft.years.length - 1];
    setDraft((d) => ({ ...d, years: [...d.years, { year: next, session: prev?.session ?? "", syllabusUrl: "", publishedAt: "", courses: [] }].sort((a, b) => a.year - b.year) }));
    setActiveYear(next);
  };

  const removeYear = () => {
    if (!year) return;
    if (year.courses.length && !window.confirm(`Remove ${yearName(year.year)} and its ${year.courses.length} courses?`)) return;
    const rest = draft.years.filter((y) => y.year !== year.year);
    set("years", rest);
    setActiveYear(rest[0]?.year ?? null);
  };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!draft.program.trim() || !draft.department.trim()) return void toast.error("Program and department are required.");
    const years = draft.years.map((y) => ({
      year: y.year,
      session: y.session?.trim() || undefined,
      syllabusUrl: y.syllabusUrl?.trim() || undefined,
      publishedAt: y.publishedAt?.trim() || undefined,
      courses: y.courses
        .map((c) => ({
          ...(c.code?.trim() ? { code: c.code.trim() } : {}),
          title: c.title.trim(),
          marks: c.marks ?? null,
          credits: c.credits ?? null,
          ...(c.group?.trim() ? { group: c.group.trim() } : {}),
        }))
        .filter((c) => c.title),
    }));
    try {
      const res = await save({ id, data: { ...draft, years } }).unwrap();
      const next = fromDoc(res.data);
      setDraft(next);
      setBaseline(next);
      toast.success(isNew ? "Department created" : "Saved");
      if (isNew) navigate(`/admin/curriculum/${res.data._id}/edit`, { replace: true });
    } catch (error) {
      toast.error(errorMessage(error, "Could not save"));
    }
  };

  if (!isNew && isLoading) return <Panel flush><LoadingRows rows={6} /></Panel>;
  if (!isNew && (isError || !saved)) return <Panel flush><ErrorState onRetry={refetch} /></Panel>;

  const numberInput = (value: number | null | undefined, onChange: (v: number | null) => void, label: string) => (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      aria-label={label}
      placeholder={label}
      className={`${inputClass} w-24`}
    />
  );

  return (
    <form onSubmit={submit}>
      <EditorHeader
        backTo="/admin/curriculum"
        backLabel="All departments"
        title={isNew ? "New department" : `${draft.department} (${draft.program})`}
        status={isNew ? undefined : draft.status}
        actions={
          <>
            {!isNew && saved && (
              <a href={`/courses/${saved.slug}`} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
                <ExternalLink size={16} aria-hidden="true" /> View
              </a>
            )}
            <button type="submit" disabled={saving} className={btn.primary}>
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Panel
          title="Courses by year"
          flush
          action={
            <button type="button" onClick={addYear} className={btn.secondary}>
              <Plus size={16} aria-hidden="true" /> Add year
            </button>
          }
        >
          {draft.years.length === 0 ? (
            <p className="p-6 text-center text-sm text-stone-500">No years yet. Click “Add year” to start adding subjects.</p>
          ) : (
            <>
              {/* Year tabs */}
              <div role="tablist" aria-label="Year" className="flex gap-1 overflow-x-auto border-b border-stone-100 px-3 pt-3">
                {draft.years.map((y) => (
                  <button
                    key={y.year}
                    type="button"
                    role="tab"
                    aria-selected={y.year === activeYear}
                    onClick={() => setActiveYear(y.year)}
                    className={`whitespace-nowrap rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold transition ${
                      y.year === activeYear ? "border-amber-500 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {yearName(y.year)} <span className="text-xs font-normal text-stone-400">({y.courses.length})</span>
                  </button>
                ))}
              </div>

              {year && (
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Session" hint="e.g. 2024-2025">
                      <input value={year.session ?? ""} onChange={(e) => setYear({ session: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Official syllabus link (PDF)">
                      <input value={year.syllabusUrl ?? ""} onChange={(e) => setYear({ syllabusUrl: e.target.value })} placeholder="https://www.nu.ac.bd/..." className={inputClass} />
                    </Field>
                    <Field label="Published on">
                      <input value={year.publishedAt ?? ""} onChange={(e) => setYear({ publishedAt: e.target.value })} placeholder="November 12, 2025" className={inputClass} />
                    </Field>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-stone-800">Subjects ({year.courses.length})</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setPasteOpen((v) => !v)} className={btn.secondary}>
                        <ClipboardPaste size={16} aria-hidden="true" /> Paste many
                      </button>
                      <button type="button" onClick={removeYear} className={btn.secondary}>
                        <Trash2 size={16} aria-hidden="true" /> Remove year
                      </button>
                    </div>
                  </div>

                  {pasteOpen && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <Field label="One subject per line" hint="“212501 Principles of Accounting 100 4”, “212501 - Principles of Accounting” or just the title.">
                        <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={6} className={inputClass} placeholder={"212501 Principles of Accounting 100 4\n212503 Introduction to Business 100 4"} />
                      </Field>
                      <div className="mt-3 flex justify-end gap-2">
                        <button type="button" onClick={() => setPasteOpen(false)} className={btn.secondary}>
                          Cancel
                        </button>
                        <button
                          type="button"
                          className={btn.primary}
                          onClick={() => {
                            const courses = parsePasted(pasted);
                            if (!courses.length) return void toast.error("No subjects found in the text.");
                            setYear({ courses: [...year.courses, ...courses].slice(0, 60) });
                            setPasted("");
                            setPasteOpen(false);
                            toast.success(`Added ${courses.length} subjects`);
                          }}
                        >
                          Add subjects
                        </button>
                      </div>
                    </div>
                  )}

                  <ol className="space-y-2">
                    {year.courses.map((c, i) => (
                      <li key={i} className="rounded-xl border border-stone-200 p-3">
                        <div className="flex items-start gap-2">
                          <div className="grid flex-1 gap-2 sm:grid-cols-[7rem_1fr]">
                            <input value={c.code ?? ""} onChange={(e) => setCourse(i, { code: e.target.value })} placeholder="Code" aria-label={`Subject ${i + 1} code`} className={`${inputClass} font-mono`} />
                            <input value={c.title} onChange={(e) => setCourse(i, { title: e.target.value })} placeholder="Subject title" aria-label={`Subject ${i + 1} title`} className={inputClass} />
                            <div className="flex flex-wrap gap-2 sm:col-span-2">
                              {numberInput(c.marks, (v) => setCourse(i, { marks: v }), "Marks")}
                              {numberInput(c.credits, (v) => setCourse(i, { credits: v }), "Credits")}
                              <input
                                value={c.group ?? ""}
                                onChange={(e) => setCourse(i, { group: e.target.value })}
                                placeholder="Elective group (optional), e.g. Group-A (Any Two)"
                                aria-label={`Subject ${i + 1} elective group`}
                                className={`${inputClass} min-w-0 flex-1`}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <button type="button" onClick={() => moveCourse(i, -1)} disabled={i === 0} aria-label="Move up" className={btn.icon}>
                              <ArrowUp size={15} aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => moveCourse(i, 1)} disabled={i === year.courses.length - 1} aria-label="Move down" className={btn.icon}>
                              <ArrowDown size={15} aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => setYear({ courses: year.courses.filter((_, j) => j !== i) })} aria-label="Remove subject" className={btn.icon}>
                              <Trash2 size={15} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>

                  {year.courses.length < 60 && (
                    <button type="button" onClick={() => setYear({ courses: [...year.courses, { code: "", title: "", marks: 100, credits: 4 }] })} className={`${btn.secondary} w-full`}>
                      <Plus size={16} aria-hidden="true" /> Add subject
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </Panel>

        <div className="space-y-6">
          <SidePanel title="Department">
            <Field label="Institution">
              <input value={draft.institution} onChange={(e) => set("institution", e.target.value)} className={inputClass} disabled={!isNew} />
            </Field>
            <Field label="Institution (Bangla)">
              <input value={draft.institutionBn ?? ""} onChange={(e) => set("institutionBn", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Level">
              <input value={draft.level} onChange={(e) => set("level", e.target.value)} className={inputClass} disabled={!isNew} />
            </Field>
            <Field label="Program code" hint="BA, BSS, BSc, BBA …">
              <input value={draft.program} onChange={(e) => set("program", e.target.value)} className={inputClass} disabled={!isNew} required />
            </Field>
            <Field label="Program name">
              <input value={draft.programName ?? ""} onChange={(e) => set("programName", e.target.value)} placeholder="Bachelor of Business Administration (Honours)" className={inputClass} />
            </Field>
            <Field label="Program name (Bangla)">
              <input value={draft.programNameBn ?? ""} onChange={(e) => set("programNameBn", e.target.value)} placeholder="বিবিএ (অনার্স)" className={inputClass} />
            </Field>
            <Field label="Department">
              <input value={draft.department} onChange={(e) => set("department", e.target.value)} className={inputClass} disabled={!isNew} required />
            </Field>
            <Field label="Department (Bangla)">
              <input value={draft.departmentBn ?? ""} onChange={(e) => set("departmentBn", e.target.value)} placeholder="হিসাববিজ্ঞান" className={inputClass} />
            </Field>
            <Field label="Visibility">
              <select value={draft.status} onChange={(e) => set("status", e.target.value as Draft["status"])} className={inputClass}>
                <option value="published">Published</option>
                <option value="draft">Hidden (draft)</option>
              </select>
            </Field>
            {!isNew && (
              <p className="text-xs text-stone-500">Institution, level, program and department name are fixed after creating (they form the web address).</p>
            )}
          </SidePanel>
          {!isNew && (
            <button type="button" onClick={() => setConfirmDelete(true)} className={`${btn.secondary} w-full text-red-600`}>
              <Trash2 size={16} aria-hidden="true" /> Delete department
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this department?"
        desc="Students will no longer see it at /courses. Listings already tagged with its courses keep their tags."
        confirmLabel="Delete"
        loading={removing}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          try {
            await remove(id!).unwrap();
            toast.success("Deleted");
            navigate("/admin/curriculum", { replace: true });
          } catch (error) {
            toast.error(errorMessage(error, "Could not delete"));
          }
        }}
      />
    </form>
  );
};

export default CurriculumEditor;
