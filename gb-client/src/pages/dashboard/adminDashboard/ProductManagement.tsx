import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ExternalLink, Eye, EyeOff, FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    useDeleteBookMutation,
    useGetAdminProductsQuery,
    useUpdateBookMutation,
} from "../../../redux/features/book/bookApi";
import { IProduct } from "../../../types/interface";
import { ListingCell, ListingStatus } from "../userDashboard/MyProducts";
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
    PageHeader,
    Pagination,
    Panel,
    SearchInput,
    SelectFilter,
    StatCard,
    StatGrid,
    Toolbar,
} from "../../../components/dashboard/ui";

type AdminProduct = Omit<IProduct, "seller"> & {
    seller?: { name?: string; email?: string; contactNo?: string } | null;
};

const PAGE_SIZE = 12;

const TYPE_OPTIONS = [
    { value: "all", label: "All types" },
    { value: "Physical", label: "Physical" },
    { value: "Digital", label: "Digital" },
];

const STATUS_OPTIONS = [
    { value: "all", label: "Published and hidden" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Hidden" },
];

const STOCK_STATUSES = ["In Stock", "Out of Stock", "Pre-order"];

const ProductManagement = () => {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [type, setType] = useState("all");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState<AdminProduct | null>(null);
    const [deleting, setDeleting] = useState<AdminProduct | null>(null);

    // Search runs on the server, so wait for a pause in typing.
    useEffect(() => {
        const id = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 350);
        return () => clearTimeout(id);
    }, [searchInput]);

    const { data, isLoading, isFetching, isError, refetch } = useGetAdminProductsQuery({
        page,
        limit: PAGE_SIZE,
        ...(search ? { search } : {}),
        ...(type !== "all" ? { productType: type } : {}),
        ...(status !== "all" ? { status } : {}),
    });
    const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
    const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation();

    const products: AdminProduct[] = data?.data?.data ?? [];
    const meta = data?.data?.meta;
    const summary = data?.data?.summary;
    const isFiltered = !!search || type !== "all" || status !== "all";

    const changeFilter = (setter: (value: string) => void) => (value: string) => {
        setter(value);
        setPage(1);
    };

    const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editing) return;
        const form = new FormData(event.currentTarget);
        try {
            await updateBook({
                id: editing._id,
                data: {
                    title: String(form.get("title")).trim(),
                    category: String(form.get("category")).trim(),
                    stockStatus: String(form.get("stockStatus")),
                    isPublished: form.get("isPublished") === "on",
                    price: { basePrice: Number(form.get("basePrice")) },
                },
            }).unwrap();
            toast.success("Listing updated");
            setEditing(null);
        } catch (error) {
            toast.error(errorMessage(error, "Could not update the listing"));
        }
    };

    const togglePublished = async (product: AdminProduct) => {
        try {
            await updateBook({ id: product._id, data: { isPublished: !product.isPublished } }).unwrap();
            toast.success(product.isPublished ? "Listing hidden from buyers" : "Listing published");
        } catch (error) {
            toast.error(errorMessage(error, "Could not update the listing"));
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await deleteBook(deleting._id).unwrap();
            toast.success("Listing deleted");
            setDeleting(null);
        } catch (error) {
            toast.error(errorMessage(error, "Could not delete the listing"));
        }
    };

    const actions = (product: AdminProduct) => (
        <div className="flex justify-end gap-1">
            {product.isPublished && (
                <Link to={`/products/${product.slug}`} aria-label={`View ${product.title}`} className={btn.icon}>
                    <ExternalLink size={16} aria-hidden="true" />
                </Link>
            )}
            <button
                type="button"
                onClick={() => togglePublished(product)}
                disabled={isUpdating}
                aria-label={product.isPublished ? `Hide ${product.title}` : `Publish ${product.title}`}
                title={product.isPublished ? "Hide from buyers" : "Publish"}
                className={btn.icon}
            >
                {product.isPublished ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
            <button type="button" onClick={() => setEditing(product)} aria-label={`Edit ${product.title}`} className={btn.icon}>
                <Pencil size={16} aria-hidden="true" />
            </button>
            <button
                type="button"
                onClick={() => setDeleting(product)}
                aria-label={`Delete ${product.title}`}
                className={`${btn.icon} hover:!bg-red-50 hover:!text-red-600`}
            >
                <Trash2 size={16} aria-hidden="true" />
            </button>
        </div>
    );

    return (
        <>
            <PageHeader title="Products" desc="Every listing on the marketplace, including hidden and out-of-stock ones." />

            <StatGrid>
                <StatCard label="All listings" value={summary?.all ?? "…"} icon={BookOpen} />
                <StatCard label="Published" value={summary?.published ?? "…"} icon={Eye} />
                <StatCard label="Hidden" value={summary?.drafts ?? "…"} icon={EyeOff} />
                <StatCard label="Digital" value={summary?.digital ?? "…"} icon={FileText} hint={`${summary?.physical ?? 0} physical`} />
            </StatGrid>

            <Toolbar>
                <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search by title, SKU or category" />
                <SelectFilter value={type} onChange={changeFilter(setType)} options={TYPE_OPTIONS} label="Filter by type" />
                <SelectFilter value={status} onChange={changeFilter(setStatus)} options={STATUS_OPTIONS} label="Filter by visibility" />
            </Toolbar>

            <Panel flush className={isFetching && !isLoading ? "opacity-60 transition-opacity" : "transition-opacity"}>
                {isLoading ? (
                    <LoadingRows />
                ) : isError ? (
                    <ErrorState onRetry={refetch} />
                ) : products.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title={isFiltered ? "No matching listings" : "No listings yet"}
                        desc={isFiltered ? "Try a different search or filter." : "Listings appear here as sellers add them."}
                    />
                ) : (
                    <>
                        <DataList
                            rows={products}
                            rowKey={(product) => product._id}
                            columns={[
                                { header: "Listing", cell: (product) => <ListingCell product={product as unknown as IProduct} /> },
                                {
                                    header: "Seller",
                                    cell: (product) => (
                                        <div className="min-w-0">
                                            <p className="max-w-[11rem] truncate text-sm text-stone-900">{product.seller?.name ?? "—"}</p>
                                            <p className="max-w-[11rem] truncate text-xs text-stone-500">{product.seller?.contactNo}</p>
                                        </div>
                                    ),
                                },
                                { header: "Price", cell: (product) => <span className="font-semibold text-stone-900">{money(product.price?.basePrice)}</span> },
                                { header: "Listed", cell: (product) => <span className="whitespace-nowrap">{formatDate(product.createdAt)}</span> },
                                { header: "Status", cell: (product) => <ListingStatus product={product as unknown as IProduct} /> },
                                { header: "Actions", align: "right", cell: actions },
                            ]}
                            renderCard={(product) => (
                                <div className="space-y-3">
                                    <ListingCell product={product as unknown as IProduct} />
                                    <p className="truncate text-xs text-stone-500">
                                        Seller: {product.seller?.name ?? "—"} · {formatDate(product.createdAt)}
                                    </p>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-bold text-stone-900">{money(product.price?.basePrice)}</span>
                                            <ListingStatus product={product as unknown as IProduct} />
                                        </div>
                                        {actions(product)}
                                    </div>
                                </div>
                            )}
                        />
                        <Pagination page={meta?.page ?? page} pageCount={meta?.totalPages ?? 1} onChange={setPage} />
                    </>
                )}
            </Panel>

            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit listing">
                {editing && (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <Field label="Title">
                            <input name="title" required defaultValue={editing.title} className={inputClass} />
                        </Field>
                        <Field label="Category">
                            <input name="category" required defaultValue={editing.category} className={inputClass} />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Price (৳)">
                                <input name="basePrice" type="number" min={0} step="1" required defaultValue={editing.price?.basePrice} className={inputClass} />
                            </Field>
                            <Field label="Stock status">
                                <select name="stockStatus" defaultValue={editing.stockStatus} className={`${inputClass} cursor-pointer`}>
                                    {STOCK_STATUSES.map((value) => (
                                        <option key={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 p-3.5">
                            <input
                                name="isPublished"
                                type="checkbox"
                                defaultChecked={editing.isPublished}
                                className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                            />
                            <span className="text-sm font-semibold text-stone-900">Published (visible to buyers)</span>
                        </label>
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
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                loading={isDeleting}
                title="Delete this listing?"
                desc={`"${deleting?.title ?? ""}" will be removed from the marketplace. Existing orders for it are not affected.`}
                confirmLabel="Delete listing"
            />
        </>
    );
};

export default ProductManagement;
