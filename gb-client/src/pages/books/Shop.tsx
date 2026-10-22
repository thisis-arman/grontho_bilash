import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageSearch, SlidersHorizontal, X } from 'lucide-react';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import Pagination from '../../utils/Pagination';
import { useGetProductsQuery, useGetShopFacetsQuery } from '../../redux/features/book/bookApi';
import { IProduct } from '../../types/interface';
import { usePageMeta } from '../../utils/usePageMeta';
import SearchBox from '../../components/search/SearchBox';
import NotifyMe from '../../components/search/NotifyMe';
import { useLogSearchMutation } from '../../redux/features/hub/hubApi';
import { bnNumber, categoryLabel, conditionLabel } from '../../i18n/labels';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'newest', label: 'নতুন আগে', sortBy: 'createdAt', sortOrder: 'desc' },
  { value: 'price_asc', label: 'দাম: কম থেকে বেশি', sortBy: 'price', sortOrder: 'asc' },
  { value: 'price_desc', label: 'দাম: বেশি থেকে কম', sortBy: 'price', sortOrder: 'desc' },
  { value: 'popular', label: 'সবচেয়ে বেশি দেখা', sortBy: 'viewCount', sortOrder: 'desc' },
  { value: 'title', label: 'নাম অনুযায়ী (A-Z)', sortBy: 'title', sortOrder: 'asc' },
] as const;

const TYPES = [
  { value: '', label: 'সব' },
  { value: 'Physical', label: 'ছাপা বই' },
  { value: 'Digital', label: 'ডিজিটাল' },
];

// Matches the conditions sellers can choose when listing.
const CONDITIONS = ['New', 'Like New', 'Used'];

// Shown when the live category counts have not loaded yet.
const FALLBACK_CATEGORIES = ['Academic', 'Fiction', 'Non-Fiction', 'Science', 'Technology', 'Religion', 'Children', 'Self-Help', 'Business', 'Other'];

const FILTER_KEYS = ['type', 'category', 'condition', 'min', 'max'] as const;

