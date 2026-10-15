import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Clock, Newspaper, Search } from "lucide-react";
import { BlogPost, useGetBlogCategoriesQuery, useGetBlogPostsQuery } from "../../redux/features/content/contentApi";
import Pagination from "../../utils/Pagination";
import { usePageMeta } from "../../utils/usePageMeta";

export const formatPostDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

export const authorName = (post: BlogPost) => (typeof post.author === "object" ? post.author?.name : undefined);

const chip = (active: boolean) =>
  `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
    active ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
  }`;

export const PostCard = ({ post, featured = false }: { post: BlogPost; featured?: boolean }) => (
  <article className={`group ${featured ? "grid gap-6 md:grid-cols-2 md:items-center md:gap-10" : "flex flex-col"}`}>
    <Link
      to={`/blogs/${post.slug}`}
      tabIndex={-1}
      aria-hidden="true"
      className="block aspect-[16/10] overflow-hidden rounded-2xl bg-stone-200"
    >
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt=""
          loading={featured ? "eager" : "lazy"}
          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
        />
      )}
    </Link>
    <div className={featured ? "" : "mt-4"}>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-stone-500">
        <span className="text-amber-700">{post.category}</span>
        <span>{formatPostDate(post.publishedAt)}</span>
        <span className="flex items-center gap-1">
          <Clock size={12} aria-hidden="true" /> {post.readingTime} min read
        </span>
      </p>
      <h2
        className={`mt-2 font-display font-bold leading-snug text-stone-900 ${
          featured ? "text-2xl sm:text-4xl" : "text-xl"
        }`}
      >
        <Link to={`/blogs/${post.slug}`} className="transition-colors hover:text-amber-700">
          {post.title}
        </Link>
      </h2>
      {post.excerpt && (
        <p className={`mt-2 text-stone-600 ${featured ? "text-base leading-relaxed sm:text-lg" : "line-clamp-3 text-sm leading-relaxed"}`}>
          {post.excerpt}
        </p>
      )}
      {authorName(post) && <p className="mt-3 text-sm font-medium text-stone-500">By {authorName(post)}</p>}
    </div>
  </article>
);

const BlogList = () => {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [searchInput, setSearchInput] = useState(search);

  usePageMeta("Blog", "Book reviews, study tips and exam guides for students in Bangladesh.");

  const { data, isLoading, isFetching, isError, refetch } = useGetBlogPostsQuery({ page, limit: 9, search, category });
  const { data: categoriesData } = useGetBlogCategoriesQuery();

  const update = (changes: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!keepPage) next.delete("page");
    setParams(next, { replace: !keepPage });
  };

  useEffect(() => {
    const term = searchInput.trim();
    if (term === search) return;
    const id = setTimeout(() => update({ search: term || null }), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const posts = data?.data.data ?? [];
  const meta = data?.data.meta;
  // The newest post gets the big slot on the first, unfiltered page.
  const showFeatured = page === 1 && !search && !category && posts.length > 0;
  const featured = showFeatured ? posts[0] : undefined;
  const rest = showFeatured ? posts.slice(1) : posts;

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-700">Grontho Bilash Blog</p>
            <h1 className="mt-1 font-display text-4xl font-bold text-stone-900 sm:text-5xl">Read, learn, review</h1>
            <p className="mt-2 max-w-xl text-stone-600">Book reviews, study tips and exam guides written for students.</p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search posts"
              aria-label="Search posts"
              className="block h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-base text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 sm:text-sm"
            />
          </div>
        </header>

        <nav aria-label="Categories" className="-mx-4 mb-10 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          <button type="button" onClick={() => update({ category: null })} aria-pressed={!category} className={chip(!category)}>
            All posts
          </button>
          {(categoriesData?.data ?? []).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => update({ category: name })}
              aria-pressed={category === name}
              className={chip(category === name)}
            >
              {name}
            </button>
          ))}
        </nav>

        {isLoading ? (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[16/10] animate-pulse rounded-2xl bg-stone-200" />
                <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-stone-200" />
                <div className="mt-3 h-5 w-4/5 animate-pulse rounded bg-stone-200" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
            <p className="mb-4 text-stone-600">We could not load posts right now.</p>
            <button type="button" onClick={() => refetch()} className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
              <Newspaper size={26} aria-hidden="true" />
            </span>
            <p className="font-display text-lg font-bold text-stone-900">
              {search || category ? "No posts match" : "No posts yet"}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {search || category ? "Try another search or category." : "New posts will appear here soon."}
            </p>
          </div>
        ) : (
          <div className={`transition-opacity duration-200 ${isFetching ? "opacity-60" : ""}`}>
            {featured && (
              <div className="mb-14 border-b border-stone-200 pb-14">
                <PostCard post={featured} featured />
              </div>
            )}
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            {meta && (
              <div className="mt-14">
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={(next) => {
                    update({ page: String(next) }, true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
