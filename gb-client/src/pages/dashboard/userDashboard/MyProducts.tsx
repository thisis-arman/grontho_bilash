import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../redux/hooks";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";
import { Table, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search, Plus, Package, Zap, MapPin, Truck, CheckCircle, XCircle } from "lucide-react";
import { useGetBooksByEmailQuery } from "../../../redux/features/book/bookApi";


type TPrice = { basePrice: number; isNegotiable: boolean; discountPrice: number };
type TFulfillment = { allowPickup: boolean; allowShipping: boolean; isDigitalDelivery: boolean };
type TBookMeta = { author: string; publisher: string; publicationYear: number; language: string; isbn?: string; edition?: string };
type TDigitalDetails = { fileType: string; fileSize: string };

type TProduct = {
    _id: string;
    title: string;
    slug: string;
    sku: string;
    productType: "Physical" | "Digital";
    category: string;
    subcategory: string;
    condition: string;
    price: TPrice;
    images: string[];
    location: string;
    stockStatus: string;
    isPublished: boolean;
    isContactNoHidden: boolean;
    viewCount: number;
    estimatedShipping: number;
    fulfillmentOptions: TFulfillment;
    bookMetadata: TBookMeta;
    digitalDetails?: TDigitalDetails;
    academicMetadata?: { level: string; faculty: string; department: string };
    createdAt: string;
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
        <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-stone-900">{value}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
);


