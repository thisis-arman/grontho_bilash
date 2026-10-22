import { Link } from "react-router-dom";
import { BookOpen, HandCoins, Plus, ShoppingBag, Truck, Wallet } from "lucide-react";
import { useGetBooksByEmailQuery } from "../../../redux/features/book/bookApi";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";
import { useGetMySalesQuery, useGetOrderByUserIdQuery } from "../../../redux/features/order/orderApi";
import { useAppSelector } from "../../../redux/hooks";
import {
    btn,
    EmptyState,
    formatDateBn,
    LoadingRows,
    OrderStatusBadge,
    PageHeader,
    Panel,
    StatCard,
    StatGrid,
} from "../../../components/dashboard/ui";
import { bnNumber, taka } from "../../../i18n/labels";

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
                title={`হ্যালো, ${name?.split(" ")[0] || "বন্ধু"}`}
                desc="তোমার কেনাবেচার হিসাব এক নজরে।"
                action={
                    <Link to="/user/add-product" className={btn.primary}>
                        <Plus size={16} aria-hidden="true" /> বই বিক্রি করো
                    </Link>
                }
            />

            <StatGrid>
                <StatCard
                    label="চলতি অর্ডার"
                    value={ordersLoading ? loadingValue : bnNumber(activeOrders)}
                    icon={Truck}
                    hint={`মোট ${bnNumber(orders.length)}টি অর্ডার করেছ`}
                />
                <StatCard label="মোট খরচ" value={ordersLoading ? loadingValue : taka(spent)} icon={Wallet} hint="বাতিল অর্ডার ধরা হয়নি" />
                <StatCard
                    label="চালু লিস্টিং"
                    value={booksLoading ? loadingValue : bnNumber(liveListings)}
                    icon={BookOpen}
                    hint={`মোট ${bnNumber(listings.length)}টি লিস্টিং`}
                />
                <StatCard
                    label="মোট বিক্রি"
                    value={salesLoading ? loadingValue : taka(earned)}
                    icon={HandCoins}
                    hint={`${bnNumber(sales.length)}টি অর্ডার পেয়েছ`}
                />
            </StatGrid>

            <div className="grid gap-6 lg:grid-cols-2">
                <Panel
                    title="সাম্প্রতিক অর্ডার"
                    flush
                    action={<Link to="/user/my-orders" className={viewAll}>সব দেখো</Link>}
                >
                    {ordersLoading ? (
                        <LoadingRows rows={3} />
                    ) : orders.length === 0 ? (
                        <EmptyState
                            icon={ShoppingBag}
                            title="এখনো কোনো অর্ডার নেই"
                            desc="তুমি যে বই অর্ডার করবে, সেগুলো এখানে দেখাবে।"
                            action={<Link to="/books" className={btn.secondary}>বই দেখো</Link>}
                        />
                    ) : (
                        <ul className="divide-y divide-stone-100">
                            {orders.slice(0, 5).map((order) => (
                                <li key={order._id} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-stone-900">
                                            {order.books?.[0]?.bookTitle || "অর্ডার"}
                                            {order.books?.length > 1 && ` আরও ${bnNumber(order.books.length - 1)}টি`}
                                        </p>
                                        <p className="mt-0.5 text-xs text-stone-500">
                                            {order.orderId} · {formatDateBn(order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                                        <span className="text-sm font-bold text-stone-900">{taka(order.totalAmount)}</span>
                                        <OrderStatusBadge status={order.orderStatus} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel
                    title="সাম্প্রতিক বিক্রি"
                    flush
                    action={<Link to="/user/sales" className={viewAll}>সব দেখো</Link>}
                >
                    {salesLoading ? (
                        <LoadingRows rows={3} />
                    ) : sales.length === 0 ? (
                        <EmptyState
                            icon={HandCoins}
                            title="এখনো কোনো বিক্রি নেই"
                            desc="কেউ তোমার লিস্টিং থেকে অর্ডার করলে এখানে দেখাবে।"
                            action={<Link to="/user/add-product" className={btn.secondary}>বই লিস্ট করো</Link>}
                        />
                    ) : (
                        <ul className="divide-y divide-stone-100">
                            {sales.slice(0, 5).map((sale) => (
                                <li key={sale._id} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-stone-900">
                                            {sale.items?.[0]?.bookTitle || "বিক্রি"}
                                            {sale.items?.length > 1 && ` আরও ${bnNumber(sale.items.length - 1)}টি`}
                                        </p>
                                        <p className="mt-0.5 text-xs text-stone-500">
                                            {sale.orderId} · {formatDateBn(sale.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                                        <span className="text-sm font-bold text-stone-900">{taka(sale.itemsTotal)}</span>
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
