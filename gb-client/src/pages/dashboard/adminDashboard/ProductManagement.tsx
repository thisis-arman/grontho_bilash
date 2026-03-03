import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  useGetBooksQuery,
  useDeleteBookMutation,
  TBook,
} from "../../../redux/features/book/bookApi";
import {
  Search, Plus, Trash2, Edit2, Package, Zap,
  ChevronLeft, ChevronRight, SlidersHorizontal,
  X, BookOpen, TrendingUp, LayoutGrid
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Academic", "Fiction", "Non-Fiction", "Science", "Technology", "Religion", "Children", "Self-Help", "Business", "Other"];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (p: number) => `৳${new Intl.NumberFormat("en-BD").format(p)}`;

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, color }: {
  label: string; value: number | string; icon: React.ElementType; color: string;
}) => (
  <div className="bg-white border border-stone-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-stone-900">{value}</p>
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

// ── Delete confirmation (native, no Swal dep) ─────────────────────────────────

const DeleteConfirmModal = ({
  product, onConfirm, onCancel, isDeleting,
}: {
  product: TBook; onConfirm: () => void; onCancel: () => void; isDeleting: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-black text-stone-900 mb-1">Delete Listing?</h3>
        <p className="text-sm text-stone-500 mb-1">
          You're about to delete{" "}
          <span className="font-semibold text-stone-800">"{product.title}"</span>.
        </p>
        <p className="text-xs text-stone-400 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const ProductManagement = () => {
  const { data: productsData, isLoading } = useGetBooksQuery(undefined);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteBookMutation();

  // Delete modal
  const [pendingDelete, setPendingDelete] = useState<TBook | null>(null);

  // Search & filter
  const [search, setSearch]               = useState("");
  const [typeFilter, setTypeFilter]       = useState<"All" | "Physical" | "Digital">("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showFilters, setShowFilters]     = useState(false);

  // Pagination
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const allProducts: TBook[] = productsData?.data?.data ?? [];

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.bookMetadata?.author?.toLowerCase().includes(q) ||
          p.bookMetadata?.isbn?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "All")     list = list.filter((p) => p.productType === typeFilter);
    if (categoryFilter !== "All") list = list.filter((p) => p.category === categoryFilter);
    return list;
  }, [allProducts, search, typeFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const physicalCount = allProducts.filter((p) => p.productType === "Physical").length;
  const digitalCount  = allProducts.filter((p) => p.productType === "Digital").length;
  const activeFilterCount = [typeFilter !== "All", categoryFilter !== "All"].filter(Boolean).length;

  const applyFilter = (fn: () => void) => { fn(); setPage(1); };

  const resetFilters = () => {
    setSearch(""); setTypeFilter("All"); setCategoryFilter("All"); setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    try {
      await deleteProduct(pendingDelete._id).unwrap();
    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setPendingDelete(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-stone-50 min-h-screen">

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Product Management</h1>
          <p className="text-stone-400 text-sm mt-1">
            {allProducts.length} total listings across all categories.
          </p>
        </div>
        <Link
          to="/dashboard/add-product"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-amber-500 hover:text-stone-900 text-white font-bold rounded-2xl text-sm transition-all hover:-translate-y-0.5 shadow-sm"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* ── Stats ── */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total"    value={allProducts.length} icon={LayoutGrid}  color="bg-stone-100 text-stone-600" />
          <StatCard label="Physical" value={physicalCount}      icon={Package}     color="bg-amber-100 text-amber-600" />
          <StatCard label="Digital"  value={digitalCount}       icon={Zap}         color="bg-violet-100 text-violet-600" />
          <StatCard label="Filtered" value={filtered.length}    icon={TrendingUp}  color="bg-emerald-100 text-emerald-600" />
        </div>
      )}

      {/* ── Search + Filter bar ── */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => applyFilter(() => setSearch(e.target.value))}
            placeholder="Search by title, author, ISBN, category..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all shadow-sm"
          />
          {search && (
            <button onClick={() => applyFilter(() => setSearch(""))} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
            showFilters || activeFilterCount > 0
              ? "bg-stone-900 text-white border-stone-900"
              : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-900 text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        {(activeFilterCount > 0 || search) && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 text-sm font-semibold hover:bg-rose-100 transition-all"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="mb-4 bg-white border border-stone-100 rounded-2xl p-5 shadow-sm flex flex-wrap gap-6">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">Type</p>
            <div className="flex gap-2">
              {(["All", "Physical", "Digital"] as const).map((t) => (
                <button key={t} onClick={() => applyFilter(() => setTypeFilter(t))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    typeFilter === t ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                  }`}
                >
                  {t === "All" ? "All Types" : t === "Physical" ? "📦 Physical" : "⚡ Digital"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => applyFilter(() => setCategoryFilter(c))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    categoryFilter === c ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Results meta ── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs text-stone-400 font-medium">
          Showing{" "}
          <span className="font-bold text-stone-700">
            {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)}
          </span>{" "}
          of <span className="font-bold text-stone-700">{filtered.length}</span> products
        </p>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="bg-white border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400"
          >
            {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-stone-50 border-b border-stone-100 text-[11px] font-bold tracking-widest uppercase text-stone-400">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Condition</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-stone-400">
                        <BookOpen size={28} className="text-stone-300" />
                        <p className="text-sm font-medium">No products match your filters</p>
                        <button onClick={resetFilters} className="text-xs text-amber-600 font-semibold hover:underline mt-1">
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((item: TBook) => (
                  <tr key={item._id} className="hover:bg-stone-50/60 transition-colors group">

                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen size={16} className="text-stone-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-stone-900 font-semibold text-sm max-w-[180px] truncate">{item.title}</p>
                          {item.bookMetadata?.author && (
                            <p className="text-stone-400 text-xs truncate max-w-[180px]">{item.bookMetadata.author}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                        {item.category || "—"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-bold text-stone-900">
                      {formatPrice(item.price?.basePrice ?? 0)}
                      {item.price?.isNegotiable && (
                        <span className="ml-1.5 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">Neg.</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.productType === "Digital"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-stone-100 text-stone-700"
                      }`}>
                        {item.productType === "Digital" ? <Zap size={10} /> : <Package size={10} />}
                        {item.productType}
                      </span>
                    </td>

                    {/* Condition */}
                    <td className="px-6 py-4 text-stone-600 text-xs font-medium">
                      {item.condition || "—"}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.stockStatus === "In Stock"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.stockStatus === "Pre-order"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {item.stockStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/dashboard/edit-product/${item._id}`}
                          className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => setPendingDelete(item)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between gap-4">
              <p className="text-xs text-stone-400">
                Page <span className="font-bold text-stone-700">{safePage}</span> of{" "}
                <span className="font-bold text-stone-700">{totalPages}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:border-stone-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`el-${i}`} className="w-8 h-8 flex items-center justify-center text-stone-400 text-xs">…</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p as number)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          safePage === p ? "bg-stone-900 text-white" : "border border-stone-200 text-stone-600 hover:border-stone-400"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:border-stone-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {pendingDelete && (
        <DeleteConfirmModal
          product={pendingDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default ProductManagement;