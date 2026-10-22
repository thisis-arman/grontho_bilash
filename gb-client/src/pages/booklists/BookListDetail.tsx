import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ListChecks, Share2 } from "lucide-react";
import { useGetBookListQuery } from "../../redux/features/hub/hubApi";
import { bnNumber, examLevelLabel, taka } from "../../i18n/labels";
import { SITE_URL, usePageMeta } from "../../utils/usePageMeta";
import { NotifyButton } from "../../components/search/NotifyMe";

// One book list: every book with how many used copies are for sale and the
// lowest price, a "notify me" for the ones nobody is selling yet, and a
// WhatsApp share so a class group can use it.
const BookListDetail = () => {
  const { slug = "" } = useParams();
  const { data, isLoading, isError, error } = useGetBookListQuery(slug);
  const list = data?.data.list;
  const related = data?.data.related ?? [];

  const books = list?.books ?? [];
  const available = books.filter((b) => (b.count ?? 0) > 0).length;
  const meta = list ? [list.institution, list.program, list.department, list.academicYear, list.session].filter(Boolean) : [];

  usePageMeta(
    list ? `${list.title} – বইয়ের তালিকা` : undefined,
    list
      ? `${meta.join(", ")}: কোন ${bnNumber(books.length)}টি বই লাগবে তার তালিকা, পুরনো কপির দামসহ। ${list.description ?? ""}`
      : undefined,
    undefined,
    {
      jsonLd: list
        ? {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: list.title,
            url: `${SITE_URL}/booklists/${list.slug}`,
            numberOfItems: books.length,
            itemListElement: books.map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: { "@type": "Book", name: b.title, ...(b.author ? { author: { "@type": "Person", name: b.author } } : {}) },
            })),
          }
        : null,
    }
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14" aria-busy="true">
        <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
        <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-stone-200" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-stone-200" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !list) {
    const notFound = (error as { status?: number })?.status === 404;
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-stone-900">{notFound ? "তালিকাটি পাওয়া যায়নি" : "কিছু একটা সমস্যা হয়েছে"}</h1>
        <p className="mt-2 text-stone-600">{notFound ? "এটি সরিয়ে নেওয়া হয়েছে বা লিংকটি ভুল।" : "একটু পরে আবার চেষ্টা করো।"}</p>
        <Link to="/booklists" className="mt-6 inline-flex rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
          সব তালিকা দেখো
        </Link>
      </div>
    );
  }

  const shareText = `${list.title} – কোন কোন বই লাগবে, আর পুরনো কপি কত দামে পাওয়া যায়: ${SITE_URL}/booklists/${list.slug}`;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <Link to="/booklists" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900">
          <ArrowLeft size={16} aria-hidden="true" /> সব তালিকা
        </Link>

        <header className="mt-5">
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800">{examLevelLabel(list.level)}</span>
            {meta.map((m) => (
              <span key={m} className="text-stone-500">
                {m}
              </span>
            ))}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">{list.title}</h1>
          {list.description && <p className="mt-3 leading-relaxed text-stone-600">{list.description}</p>}
        </header>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-stone-700">
            <ListChecks size={18} className="flex-shrink-0 text-amber-600" aria-hidden="true" />
            <span>
              মোট <b>{bnNumber(books.length)}টি</b> বই, এর মধ্যে <b className="text-emerald-700">{bnNumber(available)}টির</b> পুরনো কপি এখন
              পাওয়া যাচ্ছে
            </span>
          </p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700 transition hover:border-[#25D366] hover:text-[#128C4B]"
          >
            <Share2 size={15} aria-hidden="true" /> ক্লাসের গ্রুপে শেয়ার করো
          </a>
        </div>

        <ol className="mt-6 space-y-3">
          {books.map((book, i) => {
            const count = book.count ?? 0;
            const searchFor = book.searchTerm || book.title;
            return (
              <li key={`${book.title}-${i}`} className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 font-display text-sm font-bold text-stone-600">
                  {bnNumber(i + 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-stone-900">
                    {book.title}
                    {book.optional && (
                      <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 align-middle text-xs font-medium text-stone-500">সহায়ক</span>
                    )}
                  </p>
                  {book.author && <p className="text-sm text-stone-500">{book.author}</p>}
                  {book.note && <p className="mt-1 text-xs leading-relaxed text-stone-500">{book.note}</p>}
                </div>
                <div className="flex flex-shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                  {count > 0 ? (
                    <>
                      <span className="flex items-center gap-1 text-sm text-emerald-700">
                        <CheckCircle2 size={15} aria-hidden="true" />
                        {bnNumber(count)}টি কপি{book.fromPrice ? `, ${taka(book.fromPrice)} থেকে` : ""}
                      </span>
                      <Link
                        to={`/books?search=${encodeURIComponent(searchFor)}`}
                        className="inline-flex h-9 items-center rounded-lg bg-stone-900 px-4 text-xs font-semibold text-white transition hover:bg-stone-800"
                      >
                        কপিগুলো দেখো
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-stone-500">এখন কারও কাছে নেই</span>
                      <NotifyButton query={searchFor} />
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          তোমার কাছে এর কোনো বই আছে যা আর লাগবে না?{" "}
          <Link to="/user/add-product" className="font-semibold underline">
            বিক্রি করে দাও
          </Link>
          , জুনিয়ররা ঠিক এগুলোই খুঁজছে।
        </p>

        {related.length > 0 && (
          <section className="mt-12" aria-labelledby="related-lists">
            <h2 id="related-lists" className="mb-3 font-display text-xl font-bold text-stone-900">
              একই বিভাগের অন্য তালিকা
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r._id}>
                  <Link to={`/booklists/${r.slug}`} className="block rounded-xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-800 transition hover:border-amber-400">
                    {r.title}
                    {r.academicYear && <span className="mt-0.5 block text-xs font-normal text-stone-500">{r.academicYear}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default BookListDetail;
