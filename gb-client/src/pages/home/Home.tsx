import React, { useState, useRef, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
    useReducedMotion,
    useInView,
    animate,
    Variants,
} from "framer-motion";
import {
    ArrowRight, BookOpen, Zap, ShieldCheck, Users, Recycle, Laptop, Star, TrendingUp, Package,
    Search,
    ChevronRight,
    MapPin,
    PackageX,
} from "lucide-react";
import { useGetProductsQuery } from "../../redux/features/book/bookApi";
import { IProduct } from "../../types/interface";
import { cn } from "../../lib/utils";


const stats = [
    { target: 12, suffix: "K+", label: "Books Listed" },
    { target: 4.8, suffix: "K", decimals: 1, label: "Happy Buyers" },
    { target: 98, suffix: "%", label: "Satisfaction" },
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

// Books that "sit on the shelf" in the hero — dropped in with spring physics.
const spines = [
    { title: "Atomic Habits", color: "bg-amber-400", h: 176, w: 38 },
    { title: "Clean Code", color: "bg-sky-500", h: 204, w: 34 },
    { title: "Calculus Vol. II", color: "bg-emerald-500", h: 150, w: 42 },
    { title: "Physics Fundamentals", color: "bg-rose-400", h: 190, w: 38 },
    { title: "Deep Work", color: "bg-orange-400", h: 216, w: 38 },
    { title: "Zero to One", color: "bg-teal-500", h: 136, w: 34 },
    { title: "The Almack Of Naval Ravikant", color: "bg-yellow-500", h: 166, w: 34 },
];


const formatPrice = (price: number) =>
    `৳${new Intl.NumberFormat("en-BD").format(price)}`;

// ── Product-card helpers ────────────────────────────────────────────────
const getDiscountPercent = (basePrice: number, discountPrice?: number) => {
    if (!discountPrice || discountPrice <= 0 || discountPrice >= basePrice) return null;
    return Math.round(((basePrice - discountPrice) / basePrice) * 100);
};

const getRemainingStock = (product: IProduct) => {
    const quantity = product.inventory?.quantity ?? 0;
    const sold = product.inventory?.soldCount ?? 0;
    return quantity - sold;
};

const isOutOfStock = (product: IProduct) => {
    if (product.stockStatus && product.stockStatus !== "In Stock") return true;
    if (product.productType === "Digital") return false;
    return getRemainingStock(product) <= 0;
};

const isLowStock = (product: IProduct) => {
    if (product.productType === "Digital" || isOutOfStock(product)) return false;
    const remaining = getRemainingStock(product);
    return remaining > 0 && remaining <= 3;
};


const SectionLabel = ({ text }: { text: string }) => (
    <p className="text-xs font-semibold tracking-widest uppercase text-amber-600 mb-2">{text}</p>
);

// ── Hero motion config ──────────────────────────────────────────────────
const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const;
const HEADLINE_WORDS = ["Buy", "&", "sell", "books,"];

const MotionLink = motion(Link);

// ── Reusable scroll-reveal variants ─────────────────────────────────────
const revealContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const revealItem: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_EDITORIAL } },
};

// ── Count-up number used in the stats strip ─────────────────────────────
const AnimatedNumber = ({
    target,
    suffix = "",
    decimals = 0,
}: {
    target: number;
    suffix?: string;
    decimals?: number;
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });
    const shouldReduceMotion = useReducedMotion();
    const [display, setDisplay] = useState(shouldReduceMotion ? target : 0);

    useEffect(() => {
        if (!isInView || shouldReduceMotion) return;
        const controls = animate(0, target, {
            duration: 1.3,
            ease: EASE_EDITORIAL,
            onUpdate: (v) => setDisplay(v),
        });
        return () => controls.stop();
    }, [isInView, target, shouldReduceMotion]);

    return (
        <span ref={ref}>
            {display.toFixed(decimals)}
            {suffix}
        </span>
    );
};

