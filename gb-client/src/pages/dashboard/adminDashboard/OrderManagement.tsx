import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, Clock, Eye, ShoppingBag, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
    useDeleteOrderMutation,
    useGetOrdersQuery,
    useUpdateOrderMutation,
} from "../../../redux/features/order/orderApi";
import {
    btn,
    ConfirmDialog,
    DataList,
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
    StatCard,
    StatGrid,
    Toolbar,
    usePaged,
} from "../../../components/dashboard/ui";

interface Order {
    _id: string;
    orderId: string;
    books: { book: string; bookTitle: string; productImage: string; price: number; quantity: number }[];
    bought_by?: { name?: string; email?: string; contactNo?: string }[];
    phoneNumber: string;
    email: string;
    deliveryAddress: string;
    shippingArea: "inside" | "outside";
    shippingCost: number;
    totalAmount: number;
    paymentMethod: "cod" | "bkash";
    transactionId?: string;
    paymentStatus: string;
    orderStatus: string;
    comment?: string;
    createdAt?: string;
}

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "partially-paid", "paid", "failed"];

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    ...ORDER_STATUSES.map((status) => ({ value: status, label: status[0].toUpperCase() + status.slice(1) })),
];

const buyerName = (order: Order) => order.bought_by?.[0]?.name || order.email;

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
        <dt className="flex-shrink-0 text-stone-500">{label}</dt>
        <dd className="min-w-0 break-words text-right font-medium text-stone-900">{children}</dd>
    </div>
);

