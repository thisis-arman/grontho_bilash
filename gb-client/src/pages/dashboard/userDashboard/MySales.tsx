import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HandCoins } from "lucide-react";
import { useGetMySalesQuery } from "../../../redux/features/order/orderApi";
import {
    btn,
    DataList,
    EmptyState,
    ErrorState,
    formatDate,
    LoadingRows,
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

interface Sale {
    _id: string;
    orderId: string;
    createdAt: string;
    orderStatus: string;
    paymentStatus: string;
    items: { book: string; bookTitle: string; productImage: string; price: number; quantity: number }[];
    itemsTotal: number;
}

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
];

const ItemsCell = ({ sale }: { sale: Sale }) => (
    <div className="flex min-w-0 items-center gap-3">
        <img
            src={sale.items[0]?.productImage}
            alt=""
            loading="lazy"
            className="h-12 w-9 flex-shrink-0 rounded-md bg-stone-100 object-cover"
        />
        <div className="min-w-0">
            {sale.items.map((item) => (
                <p key={item.book} className="truncate text-sm font-semibold text-stone-900">
                    {item.bookTitle} <span className="font-normal text-stone-500">× {item.quantity}</span>
                </p>
            ))}
        </div>
    </div>
);

const MySales = () => {
    const { data, isLoading, isError, refetch } = useGetMySalesQuery(undefined);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");

    const sales: Sale[] = useMemo(() => data?.data ?? [], [data]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return sales.filter(
            (sale) =>
                (status === "all" || sale.orderStatus === status) &&
                (!term ||
                    sale.orderId.toLowerCase().includes(term) ||
                    sale.items.some((item) => item.bookTitle.toLowerCase().includes(term)))
        );
    }, [sales, search, status]);

    const { page, setPage, pageCount, pageItems } = usePaged(filtered);

    return (
        <>
            <PageHeader
                title="Sales"
                desc="Orders that include your listings. Delivery and payment are handled by Grontho Bilash."
            />

            <Toolbar>
                <SearchInput value={search} onChange={setSearch} placeholder="Search by order ID or book title" />
                <SelectFilter value={status} onChange={setStatus} options={STATUS_OPTIONS} label="Filter by order status" />
            </Toolbar>

            <Panel flush>
                {isLoading ? (
                    <LoadingRows />
                ) : isError ? (
                    <ErrorState onRetry={refetch} />
                ) : sales.length === 0 ? (
                    <EmptyState
                        icon={HandCoins}
                        title="No sales yet"
                        desc="When someone orders one of your listings, it will appear here."
                        action={<Link to="/user/add-product" className={btn.primary}>List a book</Link>}
                    />
                ) : filtered.length === 0 ? (
                    <EmptyState icon={HandCoins} title="No matching sales" desc="Try a different search or status." />
                ) : (
                    <>
                        <DataList
                            rows={pageItems}
                            rowKey={(sale) => sale._id}
                            columns={[
                                { header: "Items", cell: (sale) => <ItemsCell sale={sale} /> },
                                {
                                    header: "Order",
                                    cell: (sale) => (
                                        <>
                                            <p className="font-mono text-xs text-stone-700">{sale.orderId}</p>
                                            <p className="text-xs text-stone-500">{formatDate(sale.createdAt)}</p>
                                        </>
                                    ),
                                },
                                { header: "Status", cell: (sale) => <OrderStatusBadge status={sale.orderStatus} /> },
                                { header: "Payment", cell: (sale) => <PaymentStatusBadge status={sale.paymentStatus} /> },
                                {
                                    header: "Your items",
                                    align: "right",
                                    cell: (sale) => <span className="font-bold text-stone-900">{money(sale.itemsTotal)}</span>,
                                },
                            ]}
                            renderCard={(sale) => (
                                <div className="space-y-3">
                                    <ItemsCell sale={sale} />
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap gap-1.5">
                                            <OrderStatusBadge status={sale.orderStatus} />
                                            <PaymentStatusBadge status={sale.paymentStatus} />
                                        </div>
                                        <span className="font-bold text-stone-900">{money(sale.itemsTotal)}</span>
                                    </div>
                                    <p className="text-xs text-stone-500">
                                        <span className="font-mono">{sale.orderId}</span> · {formatDate(sale.createdAt)}
                                    </p>
                                </div>
                            )}
                        />
                        <Pagination page={page} pageCount={pageCount} onChange={setPage} />
                    </>
                )}
            </Panel>
        </>
    );
};

export default MySales;