const chip = (active: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
    active ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
  }`;

const fieldClass =
  'block w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200';

// A plain heading rather than fieldset/legend: legends ignore padding and
// sit on the divider line.
const FilterGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-b border-stone-200 py-5 first:pt-0 last:border-0 last:pb-0">
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</h3>
    {children}
  </section>
);

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const gridTop = useRef<HTMLDivElement>(null);

  // Everything lives in the URL, so results can be shared, bookmarked and
  // survive the back button.
  const search = params.get('search') ?? '';
  const type = params.get('type') ?? '';
  const category = params.get('category') ?? '';
  const condition = params.get('condition') ?? '';
  const min = params.get('min') ?? '';
  const max = params.get('max') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const activeSort = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  usePageMeta(
    // "Academic Books" should not become "Academic Books books".
    category ? `${categoryLabel(category)} বই কিনুন` : "পুরনো বই কিনুন অনলাইনে – কম দামে",
    category
      ? `কম দামে পুরনো ${categoryLabel(category)} বই কেনো, সারা বাংলাদেশের শিক্ষার্থী বিক্রেতাদের কাছ থেকে।`
      : "সারা বাংলাদেশের শিক্ষার্থীদের কাছ থেকে কম দামে পুরনো পাঠ্যবই, উপন্যাস ও ডিজিটাল নোট কেনো। নাম, লেখক বা বিষয় দিয়ে খুঁজো, ক্যাটাগরি ও দাম দিয়ে বাছাই করো।"
  );

  const [searchInput, setSearchInput] = useState(search);
  const [priceInput, setPriceInput] = useState({ min, max });
  useEffect(() => setSearchInput(search), [search]);
  useEffect(() => setPriceInput({ min, max }), [min, max]);

  const update = (changes: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!keepPage) next.delete('page');
    setParams(next, { replace: !keepPage });
  };

  // Search as you type, after a short pause.
  useEffect(() => {
    const term = searchInput.trim();
    if (term === search) return;
    const id = setTimeout(() => update({ search: term || null }), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const queryArgs = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      sortBy: activeSort.sortBy,
      sortOrder: activeSort.sortOrder,
      ...(search && { search }),
      ...(type && { productType: type }),
      ...(category && { category }),
      ...(condition && { condition }),
      ...(min && { minPrice: min }),
      ...(max && { maxPrice: max }),
    }),
    [page, activeSort, search, type, category, condition, min, max]
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(queryArgs);

  // Records each finished search once (after the shopper stops typing), so
  // the team can see what students look for and don't find.
  const [logSearch] = useLogSearchMutation();
  const logged = useRef(new Set<string>());
  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (term.length < 2 || page !== 1 || isFetching || logged.current.has(term)) return;
    const id = setTimeout(() => {
      logged.current.add(term);
      logSearch(search).catch(() => undefined);
    }, 1500);
    return () => clearTimeout(id);
  }, [search, page, isFetching, logSearch]);
  const { data: facetsData } = useGetShopFacetsQuery(undefined);

  const products: IProduct[] = data?.data?.data ?? [];
  const meta = data?.data?.meta;
  const facets = facetsData?.data;
  const categories: { name: string; count?: number }[] =
    facets?.categories?.length ? facets.categories : FALLBACK_CATEGORIES.map((name) => ({ name }));

  const activeFilters = FILTER_KEYS.filter((key) => params.get(key));
  const hasAnyFilter = activeFilters.length > 0 || !!search;

  const clearAll = () => {
    setSearchInput('');
    update({ search: null, type: null, category: null, condition: null, min: null, max: null });
  };

  const goToPage = (next: number) => {
    update({ page: String(next) }, true);
    gridTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const applyPrice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const lo = priceInput.min.trim();
    const hi = priceInput.max.trim();
    // Swap if entered the wrong way round.
    const swap = lo && hi && Number(lo) > Number(hi);
    update({ min: (swap ? hi : lo) || null, max: (swap ? lo : hi) || null });
  };

  // Close the phone filter sheet with Escape, and stop the page behind it
  // from scrolling.
  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFiltersOpen(false);
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [filtersOpen]);

  const chipLabel: Record<string, string> = {
    type: type === 'Digital' ? 'ডিজিটাল' : 'ছাপা বই',
    category: categoryLabel(category),
    condition: conditionLabel(condition),
    min: `৳${min} থেকে`,
    max: `৳${max} পর্যন্ত`,
  };

  const filters = (
    <div>
      <FilterGroup title="ধরন">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={type === option.value}
              onClick={() => update({ type: option.value || null, ...(option.value === 'Digital' && { condition: null }) })}
              className={chip(type === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="ক্যাটাগরি">
        <ul className="space-y-0.5">
          {[{ name: '' }, ...categories].map((item) => {
            const active = category === item.name;
            return (
              <li key={item.name || 'all'}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ category: item.name || null })}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    active ? 'bg-amber-100 font-semibold text-amber-900' : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {item.name ? categoryLabel(item.name) : 'সব ক্যাটাগরি'}
                  {'count' in item && item.count !== undefined && (
                    <span className="text-xs text-stone-400">{bnNumber(item.count)}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      {type !== 'Digital' && (
        <FilterGroup title="বইয়ের অবস্থা">
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={!condition} onClick={() => update({ condition: null })} className={chip(!condition)}>
              যেকোনো
            </button>
            {CONDITIONS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={condition === value}
                onClick={() => update({ condition: value })}
                className={chip(condition === value)}
              >
                {conditionLabel(value)}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="দাম (৳)">
        <form onSubmit={applyPrice} className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={priceInput.min}
              onChange={(e) => setPriceInput((p) => ({ ...p, min: e.target.value }))}
              placeholder={facets ? String(facets.minPrice) : 'সর্বনিম্ন'}
              aria-label="সর্বনিম্ন দাম"
              className={fieldClass}
            />
            <span className="text-stone-400" aria-hidden="true">–</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={priceInput.max}
              onChange={(e) => setPriceInput((p) => ({ ...p, max: e.target.value }))}
              placeholder={facets ? String(facets.maxPrice) : 'সর্বোচ্চ'}
              aria-label="সর্বোচ্চ দাম"
              className={fieldClass}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl border border-stone-900 px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-white"
          >
            দাম সেট করো
          </button>
        </form>
      </FilterGroup>
    </div>
  );

  const from = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const to = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <h1 className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">
            {search ? <>“{search}” খোঁজার ফলাফল</> : category ? `${categoryLabel(category)} বই` : 'সব বই'}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {isLoading ? 'লোড হচ্ছে…' : `${bnNumber(meta?.total ?? 0)}টি বই পাওয়া যাচ্ছে`}
          </p>
        </header>

        {/* Search + sort */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <SearchBox
              id="shop-search"
              value={searchInput}
              onValueChange={setSearchInput}
              onSearch={(term) => update({ search: term || null })}
              placeholder="বইয়ের নাম, লেখক, বিষয় বা ISBN লেখো"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:border-stone-300 lg:hidden"
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              ফিল্টার
              {activeFilters.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[11px] font-bold text-stone-950">
                  {bnNumber(activeFilters.length)}
                </span>
              )}
            </button>
            <label className="relative flex-1 sm:w-56 sm:flex-none">
              <span className="sr-only">সাজাও</span>
              <select
                value={activeSort.value}
                onChange={(e) => update({ sort: e.target.value === 'newest' ? null : e.target.value })}
                className={`${fieldClass} h-12 cursor-pointer`}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop filters */}
          <aside className="hidden w-64 flex-shrink-0 lg:block" aria-label="ফিল্টার">
            <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-stone-900">ফিল্টার</h2>
                {hasAnyFilter && (
                  <button type="button" onClick={clearAll} className="text-sm font-semibold text-amber-700 hover:underline">
                    সব মুছে ফেলো
                  </button>
                )}
              </div>
              {filters}
            </div>
          </aside>

          <section className="min-w-0 flex-1" aria-label="ফলাফল">
            <div ref={gridTop} className="scroll-mt-24" />

            {/* Active filters */}
            {activeFilters.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {activeFilters.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update({ [key]: null })}
                    className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 py-1.5 pl-3.5 pr-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
                    aria-label={`${chipLabel[key]} ফিল্টার সরাও`}
                  >
                    {chipLabel[key]}
                    <X size={14} aria-hidden="true" />
                  </button>
                ))}
                <button type="button" onClick={clearAll} className="px-2 text-sm font-semibold text-stone-500 hover:text-stone-900">
                  সব মুছে ফেলো
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
                <p className="mb-4 text-stone-600">এই মুহূর্তে বই লোড করা গেল না।</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
                >
                  আবার চেষ্টা করো
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
                  <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                    <PackageSearch size={26} aria-hidden="true" />
                  </span>
                  <p className="font-display text-lg font-bold text-stone-900">কোনো বই মেলেনি</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-stone-500">
                    {search
                      ? activeFilters.length
                        ? `“${search}” এই ফিল্টারে পাওয়া যায়নি। ফিল্টার কমিয়ে দেখো।`
                        : `“${search}” এখন কারও কাছে নেই। বানানটা একবার দেখে নাও, বা ছোট করে লেখো (যেমন শুধু বিষয়ের নাম)।`
                      : 'একটা-দুটো ফিল্টার সরিয়ে দেখো।'}
                  </p>
                  {hasAnyFilter && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="mt-5 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
                    >
                      খোঁজ ও ফিল্টার মুছে ফেলো
                    </button>
                  )}
                </div>
                {search && !activeFilters.length && <NotifyMe query={search} />}
              </div>
            ) : (
              <>
                <div
                  className={`grid grid-cols-2 gap-x-4 gap-y-8 transition-opacity duration-200 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4 ${
                    isFetching ? 'opacity-50' : 'opacity-100'
                  }`}
                  aria-busy={isFetching}
                >
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {meta && (
                  <div className="mt-12 space-y-4">
                    <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={goToPage} />
                    <p className="text-center text-sm text-stone-500">
                      মোট {bnNumber(meta.total)}টির মধ্যে {bnNumber(from)}–{bnNumber(to)} দেখানো হচ্ছে
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* Phone / tablet filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="ফিল্টার"
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-stone-900">ফিল্টার</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="ফিল্টার বন্ধ করো"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{filters}</div>
            <div className="flex gap-3 border-t border-stone-100 px-5 py-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-700"
              >
                সব মুছে ফেলো
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex-1 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white"
              >
                {isFetching ? 'আপডেট হচ্ছে…' : `${bnNumber(meta?.total ?? 0)}টি বই দেখো`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
