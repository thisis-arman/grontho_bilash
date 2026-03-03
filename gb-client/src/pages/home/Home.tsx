import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight, BookOpen, Zap, ShieldCheck, Users, Recycle, Laptop, Star, TrendingUp, Package
} from "lucide-react";
import { useGetBooksQuery, useGetProductsQuery } from "../../redux/features/book/bookApi";


const stats = [
    { value: "12K+", label: "Books Listed" },
    { value: "4.8K", label: "Happy Buyers" },
    { value: "98%", label: "Satisfaction" },
    { value: "BD", label: "Nationwide" },
];

const features = [
    { icon: BookOpen, title: "Physical & Digital", desc: "Buy used textbooks or download digital copies instantly." },
    { icon: ShieldCheck, title: "Safe Transactions", desc: "Platform-handled shipping and secure checkout every time." },
    { icon: Zap, title: "Instant Listings", desc: "List your book in under 2 minutes and reach thousands of students." },
    { icon: Users, title: "Student Community", desc: "Built by students, for students across every institution in BD." },
];

const categories = [
    { label: "Academic", emoji: "🎓", slug: "Academic" },
    { label: "Fiction", emoji: "📖", slug: "Fiction" },
    { label: "Science", emoji: "🔬", slug: "Science" },
    { label: "Technology", emoji: "💻", slug: "Technology" },
    { label: "Self-Help", emoji: "🌱", slug: "Self-Help" },
    { label: "Business", emoji: "📊", slug: "Business" },
    { label: "Religion", emoji: "🕌", slug: "Religion" },
    { label: "Children", emoji: "🧸", slug: "Children" },
];

const highlights = [
    { icon: Recycle, label: "Used Books" },
    { icon: Laptop, label: "Digital Products" },
    { icon: BookOpen, label: "Study Notes" },
];


const formatPrice = (price: number) =>
    `৳${new Intl.NumberFormat("en-BD").format(price)}`;


const SectionLabel = ({ text }: { text: string }) => (
    <p className="text-xs font-semibold tracking-widest uppercase text-amber-600 mb-2">{text}</p>
);


