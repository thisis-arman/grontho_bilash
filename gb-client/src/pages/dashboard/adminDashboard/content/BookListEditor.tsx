import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDown, ArrowUp, ClipboardPaste, ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { btn, errorMessage, ErrorState, Field, inputClass, LoadingRows, Panel } from "../../../../components/dashboard/ui";
import { EditorHeader, SidePanel, useUnsavedChangesWarning } from "../../../../components/content/EditorParts";
import {
  BookList,
  BookListBook,
  useGetAdminBookListQuery,
  useGetBookListFiltersQuery,
  useSaveBookListMutation,
} from "../../../../redux/features/hub/hubApi";
import { EXAM_LEVEL_LABELS } from "../../../../i18n/labels";

const LEVELS = Object.keys(EXAM_LEVEL_LABELS);

type Draft = {
  title: string;
  description: string;
  level: string;
  institution: string;
  program: string;
  department: string;
  academicYear: string;
  session: string;
  slug: string;
  books: BookListBook[];
};

const EMPTY: Draft = {
  title: "",
  description: "",
  level: "Honours",
  institution: "",
  program: "",
  department: "",
  academicYear: "",
  session: "",
  slug: "",
  books: [],
};

const TEXT_FIELDS = [
  { key: "institution", label: "Institution / board", placeholder: "জাতীয় বিশ্ববিদ্যালয়" },
  { key: "program", label: "Program", placeholder: "BBA (Honours)" },
  { key: "department", label: "Department / group", placeholder: "হিসাববিজ্ঞান" },
  { key: "academicYear", label: "Year / class", placeholder: "২য় বর্ষ" },
  { key: "session", label: "Session (optional)", placeholder: "2023-24" },
] as const;

const fromList = (list: BookList): Draft => ({
  title: list.title ?? "",
  description: list.description ?? "",
  level: list.level ?? "Honours",
  institution: list.institution ?? "",
  program: list.program ?? "",
  department: list.department ?? "",
  academicYear: list.academicYear ?? "",
  session: list.session ?? "",
  slug: list.slug ?? "",
  books: (list.books ?? []).map(({ title, author, note, optional, searchTerm }) => ({ title, author, note, optional, searchTerm })),
});

// "Title - Author" per line; author optional. Lines starting with "*" are
// marked optional (reference books).
const parsePasted = (text: string): BookListBook[] =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const optional = line.startsWith("*");
      const clean = line.replace(/^[*\d.)\s-]+/, "").trim();
      const [title, ...rest] = clean.split(/\s+[-–—]\s+/);
      return { title: title.trim(), author: rest.join(" - ").trim() || undefined, optional };
    })
    .filter((b) => b.title.length >= 2);

