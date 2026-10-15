import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Pencil, Phone, ShoppingBag, XCircle } from "lucide-react";
import { toast } from "sonner";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";
import {
    useDeleteOrderMutation,
    useGetOrderByUserIdQuery,
    useUpdateOrderMutation,
} from "../../../redux/features/order/orderApi";
import { useAppSelector } from "../../../redux/hooks";
import {
    btn,
    ConfirmDialog,
    EmptyState,
    errorMessage,
    ErrorState,
    Field,
    formatDate,
    inputClass,
    LoadingRows,
    Modal,
    money,
    OrderStatusBadge,
    PageHeader,
    Pagination,
    Panel,
    PaymentStatusBadge,
    SearchInput,
    SelectFilter,
    Toolbar,
    usePaged,
} from "../../../components/dashboard/ui";

interface Order {
    _id: string;
    orderId: string;
    createdAt: string;
    books: { book: { _id?: string; slug?: string } | string | null; bookTitle: string; productImage: string; price: number; quantity: number }[];
    totalAmount: number;
    shippingCost: number;
    paymentMethod: "cod" | "bkash";
    paymentStatus: string;
    orderStatus: string;
    deliveryAddress: string;
    phoneNumber: string;
    recipientName?: string;
}

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
];

// Mirrors the server rule: a buyer can change or cancel an order only while
// it is still pending and unpaid.
const isEditable = (order: Order) => order.orderStatus === "pending" && order.paymentStatus !== "paid";

