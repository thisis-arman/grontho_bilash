import { lazy, Suspense, useRef, useState } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Table,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ACCEPT_IMAGES_ATTR, useUpload } from "./useUpload";

const Markdown = lazy(() => import("./Markdown"));

type Action = { icon: LucideIcon; label: string; run: (selected: string) => { text: string; cursorOffset?: number } };

// Each action wraps or prefixes the current selection with Markdown syntax.
const ACTIONS: Action[] = [
  { icon: Heading2, label: "Heading", run: (s) => ({ text: `\n## ${s || "Heading"}\n` }) },
  { icon: Heading3, label: "Sub-heading", run: (s) => ({ text: `\n### ${s || "Sub-heading"}\n` }) },
  { icon: Bold, label: "Bold", run: (s) => ({ text: `**${s || "bold text"}**` }) },
  { icon: Italic, label: "Italic", run: (s) => ({ text: `_${s || "italic text"}_` }) },
  { icon: List, label: "Bulleted list", run: (s) => ({ text: (s || "List item").split("\n").map((l) => `- ${l}`).join("\n") }) },
  { icon: ListOrdered, label: "Numbered list", run: (s) => ({ text: (s || "First item").split("\n").map((l, i) => `${i + 1}. ${l}`).join("\n") }) },
  { icon: Quote, label: "Quote", run: (s) => ({ text: `\n> ${s || "Quote"}\n` }) },
  { icon: Link2, label: "Link", run: (s) => ({ text: `[${s || "link text"}](https://)`, cursorOffset: -1 }) },
  {
    icon: Table,
    label: "Table",
    run: () => ({ text: "\n| Column | Column |\n| --- | --- |\n| Cell | Cell |\n" }),
  },
];

const toolButton =
  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-stone-600 transition hover:bg-stone-200 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40";

// Markdown editor with a formatting toolbar, image upload and a live
// preview that uses the same renderer readers see.
const MarkdownEditor = ({
  value,
  onChange,
  uploadPurpose,
  placeholder,
  minRows = 18,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  uploadPurpose: "blog" | "suggestion";
  placeholder?: string;
  minRows?: number;
  label: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const { upload, progress } = useUpload(uploadPurpose);

  const insert = (build: Action["run"]) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const { text, cursorOffset = 0 } = build(value.slice(start, end));
    onChange(value.slice(0, start) + text + value.slice(end));
    // Put the cursor after the inserted text once React has re-rendered.
    requestAnimationFrame(() => {
      el.focus();
      const position = start + text.length + cursorOffset;
      el.setSelectionRange(position, position);
    });
  };

  const handleImage = async (file?: File) => {
    if (!file) return;
    try {
      const uploaded = await upload(file);
      insert(() => ({ text: `\n![${uploaded.name}](${uploaded.url})\n` }));
    } catch (error) {
      toast.error((error as Error).message || "Image upload failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-200">
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 bg-stone-50 px-2 py-1.5">
        <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]" role="toolbar" aria-label={`${label} formatting`}>
          {ACTIONS.map(({ icon: Icon, label: actionLabel, run }) => (
            <button
              key={actionLabel}
              type="button"
              onClick={() => insert(run)}
              disabled={tab === "preview"}
              aria-label={actionLabel}
              title={actionLabel}
              className={toolButton}
            >
              <Icon size={17} aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={tab === "preview" || progress !== null}
            aria-label="Insert image"
            title="Insert image"
            className={toolButton}
          >
            <ImagePlus size={17} aria-hidden="true" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT_IMAGES_ATTR}
            className="hidden"
            onChange={(e) => handleImage(e.target.files?.[0])}
          />
          {progress !== null && <span className="ml-2 whitespace-nowrap text-xs text-stone-500">Uploading {progress}%</span>}
        </div>

        <div className="flex flex-shrink-0 rounded-lg bg-stone-200/70 p-0.5 text-sm" role="tablist">
          {(["write", "preview"] as const).map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={`rounded-md px-3 py-1 font-semibold capitalize transition ${
                tab === name ? "bg-white text-stone-900 shadow-sm" : "text-stone-600"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {tab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          placeholder={placeholder}
          rows={minRows}
          className="block w-full resize-y border-0 px-4 py-4 font-mono text-sm leading-relaxed text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-0"
        />
      ) : (
        <div className="min-h-[18rem] px-5 py-2 sm:px-8">
          {value.trim() ? (
            <Suspense fallback={<p className="py-6 text-sm text-stone-500">Loading preview…</p>}>
              <Markdown>{value}</Markdown>
            </Suspense>
          ) : (
            <p className="py-6 text-sm text-stone-500">Nothing to preview yet.</p>
          )}
        </div>
      )}

      <div className="flex justify-between border-t border-stone-100 px-4 py-2 text-xs text-stone-500">
        <span>Markdown supported</span>
        <span>{words} words</span>
      </div>
    </div>
  );
};

export default MarkdownEditor;
