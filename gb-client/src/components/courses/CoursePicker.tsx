import { ChevronDown } from "lucide-react";
import { useGetCurriculaQuery, useGetCurriculumQuery } from "../../redux/features/hub/hubApi";
import { programLabel, yearLabel } from "../../i18n/labels";

// "Which course is this book for?" Program → department → year → subject,
// from the course catalogue, with "অন্য বিষয়" to type a subject that isn't
// listed, and "অন্যান্য" for SSC/HSC/other institutions.

export interface AcademicChoice {
  curriculum?: string; // department document id
  curriculumSlug?: string;
  program?: string; // "BBA" or "OTHER"
  departmentName?: string;
  year?: number;
  courseCode?: string;
  courseTitle?: string;
  customCourse?: boolean;
}

const OTHER = "OTHER";
const OTHER_COURSE = "__other__";

const selectCls =
  "block h-12 w-full cursor-pointer appearance-none rounded-xl border border-stone-200 bg-white px-3.5 pr-9 text-sm text-stone-900 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400";
const inputCls =
  "block h-12 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-900 placeholder:text-stone-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200";
const labelCls = "mb-1.5 block text-sm font-semibold text-stone-700";

const Select = ({ id, label, value, onChange, disabled, children }: { id: string; label: string; value: string; onChange: (v: string) => void; disabled?: boolean; children: React.ReactNode }) => (
  <label htmlFor={id} className="block">
    <span className={labelCls}>{label}</span>
    <span className="relative block">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={selectCls}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
    </span>
  </label>
);

const CoursePicker = ({ value, onChange }: { value: AcademicChoice; onChange: (v: AcademicChoice) => void }) => {
  const { data: listData, isLoading } = useGetCurriculaQuery();
  const { data: deptData, isFetching: loadingDept } = useGetCurriculumQuery(value.curriculumSlug ?? "", { skip: !value.curriculumSlug });

  const departments = listData?.data ?? [];
  const programs = [...new Set(departments.map((d) => d.program))];
  const inProgram = departments.filter((d) => d.program === value.program);
  const dept = deptData?.data;
  const years = dept?.years ?? [];
  const courses = years.find((y) => y.year === value.year)?.courses ?? [];
  const isOther = value.program === OTHER;

  const courseValue = value.customCourse ? OTHER_COURSE : value.courseCode || (value.courseTitle ? value.courseTitle : "");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="cp-program"
          label="প্রোগ্রাম"
          value={value.program ?? ""}
          disabled={isLoading}
          onChange={(program) => onChange({ program })}
        >
          <option value="">{isLoading ? "লোড হচ্ছে…" : "প্রোগ্রাম বেছে নাও"}</option>
          {programs.map((p) => (
            <option key={p} value={p}>
              জাতীয় বিশ্ববিদ্যালয় – {programLabel(p)}
            </option>
          ))}
          <option value={OTHER}>অন্যান্য (এসএসসি, এইচএসসি, অন্য প্রতিষ্ঠান)</option>
        </Select>

        {!isOther && (
          <Select
            id="cp-department"
            label="বিভাগ"
            value={value.curriculum ?? ""}
            disabled={!value.program}
            onChange={(id) => {
              const d = inProgram.find((x) => x._id === id);
              onChange({ program: value.program, curriculum: id || undefined, curriculumSlug: d?.slug, departmentName: d?.department });
            }}
          >
            <option value="">বিভাগ বেছে নাও</option>
            {inProgram.map((d) => (
              <option key={d._id} value={d._id}>
                {d.departmentBn ? `${d.departmentBn} (${d.department})` : d.department}
              </option>
            ))}
          </Select>
        )}

        {!isOther && (
          <Select
            id="cp-year"
            label="বর্ষ"
            value={value.year ? String(value.year) : ""}
            disabled={!value.curriculum || loadingDept}
            onChange={(y) => onChange({ ...value, year: y ? Number(y) : undefined, courseCode: undefined, courseTitle: undefined, customCourse: false })}
          >
            <option value="">{loadingDept ? "লোড হচ্ছে…" : "বর্ষ বেছে নাও"}</option>
            {years.map((y) => (
              <option key={y.year} value={y.year}>
                {yearLabel(y.year)}
              </option>
            ))}
          </Select>
        )}

        {!isOther && (
          <Select
            id="cp-course"
            label="কোর্স / বিষয়"
            value={courseValue}
            disabled={!value.year}
            onChange={(v) => {
              if (v === OTHER_COURSE) return onChange({ ...value, courseCode: undefined, courseTitle: "", customCourse: true });
              const c = courses.find((x) => (x.code || x.title) === v);
              onChange({ ...value, courseCode: c?.code, courseTitle: c?.title, customCourse: false });
            }}
          >
            <option value="">কোর্স বেছে নাও (ঐচ্ছিক)</option>
            {courses.map((c) => (
              <option key={`${c.code}-${c.title}`} value={c.code || c.title}>
                {c.code ? `${c.code} · ` : ""}
                {c.title}
              </option>
            ))}
            <option value={OTHER_COURSE}>অন্য বিষয় (নিজে লিখি)</option>
          </Select>
        )}
      </div>

      {(isOther || value.customCourse) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {isOther && (
            <label className="block">
              <span className={labelCls}>শ্রেণি / বিভাগ</span>
              <input
                value={value.departmentName ?? ""}
                onChange={(e) => onChange({ ...value, departmentName: e.target.value.slice(0, 120) })}
                placeholder="যেমন এইচএসসি বিজ্ঞান, ঢাকা বিশ্ববিদ্যালয় ফিজিক্স"
                className={inputCls}
              />
            </label>
          )}
          <label className={`block ${isOther ? "" : "sm:col-span-2"}`}>
            <span className={labelCls}>বিষয়ের নাম</span>
            <input
              value={value.courseTitle ?? ""}
              onChange={(e) => onChange({ ...value, courseTitle: e.target.value.slice(0, 200) })}
              placeholder="যেমন পদার্থবিজ্ঞান ১ম পত্র"
              className={inputCls}
            />
          </label>
        </div>
      )}

      <p className="text-xs leading-relaxed text-stone-500">
        কোন কোর্সের বই জানালে ঠিক সেই কোর্সের শিক্ষার্থীরা সহজে তোমার বই খুঁজে পাবে। কোর্স তালিকায় না থাকলে “অন্য বিষয়” বেছে লিখে দাও।
      </p>
    </div>
  );
};

export default CoursePicker;
