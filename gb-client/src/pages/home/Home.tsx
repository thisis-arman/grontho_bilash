import {
    memo,
    useEffect,
    useRef,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";

import { useGetProductsQuery } from "../../redux/features/book/bookApi";
import { IProduct } from "../../types/interface";
import { TOOLS } from "../tools/toolsList";

/* ==========================================================================
   STATIC CONTENT
   ========================================================================== */

const heroFacts = [
    { value: "৳০", label: "লিস্টিং ফি, কোনো লুকানো চার্জ নেই" },
    { value: "৳৭০ থেকে", label: "ডেলিভারি চার্জ" },
    { value: "COD ও বিকাশ", label: "পেমেন্টের উপায়" },
    { value: "বই ও নোট", label: "ফিজিক্যাল এবং ডিজিটাল" },
];

const benefits = [
    {
        title: "নতুন বইয়ের চেয়ে কম খরচ",
        desc: "সিনিয়রদের ব্যবহার করা বই সরাসরি তাদের কাছ থেকে কেনো। একই বই, কম দাম।",
    },
    {
        title: "শেলফের বই থেকে আয়",
        desc: "পড়া শেষ? ছবি তুলে দাম বসিয়ে লিস্ট করো। লিস্টিং সম্পূর্ণ ফ্রি, কোনো লুকানো ফি নেই।",
    },
    {
        title: "ডেলিভারি নিয়ে ভাবতে হবে না",
        desc: "অর্ডার হলে শিপিং ও পেমেন্ট প্ল্যাটফর্মই সামলায়। ক্যাশ অন ডেলিভারি বা বিকাশ, যেটা তোমার সুবিধা।",
    },
    {
        title: "বইয়ের সাথে নোটও",
        desc: "ফিজিক্যাল বইয়ের পাশাপাশি ডিজিটাল নোট ও রিসোর্সও এক জায়গায় পাওয়া যায়।",
    },
];

const journeys = [
    {
        label: "কিনতে চাইলে",
        cta: { text: "বই খুঁজো", to: "/books" },
        steps: [
            { title: "খুঁজো", desc: "বইয়ের নাম, লেখক বা ক্যাটাগরি দিয়ে দরকারি বইটা বের করো।" },
            { title: "অর্ডার করো", desc: "ব্যাগে যোগ করে ঠিকানা দাও, ক্যাশ অন ডেলিভারি বা বিকাশ বেছে নাও।" },
            { title: "হাতে পাও", desc: "বই পৌঁছে যাবে তোমার ঠিকানায়। ড্যাশবোর্ড থেকে অর্ডারের অবস্থা দেখো।" },
        ],
    },
    {
        label: "বেচতে চাইলে",
        cta: { text: "বই লিস্ট করো", to: "/user/add-product" },
        steps: [
            { title: "অ্যাকাউন্ট খোলো", desc: "ইমেইল যাচাই করে ফ্রি অ্যাকাউন্ট বানাও।" },
            { title: "লিস্ট করো", desc: "বইয়ের ছবি, অবস্থা আর দাম দাও। কয়েক মিনিটের কাজ।" },
            { title: "বিক্রি করো", desc: "অর্ডার এলে শিপিং ও পেমেন্ট প্ল্যাটফর্ম সামলায়, তুমি টাকা বুঝে নাও।" },
        ],
    },
];

const categories = [
    { label: "একাডেমিক", slug: "Academic" },
    { label: "কল্পকাহিনী", slug: "Fiction" },
    { label: "বিজ্ঞান", slug: "Science" },
    { label: "প্রযুক্তি", slug: "Technology" },
    { label: "সেলফ-হেল্প", slug: "Self-Help" },
    { label: "ব্যবসা", slug: "Business" },
    { label: "ধর্মীয়", slug: "Religion" },
    { label: "শিশুতোষ", slug: "Children" },
];

const tools = TOOLS.map((tool) => ({
    title: tool.title,
    desc: tool.desc,
    to: tool.path,
}));

/* ==========================================================================
   HELPERS
   ========================================================================== */

const PRICE_FORMATTER = new Intl.NumberFormat("en-BD");
const BN_NUMBER_FORMATTER = new Intl.NumberFormat("bn-BD");

const formatPrice = (price: number) => `৳${PRICE_FORMATTER.format(price)}`;

// "০১", "০২" ... for section and row numbering.
const bnIndex = (n: number) =>
    BN_NUMBER_FORMATTER.format(n).padStart(2, "০");

// basePrice is what the buyer pays. discountPrice holds the earlier, higher
// price and is only worth showing (crossed out) when it really is higher.
const getOriginalPrice = (product: IProduct) => {
    const { basePrice, discountPrice } = product.price;
    return discountPrice > basePrice ? discountPrice : null;
};

const isOutOfStock = (product: IProduct) => {
    if (product.stockStatus === "Out of Stock") return true;
    if (product.productType === "Digital") return false;
    return (product.inventory?.quantity ?? 0) <= 0;
};

const optimizeCloudinaryImage = (url: string, width = 360) => {
    if (!url || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
        return url;
    }
    return url.replace(
        "/image/upload/",
        `/image/upload/f_auto,q_auto:eco,w_${width},c_limit/`
    );
};

const getProductImageSrcSet = (url: string) => {
    if (!url || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
        return undefined;
    }
    return [240, 360, 480]
        .map((w) => `${optimizeCloudinaryImage(url, w)} ${w}w`)
        .join(", ");
};

// Defers the listings request until the section is close to the viewport,
// so it does not compete with the hero on first load.
const useNearViewport = <T extends HTMLElement>(rootMargin = "700px") => {
    const ref = useRef<T | null>(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        if (shouldLoad) return;
        const element = ref.current;
        if (!element) return;

        if (!("IntersectionObserver" in window)) {
            setShouldLoad(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin, threshold: 0 }
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [rootMargin, shouldLoad]);

    return { ref, shouldLoad };
};

/* ==========================================================================
   SHARED PIECES
   ========================================================================== */

const container = "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12";

const EASE = [0.22, 1, 0.36, 1] as const;

// Fade-and-rise on scroll. Renders plain markup when the visitor prefers
// reduced motion.
const Reveal = ({
    children,
    delay = 0,
    className,
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) => {
    const reduceMotion = useReducedMotion();

    if (reduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay }}
        >
            {children}
        </motion.div>
    );
};

const SectionHeader = ({
    index,
    eyebrow,
    title,
    action,
}: {
    index: number;
    eyebrow: string;
    title: ReactNode;
    action?: ReactNode;
}) => (
    <Reveal className="mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
            <p className="mb-4 flex items-center gap-3 text-sm text-stone-400">
                <span className="font-display text-amber-400">{bnIndex(index)}</span>
                <span className="h-px w-8 bg-white/20" aria-hidden="true" />
                {eyebrow}
            </p>
            <h2 className="max-w-3xl font-display text-3xl font-bold leading-[1.25] text-stone-50 sm:text-4xl lg:text-5xl lg:leading-[1.2]">
                {title}
            </h2>
        </div>
        {action}
    </Reveal>
);

const TextLink = ({ to, children }: { to: string; children: ReactNode }) => (
    <Link
        to={to}
        className="group inline-flex flex-shrink-0 items-center gap-2 border-b border-white/20 pb-1 text-sm font-semibold text-stone-200 transition-colors duration-200 hover:border-amber-400 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
        {children}
        <ArrowRight
            size={15}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1"
        />
    </Link>
);

const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-bold text-stone-950 transition duration-200 hover:bg-amber-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950";

const ghostButton =
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-bold text-stone-100 transition duration-200 hover:border-amber-400 hover:text-amber-400 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";

/* ==========================================================================
   HERO
   ========================================================================== */

const HeroSearch = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;
        navigate(`/books?search=${encodeURIComponent(query)}`);
    };

    return (
        <form
            onSubmit={handleSearch}
            role="search"
            className="flex w-full max-w-xl items-center gap-3 border-b border-white/25 pb-3 transition-colors duration-200 focus-within:border-amber-400"
        >
            <Search size={20} aria-hidden="true" className="flex-shrink-0 text-stone-500" />
            <label htmlFor="hero-search" className="sr-only">
                বই খুঁজো
            </label>
            <input
                id="hero-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="বই, লেখক বা বিষয় লিখে খুঁজো"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-0 sm:text-lg"
            />
            <button
                type="submit"
                aria-label="খুঁজো"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-stone-950 transition duration-200 hover:bg-amber-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
                <ArrowRight size={18} aria-hidden="true" />
            </button>
        </form>
    );
};

