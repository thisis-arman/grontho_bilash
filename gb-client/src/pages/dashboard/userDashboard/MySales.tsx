import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HandCoins } from "lucide-react";
import { useGetMySalesQuery } from "../../../redux/features/order/orderApi";
import {
    btn,
    DataList,
    EmptyState,
    ErrorState,
    formatDateBn,
    LoadingRows,
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
import { bnNumber, orderStatusLabel, taka } from "../../../i18n/labels";

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
    { value: "all", label: "সব অবস্থা" },
    ...["pending", "confirmed", "shipped", "delivered", "cancelled"].map((value) => ({
        value,
        label: orderStatusLabel(value),
    })),
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
                    {item.bookTitle} <span className="font-normal text-stone-500">× {bnNumber(item.quantity)}</span>
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
                title="আমার বিক্রি"
                desc="যেসব অর্ডারে তোমার লিস্টিং আছে। ডেলিভারি আর পেমেন্ট গ্রন্থ বিলাস সামলায়।"
            />

            <Toolbar>
                <SearchInput value={search} onChange={setSearch} placeholder="অর্ডার আইডি বা বইয়ের নাম দিয়ে খুঁজো" />
                <SelectFilter value={status} onChange={setStatus} options={STATUS_OPTIONS} label="অর্ডারের অবস্থা দিয়ে বাছাই করো" />
            </Toolbar>

            <Panel flush>
                {isLoading ? (
                    <LoadingRows />
                ) : isError ? (
                    <ErrorState onRetry={refetch} />
                ) : sales.length === 0 ? (
                    <EmptyState
                        icon={HandCoins}
                        title="এখনো কোনো বিক্রি নেই"
                        desc="কেউ তোমার লিস্টিং থেকে অর্ডার করলে এখানে দেখাবে।"
                        action={<Link to="/user/add-product" className={btn.primary}>বই লিস্ট করো</Link>}
                    />
                ) : filtered.length === 0 ? (
                    <EmptyState icon={HandCoins} title="মিলে যাওয়া কোনো বিক্রি নেই" desc="অন্য কিছু লিখে খুঁজো বা অন্য অবস্থা বেছে নাও।" />
                ) : (
                    <>
                        <DataList
                            rows={pageItems}
                            rowKey={(sale) => sale._id}
                            columns={[
                                { header: "বই", cell: (sale) => <ItemsCell sale={sale} /> },
                                {
                                    header: "অর্ডার",
                                    cell: (sale) => (
                                        <>
                                            <p className="font-mono text-xs text-stone-700">{sale.orderId}</p>
                                            <p className="text-xs text-stone-500">{formatDateBn(sale.createdAt)}</p>
                                        </>
                                    ),
                                },
                                { header: "অবস্থা", cell: (sale) => <OrderStatusBadge status={sale.orderStatus} /> },
                                { header: "পেমেন্ট", cell: (sale) => <PaymentStatusBadge status={sale.paymentStatus} /> },
                                {
                                    header: "তোমার বইয়ের মোট",
                                    align: "right",
                                    cell: (sale) => <span className="font-bold text-stone-900">{taka(sale.itemsTotal)}</span>,
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
                                        <span className="font-bold text-stone-900">{taka(sale.itemsTotal)}</span>
                                    </div>
                                    <p className="text-xs text-stone-500">
                                        <span className="font-mono">{sale.orderId}</span> · {formatDateBn(sale.createdAt)}
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
