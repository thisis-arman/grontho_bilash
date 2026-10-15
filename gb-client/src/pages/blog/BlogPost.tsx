import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Eye, Link2, Star } from "lucide-react";
import { toast } from "sonner";
import Markdown from "../../components/content/Markdown";
import { useGetBlogPostQuery } from "../../redux/features/content/contentApi";
import { usePageMeta } from "../../utils/usePageMeta";
import { authorName, formatPostDate, PostCard } from "./BlogList";

const shareClass =
  "inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:border-stone-400";

const ShareButtons = ({ title }: { title: string }) => {
  const url = window.location.href;
  const encoded = encodeURIComponent(url);

  return (
    <div className="flex flex-wrap gap-2">
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer" className={shareClass}>
        Facebook
      </a>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" className={shareClass}>
        WhatsApp
      </a>
      <button
        type="button"
        className={shareClass}
        onClick={() =>
          navigator.clipboard
            .writeText(url)
            .then(() => toast.success("Link copied"))
            .catch(() => toast.error("Could not copy the link"))
        }
      >
        <Link2 size={15} aria-hidden="true" /> Copy link
      </button>
    </div>
  );
};

const BlogPost = () => {
  const { slug = "" } = useParams();
  const { data, isLoading, isError, error } = useGetBlogPostQuery(slug);
  const post = data?.data.post;
  const related = data?.data.related ?? [];

  usePageMeta(post?.title, post?.excerpt, post?.coverImage);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16" aria-busy="true">
        <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
        <div className="mt-4 h-10 w-full animate-pulse rounded bg-stone-200" />
        <div className="mt-8 aspect-[16/9] animate-pulse rounded-3xl bg-stone-200" />
      </div>
    );
  }

  if (isError || !post) {
    const notFound = (error as { status?: number })?.status === 404;
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-stone-900">{notFound ? "Post not found" : "Something went wrong"}</h1>
        <p className="mt-2 text-stone-600">
          {notFound ? "It may have been moved or unpublished." : "We could not load this post. Please try again."}
        </p>
        <Link to="/blogs" className="mt-6 inline-flex rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
          Back to the blog
        </Link>
      </div>
    );
  }

  const review = post.category === "Book Review" ? post.bookReview : undefined;
  const rating = review?.rating ?? 0;

  return (
    <article className="bg-white font-sans">
      <header className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 lg:pt-14">
        <Link to="/blogs" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900">
          <ArrowLeft size={16} aria-hidden="true" /> All posts
        </Link>
        <p className="mt-6 text-sm font-semibold text-amber-700">
          <Link to={`/blogs?category=${encodeURIComponent(post.category)}`} className="hover:underline">
            {post.category}
          </Link>
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-stone-900 sm:text-5xl sm:leading-[1.15]">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-stone-600 sm:text-xl">{post.excerpt}</p>}
        <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
          {authorName(post) && <span className="font-semibold text-stone-900">{authorName(post)}</span>}
          <span>{formatPostDate(post.publishedAt)}</span>
          <span className="flex items-center gap-1">
            <Clock size={14} aria-hidden="true" /> {post.readingTime} min read
          </span>
          <span className="flex items-center gap-1">
            <Eye size={14} aria-hidden="true" /> {post.views.toLocaleString()}
          </span>
        </p>
      </header>

      {post.coverImage && (
        <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6">
          <img src={post.coverImage} alt="" className="aspect-[16/9] w-full rounded-3xl bg-stone-100 object-cover" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        {review && (review.bookTitle || rating > 0) && (
          <aside className="mt-10 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Book reviewed</p>
              {review.bookTitle && <p className="mt-1 font-display text-lg font-bold text-stone-900">{review.bookTitle}</p>}
              {review.bookAuthor && <p className="text-sm text-stone-600">by {review.bookAuthor}</p>}
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              {rating > 0 && (
                <p className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={18}
                      aria-hidden="true"
                      className={n <= rating ? "fill-amber-400 text-amber-400" : "text-amber-200"}
                    />
                  ))}
                </p>
              )}
              {review.bookTitle && (
                <Link
                  to={`/books?search=${encodeURIComponent(review.bookTitle)}`}
                  className="text-sm font-semibold text-amber-800 underline-offset-4 hover:underline"
                >
                  Find it on Grontho Bilash →
                </Link>
              )}
            </div>
          </aside>
        )}

        <div className="mt-6">
          <Markdown>{post.content ?? ""}</Markdown>
        </div>

        {post.tags.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
                #{tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex flex-col gap-3 border-t border-stone-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-stone-900">Share this post</p>
          <ShareButtons title={post.title} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-stone-200 bg-stone-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="mb-8 font-display text-2xl font-bold text-stone-900">More in {post.category}</h2>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item._id} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
};

export default BlogPost;