const MyOrders = () => {
    const { id } = useAppSelector(selectCurrentUser) as TUser;
    const { data, isLoading, isError, refetch } = useGetOrderByUserIdQuery(id);
    const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
    const [cancelOrder, { isLoading: isCancelling }] = useDeleteOrderMutation();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [editing, setEditing] = useState<Order | null>(null);
    const [cancelling, setCancelling] = useState<Order | null>(null);

    const orders: Order[] = useMemo(() => data?.data ?? [], [data]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return orders.filter(
            (order) =>
                (status === "all" || order.orderStatus === status) &&
                (!term ||
                    order.orderId?.toLowerCase().includes(term) ||
                    order.books?.some((item) => item.bookTitle?.toLowerCase().includes(term)))
        );
    }, [orders, search, status]);

    const { page, setPage, pageCount, pageItems } = usePaged(filtered, 8);

    const handleEdit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editing) return;
        const form = new FormData(event.currentTarget);
        try {
            await updateOrder({
                id: editing._id,
                data: {
                    deliveryAddress: String(form.get("deliveryAddress")).trim(),
                    phoneNumber: String(form.get("phoneNumber")).trim(),
                },
            }).unwrap();
            toast.success("Delivery details updated");
            setEditing(null);
        } catch (error) {
            toast.error(errorMessage(error, "Could not update the order"));
        }
    };

    const handleCancel = async () => {
        if (!cancelling) return;
        try {
            await cancelOrder(cancelling._id).unwrap();
            toast.success("Order cancelled");
            setCancelling(null);
        } catch (error) {
            toast.error(errorMessage(error, "Could not cancel the order"));
        }
    };

    return (
        <>
            <PageHeader title="My Orders" desc="Track what you have ordered. Pending orders can still be changed or cancelled." />

            <Toolbar>
                <SearchInput value={search} onChange={setSearch} placeholder="Search by order ID or book title" />
                <SelectFilter value={status} onChange={setStatus} options={STATUS_OPTIONS} label="Filter by order status" />
            </Toolbar>

            {isLoading ? (
                <Panel flush><LoadingRows /></Panel>
            ) : isError ? (
                <Panel flush><ErrorState onRetry={refetch} /></Panel>
            ) : orders.length === 0 ? (
                <Panel flush>
                    <EmptyState
                        icon={ShoppingBag}
                        title="No orders yet"
                        desc="Books you order will show up here."
                        action={<Link to="/books" className={btn.primary}>Browse books</Link>}
                    />
                </Panel>
            ) : filtered.length === 0 ? (
                <Panel flush>
                    <EmptyState icon={ShoppingBag} title="No matching orders" desc="Try a different search or status." />
                </Panel>
            ) : (
                <>
                    <ul className="space-y-4">
                        {pageItems.map((order) => (
                            <li key={order._id} className="rounded-2xl border border-stone-200 bg-white shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-stone-100 px-4 py-3 sm:px-5">
                                    <p className="text-sm">
                                        <span className="font-mono font-semibold text-stone-900">{order.orderId}</span>
                                        <span className="text-stone-500"> · {formatDate(order.createdAt)}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        <OrderStatusBadge status={order.orderStatus} />
                                        <PaymentStatusBadge status={order.paymentStatus} />
                                    </div>
                                </div>

                                <ul className="divide-y divide-stone-100 px-4 sm:px-5">
                                    {order.books.map((item, i) => {
                                        const slug = item.book && typeof item.book === "object" ? item.book.slug : undefined;
                                        return (
                                            <li key={i} className="flex items-center gap-3 py-3">
                                                <img
                                                    src={item.productImage}
                                                    alt=""
                                                    loading="lazy"
                                                    className="h-14 w-10 flex-shrink-0 rounded-md bg-stone-100 object-cover"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    {slug ? (
                                                        <Link to={`/products/${slug}`} className="block truncate text-sm font-semibold text-stone-900 hover:text-amber-600">
                                                            {item.bookTitle}
                                                        </Link>
                                                    ) : (
                                                        <p className="truncate text-sm font-semibold text-stone-900">{item.bookTitle}</p>
                                                    )}
                                                    <p className="text-xs text-stone-500">
                                                        {money(item.price)} × {item.quantity}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-semibold text-stone-900">{money(item.price * item.quantity)}</span>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <div className="flex flex-col gap-3 border-t border-stone-100 px-4 py-3 sm:flex-row sm:items-end sm:justify-between sm:px-5">
                                    <div className="min-w-0 space-y-1 text-xs text-stone-600">
                                        <p className="flex items-start gap-1.5">
                                            <MapPin size={14} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-stone-400" />
                                            <span className="break-words">{order.recipientName ? `${order.recipientName}, ` : ""}{order.deliveryAddress}</span>
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                            <Phone size={14} aria-hidden="true" className="flex-shrink-0 text-stone-400" />
                                            {order.phoneNumber}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 sm:text-right">
                                        <p className="text-xs text-stone-500">
                                            Delivery {money(order.shippingCost)} · {order.paymentMethod === "bkash" ? "bKash" : "Cash on delivery"}
                                        </p>
                                        <p className="font-display text-xl font-bold text-stone-900">{money(order.totalAmount)}</p>
                                    </div>
                                </div>

                                {isEditable(order) && (
                                    <div className="flex flex-col gap-2 border-t border-stone-100 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
                                        <button type="button" onClick={() => setEditing(order)} className={btn.secondary}>
                                            <Pencil size={15} aria-hidden="true" /> Edit delivery details
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCancelling(order)}
                                            className={`${btn.secondary} !text-red-600 hover:!bg-red-50`}
                                        >
                                            <XCircle size={15} aria-hidden="true" /> Cancel order
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    {pageCount > 1 && (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white [&>nav]:border-t-0">
                            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
                        </div>
                    )}
                </>
            )}

            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit delivery details">
                {editing && (
                    <form onSubmit={handleEdit} className="space-y-4">
                        <Field label="Delivery address">
                            <textarea
                                name="deliveryAddress"
                                required
                                minLength={5}
                                rows={3}
                                defaultValue={editing.deliveryAddress}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Phone number">
                            <input
                                name="phoneNumber"
                                type="tel"
                                required
                                minLength={11}
                                defaultValue={editing.phoneNumber}
                                className={inputClass}
                            />
                        </Field>
                        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => setEditing(null)} className={btn.secondary}>
                                Close
                            </button>
                            <button type="submit" disabled={isUpdating} className={btn.primary}>
                                {isUpdating ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            <ConfirmDialog
                open={!!cancelling}
                onClose={() => setCancelling(null)}
                onConfirm={handleCancel}
                loading={isCancelling}
                title="Cancel this order?"
                desc={`Order ${cancelling?.orderId ?? ""} will be cancelled and the books released back to the sellers. This cannot be undone.`}
                confirmLabel="Cancel order"
            />
        </>
    );
};

export default MyOrders;