const Home = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const { data: productsRes } = useGetProductsQuery({
        limit: 6,
        sortBy: "createdAt",
        sortOrder: "desc",
    });
    const recentProducts = productsRes?.data ?? [];

    console.log(recentProducts)

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className="bg-stone-50">
            <section className="relative overflow-hidden bg-stone-900 text-white">

                <div
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                {/* Glow orbs */}
                <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-amber-600/8 blur-[100px] pointer-events-none" />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 lg:pt-32 lg:pb-40">
                    <div className="max-w-3xl mx-auto text-center">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Bangladesh's Book Marketplace
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
                            Give Books a{" "}
                            <span className="text-amber-400">Second Life</span>
                        </h1>

                        <p className="text-stone-400 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
                            Grontho Bilash is Bangladesh's trusted marketplace to buy and sell{" "}
                            <span className="text-stone-200 font-semibold">used books, study resources, and digital products</span>.
                            Affordable learning starts here.
                        </p>

                        {/* Highlight pills */}
                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                            {highlights.map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/10 text-stone-300 text-sm font-medium">
                                    <Icon size={14} className="text-amber-400" />
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Search bar */}
                        {/* Premium Search Bar */}
                        <div className="relative max-w-2xl mx-auto group mt-4 mb-4">
                            <form
                                onSubmit={handleSearch}
                                className="flex items-center bg-white border border-yellow-200 rounded-2xl p-2  shadow-yellow-100/50 transition-all focus-within:ring-4 focus-within:ring-yellow-500/20 focus-within:border-yellow-400"
                            >
                                <div className="pl-4 text-yellow-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search old books, digital notes, authors..."
                                    className="w-full bg-transparent px-4 py-3 text-gray-800 outline-none placeholder:text-gray-400 border-none focus:border-none focus:ring-0"
                                />
                                <button
                                    type="submit"
                                    className="hidden sm:block px-8 py-3 rounded-xl font-bold text-white bg-yellow-500 hover:bg-yellow-600 transition-all active:scale-95 shadow-md shadow-yellow-200"
                                >
                                    Search
                                </button>
                            </form>
                        </div>

                        {/* CTA pair */}
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                to="/books"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30 text-sm"
                            >
                                Browse Listings
                                <ArrowRight size={15} />
                            </Link>
                            <Link
                                to="/dashboard/add-product"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold rounded-2xl transition-all text-sm"
                            >
                                Sell a Book
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
                        <path d="M0 48L1440 48L1440 24C1200 48 900 0 720 24C540 48 240 0 0 24L0 48Z" fill="#f8f5f0" />
                    </svg>
                </div>
            </section>

            {/* ━━━━ STATS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="bg-stone-50 py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-200 rounded-2xl overflow-hidden shadow-sm">
                        {stats.map(({ value, label }) => (
                            <div key={label} className="bg-white flex flex-col items-center justify-center py-8 gap-1">
                                <span className="text-3xl font-extrabold text-stone-900 tracking-tight">{value}</span>
                                <span className="text-[11px] font-semibold text-stone-400 tracking-widest uppercase">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━━ CATEGORIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-16 bg-stone-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <SectionLabel text="Explore" />
                            <h2 className="text-2xl font-bold text-stone-900">Browse by Category</h2>
                        </div>
                        <Link
                            to="/books"
                            className="text-sm font-semibold text-stone-500 hover:text-amber-600 transition-colors flex items-center gap-1"
                        >
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                        {categories.map(({ label, emoji, slug }) => (
                            <Link
                                key={slug}
                                to={`/books?category=${slug}`}
                                className="flex flex-col items-center gap-2 py-5 px-2 bg-white rounded-2xl border border-stone-100 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                            >
                                <span className="text-2xl">{emoji}</span>
                                <span className="text-[11px] font-semibold text-stone-500 group-hover:text-amber-600 transition-colors text-center leading-tight">
                                    {label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━━ RECENT LISTINGS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {recentProducts.length > 0 && (
                <section className="py-16 bg-white border-y border-stone-100">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <SectionLabel text="Fresh Arrivals" />
                                <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-amber-500" />
                                    Recently Listed
                                </h2>
                            </div>
                            <Link
                                to="/books"
                                className="text-sm font-semibold text-stone-500 hover:text-amber-600 transition-colors flex items-center gap-1"
                            >
                                See all <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {recentProducts.map((product) => (
                                <Link
                                    key={product._id}
                                    to={`/products/${product.slug}`}
                                    className="group flex flex-col bg-stone-50 rounded-2xl border border-stone-100 hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[3/4] bg-stone-200 overflow-hidden">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen size={24} className="text-stone-300" />
                                            </div>
                                        )}
                                        {/* Type badge */}
                                        <span className={`absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${product.productType === "Digital"
                                            ? "bg-violet-500 text-white"
                                            : "bg-white/90 text-stone-700"
                                            }`}>
                                            {product.productType === "Digital" ? "⚡ Digital" : "📦 Physical"}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3 flex flex-col gap-1">
                                        <p className="text-xs font-semibold text-stone-800 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                                            {product.title}
                                        </p>
                                        {product.bookMetadata?.author && (
                                            <p className="text-[10px] text-stone-400 line-clamp-1">{product.bookMetadata.author}</p>
                                        )}
                                        <p className="text-sm font-extrabold text-stone-900 mt-1">
                                            {formatPrice(product.price.basePrice)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ━━━━ FEATURES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-16 bg-stone-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <SectionLabel text="Why Us" />
                        <h2 className="text-2xl font-bold text-stone-900">Everything you need to trade books</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="group p-6 rounded-2xl bg-white hover:bg-stone-900 border border-stone-100 hover:border-stone-900 transition-all duration-300 hover:-translate-y-1 cursor-default"
                            >
                                <div className="w-10 h-10 rounded-xl bg-stone-50 group-hover:bg-amber-500 shadow-sm flex items-center justify-center mb-4 transition-colors duration-300">
                                    <Icon size={18} className="text-stone-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-sm font-bold text-stone-800 group-hover:text-white mb-1.5 transition-colors duration-300">
                                    {title}
                                </h3>
                                <p className="text-xs text-stone-500 group-hover:text-stone-400 leading-relaxed transition-colors duration-300">
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━━ SELL CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-16 bg-white border-t border-stone-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                        {/* Copy */}
                        <div>
                            <div className="inline-block px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 font-semibold text-xs tracking-wide mb-5">
                                Sell your resources
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-stone-900 leading-tight mb-4">
                                Turn old books into{" "}
                                <span className="text-amber-500">cash</span> today.
                            </h2>
                            <p className="text-stone-500 text-base leading-relaxed mb-8 max-w-md">
                                Don't let past semester books gather dust. List them in minutes,
                                help juniors find affordable resources, and earn for your next read.
                                Digital notes too.
                            </p>

                            {/* Mini checklist */}
                            <ul className="space-y-2.5 mb-8">
                                {["Free to list — no hidden fees", "Platform handles shipping & payments", "Reach thousands of students nationwide"].map(item => (
                                    <li key={item} className="flex items-center gap-2.5 text-sm text-stone-600">
                                        <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                            <Star size={10} className="text-amber-600 fill-amber-600" />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/dashboard/add-product"
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-900 font-bold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl text-sm"
                            >
                                <Package size={16} />
                                Start Selling Free
                                <ArrowRight size={15} />
                            </Link>
                        </div>

                        {/* Visual */}
                        <div className="relative">
                            <div className="bg-stone-50 border border-stone-100 rounded-3xl p-3 shadow-xl rotate-1 hover:rotate-0 transition-transform duration-500">
                                <img
                                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=900"
                                    alt="Student with books"
                                    className="w-full h-72 object-cover rounded-2xl"
                                />
                            </div>
                            {/* Floating stat badge */}
                            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-stone-100 px-5 py-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <TrendingUp size={18} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-stone-400 font-semibold tracking-wide uppercase">This week</p>
                                    <p className="text-sm font-extrabold text-stone-900">248 new listings</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━━ BOTTOM CTA BANNER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-16 bg-stone-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden bg-amber-500 rounded-3xl px-8 py-16 text-center">
                        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-amber-400/40" />
                        <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-amber-600/25" />
                        <div className="absolute top-4 right-20 w-16 h-16 rounded-full bg-amber-300/30" />
                        <div className="relative">
                            <p className="text-xs font-bold tracking-widest uppercase text-stone-700/70 mb-3">Grontho Bilash</p>
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-stone-900 mb-3 leading-tight">
                                Affordable learning <br className="hidden sm:block" /> for every student.
                            </h2>
                            <p className="text-stone-800/65 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                                Join thousands of students across Bangladesh already buying and
                                selling books smarter.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Link
                                    to="/books"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl text-sm"
                                >
                                    Browse All Books
                                    <ArrowRight size={15} />
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/80 hover:bg-white text-stone-800 font-bold rounded-2xl transition-all hover:-translate-y-0.5 text-sm"
                                >
                                    Join for Free
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;