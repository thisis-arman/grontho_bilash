import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ExternalLink, Eye, FileText, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";
import {
    useDeleteBookMutation,
    useGetBooksByEmailQuery,
    useUpdateBookMutation,
} from "../../../redux/features/book/bookApi";
import { useAppSelector } from "../../../redux/hooks";
import { IProduct } from "../../../types/interface";
import {
    Badge,
    btn,
    ConfirmDialog,
    DataList,
    EmptyState,
    errorMessage,
    ErrorState,
    Field,
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
    usePaged,
} from "../../../components/dashboard/ui";

const FILTER_OPTIONS = [
    { value: "all", label: "All listings" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Hidden" },
    { value: "out", label: "Out of stock" },
];

const CONDITIONS = ["New", "Like New", "Used"];

const isOut = (product: IProduct) => product.stockStatus === "Out of Stock";

export const ListingStatus = ({ product }: { product: IProduct }) =>
    isOut(product) ? (
        <Badge tone="red">Out of stock</Badge>
    ) : product.isPublished ? (
        <Badge tone="green">Published</Badge>
    ) : (
        <Badge tone="stone">Hidden</Badge>
    );

export const ListingCell = ({ product }: { product: IProduct }) => (
    <div className="flex min-w-0 items-center gap-3">
        <img
            src={product.images?.[0]}
            alt=""
            loading="lazy"
            className="h-14 w-10 flex-shrink-0 rounded-md bg-stone-100 object-cover"
        />
        <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-900">{product.title}</p>
            <p className="truncate text-xs text-stone-500">
                {product.category} · {product.productType === "Digital" ? "Digital" : product.condition}
            </p>
        </div>
    </div>
);

const MyProducts = () => {
    const { email } = useAppSelector(selectCurrentUser) as TUser;
    const { data, isLoading, isError, refetch } = useGetBooksByEmailQuery(email);
    const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
    const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation();

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [editing, setEditing] = useState<IProduct | null>(null);
    const [deleting, setDeleting] = useState<IProduct | null>(null);

    const products: IProduct[] = useMemo(() => data?.data ?? [], [data]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return products.filter((product) => {
            const matchesFilter =
                filter === "all" ||
                (filter === "published" && product.isPublished && !isOut(product)) ||
                (filter === "draft" && !product.isPublished) ||
                (filter === "out" && isOut(product));
            const matchesSearch =
                !term ||
                product.title.toLowerCase().includes(term) ||
                product.sku?.toLowerCase().includes(term) ||
                product.bookMetadata?.author?.toLowerCase().includes(term);
            return matchesFilter && matchesSearch;
        });
    }, [products, search, filter]);

    const { page, setPage, pageCount, pageItems } = usePaged(filtered);

    const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editing) return;
        const form = new FormData(event.currentTarget);
        const text = (name: string) => String(form.get(name) ?? "").trim();
        const year = text("publicationYear");

        try {
            await updateBook({
                id: editing._id,
                data: {
                    title: text("title"),
                    location: text("location"),
                    isPublished: form.get("isPublished") === "on",
                    price: {
                        basePrice: Number(text("basePrice")),
                        discountPrice: Number(text("discountPrice") || 0),
                    },
                    bookMetadata: {
                        author: text("author"),
                        publisher: text("publisher"),
                        ...(year ? { publicationYear: Number(year) } : {}),
                    },
                    // Digital listings have no physical stock or condition.
                    ...(editing.productType === "Physical"
                        ? {
                              condition: text("condition"),
                              inventory: { quantity: Number(text("quantity")) },
                          }
                        : {}),
                },
            }).unwrap();
            toast.success("Listing updated");
            setEditing(null);
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

    const actions = (product: IProduct) => (
        <div className="flex justify-end gap-1">
            {product.isPublished && (
                <Link to={`/products/${product.slug}`} aria-label={`View ${product.title}`} className={btn.icon}>
                    <ExternalLink size={16} aria-hidden="true" />
                </Link>
            )}
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
            <PageHeader
                title="My Listings"
                desc="Books and notes you are selling."
                action={
                    <Link to="/user/add-product" className={btn.primary}>
                        <Plus size={16} aria-hidden="true" /> New listing
                    </Link>
                }
            />

            <StatGrid>
                <StatCard label="Total listings" value={products.length} icon={BookOpen} />
                <StatCard label="Published" value={products.filter((p) => p.isPublished && !isOut(p)).length} icon={Eye} />
                <StatCard label="Out of stock" value={products.filter(isOut).length} icon={Package} />
                <StatCard label="Total views" value={products.reduce((sum, p) => sum + (p.viewCount ?? 0), 0)} icon={FileText} />
            </StatGrid>

            <Toolbar>
                <SearchInput value={search} onChange={setSearch} placeholder="Search by title, SKU or author" />
                <SelectFilter value={filter} onChange={setFilter} options={FILTER_OPTIONS} label="Filter listings" />
            </Toolbar>

            <Panel flush>
                {isLoading ? (
                    <LoadingRows />
                ) : isError ? (
                    <ErrorState onRetry={refetch} />
                ) : products.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title="You have no listings yet"
                        desc="List a book you have finished and it will appear here."
                        action={<Link to="/user/add-product" className={btn.primary}>List your first book</Link>}
                    />
                ) : filtered.length === 0 ? (
                    <EmptyState icon={BookOpen} title="No matching listings" desc="Try a different search or filter." />
                ) : (
                    <>
                        <DataList
                            rows={pageItems}
                            rowKey={(product) => product._id}
                            columns={[
                                { header: "Listing", cell: (product) => <ListingCell product={product} /> },
                                { header: "Price", cell: (product) => <span className="font-semibold text-stone-900">{money(product.price?.basePrice)}</span> },
                                {
                                    header: "Stock",
                                    cell: (product) =>
                                        product.productType === "Digital" ? "—" : `${product.inventory?.quantity ?? 0} left`,
                                },
                                { header: "Views", cell: (product) => product.viewCount ?? 0 },
                                { header: "Status", cell: (product) => <ListingStatus product={product} /> },
                                { header: "Actions", align: "right", cell: actions },
                            ]}
                            renderCard={(product) => (
                                <div className="space-y-3">
                                    <ListingCell product={product} />
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                                            <span className="text-sm font-bold text-stone-900">{money(product.price?.basePrice)}</span>
                                            <ListingStatus product={product} />
                                            {product.productType !== "Digital" && <span>{product.inventory?.quantity ?? 0} left</span>}
                                        </div>
                                        {actions(product)}
                                    </div>
                                </div>
                            )}
                        />
                        <Pagination page={page} pageCount={pageCount} onChange={setPage} />
                    </>
                )}
            </Panel>

            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit listing" wide>
                {editing && (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <Field label="Title">
                            <input name="title" required defaultValue={editing.title} className={inputClass} />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Price (৳)">
                                <input name="basePrice" type="number" min={0} step="1" required defaultValue={editing.price?.basePrice} className={inputClass} />
                            </Field>
                            <Field label="Original price (৳)" hint="Optional. Shown crossed out beside the price; leave 0 to hide.">
                                <input name="discountPrice" type="number" min={0} step="1" defaultValue={editing.price?.discountPrice ?? 0} className={inputClass} />
                            </Field>
                            {editing.productType === "Physical" && (
                                <>
                                    <Field label="Copies available" hint="Set to 0 to mark it out of stock.">
                                        <input name="quantity" type="number" min={0} step="1" required defaultValue={editing.inventory?.quantity ?? 1} className={inputClass} />
                                    </Field>
                                    <Field label="Condition">
                                        <select name="condition" defaultValue={editing.condition} className={`${inputClass} cursor-pointer`}>
                                            {CONDITIONS.map((condition) => (
                                                <option key={condition}>{condition}</option>
                                            ))}
                                        </select>
                                    </Field>
                                </>
                            )}
                            <Field label="Author">
                                <input name="author" defaultValue={editing.bookMetadata?.author ?? ""} className={inputClass} />
                            </Field>
                            <Field label="Publisher">
                                <input name="publisher" defaultValue={editing.bookMetadata?.publisher ?? ""} className={inputClass} />
                            </Field>
                            <Field label="Publication year">
                                <input name="publicationYear" type="number" min={1800} max={2100} defaultValue={editing.bookMetadata?.publicationYear ?? ""} className={inputClass} />
                            </Field>
                            <Field label="Location">
                                <input name="location" required defaultValue={editing.location} className={inputClass} />
                            </Field>
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3.5">
                            <input
                                name="isPublished"
                                type="checkbox"
                                defaultChecked={editing.isPublished}
                                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-stone-900">Published</span>
                                <span className="block text-xs text-stone-500">Untick to hide this listing from buyers without deleting it.</span>
                            </span>
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

export default MyProducts;
