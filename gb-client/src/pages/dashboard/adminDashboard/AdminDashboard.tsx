import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, ShoppingBag, Users, Wallet } from "lucide-react";
import { useGetAdminProductsQuery } from "../../../redux/features/book/bookApi";
import { useGetOrdersQuery } from "../../../redux/features/order/orderApi";
import { useGetUsersQuery } from "../../../redux/features/user/userApi";
import {
    EmptyState,
    formatDate,
    LoadingRows,
    money,
    OrderStatusBadge,
    PageHeader,
    Panel,
    StatCard,
    StatGrid,
} from "../../../components/dashboard/ui";

interface OrderSummary {
    _id: string;
    orderId: string;
    createdAt: string;
    orderStatus: string;
    totalAmount: number;
    email: string;
    books: unknown[];
    bought_by?: { name?: string }[];
}

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

const BAR_COLOR: Record<string, string> = {
    pending: "bg-amber-400",
    confirmed: "bg-sky-400",
    shipped: "bg-sky-600",
    delivered: "bg-emerald-500",
    cancelled: "bg-red-400",
};

const viewAll = "text-sm font-semibold text-amber-600 hover:text-amber-700";

const AdminDashboard = () => {
    const { data: usersData, isLoading: usersLoading } = useGetUsersQuery(undefined);
    const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery(undefined);
    // Only the catalogue counts are needed here, so ask for a single row.
    const { data: productsData, isLoading: productsLoading } = useGetAdminProductsQuery({ limit: 1 });

    const orders: OrderSummary[] = useMemo(() => ordersData?.data ?? [], [ordersData]);
    const users: { status: string }[] = usersData?.data ?? [];
    const summary = productsData?.data?.summary;

    const { orderValue, byStatus } = useMemo(() => {
        const counts: Record<string, number> = {};
        let value = 0;
        for (const order of orders) {
            counts[order.orderStatus] = (counts[order.orderStatus] ?? 0) + 1;
            // Cancelled orders bring in nothing.
            if (order.orderStatus !== "cancelled") value += order.totalAmount ?? 0;
        }
        return { orderValue: value, byStatus: counts };
    }, [orders]);

    const loadingValue = "…";

    return (
        <>
            <PageHeader title="Overview" desc="How the marketplace is doing right now." />

            <StatGrid>
                <StatCard
                    label="Order value"
                    value={ordersLoading ? loadingValue : money(orderValue)}
                    icon={Wallet}
                    hint="All orders except cancelled"
                />
                <StatCard
                    label="Orders"
                    value={ordersLoading ? loadingValue : orders.length}
                    icon={ShoppingBag}
                    hint={`${byStatus.pending ?? 0} waiting for confirmation`}
                />
                <StatCard
                    label="Listings"
                    value={productsLoading ? loadingValue : summary?.all ?? 0}
                    icon={BookOpen}
                    hint={`${summary?.published ?? 0} published`}
                />
                <StatCard
                    label="Users"
                    value={usersLoading ? loadingValue : users.length}
                    icon={Users}
                    hint={`${users.filter((u) => u.status === "blocked").length} blocked`}
                />
            </StatGrid>

            <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                <Panel
                    title="Latest orders"
                    flush
                    className="lg:col-span-2"
                    action={<Link to="/admin/order-management" className={viewAll}>Manage orders</Link>}
                >
                    {ordersLoading ? (
                        <LoadingRows />
                    ) : orders.length === 0 ? (
                        <EmptyState icon={ShoppingBag} title="No orders yet" desc="New orders will appear here as customers place them." />
                    ) : (
                        <ul className="divide-y divide-stone-100">
                            {orders.slice(0, 6).map((order) => (
                                <li key={order._id} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-stone-900">
                                            {order.bought_by?.[0]?.name || order.email}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-stone-500">
                                            <span className="font-mono">{order.orderId}</span> · {formatDate(order.createdAt)} ·{" "}
                                            {order.books?.length ?? 0} item{order.books?.length === 1 ? "" : "s"}
                                        </p>
                                    </div>
                                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                                        <span className="text-sm font-bold text-stone-900">{money(order.totalAmount)}</span>
                                        <OrderStatusBadge status={order.orderStatus} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel title="Orders by status">
                    {ordersLoading ? (
                        <div className="h-40 animate-pulse rounded-xl bg-stone-100" />
                    ) : orders.length === 0 ? (
                        <p className="py-6 text-center text-sm text-stone-500">Nothing to show yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {STATUSES.map((status) => {
                                const count = byStatus[status] ?? 0;
                                return (
                                    <li key={status}>
                                        <div className="mb-1.5 flex justify-between text-sm">
                                            <span className="font-medium capitalize text-stone-700">{status}</span>
                                            <span className="font-semibold text-stone-900">{count}</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                                            <div
                                                className={`h-full rounded-full ${BAR_COLOR[status]}`}
                                                style={{ width: `${(count / orders.length) * 100}%` }}
                                            />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {(byStatus.pending ?? 0) > 0 && (
                        <Link
                            to="/admin/order-management"
                            className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                        >
                            <Clock size={16} aria-hidden="true" />
                            {byStatus.pending} order{byStatus.pending === 1 ? "" : "s"} need confirming
                        </Link>
                    )}
                </Panel>
            </div>
        </>
    );
};

export default AdminDashboard;