const HeroSection = () => (
    <section className="relative overflow-hidden">
        {/* Soft amber glow; purely decorative. */}
        <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-amber-500/10 blur-3xl"
        />

        <div className={`${container} relative pb-16 pt-14 sm:pb-24 sm:pt-20 lg:pt-28`}>
            <Reveal>
                <p className="mb-6 flex items-center gap-3 text-sm text-stone-400 sm:mb-8">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                    পুরনো বই ও ডিজিটাল নোটের মার্কেটপ্লেস · বাংলাদেশ
                </p>
            </Reveal>

            <Reveal delay={0.05}>
                <h1 className="font-display text-[clamp(2.6rem,9.5vw,7.5rem)] font-extrabold leading-[1.12] tracking-tight text-stone-50">
                    কম দামে বই কেনো।
                    <br />
                    পড়া শেষে{" "}
                    <span className="text-amber-400">বেচে দাও।</span>
                </h1>
            </Reveal>

            <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
                <Reveal delay={0.12} className="lg:col-span-6">
                    <p className="max-w-xl text-base leading-relaxed text-stone-400 sm:text-lg">
                        গ্রন্থবিলাসে শিক্ষার্থীরা একে অপরের কাছ থেকে পুরনো বই ও নোট
                        কেনে-বেচে। নতুন বইয়ের খরচ কমাও, আর পড়ে শেষ করা বই থেকে টাকা
                        ফেরত আনো।
                    </p>
                </Reveal>

                <Reveal delay={0.18} className="flex flex-col gap-8 lg:col-span-6">
                    <HeroSearch />
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link to="/books" className={primaryButton}>
                            সব বই দেখো
                            <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                        <Link to="/user/add-product" className={ghostButton}>
                            বই বিক্রি করো
                        </Link>
                    </div>
                </Reveal>
            </div>

            <Reveal delay={0.24}>
                {/* 1px gaps over a tinted background draw the hairlines, so the
                    dividers stay correct at every column count. */}
                <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:mt-24 lg:grid-cols-4">
                    {heroFacts.map((fact) => (
                        <div
                            key={fact.label}
                            className="flex flex-col-reverse justify-end gap-1 bg-stone-950 p-5 sm:p-7"
                        >
                            <dt className="text-sm leading-snug text-stone-500">{fact.label}</dt>
                            <dd className="font-display text-xl font-bold text-stone-50 sm:text-2xl">
                                {fact.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </Reveal>
        </div>
    </section>
);

/* ==========================================================================
   CATEGORY TICKER
   ========================================================================== */

const CategoryTicker = () => {
    // Rendered twice so the CSS loop is seamless; the copy is hidden from
    // assistive tech.
    const row = (hidden: boolean) => (
        <ul
            aria-hidden={hidden || undefined}
            className="gb-marquee__track flex flex-shrink-0 items-center"
        >
            {categories.map((category) => (
                <li key={category.slug} className="flex items-center">
                    <Link
                        to={`/books?category=${encodeURIComponent(category.slug)}`}
                        tabIndex={hidden ? -1 : undefined}
                        className="px-6 font-display text-3xl font-bold text-stone-700 transition-colors duration-200 hover:text-amber-400 sm:px-10 sm:text-5xl"
                    >
                        {category.label}
                    </Link>
                    <span className="h-2 w-2 rounded-full bg-amber-400/70" aria-hidden="true" />
                </li>
            ))}
        </ul>
    );

    return (
        <div className="gb-marquee flex overflow-hidden border-y border-white/10 py-6 sm:py-8">
            {row(false)}
            {row(true)}
        </div>
    );
};

/* ==========================================================================
   RECENT LISTINGS
   ========================================================================== */

const ProductCard = memo(({ product }: { product: IProduct }) => {
    const image = product.images?.[0] || "";
    const originalPrice = getOriginalPrice(product);
    const outOfStock = isOutOfStock(product);
    // Some listings point at images that no longer exist; show the plain
    // tile instead of the browser's broken-image icon.
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <article>
            <Link
                to={`/products/${product.slug}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-4 focus-visible:ring-offset-stone-950"
            >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-900">
                    {image && !imageFailed && (
                        <img
                            onError={() => setImageFailed(true)}
                            src={optimizeCloudinaryImage(image, 360)}
                            srcSet={getProductImageSrcSet(image)}
                            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 200px"
                            width={360}
                            height={480}
                            loading="lazy"
                            decoding="async"
                            alt={product.title}
                            className={`h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04] ${
                                outOfStock ? "opacity-40 grayscale" : ""
                            }`}
                        />
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-stone-950/80 px-2.5 py-1 text-[11px] font-semibold text-stone-200 backdrop-blur">
                        {outOfStock
                            ? "স্টক শেষ"
                            : product.productType === "Digital"
                              ? "ডিজিটাল"
                              : product.condition}
                    </span>
                </div>

                <h3 className="mt-4 line-clamp-2 text-sm font-semibold leading-snug text-stone-100 transition-colors duration-200 group-hover:text-amber-400">
                    {product.title}
                </h3>

                {product.bookMetadata?.author && (
                    <p className="mt-1 line-clamp-1 text-xs text-stone-500">
                        {product.bookMetadata.author}
                    </p>
                )}

                <p className="mt-2 flex items-baseline gap-2 font-display text-base font-bold text-stone-50">
                    {formatPrice(product.price.basePrice)}
                    {originalPrice !== null && (
                        <span className="text-xs font-normal text-stone-500 line-through">
                            {formatPrice(originalPrice)}
                        </span>
                    )}
                </p>
            </Link>
        </article>
    );
});

ProductCard.displayName = "ProductCard";

const listingsGrid = "grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-6";

const RecentListingsSection = () => {
    const { ref, shouldLoad } = useNearViewport<HTMLElement>();

    const { data: productsRes, isLoading, isFetching, isError, refetch } =
        useGetProductsQuery(
            { limit: 6, sortBy: "createdAt", sortOrder: "desc" },
            { skip: !shouldLoad }
        );

    const recentProducts: IProduct[] = productsRes?.data?.data ?? [];
    const total: number | undefined = productsRes?.data?.meta?.total;

    const showSkeletons =
        !shouldLoad || isLoading || (isFetching && recentProducts.length === 0);

    return (
        <section ref={ref} className={`${container} py-20 sm:py-28`}>
            <SectionHeader
                index={3}
                eyebrow="নতুন সংযোজন"
                title={
                    total && total > 6 ? (
                        <>
                            এখন তালিকায় আছে{" "}
                            <span className="text-amber-400">
                                {BN_NUMBER_FORMATTER.format(total)}টি
                            </span>{" "}
                            বই
                        </>
                    ) : (
                        "সদ্য তালিকাভুক্ত বই"
                    )
                }
                action={<TextLink to="/books">সব বই দেখো</TextLink>}
            />

            {isError ? (
                <div className="rounded-3xl border border-white/10 px-6 py-12 text-center">
                    <p className="mb-5 text-stone-400">
                        নতুন বইগুলো এখন লোড করা যাচ্ছে না।
                    </p>
                    <button type="button" onClick={() => refetch()} className={ghostButton}>
                        আবার চেষ্টা করো
                    </button>
                </div>
            ) : showSkeletons ? (
                <div aria-label="বই লোড হচ্ছে" className={listingsGrid}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} aria-hidden="true">
                            <div className="aspect-[3/4] animate-pulse rounded-2xl bg-stone-900" />
                            <div className="mt-4 h-3 w-4/5 rounded bg-stone-900" />
                            <div className="mt-2 h-3 w-1/3 rounded bg-stone-900" />
                        </div>
                    ))}
                </div>
            ) : recentProducts.length > 0 ? (
                <div className={listingsGrid}>
                    {recentProducts.map((product, i) => (
                        <Reveal key={product._id} delay={i * 0.05}>
                            <ProductCard product={product} />
                        </Reveal>
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border border-white/10 px-6 py-12 text-center">
                    <p className="mb-5 text-stone-400">
                        এখনো কোনো বই তালিকাভুক্ত হয়নি। প্রথম বইটা তুমিই লিস্ট করো।
                    </p>
                    <Link to="/user/add-product" className={primaryButton}>
                        বই লিস্ট করো
                    </Link>
                </div>
            )}
        </section>
    );
};

/* ==========================================================================
   BENEFITS
   ========================================================================== */

const BenefitsSection = () => (
    <section className={`${container} py-20 sm:py-28`}>
        <SectionHeader
            index={1}
            eyebrow="কেন গ্রন্থবিলাস"
            title={
                <>
                    বই কেনাবেচায় তোমার{" "}
                    <span className="text-amber-400">চারটা সুবিধা</span>
                </>
            }
        />

        <div className="grid border-t border-white/10 md:grid-cols-2">
            {benefits.map((benefit, i) => (
                <Reveal
                    key={benefit.title}
                    delay={(i % 2) * 0.08}
                    className={`group border-b border-white/10 py-9 sm:py-12 ${
                        i % 2 === 0 ? "md:border-r md:pr-12" : "md:pl-12"
                    }`}
                >
                    <span className="font-display text-sm text-stone-600 transition-colors duration-300 group-hover:text-amber-400">
                        {bnIndex(i + 1)}
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-bold leading-snug text-stone-50 sm:text-3xl">
                        {benefit.title}
                    </h3>
                    <p className="mt-3 max-w-md leading-relaxed text-stone-400">
                        {benefit.desc}
                    </p>
                </Reveal>
            ))}
        </div>
    </section>
);

/* ==========================================================================
   HOW IT WORKS
   ========================================================================== */

const HowItWorksSection = () => (
    <section className="border-y border-white/10 bg-stone-900/40">
        <div className={`${container} py-20 sm:py-28`}>
            <SectionHeader
                index={2}
                eyebrow="কীভাবে কাজ করে"
                title="তিন ধাপে কেনা, তিন ধাপে বেচা"
            />

            <div className="grid gap-6 lg:grid-cols-2">
                {journeys.map((journey, j) => (
                    <Reveal
                        key={journey.label}
                        delay={j * 0.1}
                        className="flex flex-col rounded-3xl border border-white/10 bg-stone-950 p-7 sm:p-10"
                    >
                        <p className="mb-8 inline-flex w-fit items-center rounded-full border border-amber-400/30 px-4 py-1.5 text-sm font-semibold text-amber-400">
                            {journey.label}
                        </p>

                        <ol className="flex-1">
                            {journey.steps.map((step, i) => (
                                <li
                                    key={step.title}
                                    className="flex gap-5 border-t border-white/10 py-6 first:border-t-0 first:pt-0"
                                >
                                    <span className="font-display text-sm text-stone-600">
                                        {bnIndex(i + 1)}
                                    </span>
                                    <div>
                                        <h3 className="font-display text-xl font-bold text-stone-50">
                                            {step.title}
                                        </h3>
                                        <p className="mt-1.5 leading-relaxed text-stone-400">
                                            {step.desc}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-4">
                            <TextLink to={journey.cta.to}>{journey.cta.text}</TextLink>
                        </div>
                    </Reveal>
                ))}
            </div>
        </div>
    </section>
);



/* ==========================================================================
   CATEGORIES
   ========================================================================== */

const CategoriesSection = () => (
    <section className="border-t border-white/10">
        <div className={`${container} py-20 sm:py-28`}>
            <SectionHeader
                index={4}
                eyebrow="অন্বেষণ করো"
                title="যে ধরনের বই খুঁজছ"
            />

            <ul className="grid border-t border-white/10 md:grid-cols-2 md:gap-x-12">
                {categories.map((category, i) => (
                    <li key={category.slug}>
                        <Link
                            to={`/books?category=${encodeURIComponent(category.slug)}`}
                            className="group flex items-center gap-5 border-b border-white/10 py-5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:py-6"
                        >
                            <span className="font-display text-sm text-stone-600">
                                {bnIndex(i + 1)}
                            </span>
                            <span className="flex-1 font-display text-2xl font-bold text-stone-200 transition duration-300 ease-out group-hover:translate-x-2 group-hover:text-amber-400 sm:text-3xl">
                                {category.label}
                            </span>
                            <ArrowUpRight
                                size={22}
                                aria-hidden="true"
                                className="text-stone-600 transition duration-300 group-hover:rotate-45 group-hover:text-amber-400"
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    </section>
);

/* ==========================================================================
   FREE TOOLS
   ========================================================================== */

const ToolsSection = () => (
    <section className="border-t border-white/10 bg-stone-900/40">
        <div className={`${container} py-20 sm:py-28`}>
            <SectionHeader
                index={5}
                eyebrow="ফ্রি টুলস"
                title="শুধু বই না, পড়াশোনার কাজের জিনিসও"
                action={<TextLink to="/tools">সব টুলস দেখো</TextLink>}
            />

            <div className="grid gap-6 md:grid-cols-2">
                {tools.map((tool, i) => (
                    <Reveal key={tool.to} delay={(i % 2) * 0.1}>
                        <Link
                            to={tool.to}
                            className="group flex h-full flex-col justify-between gap-10 rounded-3xl border border-white/10 bg-stone-950 p-7 transition-colors duration-300 hover:border-amber-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:p-10"
                        >
                            <div>
                                <h3 className="font-display text-2xl font-bold text-stone-50 sm:text-3xl">
                                    {tool.title}
                                </h3>
                                <p className="mt-3 max-w-md leading-relaxed text-stone-400">
                                    {tool.desc}
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-300 transition-colors duration-200 group-hover:text-amber-400">
                                খুলে দেখো
                                <ArrowUpRight
                                    size={16}
                                    aria-hidden="true"
                                    className="transition-transform duration-300 group-hover:rotate-45"
                                />
                            </span>
                        </Link>
                    </Reveal>
                ))}
            </div>
        </div>
    </section>
);

/* ==========================================================================
   CLOSING CTA
   ========================================================================== */

const ClosingSection = () => (
    <section className="relative overflow-hidden border-t border-white/10">
        <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-48 left-1/2 h-[30rem] w-[50rem] max-w-none -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"
        />

        <div className={`${container} relative py-24 text-center sm:py-36`}>
            <Reveal>
                <h2 className="mx-auto max-w-5xl font-display text-[clamp(2rem,6.5vw,5rem)] font-extrabold leading-[1.2] tracking-tight text-stone-50">
                    তোমার পড়া শেষ বইটা,
                    <br />
                    <span className="text-amber-400">কারও পরের সেমিস্টার।</span>
                </h2>
            </Reveal>

            <Reveal delay={0.1}>
                <p className="mx-auto mt-6 max-w-xl leading-relaxed text-stone-400 sm:text-lg">
                    ফ্রি অ্যাকাউন্ট খুলে আজই প্রথম বইটা লিস্ট করো, অথবা দরকারি বইটা
                    কম দামে খুঁজে নাও।
                </p>
            </Reveal>

            <Reveal delay={0.16} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/user/add-product" className={primaryButton}>
                    ফ্রিতে বিক্রি শুরু করো
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/books" className={ghostButton}>
                    বই দেখো
                </Link>
            </Reveal>
        </div>
    </section>
);

/* ==========================================================================
   HOME
   ========================================================================== */

const Home = () => (
    // scheme-flip: this page is designed dark, so it shows as designed at
    // night and in its light mirror by day.
    <main className="scheme-flip bg-stone-950 font-sans text-stone-100 antialiased">
        <HeroSection />
        <RecentListingsSection />
        <CategoryTicker />
        <BenefitsSection />
        <HowItWorksSection />
        <CategoriesSection />
        <ToolsSection />
        <ClosingSection />
    </main>
);

export default Home;
