import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, MapPin, Pencil, Phone, ShoppingBag, XCircle } from "lucide-react";
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
    formatDateBn,
    inputClass,
    LoadingRows,
    Modal,
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
import { bnNumber, orderStatusLabel, paymentMethodLabel, taka } from "../../../i18n/labels";

interface Order {
    _id: string;
    orderId: string;
    createdAt: string;
    books: { book: { _id?: string; slug?: string; productType?: string } | string | null; bookTitle: string; productImage: string; price: number; quantity: number }[];
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
    { value: "all", label: "সব অবস্থা" },
    ...["pending", "confirmed", "shipped", "delivered", "cancelled"].map((value) => ({
        value,
        label: orderStatusLabel(value),
    })),
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
            toast.success("ডেলিভারির তথ্য আপডেট হয়েছে");
            setEditing(null);
        } catch (error) {
            toast.error(errorMessage(error, "অর্ডার আপডেট করা যায়নি"));
        }
    };

    const handleCancel = async () => {
        if (!cancelling) return;
        try {
            await cancelOrder(cancelling._id).unwrap();
            toast.success("অর্ডার বাতিল হয়েছে");
            setCancelling(null);
        } catch (error) {
            toast.error(errorMessage(error, "অর্ডার বাতিল করা যায়নি"));
        }
    };

    return (
        <>
            <PageHeader title="আমার অর্ডার" desc="তোমার অর্ডারগুলোর খোঁজ রাখো। অপেক্ষমাণ অর্ডার এখনো বদলানো বা বাতিল করা যায়।" />

            <Toolbar>
                <SearchInput value={search} onChange={setSearch} placeholder="অর্ডার আইডি বা বইয়ের নাম দিয়ে খুঁজো" />
                <SelectFilter value={status} onChange={setStatus} options={STATUS_OPTIONS} label="অর্ডারের অবস্থা দিয়ে বাছাই করো" />
            </Toolbar>

            {isLoading ? (
                <Panel flush><LoadingRows /></Panel>
            ) : isError ? (
                <Panel flush><ErrorState onRetry={refetch} /></Panel>
            ) : orders.length === 0 ? (
                <Panel flush>
                    <EmptyState
                        icon={ShoppingBag}
                        title="এখনো কোনো অর্ডার নেই"
                        desc="তুমি যে বই অর্ডার করবে, সেগুলো এখানে দেখাবে।"
                        action={<Link to="/books" className={btn.primary}>বই দেখো</Link>}
                    />
                </Panel>
            ) : filtered.length === 0 ? (
                <Panel flush>
                    <EmptyState icon={ShoppingBag} title="মিলে যাওয়া কোনো অর্ডার নেই" desc="অন্য কিছু লিখে খুঁজো বা অন্য অবস্থা বেছে নাও।" />
                </Panel>
            ) : (
                <>
                    <ul className="space-y-4">
                        {pageItems.map((order) => (
                            <li key={order._id} className="rounded-2xl border border-stone-200 bg-white shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-stone-100 px-4 py-3 sm:px-5">
                                    <p className="text-sm">
                                        <span className="font-mono font-semibold text-stone-900">{order.orderId}</span>
                                        <span className="text-stone-500"> · {formatDateBn(order.createdAt)}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        <OrderStatusBadge status={order.orderStatus} />
                                        <PaymentStatusBadge status={order.paymentStatus} />
                                    </div>
                                </div>

                                <ul className="divide-y divide-stone-100 px-4 sm:px-5">
                                    {order.books.map((item, i) => {
                                        const product = item.book && typeof item.book === "object" ? item.book : undefined;
                                        const slug = product?.slug;
                                        // A paid digital book opens in the reader.
                                        const readable = product?.productType === "Digital" && order.paymentStatus === "paid" && order.orderStatus !== "cancelled";
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
                                                        {taka(item.price)} × {bnNumber(item.quantity)}
                                                    </p>
                                                </div>
                                                {readable ? (
                                                    <Link to={`/read/${product!._id}`} className={btn.primary}>
                                                        <BookOpenCheck size={15} aria-hidden="true" /> পড়ো
                                                    </Link>
                                                ) : (
                                                    <span className="text-sm font-semibold text-stone-900">{taka(item.price * item.quantity)}</span>
                                                )}
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
                                            {order.shippingCost ? `ডেলিভারি ${taka(order.shippingCost)}` : "ডেলিভারি চার্জ নেই"} · {paymentMethodLabel(order.paymentMethod)}
                                        </p>
                                        <p className="font-display text-xl font-bold text-stone-900">{taka(order.totalAmount)}</p>
                                    </div>
                                </div>

                                {isEditable(order) && (
                                    <div className="flex flex-col gap-2 border-t border-stone-100 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
                                        <button type="button" onClick={() => setEditing(order)} className={btn.secondary}>
                                            <Pencil size={15} aria-hidden="true" /> ডেলিভারির তথ্য এডিট করো
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCancelling(order)}
                                            className={`${btn.secondary} !text-red-600 hover:!bg-red-50`}
                                        >
                                            <XCircle size={15} aria-hidden="true" /> অর্ডার বাতিল করো
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

            <Modal open={!!editing} onClose={() => setEditing(null)} title="ডেলিভারির তথ্য এডিট করো">
                {editing && (
                    <form onSubmit={handleEdit} className="space-y-4">
                        <Field label="ডেলিভারির ঠিকানা">
                            <textarea
                                name="deliveryAddress"
                                required
                                minLength={5}
                                rows={3}
                                defaultValue={editing.deliveryAddress}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="ফোন নম্বর">
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
                                বন্ধ করো
                            </button>
                            <button type="submit" disabled={isUpdating} className={btn.primary}>
                                {isUpdating ? "সেভ হচ্ছে..." : "সেভ করো"}
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
                title="অর্ডারটা বাতিল করবে?"
                desc={`${cancelling?.orderId ?? ""} অর্ডারটা বাতিল হবে আর বইগুলো আবার বিক্রেতাদের কাছে বিক্রির জন্য ফিরে যাবে। এটা আর ফেরানো যাবে না।`}
                confirmLabel="অর্ডার বাতিল করো"
            />
        </>
    );
};

export default MyOrders;
