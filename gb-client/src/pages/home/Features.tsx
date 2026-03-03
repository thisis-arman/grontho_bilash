import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Zap, ShieldCheck, Users } from "lucide-react";

// ── Static data ───────────────────────────────────────────────────────────────

const stats = [
    { value: "12K+", label: "Books Listed" },
    { value: "4.8K", label: "Happy Buyers" },
    { value: "98%", label: "Satisfaction" },
    { value: "BD", label: "Nationwide" },
];

const features = [
    {
        icon: BookOpen,
        title: "Physical & Digital",
        desc: "Buy used textbooks or download digital copies instantly.",
    },
    {
        icon: ShieldCheck,
        title: "Safe Transactions",
        desc: "Platform-handled shipping and secure checkout every time.",
    },
    {
        icon: Zap,
        title: "Instant Listings",
        desc: "List your book in under 2 minutes and reach thousands.",
    },
    {
        icon: Users,
        title: "Student Community",
        desc: "Built by students, for students across every institution.",
    },
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

// ── Component ─────────────────────────────────────────────────────────────────

const Feature = () => {
    return (
        <div className="bg-stone-50 font-sans">

            {/* ━━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* <section className="relative overflow-hidden bg-stone-900 text-white">

                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-600/5 blur-[100px] pointer-events-none" />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                Bangladesh's Book Marketplace
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                                Buy &amp; Sell Books{" "}
                                <span className="text-amber-400">
                                    the Smart Way
                                </span>
                            </h1>

                            <p className="text-stone-400 text-lg leading-relaxed mb-10 max-w-lg">
                                From academic textbooks to digital PDFs — find what you need,
                                list what you don't. Fast, safe, and built for students.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to="/books"
                                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/25 text-sm"
                                >
                                    Browse Listings
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    to="/dashboard/add-product"
                                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold rounded-2xl transition-all text-sm"
                                >
                                    Sell a Book
                                </Link>
                            </div>
                        </div>

                        <div className="relative hidden lg:flex justify-center items-center h-80">
                          
                            {[
                                { title: "Calculus, 10th Ed.", price: "৳380", color: "bg-amber-50", rotate: "-rotate-6", z: "z-10", t: "top-6", l: "left-8" },
                                { title: "Clean Code", price: "৳520", color: "bg-sky-50", rotate: "rotate-3", z: "z-20", t: "top-12", l: "left-28" },
                                { title: "Atomic Habits", price: "৳290", color: "bg-emerald-50", rotate: "-rotate-1", z: "z-30", t: "top-4", l: "left-52" },
                            ].map((card, i) => (
                                <div
                                    key={i}
                                    className={`absolute ${card.t} ${card.l} ${card.rotate} ${card.z} ${card.color} rounded-2xl p-4 w-44 shadow-2xl border border-white/80`}
                                >
                                    <div className="w-full aspect-[3/4] rounded-xl bg-stone-200 mb-3 overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-200" />
                                    </div>
                                    <p className="text-xs font-bold text-stone-800 line-clamp-1">{card.title}</p>
                                    <p className="text-sm font-extrabold text-amber-600 mt-0.5">{card.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
                        <path d="M0 40L1440 40L1440 20C1200 40 900 0 720 20C540 40 240 0 0 20L0 40Z" fill="#f8f5f0" />
                    </svg>
                </div>
            </section> */}
   {/* ━━━━ CATEGORIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-16 bg-stone-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <p className="text-xs font-semibold tracking-widest uppercase text-amber-600 mb-2">Explore</p>
                            <h2 className="text-2xl font-bold text-stone-900">Browse by Category</h2>
                        </div>
                        <Link to="/products" className="text-sm font-semibold text-stone-500 hover:text-amber-600 transition-colors flex items-center gap-1">
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                        {categories.map(({ label, emoji, slug }) => (
                            <Link
                                key={slug}
                                to={`/products?category=${slug}`}
                                className="flex flex-col items-center gap-2 py-5 px-3 bg-white rounded-2xl border border-stone-100 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                            >
                                <span className="text-2xl">{emoji}</span>
                                <span className="text-xs font-semibold text-stone-600 group-hover:text-amber-600 transition-colors text-center leading-tight">
                                    {label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            {/* ━━━━ STATS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="bg-stone-50 py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-200 rounded-2xl overflow-hidden shadow-sm">
                        {stats.map(({ value, label }) => (
                            <div key={label} className="bg-white flex flex-col items-center justify-center py-8 gap-1">
                                <span className="text-3xl font-extrabold text-stone-900 tracking-tight">{value}</span>
                                <span className="text-xs font-semibold text-stone-400 tracking-widest uppercase">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

         

            {/* ━━━━ FEATURES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-16 bg-white border-y border-stone-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <p className="text-xs font-semibold tracking-widest uppercase text-amber-600 mb-2">Why Us</p>
                        <h2 className="text-2xl font-bold text-stone-900">Everything you need to trade books</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="group p-6 rounded-2xl bg-stone-50 hover:bg-stone-900 border border-stone-100 hover:border-stone-900 transition-all duration-300 hover:-translate-y-1 cursor-default"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-amber-500 shadow-sm flex items-center justify-center mb-4 transition-colors duration-300">
                                    <Icon size={18} className="text-stone-700 group-hover:text-white transition-colors duration-300" />
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

            {/* ━━━━ CTA BANNER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-16 bg-stone-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden bg-amber-500 rounded-3xl px-8 py-14 text-center">
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-amber-400/50" />
                        <div className="absolute -bottom-8 -right-8 w-52 h-52 rounded-full bg-amber-600/30" />

                        <div className="relative">
                            <h2 className="text-3xl font-extrabold text-stone-900 mb-3">
                                Have books collecting dust?
                            </h2>
                            <p className="text-stone-800/70 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                                Turn your unused textbooks and resources into cash.
                                List in minutes, get paid safely.
                            </p>
                            <Link
                                to="/dashboard/add-product"
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl text-sm"
                            >
                                Start Selling Free
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Feature;