const BookListEditor = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetAdminBookListQuery(id ?? "", { skip: isNew });
  const { data: filtersData } = useGetBookListFiltersQuery();
  const [saveList, { isLoading: isSaving }] = useSaveBookListMutation();
  const saved = data?.data;

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [baseline, setBaseline] = useState<Draft>(EMPTY);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const status = saved?.status ?? "draft";

  useEffect(() => {
    if (saved) {
      const next = fromList(saved);
      setDraft(next);
      setBaseline(next);
    }
  }, [saved]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline]);
  useUnsavedChangesWarning(dirty);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setBook = (i: number, changes: Partial<BookListBook>) =>
    setDraft((d) => ({ ...d, books: d.books.map((b, j) => (j === i ? { ...b, ...changes } : b)) }));
  const moveBook = (i: number, delta: number) =>
    setDraft((d) => {
      const books = [...d.books];
      const j = i + delta;
      if (j < 0 || j >= books.length) return d;
      [books[i], books[j]] = [books[j], books[i]];
      return { ...d, books };
    });

  const known = {
    institution: filtersData?.data.institutions.map((x) => x.name),
    program: filtersData?.data.programs.map((x) => x.name),
    department: filtersData?.data.departments.map((x) => x.name),
    academicYear: filtersData?.data.academicYears.map((x) => x.name),
  } as Record<string, string[] | undefined>;

  const save = async (nextStatus: "draft" | "published") => {
    if (!draft.title.trim()) return void toast.error("Add a title first.");
    const books = draft.books
      .map((b) => ({
        title: b.title.trim(),
        author: b.author?.trim() || undefined,
        note: b.note?.trim() || undefined,
        optional: !!b.optional,
        searchTerm: b.searchTerm?.trim() || undefined,
      }))
      .filter((b) => b.title);
    if (nextStatus === "published" && !books.length) return void toast.error("Add at least one book before publishing.");

    const payload: Partial<BookList> = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      level: draft.level,
      books,
      status: nextStatus,
      ...Object.fromEntries(TEXT_FIELDS.map(({ key }) => [key, draft[key].trim()])),
      ...(draft.slug && !isNew ? { slug: draft.slug } : {}),
    };
    try {
      const result = await saveList({ id, data: payload }).unwrap();
      const next = fromList(result.data);
      setDraft(next);
      setBaseline(next);
      toast.success(nextStatus === "published" ? "Book list published" : "Draft saved");
      if (isNew) navigate(`/admin/booklists/${result.data._id}/edit`, { replace: true });
    } catch (error) {
      toast.error(errorMessage(error, "Could not save the book list"));
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    save(status);
  };

  if (!isNew && isLoading) return <Panel flush><LoadingRows rows={6} /></Panel>;
  if (!isNew && (isError || !saved)) return <Panel flush><ErrorState onRetry={refetch} /></Panel>;

  return (
    <form onSubmit={onSubmit}>
      <EditorHeader
        backTo="/admin/booklists"
        backLabel="All book lists"
        title={isNew ? "New book list" : draft.title || "Untitled list"}
        status={isNew ? undefined : status}
        actions={
          <>
            {status === "published" && saved && (
              <a href={`/booklists/${saved.slug}`} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
                <ExternalLink size={16} aria-hidden="true" /> View
              </a>
            )}
            <button type="button" onClick={() => save("draft")} disabled={isSaving} className={btn.secondary}>
              {status === "published" ? "Unpublish" : "Save draft"}
            </button>
            <button type="button" onClick={() => save("published")} disabled={isSaving} className={btn.primary}>
              {status === "published" ? "Update" : "Publish"}
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Panel title="List" flush>
            <div className="space-y-4 p-4 sm:p-5">
              <Field label="Title" hint="Students see this. e.g. “BBA হিসাববিজ্ঞান ২য় বর্ষের বই (জাতীয় বিশ্ববিদ্যালয়)”">
                <input value={draft.title} onChange={(e) => set("title", e.target.value)} maxLength={160} className={inputClass} required />
              </Field>
              <Field label="Short description (optional)" hint="e.g. which syllabus/session it follows, tips about editions.">
                <textarea value={draft.description} onChange={(e) => set("description", e.target.value)} maxLength={500} rows={2} className={inputClass} />
              </Field>
            </div>
          </Panel>

          <Panel
            flush
            title={`Books (${draft.books.length})`}
            action={
              <button type="button" onClick={() => setPasteOpen((v) => !v)} className={btn.secondary}>
                <ClipboardPaste size={16} aria-hidden="true" /> Paste many
              </button>
            }
          >
            <div className="space-y-3 p-4 sm:p-5">
              {pasteOpen && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <Field label="One book per line: Title - Author" hint="Start a line with * to mark it optional (reference). Numbers like “1.” are removed.">
                    <textarea
                      value={pasted}
                      onChange={(e) => setPasted(e.target.value)}
                      rows={6}
                      placeholder={"Principles of Accounting - Weygandt\nব্যবসায় পরিসংখ্যান - ড. মো. আব্দুল আলীম\n* Financial Accounting - Hanif & Mukherjee"}
                      className={inputClass}
                    />
                  </Field>
                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setPasteOpen(false)} className={btn.secondary}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const books = parsePasted(pasted);
                        if (!books.length) return void toast.error("No books found in the text.");
                        setDraft((d) => ({ ...d, books: [...d.books, ...books].slice(0, 40) }));
                        setPasted("");
                        setPasteOpen(false);
                        toast.success(`Added ${books.length} books`);
                      }}
                      className={btn.primary}
                    >
                      Add books
                    </button>
                  </div>
                </div>
              )}

              {draft.books.length === 0 && !pasteOpen && (
                <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
                  No books yet. Add them one by one or use “Paste many”.
                </p>
              )}

              <ol className="space-y-3">
                {draft.books.map((book, i) => (
                  <li key={i} className="rounded-xl border border-stone-200 p-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-2.5 w-6 flex-shrink-0 text-center text-sm font-semibold text-stone-400">{i + 1}</span>
                      <div className="grid flex-1 gap-2 sm:grid-cols-2">
                        <input value={book.title} onChange={(e) => setBook(i, { title: e.target.value })} placeholder="Book title" aria-label={`Book ${i + 1} title`} maxLength={160} className={inputClass} />
                        <input value={book.author ?? ""} onChange={(e) => setBook(i, { author: e.target.value })} placeholder="Author (optional)" aria-label={`Book ${i + 1} author`} maxLength={120} className={inputClass} />
                        <input value={book.note ?? ""} onChange={(e) => setBook(i, { note: e.target.value })} placeholder="Note for students (optional)" aria-label={`Book ${i + 1} note`} maxLength={200} className={inputClass} />
                        <input value={book.searchTerm ?? ""} onChange={(e) => setBook(i, { searchTerm: e.target.value })} placeholder="Shop search text, if not the title" aria-label={`Book ${i + 1} search text`} maxLength={100} className={inputClass} />
                        <label className="flex items-center gap-2 text-sm text-stone-600">
                          <input type="checkbox" checked={!!book.optional} onChange={(e) => setBook(i, { optional: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-500" />
                          Optional / reference book
                        </label>
                      </div>
                      <div className="flex flex-col">
                        <button type="button" onClick={() => moveBook(i, -1)} disabled={i === 0} aria-label="Move up" className={btn.icon}>
                          <ArrowUp size={15} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => moveBook(i, 1)} disabled={i === draft.books.length - 1} aria-label="Move down" className={btn.icon}>
                          <ArrowDown size={15} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => set("books", draft.books.filter((_, j) => j !== i))} aria-label="Remove book" className={btn.icon}>
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              {draft.books.length < 40 && (
                <button type="button" onClick={() => set("books", [...draft.books, { title: "" }])} className={`${btn.secondary} w-full`}>
                  <Plus size={16} aria-hidden="true" /> Add a book
                </button>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <SidePanel title="Who is it for">
            <Field label="Level">
              <select value={draft.level} onChange={(e) => set("level", e.target.value)} className={inputClass}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l} ({EXAM_LEVEL_LABELS[l]})
                  </option>
                ))}
              </select>
            </Field>
            {TEXT_FIELDS.map(({ key, label, placeholder }) => (
              <Field key={key} label={label}>
                <input
                  value={draft[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  list={known[key]?.length ? `known-${key}` : undefined}
                  className={inputClass}
                />
                {known[key]?.length ? (
                  <datalist id={`known-${key}`}>
                    {known[key]!.map((v) => (
                      <option key={v} value={v} />
                    ))}
                  </datalist>
                ) : null}
              </Field>
            ))}
            <p className="text-xs leading-relaxed text-stone-500">
              Use the same spelling as existing lists (suggestions appear while typing), so the step-by-step picker groups them.
            </p>
          </SidePanel>
          {!isNew && (
            <SidePanel title="Web address">
              <Field label="Slug" hint={`gronthobilash.com/booklists/${draft.slug || "…"}`}>
                <input value={draft.slug} onChange={(e) => set("slug", e.target.value)} className={inputClass} />
              </Field>
            </SidePanel>
          )}
        </div>
      </div>
    </form>
  );
};

export default BookListEditor;
