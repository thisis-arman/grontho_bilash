import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExternalLink, Star } from "lucide-react";
import { toast } from "sonner";
import MarkdownEditor from "../../../../components/content/MarkdownEditor";
import {
  CoverImageField,
  EditorHeader,
  SidePanel,
  TagInput,
  useUnsavedChangesWarning,
} from "../../../../components/content/EditorParts";
import { btn, errorMessage, ErrorState, Field, inputClass, LoadingRows, Panel } from "../../../../components/dashboard/ui";
import {
  BlogPost,
  useGetAdminBlogPostQuery,
  useGetBlogCategoriesQuery,
  useSaveBlogPostMutation,
} from "../../../../redux/features/content/contentApi";

type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  bookTitle: string;
  bookAuthor: string;
  rating: number;
};

const EMPTY: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "",
  tags: [],
  bookTitle: "",
  bookAuthor: "",
  rating: 0,
};

const fromPost = (post: BlogPost): Draft => ({
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt ?? "",
  content: post.content ?? "",
  coverImage: post.coverImage ?? "",
  category: post.category,
  tags: post.tags ?? [],
  bookTitle: post.bookReview?.bookTitle ?? "",
  bookAuthor: post.bookReview?.bookAuthor ?? "",
  rating: post.bookReview?.rating ?? 0,
});

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const { data, isLoading, isError, refetch } = useGetAdminBlogPostQuery(id ?? "", { skip: isNew });
  const { data: categoriesData } = useGetBlogCategoriesQuery();
  const [savePost, { isLoading: isSaving }] = useSaveBlogPostMutation();

  const saved = data?.data;
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [baseline, setBaseline] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (saved) {
      setDraft(fromPost(saved));
      setBaseline(fromPost(saved));
    }
  }, [saved]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline]);
  useUnsavedChangesWarning(dirty);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const isReview = draft.category === "Book Review";
  const status = saved?.status ?? "draft";

  const save = async (nextStatus: "draft" | "published") => {
    if (!draft.title.trim() || !draft.category) {
      toast.error("Add a title and choose a category first.");
      return;
    }
    const payload: Partial<BlogPost> = {
      title: draft.title,
      excerpt: draft.excerpt,
      content: draft.content,
      coverImage: draft.coverImage,
      category: draft.category,
      tags: draft.tags,
      status: nextStatus,
      ...(draft.slug && !isNew ? { slug: draft.slug } : {}),
      ...(isReview
        ? {
            bookReview: {
              bookTitle: draft.bookTitle || undefined,
              bookAuthor: draft.bookAuthor || undefined,
              rating: draft.rating || undefined,
            },
          }
        : {}),
    };

    try {
      const result = await savePost({ id, data: payload }).unwrap();
      const next = fromPost(result.data);
      setDraft(next);
      setBaseline(next);
      toast.success(
        nextStatus === "published"
          ? status === "published" ? "Changes published" : "Post published"
          : status === "published" ? "Post moved back to drafts" : "Draft saved"
      );
      if (isNew) navigate(`/admin/blogs/${result.data._id}/edit`, { replace: true });
    } catch (error) {
      toast.error(errorMessage(error, "Could not save the post"));
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
        backTo="/admin/blogs"
        backLabel="All posts"
        title={isNew ? "New post" : draft.title || "Untitled post"}
        status={isNew ? undefined : status}
        actions={
          <>
            {status === "published" && saved && (
              <a href={`/blogs/${saved.slug}`} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
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
                  placeholder="A clear, specific title"
                  className={`${inputClass} text-lg font-semibold`}
                />
              </Field>
              <Field label="Summary" hint={`Shown on post cards and in search results. ${draft.excerpt.length}/300`}>
                <textarea
                  value={draft.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="One or two sentences about what readers will get from this post"
                  className={inputClass}
                />
              </Field>
            </div>
          </Panel>

          <MarkdownEditor
            label="Post content"
            value={draft.content}
            onChange={(value) => set("content", value)}
            uploadPurpose="blog"
            placeholder={"Write your post here.\n\n## Use headings to break it up\n\nAdd images with the toolbar."}
          />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <SidePanel title="Category and tags">
            <Field label="Category">
              <select
                value={draft.category}
                onChange={(e) => set("category", e.target.value)}
                required
                className={`${inputClass} cursor-pointer`}
              >
                <option value="" disabled>
                  Choose a category
                </option>
                {(categoriesData?.data ?? []).map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </Field>
            <Field label="Tags">
              <TagInput value={draft.tags} onChange={(tags) => set("tags", tags)} />
            </Field>
          </SidePanel>

          {isReview && (
            <SidePanel title="Book being reviewed">
              <Field label="Book title">
                <input value={draft.bookTitle} onChange={(e) => set("bookTitle", e.target.value)} maxLength={160} className={inputClass} />
              </Field>
              <Field label="Author">
                <input value={draft.bookAuthor} onChange={(e) => set("bookAuthor", e.target.value)} maxLength={120} className={inputClass} />
              </Field>
              <div>
                <p className="mb-1.5 text-sm font-semibold text-stone-700">Rating</p>
                <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={draft.rating === n}
                      aria-label={`${n} star${n === 1 ? "" : "s"}`}
                      onClick={() => set("rating", draft.rating === n ? 0 : n)}
                      className="rounded-md p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <Star size={24} aria-hidden="true" className={n <= draft.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"} />
                    </button>
                  ))}
                </div>
              </div>
            </SidePanel>
          )}

          <SidePanel title="Cover image">
            <CoverImageField value={draft.coverImage} onChange={(url) => set("coverImage", url)} purpose="blog" />
          </SidePanel>

          {!isNew && (
            <SidePanel title="Web address">
              <Field label="Slug" hint={`gronthobilash.com/blogs/${draft.slug || "…"}`}>
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

export default BlogEditor;
