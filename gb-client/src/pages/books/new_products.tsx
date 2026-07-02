import { useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { SlidersHorizontal, X, Package, Zap, ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import Pagination from '../../utils/Pagination';
import { ProductSkeleton } from './ProductSkeleton';
import { useGetProductsQuery } from '../../redux/features/book/bookApi';

const CATEGORIES = [
  'Academic', 'Fiction', 'Non-Fiction', 'Science',
  'Technology', 'Religion', 'Children', 'Self-Help', 'Business', 'Other',
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Acceptable'];

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', sortBy: 'createdAt', sortOrder: 'desc' },
  { value: 'price_asc', label: 'Price: Low–High', sortBy: 'price', sortOrder: 'asc' },
  { value: 'price_desc', label: 'Price: High–Low', sortBy: 'price', sortOrder: 'desc' },
  { value: 'views', label: 'Most Viewed', sortBy: 'viewCount', sortOrder: 'desc' },
] as const;

const LoadingState = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
    {[...Array(PAGE_SIZE)].map((_, i) => <ProductSkeleton key={i} />)}
  </div>
);

const EmptyState = ({ searchQuery, onClear }: { searchQuery: string; onClear: () => void }) => (
  <div className="col-span-full text-center py-20 sm:py-24 bg-white rounded-2xl border border-stone-100 shadow-sm">
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 mb-4">
      <Package className="w-6 h-6 text-stone-400" />
    </div>
    <h3 className="text-lg font-semibold text-stone-800 mb-1">No products found</h3>
    <p className="text-sm text-stone-400 max-w-sm mx-auto mb-4">
      {searchQuery
        ? `No results for "${searchQuery}". Try different keywords or adjust your filters.`
        : 'Try adjusting or clearing your filters.'}
    </p>
    <button
      onClick={onClear}
      className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2"
    >
      Clear all filters
    </button>
  </div>
);

const FilterChip = ({
  active, label, onClick,
}: { active: boolean; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${active
        ? 'bg-stone-900 text-white border-stone-900'
        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
      }`}
  >
    {label}
  </button>
);

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // ── Read all state from the URL so filters/sort/page are
  //    shareable, bookmarkable, and survive back/forward nav.
  const searchQuery = searchParams.get('search') || '';
  const productType = (searchParams.get('type') as 'Physical' | 'Digital' | null) ?? 'All';
  const category = searchParams.get('category') || 'All';
  const condition = searchParams.get('condition') || 'All';
  const sortValue = searchParams.get('sort') || 'newest';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const activeSort = SORT_OPTIONS.find(o => o.value === sortValue) ?? SORT_OPTIONS[0];

  const queryArgs = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    search: searchQuery || undefined,
    productType: productType !== 'All' ? productType : undefined,
    category: category !== 'All' ? category : undefined,
    condition: condition !== 'All' ? condition : undefined,
    sortBy: activeSort.sortBy,
    sortOrder: activeSort.sortOrder,
  }), [page, searchQuery, productType, category, condition, activeSort]);

  const { data: productsResponse, isLoading, isFetching } = useGetProductsQuery(queryArgs);

  const products = productsResponse?.data?.data ?? [];
  const meta = productsResponse?.data?.meta;

  // ── URL helpers ──
  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'All') next.delete(key);
    else next.set(key, value);
    next.delete('page'); // any filter change resets pagination
    setSearchParams(next);
  };

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    const next = new URLSearchParams(searchParams);
    ['type', 'category', 'condition', 'sort', 'page'].forEach(k => next.delete(k));
    setSearchParams(next);
  };

  const activeFilterCount = [
    productType !== 'All',
    category !== 'All',
    condition !== 'All',
    sortValue !== 'newest',
  ].filter(Boolean).length;

  return (
    <div className="bg-stone-50 min-h-screen mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              {searchQuery ? `Results for "${searchQuery}"` : 'Marketplace'}
            </h1>
            <p className="text-sm text-stone-400 mt-1">
              {isLoading
                ? 'Loading...'
                : `${meta?.total ?? 0} ${meta?.total === 1 ? 'listing' : 'listings'} found`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={sortValue}
                onChange={e => updateParam('sort', e.target.value)}
                aria-label="Sort products"
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl cursor-pointer focus:outline-none focus:border-amber-500 hover:border-stone-300 transition-colors"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(true)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${activeFilterCount > 0
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Active filter summary bar ── */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {productType !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-stone-100 text-stone-700 rounded-lg">
                {productType === 'Physical' ? <Package className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                {productType}
                <button onClick={() => updateParam('type', null)} className="text-stone-400 hover:text-stone-700 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {category !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-stone-100 text-stone-700 rounded-lg">
                {category}
                <button onClick={() => updateParam('category', null)} className="text-stone-400 hover:text-stone-700 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {condition !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-stone-100 text-stone-700 rounded-lg">
                {condition}
                <button onClick={() => updateParam('condition', null)} className="text-stone-400 hover:text-stone-700 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="sm:hidden inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-rose-500"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          </div>
        )}

        {/* ── Filter Drawer: bottom sheet on mobile, static panel on desktop ── */}
        {showFilters && (
          <>
            <div
              className="fixed inset-0 bg-stone-900/40 z-40 sm:hidden"
              onClick={() => setShowFilters(false)}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Filter products"
              className="fixed inset-x-0 bottom-0 z-50 sm:static sm:z-auto rounded-t-3xl sm:rounded-2xl bg-white border border-stone-100 shadow-2xl sm:shadow-sm p-5 mb-0 sm:mb-6 max-h-[85vh] sm:max-h-none overflow-y-auto"
            >
              {/* Mobile-only handle + close */}
              <div className="sm:hidden w-10 h-1 bg-stone-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4 sm:hidden">
                <h3 className="font-semibold text-stone-900">Filters</h3>
                <button onClick={() => setShowFilters(false)} aria-label="Close filters">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Product Type */}
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Type</p>
                  <div className="flex flex-wrap gap-2">
                    {(['All', 'Physical', 'Digital'] as const).map(t => (
                      <FilterChip
                        key={t}
                        label={t === 'All' ? 'All Types' : t === 'Physical' ? '📦 Physical' : '⚡ Digital'}
                        active={productType === t}
                        onClick={() => updateParam('type', t === 'All' ? null : t)}
                      />
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip label="All" active={category === 'All'} onClick={() => updateParam('category', null)} />
                    {CATEGORIES.map(c => (
                      <FilterChip key={c} label={c} active={category === c} onClick={() => updateParam('category', c)} />
                    ))}
                  </div>
                </div>

                {/* Condition (physical only) */}
                {productType !== 'Digital' && (
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Condition</p>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip label="All" active={condition === 'All'} onClick={() => updateParam('condition', null)} />
                      {CONDITIONS.map(c => (
                        <FilterChip key={c} label={c} active={condition === c} onClick={() => updateParam('condition', c)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile action bar */}
              <div className="sm:hidden pt-5 flex gap-2 sticky bottom-0 bg-white">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold"
                >
                  Show {meta?.total ?? 0} results
                </button>
              </div>

              {/* Desktop close */}
              <div className="hidden sm:flex justify-end pt-4">
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-xs font-semibold text-stone-400 hover:text-stone-700"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Product Grid ── */}
        {isLoading ? (
          <LoadingState />
        ) : products.length === 0 ? (
          <EmptyState searchQuery={searchQuery} onClear={resetFilters} />
        ) : (
          <>
            <div
              className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 transition-opacity ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'
                }`}
            >
              <ProductCard products={products} />
            </div>

            {meta && (
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={goToPage} />
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Products;