const OrderManagement = () => {
    const { data, isLoading, isError, refetch } = useGetOrdersQuery(undefined);
    const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
    const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [viewingId, setViewingId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<Order | null>(null);

    const orders: Order[] = useMemo(() => data?.data ?? [], [data]);
    // Looked up from the live list so the dialog reflects a saved change.
    const viewing = orders.find((order) => order._id === viewingId) ?? null;

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return orders.filter(
            (order) =>
                (status === "all" || order.orderStatus === status) &&
                (!term ||
                    order.orderId?.toLowerCase().includes(term) ||
                    buyerName(order)?.toLowerCase().includes(term) ||
                    order.email?.toLowerCase().includes(term) ||
                    order.phoneNumber?.includes(term) ||
                    order.books?.some((item) => item.bookTitle?.toLowerCase().includes(term)))
        );
    }, [orders, search, status]);

    const { page, setPage, pageCount, pageItems } = usePaged(filtered);

    const active = orders.filter((order) => order.orderStatus !== "cancelled");
    const orderValue = active.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);

    const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!viewing) return;
        const form = new FormData(event.currentTarget);
        try {
            await updateOrder({
                id: viewing._id,
                data: {
                    orderStatus: String(form.get("orderStatus")),
                    paymentStatus: String(form.get("paymentStatus")),
                },
            }).unwrap();
            toast.success("Order updated");
        } catch (error) {
            toast.error(errorMessage(error, "Could not update the order"));
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await deleteOrder(deleting._id).unwrap();
            toast.success("Order removed");
            setDeleting(null);
        } catch (error) {
            toast.error(errorMessage(error, "Could not remove the order"));
        }
    };

    const actions = (order: Order) => (
        <div className="flex justify-end gap-1">
            <button type="button" onClick={() => setViewingId(order._id)} aria-label={`Open order ${order.orderId}`} className={btn.icon}>
                <Eye size={16} aria-hidden="true" />
            </button>
            <button
                type="button"
                onClick={() => setDeleting(order)}
                aria-label={`Remove order ${order.orderId}`}
                className={`${btn.icon} hover:!bg-red-50 hover:!text-red-600`}
            >
                <Trash2 size={16} aria-hidden="true" />
            </button>
        </div>
    );

    const buyerCell = (order: Order) => (
        <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-900">{buyerName(order)}</p>
            <p className="truncate text-xs text-stone-500">{order.phoneNumber}</p>
        </div>
    );

    return (
        <>
            <PageHeader title="Orders" desc="Confirm, ship and track every order." />

            <StatGrid>
                <StatCard label="Total orders" value={orders.length} icon={ShoppingBag} />
                <StatCard label="Order value" value={money(orderValue)} icon={Wallet} hint="Excludes cancelled" />
                <StatCard label="Pending" value={orders.filter((o) => o.orderStatus === "pending").length} icon={Clock} />
                <StatCard label="Delivered" value={orders.filter((o) => o.orderStatus === "delivered").length} icon={CheckCircle2} />
            </StatGrid>

            <Toolbar>
                <SearchInput value={search} onChange={setSearch} placeholder="Search by order ID, buyer, phone or book" />
                <SelectFilter value={status} onChange={setStatus} options={STATUS_OPTIONS} label="Filter by order status" />
            </Toolbar>

            <Panel flush>
                {isLoading ? (
                    <LoadingRows />
                ) : isError ? (
                    <ErrorState onRetry={refetch} />
                ) : orders.length === 0 ? (
                    <EmptyState icon={ShoppingBag} title="No orders yet" desc="New orders will appear here as customers place them." />
                ) : filtered.length === 0 ? (
                    <EmptyState icon={ShoppingBag} title="No matching orders" desc="Try a different search or status." />
                ) : (
                    <>
                        <DataList
                            rows={pageItems}
                            rowKey={(order) => order._id}
                            columns={[
                                {
                                    header: "Order",
                                    cell: (order) => (
                                        <>
                                            <p className="font-mono text-xs font-semibold text-stone-900">{order.orderId}</p>
                                            <p className="text-xs text-stone-500">{formatDate(order.createdAt)}</p>
                                        </>
                                    ),
                                },
                                { header: "Buyer", cell: buyerCell },
                                {
                                    header: "Items",
                                    cell: (order) => (
                                        <p className="max-w-[14rem] truncate text-sm text-stone-700">
                                            {order.books?.[0]?.bookTitle}
                                            {order.books?.length > 1 && ` +${order.books.length - 1}`}
                                        </p>
                                    ),
                                },
                                { header: "Total", cell: (order) => <span className="font-bold text-stone-900">{money(order.totalAmount)}</span> },
                                { header: "Payment", cell: (order) => <PaymentStatusBadge status={order.paymentStatus} /> },
                                { header: "Status", cell: (order) => <OrderStatusBadge status={order.orderStatus} /> },
                                { header: "Actions", align: "right", cell: actions },
                            ]}
                            renderCard={(order) => (
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        {buyerCell(order)}
                                        <span className="flex-shrink-0 font-bold text-stone-900">{money(order.totalAmount)}</span>
                                    </div>
                                    <p className="truncate text-sm text-stone-700">
                                        {order.books?.[0]?.bookTitle}
                                        {order.books?.length > 1 && ` +${order.books.length - 1}`}
                                    </p>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-wrap gap-1.5">
                                            <OrderStatusBadge status={order.orderStatus} />
                                            <PaymentStatusBadge status={order.paymentStatus} />
                                        </div>
                                        {actions(order)}
                                    </div>
                                    <p className="text-xs text-stone-500">
                                        <span className="font-mono">{order.orderId}</span> · {formatDate(order.createdAt)}
                                    </p>
                                </div>
                            )}
                        />
                        <Pagination page={page} pageCount={pageCount} onChange={setPage} />
                    </>
                )}
            </Panel>

            <Modal open={!!viewing} onClose={() => setViewingId(null)} title={viewing ? `Order ${viewing.orderId}` : "Order"} wide>
                {viewing && (
                    <div className="space-y-6">
                        <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200">
                            {viewing.books.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 p-3">
                                    <img src={item.productImage} alt="" loading="lazy" className="h-14 w-10 flex-shrink-0 rounded-md bg-stone-100 object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-stone-900">{item.bookTitle}</p>
                                        <p className="text-xs text-stone-500">{money(item.price)} × {item.quantity}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-stone-900">{money(item.price * item.quantity)}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <dl>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">Delivery</p>
                                <Row label="Buyer">{buyerName(viewing)}</Row>
                                <Row label="Phone">
                                    <a href={`tel:${viewing.phoneNumber}`} className="text-amber-700 hover:underline">{viewing.phoneNumber}</a>
                                </Row>
                                <Row label="Email">{viewing.email}</Row>
                                <Row label="Area">{viewing.shippingArea === "inside" ? "Inside Chattogram" : "Outside Chattogram"}</Row>
                                <Row label="Address">{viewing.deliveryAddress}</Row>
                                {viewing.comment && <Row label="Note">{viewing.comment}</Row>}
                            </dl>
                            <dl>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">Payment</p>
                                <Row label="Method">{viewing.paymentMethod === "bkash" ? "bKash" : "Cash on delivery"}</Row>
                                {viewing.paymentMethod === "bkash" && (
                                    <Row label="Transaction ID"><span className="font-mono">{viewing.transactionId}</span></Row>
                                )}
                                <Row label="Delivery charge">{money(viewing.shippingCost)}</Row>
                                <Row label="Total"><span className="text-base font-bold">{money(viewing.totalAmount)}</span></Row>
                                <Row label="Placed">{formatDate(viewing.createdAt)}</Row>
                            </dl>
                        </div>

                        {viewing.orderStatus === "cancelled" ? (
                            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                This order was cancelled and its stock returned. A cancelled order cannot be reopened.
                            </p>
                        ) : (
                            // Keyed so the selects reset to the saved values after an update.
                            <form
                                key={`${viewing.orderStatus}-${viewing.paymentStatus}`}
                                onSubmit={handleUpdate}
                                className="rounded-xl bg-stone-50 p-4"
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Order status">
                                        <select name="orderStatus" defaultValue={viewing.orderStatus} className={`${inputClass} cursor-pointer capitalize`}>
                                            {ORDER_STATUSES.map((value) => (
                                                <option key={value} value={value}>{value}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Payment status">
                                        <select name="paymentStatus" defaultValue={viewing.paymentStatus} className={`${inputClass} cursor-pointer capitalize`}>
                                            {PAYMENT_STATUSES.map((value) => (
                                                <option key={value} value={value}>{value.replace("-", " ")}</option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>
                                <p className="mt-3 text-xs text-stone-500">
                                    Setting the order to cancelled returns its books to stock.
                                </p>
                                <div className="mt-4 flex justify-end">
                                    <button type="submit" disabled={isUpdating} className={`${btn.primary} w-full sm:w-auto`}>
                                        {isUpdating ? "Saving..." : "Save status"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </Modal>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                loading={isDeleting}
                title="Remove this order?"
                desc={`Order ${deleting?.orderId ?? ""} will be removed from this list. If it is still pending or confirmed it is cancelled first and its books are returned to stock.`}
                confirmLabel="Remove order"
            />
        </>
    );
};

export default OrderManagement;
