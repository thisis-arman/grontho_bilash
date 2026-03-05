import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight, BookOpen, Zap, ShieldCheck, Users, Recycle, Laptop, Star, TrendingUp, Package,
    Search,
    ChevronRight
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

    const spines = [
        { title: "Atomic Habits", color: "bg-amber-400", h: "h-48", w: "w-10" },
        { title: "Clean Code", color: "bg-sky-500", h: "h-56", w: "w-9" },
        { title: "Calculus Vol. II", color: "bg-emerald-500", h: "h-40", w: "w-11" },
        { title: "Physics Fundamentals", color: "bg-rose-400", h: "h-52", w: "w-10" },
        { title: "Deep Work", color: "bg-orange-400", h: "h-60", w: "w-10" },
        { title: "Zero to One", color: "bg-teal-500", h: "h-36", w: "w-9" },
    ];
    const ticker = ["Used Textbooks", "Digital PDFs", "Study Notes", "Fiction", "Academic Books", "Science Books", "Self-Help", "Business Books"];

    return (
        <div className="bg-stone-50">
            <section className="bg-[#fdf9f4] min-h-screen flex items-center overflow-hidden relative">
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-400/15 blur-[100px] pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <Link to="/blog" className="inline-flex items-center gap-2 px-3 py-1.5 mt-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold tracking-wide mb-8 hover:bg-amber-200 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Digital products now available <ChevronRight size={12} />
                            </Link>

                            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-stone-900 leading-[1.0] tracking-tighter mb-6">
                                Buy &amp; sell books{" "}
                                <span className="relative inline-block">
                                    <span className="text-amber-500">smarter.</span>
                                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                                        <path d="M2 6C40 2 80 1 100 3C120 5 160 6 198 2" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                </span>
                            </h1>

                            <p className="text-stone-500 text-lg leading-relaxed mb-8 max-w-md">
                                Bangladesh's trusted marketplace for used textbooks, digital PDFs,
                                and study resources. Join 4,800+ students saving money.
                            </p>

                            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md mb-8">
                                <div className="flex-1 relative">
                                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search books, authors..."
                                        className="w-full pl-10 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 shadow-sm transition-all"
                                    />
                                </div>
                                <button type="submit" className="w-12 h-12 bg-stone-900 hover:bg-amber-500 text-white rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 flex-shrink-0">
                                    <ArrowRight size={16} />
                                </button>
                            </form>

                            <div className="flex flex-wrap gap-2">
                                <Link to="/books" className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-sm">
                                    Browse Books <ArrowRight size={14} />
                                </Link>
                                <Link to="/user/add-product" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-sm">
                                    <Zap size={14} /> Sell Yours
                                </Link>
                            </div>
                        </div>

                        {/* Right — Bento */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-stone-900 text-white rounded-3xl p-6 flex flex-col justify-between">
                                <p className="text-[11px] font-bold tracking-widest uppercase text-stone-500">Books Listed</p>
                                <div className="mt-4">
                                    <p className="text-5xl font-black">12K+</p>
                                    <p className="text-xs text-stone-400 mt-1">across Bangladesh</p>
                                </div>
                            </div>

                            <div className="bg-amber-500 rounded-3xl p-6 flex flex-col justify-between">
                                <div className="w-9 h-9 bg-stone-900/15 rounded-xl flex items-center justify-center mb-4">
                                    <Zap size={18} className="text-stone-900" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-stone-900">Instant Digital Delivery</p>
                                    <p className="text-xs text-stone-800/70 mt-1">Download PDFs right after checkout</p>
                                </div>
                            </div>

                            <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
                                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen size={18} className="text-emerald-600" />
                                </div>
                                <p className="text-sm font-bold text-stone-900">All Conditions</p>
                                <p className="text-xs text-stone-400 mt-1">New, Like New, Good &amp; Acceptable</p>
                            </div>

                            <div className="bg-stone-100 rounded-3xl p-6 flex flex-col justify-between">
                                <p className="text-[11px] font-bold tracking-widest uppercase text-stone-400">Satisfaction</p>
                                <div className="mt-4">
                                    <p className="text-5xl font-black text-stone-900">98%</p>
                                    <p className="text-xs text-stone-400 mt-1">of buyers satisfied</p>
                                </div>
                            </div>

                            <div className="col-span-2 bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-5 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold text-stone-500 mb-1">Join the community</p>
                                    <p className="text-white font-bold text-sm">4,800+ students already saving money</p>
                                </div>
                                <Link to="/register" className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-xl text-xs transition-all whitespace-nowrap">
                                    Join Free <ArrowRight size={13} />
                                </Link>
                            </div>
                        </div>

                    </div>
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