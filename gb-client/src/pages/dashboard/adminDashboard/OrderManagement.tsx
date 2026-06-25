import { useState, useMemo } from "react";
import {
  useGetOrdersQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation
} from "../../../redux/features/order/orderApi";
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
  ShoppingBag, DollarSign, Clock, CheckCircle, Edit, Trash2,
  Package, MapPin, CreditCard, Tag
} from "lucide-react";
import { toast } from "sonner";

type TOrder = {
  _id: string;
  orderId: string;
  books: {
    book: string;
    bookTitle: string;
    productImage: string;
    seller: string;
    price: number;
    quantity: number;
  }[];
  buyer: any;
  bought_by?: any[]; // Lookup array from backend aggregation
  phoneNumber: string;
  email: string;
  deliveryAddress: string;
  shippingArea: "inside" | "outside";
  shippingCost: number;
  totalAmount: number;
  paymentMethod: "cod" | "bkash";
  transactionId?: string;
  paymentStatus: "pending" | "paid" | "partially-paid" | "failed" | "cancelled";
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const StatCard = ({ label, value, icon: Icon, color }: {
  label: string; value: number | string; icon: React.ElementType; color: string;
}) => (
  <div className="bg-white border border-stone-100 rounded-lg px-2 py-2 flex items-center gap-2 shadow-sm">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-xs md:text-md font-medium text-stone-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm md:text-xl font-extrabold text-stone-900">{value}</p>
    </div>
  </div>
);

const OrderManagement = () => {
  const { data: ordersResponse, isLoading } = useGetOrdersQuery(undefined);
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

  // State Management
  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit / Delete Modal State
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState<TOrder["orderStatus"]>("pending");
  const [newPaymentStatus, setNewPaymentStatus] = useState<TOrder["paymentStatus"]>("pending");
  const [pendingDeleteOrder, setPendingDeleteOrder] = useState<TOrder | null>(null);

  const allOrders: TOrder[] = ordersResponse?.data || [];

  // Derived Data & Filtering
  const filtered = useMemo(() => {
    let list = [...allOrders];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((order) => {
        const orderIdMatch = order.orderId?.toLowerCase().includes(q);
        const emailMatch = order.email?.toLowerCase().includes(q);
        const phoneMatch = order.phoneNumber?.toLowerCase().includes(q);
        const buyerNameMatch = order.bought_by?.[0]?.name?.toLowerCase().includes(q);
        const bookTitleMatch = order.books?.some((b) => b.bookTitle?.toLowerCase().includes(q));
        return orderIdMatch || emailMatch || phoneMatch || buyerNameMatch || bookTitleMatch;
      });
    }

    if (orderStatusFilter !== "All") {
      list = list.filter((o) => o.orderStatus === orderStatusFilter);
    }

    if (paymentStatusFilter !== "All") {
      list = list.filter((o) => o.paymentStatus === paymentStatusFilter);
    }

    return list;
  }, [allOrders, search, orderStatusFilter, paymentStatusFilter]);

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Calculate statistics
  const totalAmountSum = allOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const pendingOrdersCount = allOrders.filter((o) => o.orderStatus === "pending").length;
  const completedOrdersCount = allOrders.filter((o) => o.orderStatus === "delivered").length;

  const activeFilterCount = [orderStatusFilter !== "All", paymentStatusFilter !== "All"].filter(Boolean).length;

  const applyFilter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setOrderStatusFilter("All");
    setPaymentStatusFilter("All");
    setPage(1);
  };

  // Handlers
  const handleEditClick = (order: TOrder) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
    setIsEditModalOpen(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await updateOrder({
        id: selectedOrder._id,
        data: {
          orderStatus: newOrderStatus,
          paymentStatus: newPaymentStatus
        }
      }).unwrap();
      toast.success("Order status updated successfully!");
      setIsEditModalOpen(false);
      setSelectedOrder(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update order status.");
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteOrder) return;
    try {
      await deleteOrder(pendingDeleteOrder._id).unwrap();
      toast.success("Order deleted/cancelled successfully!");
      setPendingDeleteOrder(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete order.");
      console.error(err);
    }
  };

  return (
    <div className="p-1 sm:p-6 lg:p-8 bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">Order Management</h1>
          <p className="text-stone-400 text-sm mt-1">
            Track transactions, update shipment states, and monitor order processing.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          <StatCard label="Total Orders" value={allOrders.length} icon={ShoppingBag} color="bg-stone-100 text-stone-600" />
          <StatCard label="Total Revenue" value={`৳ ${totalAmountSum.toLocaleString()}`} icon={DollarSign} color="bg-emerald-100 text-emerald-600" />
          <StatCard label="Pending State" value={pendingOrdersCount} icon={Clock} color="bg-amber-100 text-amber-600" />
          <StatCard label="Completed" value={completedOrdersCount} icon={CheckCircle} color="bg-indigo-100 text-indigo-600" />
        </div>
      )}

      {/* Filter Options */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => applyFilter(() => setSearch(e.target.value))}
            placeholder="Search by Order ID, Buyer Name, Email, or Book title..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all shadow-sm"
          />
          {search && (
            <button onClick={() => applyFilter(() => setSearch(""))} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showFilters || activeFilterCount > 0
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

        {/* Clear Filters */}
        {(activeFilterCount > 0 || search) && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 text-sm font-semibold hover:bg-rose-100 transition-all"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Extended Filters Drawer */}
      {showFilters && (
        <div className="mb-4 bg-white border border-stone-100 rounded-2xl p-5 shadow-sm flex flex-wrap gap-6">
          {/* Order Status */}
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">Order Status</p>
            <div className="flex flex-wrap gap-2">
              {["All", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => applyFilter(() => setOrderStatusFilter(status))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all capitalize ${orderStatusFilter === status
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">Payment Status</p>
            <div className="flex flex-wrap gap-2">
              {["All", "pending", "paid", "failed", "cancelled"].map((pStatus) => (
                <button
                  key={pStatus}
                  onClick={() => applyFilter(() => setPaymentStatusFilter(pStatus))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all capitalize ${paymentStatusFilter === pStatus
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                    }`}
                >
                  {pStatus}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Header Info */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs text-stone-400 font-medium">
          Showing{" "}
          <span className="font-bold text-stone-700">
            {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)}
          </span>{" "}
          of <span className="font-bold text-stone-700">{filtered.length}</span> orders
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

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-stone-50 border-b border-stone-100 text-[11px] font-medium tracking-widest uppercase text-stone-400">
                <tr>
                  <th className="px-1 py-1">Order ID & Date</th>
                  <th className="px-1 py-1">Purchased Books</th>
                  <th className="px-1 py-1">Buyer Details</th>
                  <th className="px-1 py-1">Transaction details</th>
                  <th className="px-1 py-1">Status Badges</th>
                  <th className="px-1 py-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-1 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-stone-400">
                        <ShoppingBag size={28} className="text-stone-300" />
                        <p className="text-sm font-medium">No orders match your criteria</p>
                        <button onClick={resetFilters} className="text-xs text-amber-600 font-semibold hover:underline mt-1">
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((item: TOrder) => {
                  const firstBook = item.books?.[0];
                  const additionalBooksCount = (item.books?.length || 0) - 1;

                  return (
                    <tr key={item._id} className="hover:bg-stone-50/60 transition-colors group">

                      {/* Order ID & Date */}
                      <td className="px-2 py-2">
                        <p className="font-extrabold text-stone-900 text-sm">#{item.orderId || item._id.slice(-8).toUpperCase()}</p>
                        <span className="text-[10px] text-stone-400 font-bold block mt-0.5">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}
                        </span>
                      </td>

                      {/* Purchased Books */}
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200 flex items-center justify-center">
                            {firstBook?.productImage ? (
                              <img src={firstBook.productImage} alt={firstBook.bookTitle} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={16} className="text-stone-400" />
                            )}
                          </div>
                          <div className="max-w-[200px]">
                            <p className="text-stone-900 font-semibold text-xs truncate" title={firstBook?.bookTitle}>
                              {firstBook?.bookTitle || "Book title not found"}
                            </p>
                            <p className="text-[10px] text-stone-400 font-bold mt-0.5">
                              Qty: {firstBook?.quantity || 1} • Price: ৳{firstBook?.price || 0}
                              {additionalBooksCount > 0 && (
                                <span className="ml-1 text-amber-600 bg-amber-50 border border-amber-100 px-1 py-0.25 rounded text-[9px] font-black">
                                  +{additionalBooksCount} more
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Buyer Details */}
                      <td className="px-2 py-2">
                        <p className="text-stone-900 font-bold text-xs">
                          {item.bought_by?.[0]?.name || item.email?.split("@")[0] || "Guest Buyer"}
                        </p>
                        <span className="text-[10px] text-stone-400 block font-medium mt-0.5">{item.email}</span>
                        <span className="text-[10px] text-stone-400 block font-medium">{item.phoneNumber}</span>
                      </td>

                      {/* Transaction Details */}
                      <td className="px-2 py-2">
                        <div className="space-y-0.5">
                          <p className="text-stone-900 font-extrabold text-sm">৳{item.totalAmount?.toLocaleString()}</p>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 font-semibold">
                            <span className="uppercase text-amber-700 bg-amber-50 px-1.5 py-0.25 rounded border border-amber-100">
                              {item.paymentMethod}
                            </span>
                            {item.transactionId && item.transactionId !== "N/A" && (
                              <span className="truncate max-w-[80px]" title={item.transactionId}>
                                TxID: {item.transactionId}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="px-2 py-2 space-y-1.5">
                        {/* Order status */}
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black capitalize ${item.orderStatus === "delivered"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.orderStatus === "shipped"
                                ? "bg-blue-100 text-blue-700"
                                : item.orderStatus === "cancelled"
                                  ? "bg-red-150 text-red-750"
                                  : "bg-amber-100 text-amber-700"
                            }`}>
                            {item.orderStatus}
                          </span>
                        </div>
                        {/* Payment status */}
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold capitalize border ${item.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : item.paymentStatus === "failed" || item.paymentStatus === "cancelled"
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}>
                            Pay: {item.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-2 py-2 text-right">
                        <div className="flex items-center justify-end gap-1 ">
                          <button
                            onClick={() => handleEditClick(item)}
                            title="Edit Status"
                            className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => setPendingDeleteOrder(item)}
                            title="Delete Order"
                            className="p-2 text-red-400 hover:text-red-650 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${safePage === p ? "bg-stone-900 text-white" : "border border-stone-200 text-stone-600 hover:border-stone-400"
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

      {/* ── Status Editing Modal ── */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Edit size={15} />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Update Order Status</h3>
                  <p className="text-xs text-stone-400">Order ID: #{selectedOrder.orderId}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-stone-100 flex items-center justify-center text-stone-400 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateOrder} className="p-6 space-y-4">
              {/* Order Status Select */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Order Status</label>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value as TOrder["orderStatus"])}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status Select */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as TOrder["paymentStatus"])}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partially-paid">Partially-Paid</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-50">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-900/20 border-t-stone-900 rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {pendingDeleteOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => setPendingDeleteOrder(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-stone-100">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-500">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-black text-stone-900 mb-1">Delete Order?</h3>
              <p className="text-sm text-stone-500 mb-1 leading-relaxed">
                Are you sure you want to delete order <strong className="font-extrabold text-stone-850">#{pendingDeleteOrder.orderId}</strong>?
              </p>
              <p className="text-xs text-stone-405 mb-6">This operation is irreversible.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingDeleteOrder(null)}
                  className="flex-1 py-2.5 text-sm font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;