const MyProducts = () => {
    const { id,email } = useAppSelector(selectCurrentUser) as TUser;
    const { data: responseData, isLoading } = useGetBooksByEmailQuery(email);
    const [searchText, setSearchText] = useState("");
    const [typeFilter, setTypeFilter] = useState<"All" | "Physical" | "Digital">("All");

    const products: TProduct[] = responseData?.data || [];

    const totalProducts = products.length;
    const publishedCount = products.filter(p => p.isPublished).length;
    const physicalCount = products.filter(p => p.productType === "Physical").length;
    const digitalCount = products.filter(p => p.productType === "Digital").length;

    const filtered = products.filter(p => {
        const q = searchText.toLowerCase();
        const matchesSearch =
            p.title?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.bookMetadata?.author?.toLowerCase().includes(q);
        const matchesType = typeFilter === "All" || p.productType === typeFilter;
        return matchesSearch && matchesType;
    });

   const columns: ColumnsType<TProduct> = [
        {
            title: "Product",
            key: "product",
            width: 280,
            render: (_, r) => (
                <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                        <img
                            src={r.images?.[0] || "https://via.placeholder.com/80"}
                            alt={r.title}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-100"
                        />
                        <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${r.productType === "Digital" ? "bg-violet-500" : "bg-amber-500"}`}>
                            {r.productType === "Digital"
                                ? <Zap className="w-2 h-2 text-white" />
                                : <Package className="w-2 h-2 text-white" />}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate max-w-[180px]">{r.title}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{r.sku}</p>
                        {r.bookMetadata?.author && (
                            <p className="text-xs text-stone-400 truncate">{r.bookMetadata.author}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: "Category",
            key: "category",
            render: (_, r) => (
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-stone-700">{r.category}</span>
                    {r.academicMetadata?.level && (
                        <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md w-fit">Academic</span>
                    )}
                </div>
            ),
            filters: [...new Set(products.map(p => p.category))].map(c => ({ text: c, value: c })),
            onFilter: (val: any, r) => r.category === val,
        },
        {
            title: "Price",
            key: "price",
            sorter: (a, b) => a.price.basePrice - b.price.basePrice,
            render: (_, r) => (
                <div>
                    <span className="text-sm font-bold text-stone-900">৳{r.price.basePrice}</span>
                    {r.price.discountPrice > 0 && (
                        <span className="ml-1.5 text-xs text-stone-400 line-through">৳{r.price.discountPrice}</span>
                    )}
                    {r.price.isNegotiable && (
                        <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Negotiable</p>
                    )}
                </div>
            ),
        },
        {
            title: "Condition",
            dataIndex: "condition",
            key: "condition",
            render: (c) => {
                const map: Record<string, string> = {
                    "New": "bg-emerald-50 text-emerald-700",
                    "Like New": "bg-teal-50 text-teal-700",
                    "Good": "bg-sky-50 text-sky-700",
                    "Acceptable": "bg-amber-50 text-amber-700",
                    "Digital Content": "bg-violet-50 text-violet-700",
                };
                return (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${map[c] || "bg-stone-100 text-stone-600"}`}>
                        {c}
                    </span>
                );
            },
            filters: ["New", "Like New", "Good", "Acceptable", "Digital Content"].map(v => ({ text: v, value: v })),
            onFilter: (val: any, r) => r.condition === val,
        },
        {
            title: "Fulfillment",
            key: "fulfillment",
            render: (_, r) => (
                <div className="flex flex-col gap-1">
                    {r.fulfillmentOptions.isDigitalDelivery ? (
                        <span className="flex items-center gap-1 text-xs text-violet-600">
                            <Zap className="w-3 h-3" /> Digital Download
                        </span>
                    ) : (
                        <>
                            {r.fulfillmentOptions.allowPickup && (
                                <span className="flex items-center gap-1 text-xs text-stone-600">
                                    <MapPin className="w-3 h-3 text-amber-500" /> Pickup
                                </span>
                            )}
                            {r.fulfillmentOptions.allowShipping && (
                                <span className="flex items-center gap-1 text-xs text-stone-600">
                                    <Truck className="w-3 h-3 text-amber-500" /> Shipping
                                    {r.estimatedShipping > 0 && (
                                        <span className="text-stone-400">(৳{r.estimatedShipping})</span>
                                    )}
                                </span>
                            )}
                        </>
                    )}
                </div>
            ),
        },
        {
            title: "Status",
            key: "status",
            render: (_, r) => (
                <div className="flex flex-col gap-1.5">
                    {r.isPublished ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <CheckCircle className="w-3 h-3" /> Published
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-stone-400">
                            <XCircle className="w-3 h-3" /> Draft
                        </span>
                    )}
                    <span className="text-[10px] text-stone-400">{r.viewCount} views</span>
                </div>
            ),
            filters: [{ text: "Published", value: true }, { text: "Draft", value: false }],
            onFilter: (val: any, r) => r.isPublished === val,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, r) => (
                <Space size={4}>
                    <Link to={`/user/edit-product/${r._id}`}>
                        <button className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">
                            Edit
                        </button>
                    </Link>
                    <button className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                        Delete
                    </button>
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">My Listings</h1>
                        <p className="text-sm text-stone-500 mt-0.5">Manage your physical and digital products</p>
                    </div>
                    <Link to="/user/add-product">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                            <Plus className="w-4 h-4" />
                            New Listing
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Listings" value={totalProducts} />
                    <StatCard label="Published" value={publishedCount} sub={`${totalProducts - publishedCount} drafts`} />
                    <StatCard label="Physical" value={physicalCount} sub="Books & Items" />
                    <StatCard label="Digital" value={digitalCount} sub="PDFs & Files" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search by title, SKU, author..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(["All", "Physical", "Digital"] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                                    typeFilter === type
                                        ? "bg-stone-900 text-white border-stone-900"
                                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                                }`}
                            >
                                {type === "Physical" && <Package className="w-3 h-3 inline mr-1" />}
                                {type === "Digital" && <Zap className="w-3 h-3 inline mr-1" />}
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={filtered}
                        rowKey="_id"
                        loading={isLoading}
                        pagination={{
                            defaultPageSize: 8,
                            showSizeChanger: true,
                            pageSizeOptions: ["8", "16", "32"],
                            showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} listings`,
                            className: "px-4 py-2",
                        }}
                        scroll={{ x: 900 }}
                        size="middle"
                        rowClassName="hover:bg-stone-50/50 transition-colors"
                        locale={{
                            emptyText: (
                                <div className="py-16 flex flex-col items-center gap-3">
                                    <Package className="w-10 h-10 text-stone-200" />
                                    <p className="text-sm text-stone-400 font-medium">No listings found</p>
                                    <Link to="/user/add-product">
                                        <button className="mt-1 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-colors">
                                            Create your first listing
                                        </button>
                                    </Link>
                                </div>
                            ),
                        }}
                    />
                </div>

            </div>
        </div>
    );
};

export default MyProducts;