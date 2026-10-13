import { Link } from "react-router-dom";
import { BookOpen, HandCoins, Plus, ShoppingBag, Truck, Wallet } from "lucide-react";
import { useGetBooksByEmailQuery } from "../../../redux/features/book/bookApi";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";
import { useGetMySalesQuery, useGetOrderByUserIdQuery } from "../../../redux/features/order/orderApi";
import { useAppSelector } from "../../../redux/hooks";
import {
    btn,
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

const ACTIVE_ORDER = ["pending", "confirmed", "shipped"];

interface LineItem { bookTitle: string }
interface OrderSummary { _id: string; orderId: string; createdAt: string; orderStatus: string; totalAmount: number; books: LineItem[] }
interface SaleSummary { _id: string; orderId: string; createdAt: string; orderStatus: string; itemsTotal: number; items: LineItem[] }
interface ListingSummary { isPublished: boolean; stockStatus: string }

const viewAll = "text-sm font-semibold text-amber-600 hover:text-amber-700";

const UserDashboard = () => {
    const { id, email, name } = useAppSelector(selectCurrentUser) as TUser;

    const { data: orderData, isLoading: ordersLoading } = useGetOrderByUserIdQuery(id);
    const { data: bookData, isLoading: booksLoading } = useGetBooksByEmailQuery(email);
    const { data: salesData, isLoading: salesLoading } = useGetMySalesQuery(undefined);

    const orders: OrderSummary[] = orderData?.data ?? [];
    const listings: ListingSummary[] = bookData?.data ?? [];
    const sales: SaleSummary[] = salesData?.data ?? [];

    // Cancelled orders were never paid for or earned from, so they are left
    // out of the money figures.
    const spent = orders
        .filter((order) => order.orderStatus !== "cancelled")
        .reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
    const earned = sales
        .filter((sale) => sale.orderStatus !== "cancelled")
        .reduce((sum, sale) => sum + (sale.itemsTotal ?? 0), 0);
    const activeOrders = orders.filter((order) => ACTIVE_ORDER.includes(order.orderStatus)).length;
    const liveListings = listings.filter(
        (listing) => listing.isPublished && listing.stockStatus !== "Out of Stock"
    ).length;

    const loadingValue = "…";

    return (
        <>
            <PageHeader
                title={`Hello, ${name?.split(" ")[0] || "there"}`}
                desc="Your buying and selling at a glance."
                action={
                    <Link to="/user/add-product" className={btn.primary}>
                        <Plus size={16} aria-hidden="true" /> Sell a book
                    </Link>
                }
            />

            <StatGrid>
                <StatCard
                    label="Orders on the way"
                    value={ordersLoading ? loadingValue : activeOrders}
                    icon={Truck}
                    hint={`${orders.length} placed in total`}
                />
                <StatCard label="Total spent" value={ordersLoading ? loadingValue : money(spent)} icon={Wallet} hint="Excludes cancelled orders" />
                <StatCard
                    label="Live listings"
                    value={booksLoading ? loadingValue : liveListings}
                    icon={BookOpen}
                    hint={`${listings.length} listed in total`}
                />
                <StatCard
                    label="Sales value"
                    value={salesLoading ? loadingValue : money(earned)}
                    icon={HandCoins}
                    hint={`${sales.length} order${sales.length === 1 ? "" : "s"} received`}
                />
            </StatGrid>

            <div className="grid gap-6 lg:grid-cols-2">
                <Panel
                    title="Recent orders"
                    flush
                    action={<Link to="/user/my-orders" className={viewAll}>View all</Link>}
                >
                    {ordersLoading ? (
                        <LoadingRows rows={3} />
                    ) : orders.length === 0 ? (
                        <EmptyState
                            icon={ShoppingBag}
                            title="No orders yet"
                            desc="Books you order will show up here."
                            action={<Link to="/books" className={btn.secondary}>Browse books</Link>}
                        />
                    ) : (
                        <ul className="divide-y divide-stone-100">
                            {orders.slice(0, 5).map((order) => (
                                <li key={order._id} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-stone-900">
                                            {order.books?.[0]?.bookTitle || "Order"}
                                            {order.books?.length > 1 && ` +${order.books.length - 1} more`}
                                        </p>
                                        <p className="mt-0.5 text-xs text-stone-500">
                                            {order.orderId} · {formatDate(order.createdAt)}
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

                <Panel
                    title="Recent sales"
                    flush
                    action={<Link to="/user/sales" className={viewAll}>View all</Link>}
                >
                    {salesLoading ? (
                        <LoadingRows rows={3} />
                    ) : sales.length === 0 ? (
                        <EmptyState
                            icon={HandCoins}
                            title="No sales yet"
                            desc="When someone orders one of your listings, it will appear here."
                            action={<Link to="/user/add-product" className={btn.secondary}>List a book</Link>}
                        />
                    ) : (
                        <ul className="divide-y divide-stone-100">
                            {sales.slice(0, 5).map((sale) => (
                                <li key={sale._id} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-stone-900">
                                            {sale.items?.[0]?.bookTitle || "Sale"}
                                            {sale.items?.length > 1 && ` +${sale.items.length - 1} more`}
                                        </p>
                                        <p className="mt-0.5 text-xs text-stone-500">
                                            {sale.orderId} · {formatDate(sale.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                                        <span className="text-sm font-bold text-stone-900">{money(sale.itemsTotal)}</span>
                                        <OrderStatusBadge status={sale.orderStatus} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>
        </>
    );
};

export default UserDashboard;
