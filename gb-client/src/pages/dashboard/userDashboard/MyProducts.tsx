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
import { bnNumber, conditionLabel, taka } from "../../../i18n/labels";

const FILTER_OPTIONS = [
    { value: "all", label: "সব লিস্টিং" },
    { value: "published", label: "চালু" },
    { value: "draft", label: "লুকানো" },
    { value: "out", label: "স্টকে নেই" },
];

const CONDITIONS = ["New", "Like New", "Used"];

const isOut = (product: IProduct) => product.stockStatus === "Out of Stock";

// Also used by the admin product table, which stays in English, so the
// Bangla text is opt-in through `bn`.
export const ListingStatus = ({ product, bn = false }: { product: IProduct; bn?: boolean }) =>
    isOut(product) ? (
        <Badge tone="red">{bn ? "স্টকে নেই" : "Out of stock"}</Badge>
    ) : product.isPublished ? (
        <Badge tone="green">{bn ? "চালু" : "Published"}</Badge>
    ) : (
        <Badge tone="stone">{bn ? "লুকানো" : "Hidden"}</Badge>
    );

export const ListingCell = ({ product, bn = false }: { product: IProduct; bn?: boolean }) => (
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
                {product.category} ·{" "}
                {product.productType === "Digital"
                    ? bn ? "ডিজিটাল" : "Digital"
                    : bn ? conditionLabel(product.condition) : product.condition}
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
            toast.success("লিস্টিং আপডেট হয়েছে");
            setEditing(null);
        } catch (error) {
            toast.error(errorMessage(error, "লিস্টিং আপডেট করা যায়নি"));
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await deleteBook(deleting._id).unwrap();
            toast.success("লিস্টিং মুছে ফেলা হয়েছে");
            setDeleting(null);
        } catch (error) {
            toast.error(errorMessage(error, "লিস্টিং মুছে ফেলা যায়নি"));
        }
    };

    const actions = (product: IProduct) => (
        <div className="flex justify-end gap-1">
            {product.isPublished && (
                <Link to={`/products/${product.slug}`} aria-label={`${product.title} দেখো`} className={btn.icon}>
                    <ExternalLink size={16} aria-hidden="true" />
                </Link>
            )}
            <button type="button" onClick={() => setEditing(product)} aria-label={`${product.title} এডিট করো`} className={btn.icon}>
                <Pencil size={16} aria-hidden="true" />
            </button>
            <button
                type="button"
                onClick={() => setDeleting(product)}
                aria-label={`${product.title} মুছে ফেলো`}
                className={`${btn.icon} hover:!bg-red-50 hover:!text-red-600`}
            >
                <Trash2 size={16} aria-hidden="true" />
            </button>
        </div>
    );

    return (
        <>
            <PageHeader
                title="আমার লিস্টিং"
                desc="তুমি যে বই আর নোট বিক্রি করছ।"
                action={
                    <Link to="/user/add-product" className={btn.primary}>
                        <Plus size={16} aria-hidden="true" /> নতুন লিস্টিং
                    </Link>
                }
            />

            <StatGrid>
                <StatCard label="মোট লিস্টিং" value={bnNumber(products.length)} icon={BookOpen} />
                <StatCard label="চালু" value={bnNumber(products.filter((p) => p.isPublished && !isOut(p)).length)} icon={Eye} />
                <StatCard label="স্টকে নেই" value={bnNumber(products.filter(isOut).length)} icon={Package} />
                <StatCard label="মোট দেখা হয়েছে" value={bnNumber(products.reduce((sum, p) => sum + (p.viewCount ?? 0), 0))} icon={FileText} />
            </StatGrid>

            <Toolbar>
                <SearchInput value={search} onChange={setSearch} placeholder="নাম, SKU বা লেখক দিয়ে খুঁজো" />
                <SelectFilter value={filter} onChange={setFilter} options={FILTER_OPTIONS} label="লিস্টিং বাছাই করো" />
            </Toolbar>

            <Panel flush>
                {isLoading ? (
                    <LoadingRows />
                ) : isError ? (
                    <ErrorState onRetry={refetch} />
                ) : products.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title="তোমার এখনো কোনো লিস্টিং নেই"
                        desc="পড়া শেষ হওয়া একটা বই লিস্ট করো, সেটা এখানে দেখাবে।"
                        action={<Link to="/user/add-product" className={btn.primary}>প্রথম বইটা লিস্ট করো</Link>}
                    />
                ) : filtered.length === 0 ? (
                    <EmptyState icon={BookOpen} title="মিলে যাওয়া কোনো লিস্টিং নেই" desc="অন্য কিছু লিখে খুঁজো বা অন্য ফিল্টার বেছে নাও।" />
                ) : (
                    <>
                        <DataList
                            rows={pageItems}
                            rowKey={(product) => product._id}
                            columns={[
                                { header: "লিস্টিং", cell: (product) => <ListingCell product={product} bn /> },
                                { header: "দাম", cell: (product) => <span className="font-semibold text-stone-900">{taka(product.price?.basePrice)}</span> },
                                {
                                    header: "স্টক",
                                    cell: (product) =>
                                        product.productType === "Digital" ? "—" : `${bnNumber(product.inventory?.quantity ?? 0)}টি বাকি`,
                                },
                                { header: "দেখা হয়েছে", cell: (product) => bnNumber(product.viewCount ?? 0) },
                                { header: "অবস্থা", cell: (product) => <ListingStatus product={product} bn /> },
                                { header: "কাজ", align: "right", cell: actions },
                            ]}
                            renderCard={(product) => (
                                <div className="space-y-3">
                                    <ListingCell product={product} bn />
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                                            <span className="text-sm font-bold text-stone-900">{taka(product.price?.basePrice)}</span>
                                            <ListingStatus product={product} bn />
                                            {product.productType !== "Digital" && <span>{bnNumber(product.inventory?.quantity ?? 0)}টি বাকি</span>}
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

            <Modal open={!!editing} onClose={() => setEditing(null)} title="লিস্টিং এডিট করো" wide>
                {editing && (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <Field label="বইয়ের নাম">
                            <input name="title" required defaultValue={editing.title} className={inputClass} />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="দাম (৳)">
                                <input name="basePrice" type="number" min={0} step="1" required defaultValue={editing.price?.basePrice} className={inputClass} />
                            </Field>
                            <Field label="আসল দাম (৳)" hint="না দিলেও চলবে। দামের পাশে কেটে দেখানো হয়; লুকাতে ০ রাখো।">
                                <input name="discountPrice" type="number" min={0} step="1" defaultValue={editing.price?.discountPrice ?? 0} className={inputClass} />
                            </Field>
                            {editing.productType === "Physical" && (
                                <>
                                    <Field label="কয়টা কপি আছে" hint="০ দিলে 'স্টকে নেই' দেখাবে।">
                                        <input name="quantity" type="number" min={0} step="1" required defaultValue={editing.inventory?.quantity ?? 1} className={inputClass} />
                                    </Field>
                                    <Field label="বইয়ের অবস্থা">
                                        <select name="condition" defaultValue={editing.condition} className={`${inputClass} cursor-pointer`}>
                                            {CONDITIONS.map((condition) => (
                                                <option key={condition} value={condition}>
                                                    {conditionLabel(condition)}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </>
                            )}
                            <Field label="লেখক">
                                <input name="author" defaultValue={editing.bookMetadata?.author ?? ""} className={inputClass} />
                            </Field>
                            <Field label="প্রকাশক">
                                <input name="publisher" defaultValue={editing.bookMetadata?.publisher ?? ""} className={inputClass} />
                            </Field>
                            <Field label="প্রকাশের সাল">
                                <input name="publicationYear" type="number" min={1800} max={2100} defaultValue={editing.bookMetadata?.publicationYear ?? ""} className={inputClass} />
                            </Field>
                            <Field label="এলাকা">
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
                                <span className="block text-sm font-semibold text-stone-900">চালু রাখো</span>
                                <span className="block text-xs text-stone-500">টিক তুলে দিলে লিস্টিংটা মুছবে না, শুধু ক্রেতাদের কাছ থেকে লুকানো থাকবে।</span>
                            </span>
                        </label>

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
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                loading={isDeleting}
                title="লিস্টিংটা মুছে ফেলবে?"
                desc={`"${deleting?.title ?? ""}" সাইট থেকে সরিয়ে ফেলা হবে। এর আগের অর্ডারগুলোতে কোনো সমস্যা হবে না।`}
                confirmLabel="লিস্টিং মুছে ফেলো"
            />
        </>
    );
};

export default MyProducts;
