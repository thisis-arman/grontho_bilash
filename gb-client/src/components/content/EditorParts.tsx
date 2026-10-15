import { DragEvent, KeyboardEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, FileText, ImagePlus, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { inputClass } from "../dashboard/ui";
import { ACCEPT_ATTR, ACCEPT_IMAGES_ATTR, formatBytes, MAX_UPLOAD_BYTES, UploadedFile, useUpload } from "./useUpload";

// Pieces shared by the blog and suggestion editors.

export const EditorHeader = ({
  backTo,
  backLabel,
  title,
  status,
  actions,
}: {
  backTo: string;
  backLabel: string;
  title: string;
  status?: "draft" | "published";
  actions: ReactNode;
}) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900">
        <ArrowLeft size={16} aria-hidden="true" /> {backLabel}
      </Link>
      <h1 className="mt-2 flex items-center gap-3 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
        <span className="truncate">{title}</span>
        {status && (
          <span
            className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              status === "published" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-stone-100 text-stone-600 ring-1 ring-stone-200"
            }`}
          >
            {status === "published" ? "Published" : "Draft"}
          </span>
        )}
      </h1>
    </div>
    <div className="flex flex-shrink-0 flex-wrap gap-2">{actions}</div>
  </div>
);

export const SidePanel = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
    <h2 className="mb-4 text-sm font-semibold text-stone-900">{title}</h2>
    <div className="space-y-4">{children}</div>
  </section>
);

// Warns before the tab is closed or reloaded with unsaved changes.
export const useUnsavedChangesWarning = (dirty: boolean) => {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
};

export const TagInput = ({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) => {
  const [draft, setDraft] = useState("");

  const add = () => {
    const tag = draft.trim().toLowerCase().replace(/^#/, "");
    if (tag && !value.includes(tag) && value.length < 10) onChange([...value, tag.slice(0, 30)]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add();
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      <div className={`${inputClass} flex min-h-[2.75rem] flex-wrap items-center gap-1.5 py-1.5`}>
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-stone-100 py-0.5 pl-2.5 pr-1 text-xs font-medium text-stone-700">
            #{tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove tag ${tag}`}
              className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-stone-200"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={value.length ? "" : "Type and press Enter"}
          aria-label="Add tag"
          className="min-w-[6rem] flex-1 border-0 bg-transparent p-0.5 text-sm focus:outline-none focus:ring-0"
        />
      </div>
      <p className="mt-1 text-xs text-stone-500">Up to 10 tags.</p>
    </div>
  );
};

export const CoverImageField = ({
  value,
  onChange,
  purpose,
}: {
  value?: string;
  onChange: (url: string) => void;
  purpose: "blog" | "suggestion";
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, progress } = useUpload(purpose);

  const pick = async (file?: File) => {
    if (!file) return;
    try {
      onChange((await upload(file)).url);
    } catch (error) {
      toast.error((error as Error).message || "Upload failed");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-stone-200">
          <img src={value} alt="Cover preview" className="aspect-[16/10] w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-stone-900">
              Replace
            </button>
            <button type="button" onClick={() => onChange("")} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-600">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={progress !== null}
          className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 text-sm font-medium text-stone-500 transition hover:border-amber-400 hover:text-amber-700"
        >
          <ImagePlus size={24} aria-hidden="true" />
          {progress !== null ? `Uploading ${progress}%` : "Upload cover image"}
        </button>
      )}
      <input ref={inputRef} type="file" accept={ACCEPT_IMAGES_ATTR} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      <p className="mt-1 text-xs text-stone-500">Landscape works best (16:10). JPG, PNG or WebP.</p>
    </div>
  );
};

// Drag-and-drop list of PDFs and images, uploaded one after another.
export const AttachmentsField = ({
  value,
  onChange,
}: {
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, progress } = useUpload("suggestion");
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);

  // Kept in a ref so files finishing one after another all land in the list.
  const latest = useRef(value);
  latest.current = value;

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, 20 - latest.current.length);
    if (!list.length) return;
    setQueue(list.map((f) => f.name));
    for (const file of list) {
      try {
        const uploaded = await upload(file);
        onChange([...latest.current, uploaded]);
      } catch (error) {
        toast.error((error as Error).message || `Could not upload ${file.name}`);
      }
      setQueue((q) => q.slice(1));
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const move = (index: number, delta: number) => {
    const next = value.slice();
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragging ? "border-amber-400 bg-amber-50" : "border-stone-300"
        }`}
      >
        <UploadCloud size={28} aria-hidden="true" className="text-stone-400" />
        <p className="text-sm text-stone-600">
          Drop PDFs or images here, or{" "}
          <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-amber-700 hover:underline">
            choose files
          </button>
        </p>
        <p className="text-xs text-stone-500">Up to 20 files, {formatBytes(MAX_UPLOAD_BYTES)} each.</p>
        {queue.length > 0 && (
          <p className="text-xs font-semibold text-stone-700" aria-live="polite">
            Uploading {queue[0]} {progress !== null ? `(${progress}%)` : ""}
            {queue.length > 1 ? ` · ${queue.length - 1} more waiting` : ""}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {value.length > 0 && (
        <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200">
          {value.map((file, index) => (
            <li key={file.url} className="flex items-center gap-3 p-3">
              {file.kind === "image" ? (
                <img src={file.url} alt="" className="h-11 w-11 flex-shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <FileText size={20} aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <input
                  value={file.name}
                  onChange={(e) => onChange(value.map((f, i) => (i === index ? { ...f, name: e.target.value } : f)))}
                  aria-label="File name shown to readers"
                  className="w-full rounded-md border-0 bg-transparent px-1 py-0.5 text-sm font-semibold text-stone-900 focus:bg-stone-50 focus:ring-2 focus:ring-amber-200"
                />
                <p className="px-1 text-xs text-stone-500">
                  {file.kind.toUpperCase()} {file.size ? `· ${formatBytes(file.size)}` : ""}
                </p>
              </div>
              <div className="flex flex-shrink-0">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 disabled:opacity-30">
                  <ArrowUp size={15} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label="Move down" className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 disabled:opacity-30">
                  <ArrowDown size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  aria-label={`Remove ${file.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
