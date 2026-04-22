import { useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard';

import { useMemo, useState } from 'react';
import { SlidersHorizontal, X, Package, Zap, ChevronDown } from 'lucide-react';
import { ProductSkeleton } from './ProductSkeleton';
import { useGetProductsQuery } from '../../redux/features/book/bookApi';


const CATEGORIES = [
  "All", "Academic", "Fiction", "Non-Fiction", "Science",
  "Technology", "Religion", "Children", "Self-Help", "Business", "Other",
];

const CONDITIONS = ["All", "New", "Like New", "Good", "Acceptable"];

const SORT_OPTIONS = [
  { label: "Newest First",    value: "newest" },
  { label: "Price: Low–High", value: "price_asc" },
  { label: "Price: High–Low", value: "price_desc" },
  { label: "Most Viewed",     value: "views" },
];

const LoadingState = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
  </div>
);

const EmptyState = ({ searchQuery }: { searchQuery: string }) => (
  <div className="col-span-full text-center py-24 bg-white rounded-2xl border border-stone-100 shadow-sm">
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 mb-4">
      <Package className="w-6 h-6 text-stone-400" />
    </div>
    <h3 className="text-lg font-semibold text-stone-800 mb-1">No products found</h3>
    <p className="text-sm text-stone-400 max-w-sm mx-auto">
      {searchQuery
        ? `No results for "${searchQuery}". Try different keywords or adjust your filters.`
        : "No products are listed yet. Check back soon."}
    </p>
  </div>
);

const FilterChip = ({
  active, label, onClick,
}: { active: boolean; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
      active
        ? "bg-stone-900 text-white border-stone-900"
        : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
    }`}
  >
    {label}
  </button>
);

const Products = () => {
  const { data: productsResponse, isLoading } = useGetProductsQuery(undefined);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  // Filter state
  const [productType, setProductType]   = useState<"All" | "Physical" | "Digital">("All");
  const [category, setCategory]         = useState("All");
  const [condition, setCondition]       = useState("All");
  const [sortBy, setSortBy]             = useState("newest");
  const [showFilters, setShowFilters]   = useState(false);

  console.log(productsResponse?.data);
  // ── Derived data ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!productsResponse?.data) return [];

    let items = [...productsResponse.data];

    // Search
    if (searchQuery) {
      items = items.filter((p: any) => {
        const q = searchQuery;
        return (
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.bookMetadata?.author?.toLowerCase().includes(q) ||
          p.bookMetadata?.isbn?.toLowerCase().includes(q) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(q))
        );
      });
    }

    // Product type
    if (productType !== "All") {
      items = items.filter((p: any) => p.productType === productType);
    }

    // Category
    if (category !== "All") {
      items = items.filter((p: any) => p.category === category);
    }

    // Condition (only relevant for physical)
    if (condition !== "All") {
      items = items.filter((p: any) => p.condition === condition);
    }

    // Sort
    if (sortBy === "newest") {
      items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "price_asc") {
      items.sort((a: any, b: any) => (a.price?.basePrice ?? 0) - (b.price?.basePrice ?? 0));
    } else if (sortBy === "price_desc") {
      items.sort((a: any, b: any) => (b.price?.basePrice ?? 0) - (a.price?.basePrice ?? 0));
    } else if (sortBy === "views") {
      items.sort((a: any, b: any) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    }

    return items;
  }, [productsResponse?.data, searchQuery, productType, category, condition, sortBy]);

  const activeFilterCount = [
    productType !== "All",
    category !== "All",
    condition !== "All",
    sortBy !== "newest",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setProductType("All");
    setCategory("All");
    setCondition("All");
    setSortBy("newest");
  };

  return (
    <div className="bg-stone-50 min-h-screen mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {searchQuery ? `Results for "${searchQuery}"` : "Marketplace"}
            </h1>
            <p className="text-sm text-stone-400 mt-1">
              {isLoading
                ? "Loading..."
                : `${filtered.length} ${filtered.length === 1 ? "listing" : "listings"} found`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl cursor-pointer focus:outline-none focus:border-amber-500 hover:border-stone-300 transition-colors"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                showFilters || activeFilterCount > 0
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
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
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Panel ── */}
        {showFilters && (
          <div className="bg-white border border-stone-100 rounded-2xl p-5 mb-6 shadow-sm space-y-4">

            {/* Product Type */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Type</p>
              <div className="flex flex-wrap gap-2">
                {(["All", "Physical", "Digital"] as const).map(t => (
                  <FilterChip
                    key={t}
                    label={t === "All" ? "All Types" : t === "Physical" ? "📦 Physical" : "⚡ Digital"}
                    active={productType === t}
                    onClick={() => setProductType(t)}
                  />
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
                ))}
              </div>
            </div>

            {/* Condition (only for physical) */}
            {productType !== "Digital" && (
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Condition</p>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map(c => (
                    <FilterChip key={c} label={c} active={condition === c} onClick={() => setCondition(c)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Active filter summary bar ── */}
        {!showFilters && activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {productType !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-stone-100 text-stone-700 rounded-lg">
                {productType === "Physical" ? <Package className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                {productType}
                <button onClick={() => setProductType("All")} className="text-stone-400 hover:text-stone-700 ml-0.5"><X className="w-3 h-3" /></button>
              </span>
            )}
            {category !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-stone-100 text-stone-700 rounded-lg">
                {category}
                <button onClick={() => setCategory("All")} className="text-stone-400 hover:text-stone-700 ml-0.5"><X className="w-3 h-3" /></button>
              </span>
            )}
            {condition !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-stone-100 text-stone-700 rounded-lg">
                {condition}
                <button onClick={() => setCondition("All")} className="text-stone-400 hover:text-stone-700 ml-0.5"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* ── Product Grid ── */}
        {isLoading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <ProductCard products={filtered} />
          </div>
        )}

      </div>
    </div>
  );
};

export default Products;