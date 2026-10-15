import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import MarkdownEditor from "../../../../components/content/MarkdownEditor";
import {
  AttachmentsField,
  EditorHeader,
  SidePanel,
  TagInput,
  useUnsavedChangesWarning,
} from "../../../../components/content/EditorParts";
import { UploadedFile } from "../../../../components/content/useUpload";
import { btn, errorMessage, ErrorState, Field, inputClass, LoadingRows, Panel } from "../../../../components/dashboard/ui";
import {
  Suggestion,
  useGetAdminSuggestionQuery,
  useGetSuggestionFiltersQuery,
  useSaveSuggestionMutation,
} from "../../../../redux/features/content/contentApi";

const TEXT_FIELDS = [
  { key: "subject", label: "Subject", placeholder: "Working Capital Management", required: true },
  { key: "subjectCode", label: "Course code", placeholder: "WCM-401" },
  { key: "program", label: "Program", placeholder: "BBA" },
  { key: "department", label: "Department", placeholder: "Accounting" },
  { key: "academicYear", label: "Year / class", placeholder: "4th Year" },
  { key: "examYear", label: "Exam year", placeholder: "2026" },
  { key: "institution", label: "Board / institution", placeholder: "National University" },
  { key: "preparedBy", label: "Prepared by", placeholder: "Teacher's name" },
] as const;

type TextKey = (typeof TEXT_FIELDS)[number]["key"];

type Draft = Record<TextKey, string> & {
  title: string;
  slug: string;
  summary: string;
  body: string;
  level: string;
  tags: string[];
  attachments: UploadedFile[];
};

const EMPTY: Draft = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  level: "",
  tags: [],
  attachments: [],
  subject: "",
  subjectCode: "",
  program: "",
  department: "",
  academicYear: "",
  examYear: "",
  institution: "",
  preparedBy: "",
};

const fromSuggestion = (s: Suggestion): Draft => ({
  ...EMPTY,
  ...Object.fromEntries(TEXT_FIELDS.map(({ key }) => [key, s[key] ?? ""])),
  title: s.title,
  slug: s.slug,
  summary: s.summary ?? "",
  body: s.body ?? "",
  level: s.level,
  tags: s.tags ?? [],
  attachments: s.attachments.map((a) => ({ ...a, size: a.size ?? 0 })),
});

const SuggestionEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const { data, isLoading, isError, refetch } = useGetAdminSuggestionQuery(id ?? "", { skip: isNew });
  const { data: filtersData } = useGetSuggestionFiltersQuery();
  const [saveSuggestion, { isLoading: isSaving }] = useSaveSuggestionMutation();

  const saved = data?.data;
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [baseline, setBaseline] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (saved) {
      setDraft(fromSuggestion(saved));
      setBaseline(fromSuggestion(saved));
    }
  }, [saved]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline]);
  useUnsavedChangesWarning(dirty);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const status = saved?.status ?? "draft";

  // Suggest values already used elsewhere so naming stays consistent
  // ("Accounting", not "accounting dept").
  const known: Partial<Record<TextKey, string[]>> = {
    subject: filtersData?.data?.subjects?.map((s) => s.name),
    department: filtersData?.data?.departments?.map((s) => s.name),
    academicYear: filtersData?.data?.academicYears?.map((s) => s.name),
  };

  const save = async (nextStatus: "draft" | "published") => {
    if (!draft.title.trim() || !draft.level || !draft.subject.trim()) {
      toast.error("Add a title, level and subject first.");
      return;
    }
    const payload: Partial<Suggestion> = {
      title: draft.title,
      summary: draft.summary,
      body: draft.body,
      level: draft.level,
      tags: draft.tags,
      attachments: draft.attachments,
      status: nextStatus,
      ...Object.fromEntries(TEXT_FIELDS.map(({ key }) => [key, draft[key].trim()])),
      ...(draft.slug && !isNew ? { slug: draft.slug } : {}),
    };

    try {
      const result = await saveSuggestion({ id, data: payload }).unwrap();
      const next = fromSuggestion(result.data);
      setDraft(next);
      setBaseline(next);
      toast.success(nextStatus === "published" ? "Suggestion published" : status === "published" ? "Moved back to drafts" : "Draft saved");
      if (isNew) navigate(`/admin/suggestions/${result.data._id}/edit`, { replace: true });
    } catch (error) {
      toast.error(errorMessage(error, "Could not save the suggestion"));
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    save(status);
  };

  if (!isNew && isLoading) return <Panel flush><LoadingRows rows={6} /></Panel>;
  if (!isNew && (isError || !saved)) return <Panel flush><ErrorState onRetry={refetch} /></Panel>;

  return (
    <form onSubmit={onSubmit}>
      <EditorHeader
        backTo="/admin/suggestions"
        backLabel="All suggestions"
        title={isNew ? "New suggestion" : draft.title || "Untitled suggestion"}
        status={isNew ? undefined : status}
        actions={
          <>
            {status === "published" && saved && (
              <a href={`/suggestions/${saved.slug}`} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
                <ExternalLink size={16} aria-hidden="true" /> View
              </a>
            )}
            <button type="button" onClick={() => save("draft")} disabled={isSaving} className={btn.secondary}>
              {status === "published" ? "Unpublish" : "Save draft"}
            </button>
            <button type="button" onClick={() => save("published")} disabled={isSaving} className={btn.primary}>
              {isSaving ? "Saving..." : status === "published" ? "Update" : "Publish"}
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0 space-y-5">
          <Panel>
            <div className="space-y-4">
              <Field label="Title">
                <input
                  value={draft.title}
                  onChange={(e) => set("title", e.target.value)}
                  required
                  maxLength={160}
                  placeholder="e.g. Working Capital Management — Final Exam Suggestion 2026"
                  className={`${inputClass} text-lg font-semibold`}
                />
              </Field>
              <Field label="Summary" hint={`Shown on cards and in search results. ${draft.summary.length}/300`}>
                <textarea
                  value={draft.summary}
                  onChange={(e) => set("summary", e.target.value)}
                  maxLength={300}
                  rows={2}
                  className={inputClass}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Files">
            <AttachmentsField value={draft.attachments} onChange={(files) => set("attachments", files)} />
          </Panel>

          <div>
            <p className="mb-2 text-sm font-semibold text-stone-700">
              Suggestion text <span className="font-normal text-stone-500">(optional if you attach files)</span>
            </p>
            <MarkdownEditor
              label="Suggestion text"
              value={draft.body}
              onChange={(value) => set("body", value)}
              uploadPurpose="suggestion"
              minRows={14}
              placeholder={"## অধ্যায় ১: ভূমিকা\n\n1. Important question ★★★\n2. Another question ★★"}
            />
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <SidePanel title="Exam details">
            <Field label="Level">
              <select value={draft.level} onChange={(e) => set("level", e.target.value)} required className={`${inputClass} cursor-pointer`}>
                <option value="" disabled>
                  Choose a level
                </option>
                {(filtersData?.data?.allLevels ?? []).map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </Field>
            {TEXT_FIELDS.map(({ key, label, placeholder, ...rest }) => (
              <Field key={key} label={label}>
                <input
                  value={draft[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  required={"required" in rest}
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
          </SidePanel>

          <SidePanel title="Tags">
            <TagInput value={draft.tags} onChange={(tags) => set("tags", tags)} />
          </SidePanel>

          {!isNew && (
            <SidePanel title="Web address">
              <Field label="Slug" hint={`gronthobilash.com/suggestions/${draft.slug || "…"}`}>
                <input
                  value={draft.slug}
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  className={`${inputClass} font-mono text-xs`}
                />
              </Field>
            </SidePanel>
          )}

          {dirty && <p className="text-center text-xs font-medium text-amber-700">You have unsaved changes.</p>}
        </aside>
      </div>
    </form>
  );
};

export default SuggestionEditor;