const Home = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const navigate = useNavigate();
    const shouldReduceMotion = useReducedMotion();

    const { data: productsRes } = useGetProductsQuery({
        limit: 6,
        sortBy: "createdAt",
        sortOrder: "desc",
    });
    const recentProducts = productsRes?.data?.data ?? [];

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // ── Mouse-parallax tilt for the hero bookshelf ──
    const shelfContainerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rawRotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);
    const rawRotateX = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
    const shelfRotateY = useSpring(rawRotateY, { stiffness: 90, damping: 16 });
    const shelfRotateX = useSpring(rawRotateX, { stiffness: 90, damping: 16 });

    const handleShelfMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (shouldReduceMotion || !shelfContainerRef.current) return;
        const rect = shelfContainerRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const handleShelfMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    // ── Headline reveal choreography ──
    const headlineContainer = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.08,
                delayChildren: shouldReduceMotion ? 0 : 0.1,
            },
        },
    };
    const wordVariant = {
        hidden: { y: shouldReduceMotion ? 0 : "110%", opacity: shouldReduceMotion ? 0 : 1 },
        visible: {
            y: "0%",
            opacity: 1,
            transition: shouldReduceMotion
                ? { duration: 0.2 }
                : { duration: 0.85, ease: EASE_EDITORIAL },
        },
    };
    const forLessDelay = shouldReduceMotion ? 0 : 0.1 + 0.08 * HEADLINE_WORDS.length;
    // Time the shelf drop finishes so dependent elements (ledge, price tag) can queue after it.
    const shelfSettleDelay = 0.4 + spines.length * 0.12;

    return (
        <div className="bg-stone-50 ">
            {/* HERO SECTION */}
            <div className="bg-[#fdf9f4] relative flex min-h-[46rem] w-full items-center justify-center bg-white dark:bg-black overflow-hidden">
                <div
                    className={cn(
                        "absolute inset-0",
                        "[background-size:40px_40px]",
                        "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
                        "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
                    )}
                />

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
                <section className="min-h-screen flex items-center overflow-hidden relative">
                    {/* ── Atmospheric ambient blobs ── */}
                    <motion.div
                        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-400/15 blur-[100px] pointer-events-none"
                        animate={
                            shouldReduceMotion
                                ? {}
                                : {
                                    x: [0, 40, -20, 0],
                                    y: [0, -30, 15, 0],
                                    scale: [1, 1.15, 0.95, 1],
                                    opacity: [0.15, 0.25, 0.15, 0.15],
                                }
                        }
                        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute top-0 left-0 w-[360px] h-[360px] rounded-full bg-stone-300/10 blur-[90px] pointer-events-none"
                        animate={
                            shouldReduceMotion
                                ? {}
                                : {
                                    x: [0, -25, 20, 0],
                                    y: [0, 25, -15, 0],
                                    scale: [1, 0.9, 1.1, 1],
                                    opacity: [0.1, 0.18, 0.1, 0.1],
                                }
                        }
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                            {/* ── Left: message ── */}
                            <div>
                                <motion.h1
                                    initial="hidden"
                                    animate="visible"
                                    variants={headlineContainer}
                                    className="text-5xl lg:text-6xl xl:text-7xl font-black text-stone-900 leading-[1.0] tracking-tighter mb-6"
                                >
                                    {HEADLINE_WORDS.map((word, i) => (
                                        <span key={word + i} className="inline-block overflow-hidden pb-1 align-bottom mr-[0.22em] last:mr-0">
                                            <motion.span variants={wordVariant} className="inline-block">
                                                {word}
                                            </motion.span>
                                        </span>
                                    ))}
                                    <span className="relative inline-block overflow-hidden pb-1 align-bottom">
                                        <motion.span
                                            variants={wordVariant}
                                            className="relative inline-block text-amber-500"
                                        >
                                            for less.
                                            <svg
                                                className="absolute -bottom-1 left-0 w-full"
                                                viewBox="0 0 200 8"
                                                fill="none"
                                            >
                                                <motion.path
                                                    d="M2 6C40 2 80 1 100 3C120 5 160 6 198 2"
                                                    stroke="#f59e0b"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                                    transition={{
                                                        delay: forLessDelay + (shouldReduceMotion ? 0 : 0.75),
                                                        duration: shouldReduceMotion ? 0.2 : 0.55,
                                                        ease: "easeInOut",
                                                    }}
                                                />
                                            </svg>
                                        </motion.span>
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: shouldReduceMotion ? 0 : 1.35, duration: 0.6, ease: EASE_EDITORIAL }}
                                    className="text-stone-500 text-lg leading-relaxed mb-3 max-w-md"
                                >
                                    Bangladesh's marketplace for used textbooks and digital notes.
                                    4,800+ students already save here.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: shouldReduceMotion ? 0 : 1.45, duration: 0.6, ease: EASE_EDITORIAL }}
                                >
                                    <Link to="/books?type=Digital" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 mb-8 transition-colors">
                                        New — instant digital downloads <ChevronRight size={12} />
                                    </Link>
                                </motion.div>

                                <motion.form
                                    onSubmit={handleSearch}
                                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: shouldReduceMotion ? 0 : 1.55, duration: 0.6, ease: EASE_EDITORIAL }}
                                    className="flex items-center gap-2 max-w-md mb-6"
                                >
                                    <motion.div
                                        className="flex-1 relative rounded-xl"
                                        animate={{
                                            y: isSearchFocused ? -2 : 0,
                                            boxShadow: isSearchFocused
                                                ? "0 10px 30px rgba(245, 158, 11, 0.22)"
                                                : "0 1px 2px rgba(28,25,23,0.04)",
                                        }}
                                        transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
                                    >
                                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                            onFocus={() => setIsSearchFocused(true)}
                                            onBlur={() => setIsSearchFocused(false)}
                                            placeholder="Search books, authors..."
                                            className="w-full pl-10 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all"
                                        />
                                    </motion.div>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ y: -2, scale: 1.03 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                        className="w-12 h-12 bg-stone-900 hover:bg-amber-500 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                                    >
                                        <ArrowRight size={16} />
                                    </motion.button>
                                </motion.form>

                                <motion.div
                                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: shouldReduceMotion ? 0 : 1.65, duration: 0.6, ease: EASE_EDITORIAL }}
                                    className="flex flex-wrap items-center gap-3"
                                >
                                    <MotionLink
                                        to="/books"
                                        whileHover={{ y: -4, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-sm shadow-sm"
                                    >
                                        Browse Books <ArrowRight size={14} />
                                    </MotionLink>
                                    <MotionLink
                                        to="/user/add-product"
                                        whileHover={{ y: -4, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-300 hover:border-stone-900 text-stone-700 hover:text-stone-900 font-bold rounded-xl text-sm"
                                    >
                                        <Zap size={14} /> Sell yours
                                    </MotionLink>
                                </motion.div>
                            </div>

                            {/* ── Right: signature visual — a bookshelf that drops itself into place ── */}
                            <div
                                ref={shelfContainerRef}
                                onMouseMove={handleShelfMouseMove}
                                onMouseLeave={handleShelfMouseLeave}
                                className="relative flex items-end justify-center min-h-[380px]"
                                style={{ perspective: 1400 }}
                            >
                                <motion.div
                                    className="absolute w-72 h-72 rounded-full bg-amber-400/20 blur-[80px] pointer-events-none"
                                    animate={
                                        shouldReduceMotion
                                            ? {}
                                            : { scale: [1, 1.08, 1], opacity: [0.2, 0.3, 0.2] }
                                    }
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                />

                                <motion.div
                                    className="relative flex items-end"
                                    style={{
                                        rotateX: shouldReduceMotion ? 0 : shelfRotateX,
                                        rotateY: shouldReduceMotion ? 0 : shelfRotateY,
                                        transformStyle: "preserve-3d",
                                    }}
                                >
                                    {/* Spines drop in with a spring bounce, then idle-sway independently */}
                                    <div className="relative flex items-end gap-2 z-10">
                                        {spines.map((spine, i) => (
                                            <motion.div
                                                key={spine.title}
                                                animate={
                                                    shouldReduceMotion
                                                        ? {}
                                                        : { y: [0, -4, 0] }
                                                }
                                                transition={{
                                                    duration: 3.4 + i * 0.3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: shelfSettleDelay + i * 0.15,
                                                }}
                                            >
                                                <motion.div
                                                    className={`${spine.color} rounded-t-md rounded-b-sm shadow-lg cursor-pointer relative`}
                                                    style={{ width: spine.w, height: spine.h }}
                                                    initial={{
                                                        y: shouldReduceMotion ? 0 : -420,
                                                        opacity: shouldReduceMotion ? 1 : 0,
                                                        rotate: shouldReduceMotion ? 0 : i % 2 === 0 ? -10 : 10,
                                                    }}
                                                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 140,
                                                        damping: 13,
                                                        delay: shouldReduceMotion ? 0 : 0.5 + i * 0.12,
                                                    }}
                                                    whileHover={
                                                        shouldReduceMotion
                                                            ? {}
                                                            : {
                                                                y: -20,
                                                                rotate: i % 2 === 0 ? -3 : 3,
                                                                transition: { type: "spring", stiffness: 320, damping: 14 },
                                                            }
                                                    }
                                                >
                                                    <div className="absolute inset-x-0 top-3 h-px bg-white/30" />
                                                    <div className="absolute inset-x-0 bottom-3 h-px bg-white/30" />
                                                    <span
                                                        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/90 tracking-wide px-1 text-center select-none"
                                                        style={{ writingMode: "vertical-rl" }}
                                                    >
                                                        {spine.title}
                                                    </span>
                                                </motion.div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Shelf ledge — scales in once the books have landed */}
                                <motion.div
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-3 bg-stone-800 rounded-full"
                                    style={{ boxShadow: "0 16px 28px rgba(28,25,23,0.22)" }}
                                    initial={{ scaleX: shouldReduceMotion ? 1 : 0, opacity: shouldReduceMotion ? 1 : 0 }}
                                    animate={{ scaleX: 1, opacity: 1 }}
                                    transition={{ delay: shouldReduceMotion ? 0 : 0.25, duration: 0.5, ease: EASE_EDITORIAL }}
                                />

                                {/* Price tag — flips in once the shelf has settled */}
                                <motion.div
                                    className="absolute -top-2 right-2 bg-white border border-[#f0ede7] rounded-2xl px-3 py-2"
                                    initial={{ opacity: 0, scale: 0.6, rotate: 14 }}
                                    animate={{ opacity: 1, scale: 1, rotate: -4 }}
                                    transition={{
                                        delay: shouldReduceMotion ? 0.2 : shelfSettleDelay + 0.35,
                                        type: "spring",
                                        stiffness: 220,
                                        damping: 15,
                                    }}
                                    whileHover={{ scale: 1.06, rotate: 0, boxShadow: "0 14px 30px rgba(28,25,23,0.16)" }}
                                >
                                    <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide leading-none">Starting at</p>
                                    <p className="text-sm font-black text-stone-900 leading-none mt-1">৳150</p>
                                </motion.div>

                                {/* Floating badge — students count */}
                                <motion.div
                                    className="absolute bottom-6 -left-2 flex items-center gap-2 bg-white border border-[#f0ede7] rounded-2xl px-3 py-2"
                                    initial={{ opacity: 0, x: -14 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        y: shouldReduceMotion ? 0 : [0, 6, 0],
                                    }}
                                    transition={{
                                        opacity: { delay: shouldReduceMotion ? 0.2 : shelfSettleDelay + 0.5, duration: 0.5 },
                                        x: { delay: shouldReduceMotion ? 0.2 : shelfSettleDelay + 0.5, duration: 0.5 },
                                        y: { duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: shelfSettleDelay + 0.5 },
                                    }}
                                    whileHover={{ scale: 1.05, boxShadow: "0 14px 30px rgba(28,25,23,0.16)" }}
                                >
                                    <BookOpen size={14} className="text-stone-900" />
                                    <div>
                                        <p className="text-sm font-black text-stone-900 leading-none">12K+</p>
                                        <p className="text-[10px] text-stone-400 leading-none mt-0.5">books listed</p>
                                    </div>
                                </motion.div>
                            </div>

                        </div>
                    </div>

                </section>
            </div>

            {/* ━━━━ STATS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="bg-stone-50 py-12">
                <motion.div
                    className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={revealContainer}
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-200 rounded-2xl overflow-hidden shadow-sm">
                        {stats.map((stat) => (
                            <motion.div
                                key={stat.label}
                                variants={revealItem}
                                className="bg-white flex flex-col items-center justify-center py-8 gap-1"
                            >
                                <span className="text-3xl font-extrabold text-stone-900 tracking-tight">
                                    {"target" in stat ? (
                                        <AnimatedNumber target={stat.target} suffix={stat.suffix} decimals={stat.decimals} />
                                    ) : (
                                        stat.value
                                    )}
                                </span>
                                <span className="text-[11px] font-semibold text-stone-400 tracking-widest uppercase">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
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

                    <motion.div
                        className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        variants={revealContainer}
                    >
                        {categories.map(({ label, emoji, slug }) => (
                            <motion.div key={slug} variants={revealItem}>
                                <Link
                                    to={`/books?category=${slug}`}
                                    className="flex flex-col items-center gap-2 py-5 px-2 bg-white rounded-2xl border border-stone-100 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group h-full"
                                >
                                    <span className="text-2xl">{emoji}</span>
                                    <span className="text-[11px] font-semibold text-stone-500 group-hover:text-amber-600 transition-colors text-center leading-tight">
                                        {label}
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
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

                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-60px" }}
                            variants={revealContainer}
                        >
                            {recentProducts.map((product: IProduct) => {
                                const discountPercent = getDiscountPercent(product.price.basePrice, product.price.discountPrice);
                                const outOfStock = isOutOfStock(product);
                                const lowStock = isLowStock(product);
                                const remainingStock = getRemainingStock(product);

                                return (
                                    <motion.div key={product._id} variants={revealItem} whileHover={outOfStock ? {} : { y: -4 }}>
                                        <Link
                                            to={`/products/${product.slug}`}
                                            className={`group flex flex-col bg-stone-50 rounded-2xl border border-stone-100 hover:border-amber-200 hover:shadow-md transition-all duration-200 overflow-hidden ${outOfStock ? "pointer-events-none" : ""
                                                }`}
                                            aria-disabled={outOfStock}
                                        >
                                            {/* Image */}
                                            <div className="relative aspect-[3/4] bg-stone-200 overflow-hidden">
                                                {product.images?.[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.title}
                                                        className={`w-full h-full object-cover transition-transform duration-500 ${outOfStock ? "grayscale opacity-60" : "group-hover:scale-105"
                                                            }`}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <BookOpen size={24} className="text-stone-300" />
                                                    </div>
                                                )}

                                                {/* Type badge */}
                                                <span
                                                    className={`absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${product.productType === "Digital"
                                                        ? "bg-violet-500 text-white"
                                                        : "bg-white/90 text-stone-700"
                                                        }`}
                                                >
                                                    {product.productType === "Digital" ? "⚡ Digital" : "📦 Physical"}
                                                </span>

                                                {/* Discount badge */}
                                                {discountPercent && !outOfStock && (
                                                    <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-white shadow-sm">
                                                        -{discountPercent}%
                                                    </span>
                                                )}

                                                {/* Out of stock overlay */}
                                                {outOfStock && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900/30">
                                                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-white bg-stone-900/80 px-2.5 py-1 rounded-full">
                                                            <PackageX size={11} />
                                                            Out of Stock
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="p-3 flex flex-col gap-1">
                                                <p className="text-xs font-semibold text-stone-800 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                                                    {product.title}
                                                </p>

                                                {product.bookMetadata?.author ? (
                                                    <p className="text-[10px] text-stone-400 line-clamp-1">{product.bookMetadata.author}</p>
                                                ) : product.location ? (
                                                    <p className="text-[10px] text-stone-400 line-clamp-1 flex items-center gap-1">
                                                        <MapPin size={10} className="flex-shrink-0" />
                                                        <span className="truncate">{product.location}</span>
                                                    </p>
                                                ) : null}

                                                {/* Price */}
                                                {discountPercent ? (
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <p className="text-sm font-extrabold text-stone-900">
                                                            {formatPrice(product.price.discountPrice as number)}
                                                        </p>
                                                        <p className="text-[10px] text-stone-400 line-through">
                                                            {formatPrice(product.price.basePrice)}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-extrabold text-stone-900 mt-1">
                                                        {formatPrice(product.price.basePrice)}
                                                    </p>
                                                )}

                                                {/* Condition / negotiable / low-stock chips */}
                                                {(product.condition && product.condition !== "Digital Content") ||
                                                    product.price.isNegotiable ||
                                                    lowStock ? (
                                                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                                        {product.condition && product.condition !== "Digital Content" && (
                                                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500">
                                                                {product.condition}
                                                            </span>
                                                        )}
                                                        {product.price.isNegotiable && (
                                                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600">
                                                                Negotiable
                                                            </span>
                                                        )}
                                                        {lowStock && (
                                                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-red-50 text-red-500">
                                                                {remainingStock} left
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
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
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        variants={revealContainer}
                    >
                        {features.map(({ icon: Icon, title, desc }) => (
                            <motion.div
                                key={title}
                                variants={revealItem}
                                whileHover={{ y: -4 }}
                                className="group p-6 rounded-2xl bg-white hover:bg-stone-900 border border-stone-100 hover:border-stone-900 transition-colors duration-300 cursor-default"
                            >
                                <motion.div
                                    whileHover={{ rotate: -8, scale: 1.08 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 12 }}
                                    className="w-10 h-10 rounded-xl bg-stone-50 group-hover:bg-amber-500 shadow-sm flex items-center justify-center mb-4 transition-colors duration-300"
                                >
                                    <Icon size={18} className="text-stone-600 group-hover:text-white transition-colors duration-300" />
                                </motion.div>
                                <h3 className="text-sm font-bold text-stone-800 group-hover:text-white mb-1.5 transition-colors duration-300">
                                    {title}
                                </h3>
                                <p className="text-xs text-stone-500 group-hover:text-stone-400 leading-relaxed transition-colors duration-300">
                                    {desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ━━━━ SELL CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-16 bg-white border-t border-stone-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                        {/* Copy */}
                        <motion.div
                            initial={{ opacity: 0, x: -24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
                        >
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
                            <motion.ul
                                className="space-y-2.5 mb-8"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-80px" }}
                                variants={revealContainer}
                            >
                                {["Free to list — no hidden fees", "Platform handles shipping & payments", "Reach thousands of students nationwide"].map(item => (
                                    <motion.li key={item} variants={revealItem} className="flex items-center gap-2.5 text-sm text-stone-600">
                                        <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                            <Star size={10} className="text-amber-600 fill-amber-600" />
                                        </span>
                                        {item}
                                    </motion.li>
                                ))}
                            </motion.ul>

                            <MotionLink
                                to="/user/add-product"
                                whileHover={{ y: -3, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-900 font-bold rounded-2xl hover:shadow-xl text-sm"
                            >
                                <Package size={16} />
                                Start Selling Free
                                <ArrowRight size={15} />
                            </MotionLink>
                        </motion.div>

                        {/* Visual */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay: 0.1 }}
                        >
                            <motion.div
                                className="bg-stone-50 border border-stone-100 rounded-3xl p-3 shadow-xl"
                                initial={{ rotate: 1 }}
                                whileHover={{ rotate: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=900"
                                    alt="Student with books"
                                    className="w-full h-72 object-cover rounded-2xl"
                                />
                            </motion.div>
                            {/* Floating stat badge */}
                            <motion.div
                                className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-stone-100 px-5 py-3 flex items-center gap-3"
                                initial={{ opacity: 0, scale: 0.7, y: 12 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 220, damping: 16 }}
                            >
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <TrendingUp size={18} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-stone-400 font-semibold tracking-wide uppercase">This week</p>
                                    <p className="text-sm font-extrabold text-stone-900">248 new listings</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ━━━━ BOTTOM CTA BANNER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-16 bg-stone-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="relative overflow-hidden bg-amber-500 rounded-3xl px-8 py-16 text-center"
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
                    >
                        <motion.div
                            className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-amber-400/40"
                            animate={shouldReduceMotion ? {} : { scale: [1, 1.1, 1] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-amber-600/25"
                            animate={shouldReduceMotion ? {} : { scale: [1, 1.12, 1] }}
                            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        />
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
                                <MotionLink
                                    to="/books"
                                    whileHover={{ y: -3, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl hover:shadow-xl text-sm"
                                >
                                    Browse All Books
                                    <ArrowRight size={15} />
                                </MotionLink>
                                <MotionLink
                                    to="/signup"
                                    whileHover={{ y: -3, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/80 hover:bg-white text-stone-800 font-bold rounded-2xl text-sm"
                                >
                                    Join for Free
                                </MotionLink>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>

    );
};

export default Home;