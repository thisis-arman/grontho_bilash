import {
    memo,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    ArrowRight,
    BookOpen,
    ShieldCheck,
    Users,
    Zap,
    Search,
    ChevronRight,
    MapPin,
    PackageX,
    Star,
    TrendingUp,
    Package,
} from "lucide-react";

import { useGetProductsQuery } from "../../redux/features/book/bookApi";
import { IProduct } from "../../types/interface";

/* ==========================================================================
   STATIC DATA
   ========================================================================== */

const features = [
    {
        icon: BookOpen,
        title: "ফিজিক্যাল ও ডিজিটাল",
        desc: "পুরনো বই কেনো অথবা সাথে সাথে ডিজিটাল কপি ডাউনলোড করো।",
    },
    {
        icon: ShieldCheck,
        title: "নিরাপদ লেনদেন",
        desc: "প্রতিটি অর্ডারে প্ল্যাটফর্ম-নিয়ন্ত্রিত শিপিং ও নিরাপদ পেমেন্ট।",
    },
    {
        icon: Zap,
        title: "সহজ লিস্টিং",
        desc: "২ মিনিটের মধ্যে বই লিস্ট করো, হাজারো শিক্ষার্থীর কাছে পৌঁছাও।",
    },
    {
        icon: Users,
        title: "শিক্ষার্থীদের কমিউনিটি",
        desc: "বাংলাদেশের প্রতিটি প্রতিষ্ঠানের শিক্ষার্থীদের জন্য, শিক্ষার্থীদের তৈরি।",
    },
];

const categories = [
    { label: "একাডেমিক", emoji: "🎓", slug: "Academic" },
    { label: "কল্পকাহিনী", emoji: "📖", slug: "Fiction" },
    { label: "বিজ্ঞান", emoji: "🔬", slug: "Science" },
    { label: "প্রযুক্তি", emoji: "💻", slug: "Technology" },
    { label: "সেলফ-হেল্প", emoji: "🌱", slug: "Self-Help" },
    { label: "ব্যবসা", emoji: "📊", slug: "Business" },
    { label: "ধর্মীয়", emoji: "🕌", slug: "Religion" },
    { label: "শিশুতোষ", emoji: "🧸", slug: "Children" },
];

const spines = [
    {
        title: "Atomic Habits",
        color: "bg-amber-400",
        height: 176,
        width: 38,
        rotate: -2,
    },
    {
        title: "Clean Code",
        color: "bg-sky-500",
        height: 204,
        width: 34,
        rotate: 1,
    },
    {
        title: "Calculus Vol. II",
        color: "bg-emerald-500",
        height: 150,
        width: 42,
        rotate: -1,
    },
    {
        title: "Physics Fundamentals",
        color: "bg-rose-400",
        height: 190,
        width: 38,
        rotate: 2,
    },
    {
        title: "Deep Work",
        color: "bg-orange-400",
        height: 216,
        width: 38,
        rotate: -1,
    },
    {
        title: "Zero to One",
        color: "bg-teal-500",
        height: 136,
        width: 34,
        rotate: 1,
    },
];

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

const PRICE_FORMATTER = new Intl.NumberFormat("en-BD");

const belowFoldStyle: CSSProperties = {
    contentVisibility: "auto",
    containIntrinsicSize: "1px 700px",
};

/* ==========================================================================
   HELPERS
   ========================================================================== */

const formatPrice = (price: number) => {
    return `৳${PRICE_FORMATTER.format(price)}`;
};

const getDiscountPercent = (
    basePrice: number,
    discountPrice?: number
) => {
    if (
        !discountPrice ||
        discountPrice <= 0 ||
        discountPrice >= basePrice
    ) {
        return null;
    }

    return Math.round(
        ((basePrice - discountPrice) / basePrice) * 100
    );
};

const getRemainingStock = (product: IProduct) => {
    const quantity = product.inventory?.quantity ?? 0;
    const sold = product.inventory?.soldCount ?? 0;

    return quantity - sold;
};

const isOutOfStock = (product: IProduct) => {
    if (
        product.stockStatus &&
        product.stockStatus !== "In Stock"
    ) {
        return true;
    }

    if (product.productType === "Digital") {
        return false;
    }

    return getRemainingStock(product) <= 0;
};

const isLowStock = (product: IProduct) => {
    if (
        product.productType === "Digital" ||
        isOutOfStock(product)
    ) {
        return false;
    }

    const remaining = getRemainingStock(product);

    return remaining > 0 && remaining <= 3;
};

/* ==========================================================================
   CLOUDINARY IMAGE OPTIMIZER

   Example:

   Original:
   https://res.cloudinary.com/xxx/image/upload/book.jpg

   Output:
   https://res.cloudinary.com/xxx/image/upload/f_auto,q_auto:eco,w_360,c_limit/book.jpg
   ========================================================================== */

const optimizeCloudinaryImage = (
    url: string,
    width = 360
) => {
    if (!url) {
        return url;
    }

    if (
        !url.includes("res.cloudinary.com") ||
        !url.includes("/image/upload/")
    ) {
        return url;
    }

    return url.replace(
        "/image/upload/",
        `/image/upload/f_auto,q_auto:eco,w_${width},c_limit/`
    );
};

const getProductImageSrcSet = (url: string) => {
    if (
        !url ||
        !url.includes("res.cloudinary.com") ||
        !url.includes("/image/upload/")
    ) {
        return undefined;
    }

    return [
        `${optimizeCloudinaryImage(url, 240)} 240w`,
        `${optimizeCloudinaryImage(url, 360)} 360w`,
        `${optimizeCloudinaryImage(url, 480)} 480w`,
    ].join(", ");
};

/* ==========================================================================
   NEAR-VIEWPORT HOOK

   Prevents Recent Listings API from competing with the hero during the
   initial page load.

   The request starts before the section actually becomes visible.
   ========================================================================== */

const useNearViewport = <T extends HTMLElement>(
    rootMargin = "700px"
) => {
    const ref = useRef<T | null>(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        if (shouldLoad) {
            return;
        }

        const element = ref.current;

        if (!element) {
            return;
        }

        if (
            typeof window === "undefined" ||
            !("IntersectionObserver" in window)
        ) {
            setShouldLoad(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                if (entry?.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            {
                root: null,
                rootMargin,
                threshold: 0,
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [rootMargin, shouldLoad]);

    return {
        ref,
        shouldLoad,
    };
};

/* ==========================================================================
   SECTION LABEL
   ========================================================================== */

const SectionLabel = ({
    text,
}: {
    text: string;
}) => {
    return (
        <p className="mb-2 text-xs font-semibold tracking-wide text-amber-600">
            {text}
        </p>
    );
};

/* ==========================================================================
   SEARCH

   IMPORTANT:
   Search state lives here instead of Home.

   Typing now rerenders only this component rather than the complete homepage.
   ========================================================================== */

const HeroSearch = () => {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] =
        useState("");

    const handleSearch = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const query = searchQuery.trim();

        if (!query) {
            return;
        }

        navigate(
            `/books?search=${encodeURIComponent(query)}`
        );
    };

    return (
        <form
            onSubmit={handleSearch}
            role="search"
            className="mb-6 flex max-w-md items-center gap-2"
        >
            <div className="relative flex-1">
                <Search
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                />

                <label
                    htmlFor="home-book-search"
                    className="sr-only"
                >
                    বই বা লেখক খুঁজুন
                </label>

                <input
                    id="home-book-search"
                    type="search"
                    autoComplete="off"
                    enterKeyHint="search"
                    value={searchQuery}
                    onChange={(event) =>
                        setSearchQuery(
                            event.target.value
                        )
                    }
                    placeholder="বই, লেখক খুঁজুন..."
                    className="
                        w-full
                        rounded-xl
                        border
                        border-stone-200
                        bg-white
                        py-3.5
                        pl-10
                        pr-4
                        text-sm
                        text-stone-800
                        outline-none
                        transition-colors
                        duration-150
                        placeholder:text-stone-400
                        hover:border-stone-300
                        focus:border-amber-400
                        focus:ring-2
                        focus:ring-amber-500/15
                    "
                />
            </div>

            <button
                type="submit"
                aria-label="Search books"
                className="
                    flex
                    h-12
                    w-12
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-stone-900
                    text-white
                    transition-colors
                    duration-150
                    hover:bg-amber-500
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-amber-500
                    focus-visible:ring-offset-2
                "
            >
                <ArrowRight
                    size={16}
                    aria-hidden="true"
                />
            </button>
        </form>
    );
};

/* ==========================================================================
   HERO
   ========================================================================== */

const HeroSection = () => {
    return (
        <section
            className="
                relative
                isolate
                overflow-hidden
                bg-[#fdf9f4]
            "
        >
            {/* Lightweight static background */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    opacity-60
                "
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(231,229,228,.55) 1px, transparent 1px), linear-gradient(to bottom, rgba(231,229,228,.55) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Static radial gradients. No animated blur. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(circle at 82% 70%, rgba(245,158,11,.18), transparent 28%), radial-gradient(circle at 12% 5%, rgba(168,162,158,.13), transparent 24%), linear-gradient(to bottom, rgba(253,249,244,.15), #fdf9f4 95%)",
                }}
            />

            <div
                className="
                    relative
                    mx-auto
                    grid
                    max-w-7xl
                    grid-cols-1
                    items-center
                    gap-12
                    px-4
                    py-14
                    sm:px-6
                    sm:py-16
                    lg:grid-cols-2
                    lg:px-8
                    lg:py-20
                "
            >
                {/* ======================================================
                    HERO CONTENT
                   ====================================================== */}

                <div>
                    <h1
                        className="
                            mb-6
                            max-w-2xl
                            font-display
                            text-5xl
                            font-bold
                            leading-[1.12]
                            tracking-tight
                            text-stone-900
                            lg:text-6xl
                            xl:text-7xl
                        "
                    >
                        বই কেনো, বই বেচো,{" "}
                        <span className="relative inline-block text-amber-500">
                            কম দামে।
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 200 8"
                                fill="none"
                                className="absolute -bottom-1 left-0 w-full"
                            >
                                <path
                                    d="M2 6C40 2 80 1 100 3C120 5 160 6 198 2"
                                    stroke="#f59e0b"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </span>
                    </h1>

                    <p
                        className="
                            mb-3
                            max-w-md
                            text-lg
                            leading-relaxed
                            text-stone-500
                        "
                    >
                        বাংলাদেশের পুরনো বই ও
                        ডিজিটাল নোটের মার্কেটপ্লেস।
                        ইতিমধ্যে ৪,৮০০+ শিক্ষার্থী
                        এখানে সাশ্রয় করছে।
                    </p>

                    <Link
                        to="/books?type=Digital"
                        className="
                            mb-8
                            inline-flex
                            items-center
                            gap-1.5
                            text-xs
                            font-bold
                            text-amber-700
                            transition-colors
                            duration-150
                            hover:text-amber-800
                        "
                    >
                        নতুন — সাথে সাথে ডিজিটাল
                        ডাউনলোড

                        <ChevronRight
                            size={12}
                            aria-hidden="true"
                        />
                    </Link>

                    <HeroSearch />

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/books"
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-stone-900
                                px-5
                                py-2.5
                                text-sm
                                font-bold
                                text-white
                                shadow-sm
                                transition
                                duration-150
                                hover:-translate-y-0.5
                                hover:bg-stone-800
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-stone-900
                                focus-visible:ring-offset-2
                            "
                        >
                            সব বই দেখো

                            <ArrowRight
                                size={14}
                                aria-hidden="true"
                            />
                        </Link>

                        <Link
                            to="/user/add-product"
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-stone-300
                                px-5
                                py-2.5
                                text-sm
                                font-bold
                                text-stone-700
                                transition
                                duration-150
                                hover:-translate-y-0.5
                                hover:border-stone-900
                                hover:text-stone-900
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-stone-900
                                focus-visible:ring-offset-2
                            "
                        >
                            <Zap
                                size={14}
                                aria-hidden="true"
                            />

                            বই বিক্রি করো
                        </Link>
                    </div>
                </div>

                {/* ======================================================
                    BOOKSHELF

                    Pure CSS. No mousemove, spring or infinite animation.
                   ====================================================== */}

                <div
                    aria-hidden="true"
                    className="
                        relative
                        hidden
                        min-h-[380px]
                        items-end
                        justify-center
                        lg:flex
                    "
                >
                    <div
                        className="
                            pointer-events-none
                            absolute
                            bottom-8
                            h-80
                            w-80
                            rounded-full
                        "
                        style={{
                            background:
                                "radial-gradient(circle, rgba(245,158,11,.22), rgba(245,158,11,0) 68%)",
                        }}
                    />

                    <div className="relative flex items-end">
                        <div className="relative z-10 flex items-end gap-2">
                            {spines.map(
                                (spine) => (
                                    <div
                                        key={
                                            spine.title
                                        }
                                        className={`
                                            ${spine.color}
                                            relative
                                            cursor-default
                                            rounded-b-sm
                                            rounded-t-md
                                            shadow-lg
                                            transition-transform
                                            duration-200
                                            hover:-translate-y-3
                                        `}
                                        style={{
                                            width: spine.width,
                                            height: spine.height,
                                            transform: `rotate(${spine.rotate}deg)`,
                                        }}
                                    >
                                        <div className="absolute inset-x-0 top-3 h-px bg-white/30" />

                                        <div className="absolute inset-x-0 bottom-3 h-px bg-white/30" />

                                        <span
                                            className="
                                                absolute
                                                inset-0
                                                flex
                                                select-none
                                                items-center
                                                justify-center
                                                px-1
                                                text-center
                                                text-[9px]
                                                font-bold
                                                tracking-wide
                                                text-white/90
                                            "
                                            style={{
                                                writingMode:
                                                    "vertical-rl",
                                            }}
                                        >
                                            {
                                                spine.title
                                            }
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Shelf ledge */}
                    <div
                        className="
                            absolute
                            bottom-0
                            left-1/2
                            h-3
                            w-[300px]
                            -translate-x-1/2
                            rounded-full
                            bg-stone-800
                        "
                        style={{
                            boxShadow:
                                "0 16px 28px rgba(28,25,23,.18)",
                        }}
                    />

                    {/* Price card */}
                    <div
                        className="
                            absolute
                            right-4
                            top-5
                            rounded-2xl
                            border
                            border-stone-200
                            bg-white
                            px-3
                            py-2
                            shadow-sm
                        "
                    >
                        <p className="text-[10px] font-semibold leading-none text-stone-400">
                            শুরু মাত্র
                        </p>

                        <p className="mt-1 text-sm font-black leading-none text-stone-900">
                            ৳150
                        </p>
                    </div>

                    {/* Book count */}
                    <div
                        className="
                            absolute
                            bottom-6
                            left-0
                            flex
                            items-center
                            gap-2
                            rounded-2xl
                            border
                            border-stone-200
                            bg-white
                            px-3
                            py-2
                            shadow-sm
                        "
                    >
                        <BookOpen
                            size={14}
                            className="text-stone-900"
                        />

                        <div>
                            <p className="text-sm font-black leading-none text-stone-900">
                                ১২,০০০+
                            </p>

                            <p className="mt-0.5 text-[10px] leading-none text-stone-400">
                                তালিকাভুক্ত বই
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ==========================================================================
   CATEGORIES
   ========================================================================== */

const CategoriesSection = () => {
    return (
        <section
            className="bg-stone-50 py-14 sm:py-16"
            style={belowFoldStyle}
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <SectionLabel text="অন্বেষণ করো" />

                        <h2 className="font-display text-2xl font-bold text-stone-900">
                            ক্যাটাগরি অনুযায়ী ব্রাউজ
                            করো
                        </h2>
                    </div>

                    <Link
                        to="/books"
                        className="
                            flex
                            flex-shrink-0
                            items-center
                            gap-1
                            text-sm
                            font-semibold
                            text-stone-500
                            transition-colors
                            duration-150
                            hover:text-amber-600
                        "
                    >
                        সব দেখো

                        <ArrowRight
                            size={14}
                            aria-hidden="true"
                        />
                    </Link>
                </div>

                <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
                    {categories.map(
                        ({
                            label,
                            emoji,
                            slug,
                        }) => (
                            <Link
                                key={slug}
                                to={`/books?category=${encodeURIComponent(
                                    slug
                                )}`}
                                className="
                                    group
                                    flex
                                    h-full
                                    flex-col
                                    items-center
                                    gap-2
                                    rounded-2xl
                                    border
                                    border-stone-100
                                    bg-white
                                    px-2
                                    py-5
                                    transition
                                    duration-150
                                    hover:-translate-y-0.5
                                    hover:border-amber-300
                                    hover:shadow-sm
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-amber-400
                                "
                            >
                                <span
                                    aria-hidden="true"
                                    className="text-2xl"
                                >
                                    {emoji}
                                </span>

                                <span
                                    className="
                                        text-center
                                        text-[11px]
                                        font-semibold
                                        leading-tight
                                        text-stone-500
                                        transition-colors
                                        group-hover:text-amber-600
                                    "
                                >
                                    {label}
                                </span>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </section>
    );
};

/* ==========================================================================
   PRODUCT CARD
   ========================================================================== */

const ProductCard = memo(
    ({
        product,
    }: {
        product: IProduct;
    }) => {
        const discountPercent =
            getDiscountPercent(
                product.price.basePrice,
                product.price.discountPrice
            );

        const outOfStock =
            isOutOfStock(product);

        const lowStock =
            isLowStock(product);

        const remainingStock =
            getRemainingStock(product);

        const image =
            product.images?.[0] || "";

        const optimizedImage =
            optimizeCloudinaryImage(
                image,
                360
            );

        const imageSrcSet =
            getProductImageSrcSet(image);

        return (
            <article>
                <Link
                    to={`/products/${product.slug}`}
                    className="
                        group
                        flex
                        h-full
                        flex-col
                        overflow-hidden
                        rounded-2xl
                        border
                        border-stone-100
                        bg-stone-50
                        transition
                        duration-150
                        hover:-translate-y-1
                        hover:border-amber-200
                        hover:shadow-md
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-amber-400
                    "
                >
                    <div
                        className="
                            relative
                            aspect-[3/4]
                            overflow-hidden
                            bg-stone-200
                        "
                    >
                        {image ? (
                            <img
                                src={optimizedImage}
                                srcSet={
                                    imageSrcSet
                                }
                                sizes="
                                    (max-width: 639px) 50vw,
                                    (max-width: 767px) 33vw,
                                    (max-width: 1023px) 25vw,
                                    180px
                                "
                                width={360}
                                height={480}
                                loading="lazy"
                                decoding="async"
                                fetchPriority="low"
                                alt={
                                    product.title
                                }
                                className={`
                                    h-full
                                    w-full
                                    object-cover
                                    transition-transform
                                    duration-200
                                    ${outOfStock
                                        ? "grayscale opacity-60"
                                        : "group-hover:scale-[1.03]"
                                    }
                                `}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <BookOpen
                                    size={24}
                                    aria-hidden="true"
                                    className="text-stone-300"
                                />
                            </div>
                        )}

                        <span
                            className={`
                                absolute
                                right-2
                                top-2
                                rounded-md
                                px-1.5
                                py-0.5
                                text-[9px]
                                font-bold
                                ${product.productType ===
                                    "Digital"
                                    ? "bg-violet-500 text-white"
                                    : "bg-white/90 text-stone-700"
                                }
                            `}
                        >
                            {product.productType ===
                                "Digital"
                                ? "⚡ ডিজিটাল"
                                : "📦 ফিজিক্যাল"}
                        </span>

                        {discountPercent &&
                            !outOfStock && (
                                <span
                                    className="
                                        absolute
                                        left-2
                                        top-2
                                        rounded-md
                                        bg-amber-500
                                        px-1.5
                                        py-0.5
                                        text-[9px]
                                        font-bold
                                        text-white
                                        shadow-sm
                                    "
                                >
                                    -
                                    {
                                        discountPercent
                                    }
                                    %
                                </span>
                            )}

                        {outOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-stone-900/30">
                                <span
                                    className="
                                        flex
                                        items-center
                                        gap-1
                                        rounded-full
                                        bg-stone-900/80
                                        px-2.5
                                        py-1
                                        text-[10px]
                                        font-bold
                                        text-white
                                    "
                                >
                                    <PackageX
                                        size={11}
                                        aria-hidden="true"
                                    />

                                    স্টক নেই
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1 p-3">
                        <h3
                            className="
                                line-clamp-2
                                text-xs
                                font-semibold
                                leading-snug
                                text-stone-800
                                transition-colors
                                group-hover:text-amber-600
                            "
                        >
                            {product.title}
                        </h3>

                        {product.bookMetadata
                            ?.author ? (
                            <p className="line-clamp-1 text-[10px] text-stone-400">
                                {
                                    product
                                        .bookMetadata
                                        .author
                                }
                            </p>
                        ) : product.location ? (
                            <p
                                className="
                                    flex
                                    items-center
                                    gap-1
                                    text-[10px]
                                    text-stone-400
                                "
                            >
                                <MapPin
                                    size={10}
                                    aria-hidden="true"
                                    className="flex-shrink-0"
                                />

                                <span className="truncate">
                                    {
                                        product.location
                                    }
                                </span>
                            </p>
                        ) : null}

                        {discountPercent &&
                            product.price
                                .discountPrice ? (
                            <div className="mt-1 flex items-center gap-1.5">
                                <p className="text-sm font-extrabold text-stone-900">
                                    {formatPrice(
                                        product
                                            .price
                                            .discountPrice
                                    )}
                                </p>

                                <p className="text-[10px] text-stone-400 line-through">
                                    {formatPrice(
                                        product
                                            .price
                                            .basePrice
                                    )}
                                </p>
                            </div>
                        ) : (
                            <p className="mt-1 text-sm font-extrabold text-stone-900">
                                {formatPrice(
                                    product
                                        .price
                                        .basePrice
                                )}
                            </p>
                        )}

                        {((product.condition &&
                            product.condition !==
                            "Digital Content") ||
                            product.price
                                .isNegotiable ||
                            lowStock) && (
                                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                                    {product.condition &&
                                        product.condition !==
                                        "Digital Content" && (
                                            <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[9px] font-semibold text-stone-500">
                                                {
                                                    product.condition
                                                }
                                            </span>
                                        )}

                                    {product.price
                                        .isNegotiable && (
                                            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600">
                                                দরদাম চলবে
                                            </span>
                                        )}

                                    {lowStock && (
                                        <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold text-red-500">
                                            {
                                                remainingStock
                                            }
                                            টি বাকি
                                        </span>
                                    )}
                                </div>
                            )}
                    </div>
                </Link>
            </article>
        );
    }
);

ProductCard.displayName = "ProductCard";

/* ==========================================================================
   PRODUCT SKELETON
   ========================================================================== */

const ProductSkeleton = () => {
    return (
        <div
            aria-hidden="true"
            className="
                overflow-hidden
                rounded-2xl
                border
                border-stone-100
                bg-stone-50
            "
        >
            <div className="aspect-[3/4] animate-pulse bg-stone-200" />

            <div className="space-y-2 p-3">
                <div className="h-3 w-4/5 rounded bg-stone-200" />

                <div className="h-2.5 w-1/2 rounded bg-stone-200" />

                <div className="h-4 w-1/3 rounded bg-stone-200" />
            </div>
        </div>
    );
};

/* ==========================================================================
   RECENT LISTINGS

   API is deferred until section is close to viewport.
   ========================================================================== */

const RecentListingsSection = () => {
    const { ref, shouldLoad } =
        useNearViewport<HTMLElement>(
            "700px"
        );

    const {
        data: productsRes,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetProductsQuery(
        {
            limit: 6,
            sortBy: "createdAt",
            sortOrder: "desc",
        },
        {
            skip: !shouldLoad,
        }
    );

    const recentProducts =
        productsRes?.data?.data ?? [];

    const showSkeletons =
        !shouldLoad ||
        isLoading ||
        (isFetching &&
            recentProducts.length === 0);

    return (
        <section
            ref={ref}
            className="
                border-y
                border-stone-100
                bg-white
                py-14
                sm:py-16
            "
            style={belowFoldStyle}
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <SectionLabel text="নতুন সংযোজন" />

                        <h2
                            className="
                                flex
                                items-center
                                gap-2
                                font-display
                                text-2xl
                                font-bold
                                text-stone-900
                            "
                        >
                            <TrendingUp
                                size={20}
                                aria-hidden="true"
                                className="text-amber-500"
                            />

                            সদ্য তালিকাভুক্ত
                        </h2>
                    </div>

                    <Link
                        to="/books"
                        className="
                            flex
                            flex-shrink-0
                            items-center
                            gap-1
                            text-sm
                            font-semibold
                            text-stone-500
                            transition-colors
                            duration-150
                            hover:text-amber-600
                        "
                    >
                        সব দেখো

                        <ArrowRight
                            size={14}
                            aria-hidden="true"
                        />
                    </Link>
                </div>

                {isError ? (
                    <div
                        className="
                            rounded-2xl
                            border
                            border-stone-200
                            bg-stone-50
                            px-5
                            py-8
                            text-center
                        "
                    >
                        <p className="mb-4 text-sm text-stone-600">
                            নতুন বইগুলো এখন লোড
                            করা যাচ্ছে না।
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                refetch()
                            }
                            className="
                                rounded-lg
                                bg-stone-900
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                text-white
                                transition-colors
                                hover:bg-amber-500
                            "
                        >
                            আবার চেষ্টা করুন
                        </button>
                    </div>
                ) : showSkeletons ? (
                    <div
                        aria-label="Loading recent books"
                        className="
                            grid
                            grid-cols-2
                            gap-4
                            sm:grid-cols-3
                            md:grid-cols-4
                            lg:grid-cols-6
                        "
                    >
                        {Array.from({
                            length: 6,
                        }).map((_, index) => (
                            <ProductSkeleton
                                key={index}
                            />
                        ))}
                    </div>
                ) : recentProducts.length >
                    0 ? (
                    <div
                        className="
                            grid
                            grid-cols-2
                            gap-4
                            sm:grid-cols-3
                            md:grid-cols-4
                            lg:grid-cols-6
                        "
                    >
                        {recentProducts.map(
                            (
                                product: IProduct
                            ) => (
                                <ProductCard
                                    key={
                                        product._id
                                    }
                                    product={
                                        product
                                    }
                                />
                            )
                        )}
                    </div>
                ) : (
                    <div
                        className="
                            rounded-2xl
                            border
                            border-stone-200
                            bg-stone-50
                            px-5
                            py-8
                            text-center
                        "
                    >
                        <BookOpen
                            size={24}
                            aria-hidden="true"
                            className="mx-auto mb-3 text-stone-300"
                        />

                        <p className="text-sm text-stone-500">
                            এখনো কোনো নতুন বই
                            পাওয়া যায়নি।
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

/* ==========================================================================
   FEATURES
   ========================================================================== */

const FeaturesSection = () => {
    return (
        <section
            className="bg-stone-50 py-14 sm:py-16"
            style={belowFoldStyle}
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center sm:mb-12">
                    <SectionLabel text="কেন আমরা" />

                    <h2 className="font-display text-2xl font-bold text-stone-900">
                        বই কেনাবেচার জন্য যা যা
                        দরকার
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map(
                        ({
                            icon: Icon,
                            title,
                            desc,
                        }) => (
                            <article
                                key={title}
                                className="
                                    group
                                    rounded-2xl
                                    border
                                    border-stone-100
                                    bg-white
                                    p-6
                                    transition
                                    duration-200
                                    hover:-translate-y-1
                                    hover:border-stone-900
                                    hover:bg-stone-900
                                "
                            >
                                <div
                                    className="
                                        mb-4
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-stone-50
                                        shadow-sm
                                        transition-colors
                                        duration-200
                                        group-hover:bg-amber-500
                                    "
                                >
                                    <Icon
                                        size={
                                            18
                                        }
                                        aria-hidden="true"
                                        className="
                                            text-stone-600
                                            transition-colors
                                            duration-200
                                            group-hover:text-white
                                        "
                                    />
                                </div>

                                <h3
                                    className="
                                        mb-1.5
                                        text-sm
                                        font-bold
                                        text-stone-800
                                        transition-colors
                                        group-hover:text-white
                                    "
                                >
                                    {title}
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        leading-relaxed
                                        text-stone-500
                                        transition-colors
                                        group-hover:text-stone-400
                                    "
                                >
                                    {desc}
                                </p>
                            </article>
                        )
                    )}
                </div>
            </div>
        </section>
    );
};

/* ==========================================================================
   SELL CTA
   ========================================================================== */

const SellCTASection = () => {
    return (
        <section
            className="
                border-t
                border-stone-100
                bg-white
                py-14
                sm:py-16
            "
            style={belowFoldStyle}
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
                    <div>
                        <div
                            className="
                                mb-5
                                inline-block
                                rounded-full
                                bg-amber-100
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                text-amber-700
                            "
                        >
                            তোমার বই বিক্রি করো
                        </div>

                        <h2
                            className="
                                mb-4
                                font-display
                                text-3xl
                                font-bold
                                leading-tight
                                text-stone-900
                                lg:text-4xl
                            "
                        >
                            পুরনো বইকে বানাও{" "}
                            <span className="text-amber-500">
                                নগদ টাকা
                            </span>
                            , আজই।
                        </h2>

                        <p
                            className="
                                mb-8
                                max-w-md
                                text-base
                                leading-relaxed
                                text-stone-500
                            "
                        >
                            আগের সেমিস্টারের বই
                            ফেলে না রেখে, মিনিটেই
                            লিস্ট করো। জুনিয়রদের
                            সাশ্রয়ী রিসোর্স খুঁজে
                            পেতে সাহায্য করো, আর
                            পরের বইয়ের জন্য আয়
                            করো। ডিজিটাল নোটও চলবে।
                        </p>

                        <ul className="mb-8 space-y-2.5">
                            {[
                                "লিস্ট করা সম্পূর্ণ ফ্রি — কোনো লুকানো ফি নেই",
                                "শিপিং ও পেমেন্ট প্ল্যাটফর্মই সামলায়",
                                "সারাদেশের হাজারো শিক্ষার্থীর কাছে পৌঁছাও",
                            ].map((item) => (
                                <li
                                    key={item}
                                    className="flex items-center gap-2.5 text-sm text-stone-600"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="
                                            flex
                                            h-5
                                            w-5
                                            flex-shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-amber-100
                                        "
                                    >
                                        <Star
                                            size={
                                                10
                                            }
                                            className="fill-amber-600 text-amber-600"
                                        />
                                    </span>

                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Link
                            to="/user/add-product"
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-2xl
                                bg-stone-900
                                px-7
                                py-3.5
                                text-sm
                                font-bold
                                text-white
                                transition
                                duration-150
                                hover:-translate-y-0.5
                                hover:bg-amber-500
                                hover:text-stone-900
                                hover:shadow-lg
                            "
                        >
                            <Package
                                size={16}
                                aria-hidden="true"
                            />

                            ফ্রিতে বিক্রি শুরু করো

                            <ArrowRight
                                size={15}
                                aria-hidden="true"
                            />
                        </Link>
                    </div>

                    <div className="relative">
                        <div
                            className="
                                overflow-hidden
                                rounded-3xl
                                border
                                border-stone-100
                                bg-stone-50
                                p-3
                                shadow-lg
                            "
                        >
                            <img
                                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=70&w=720"
                                srcSet="
                                    https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=70&w=480 480w,
                                    https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=70&w=720 720w,
                                    https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=70&w=900 900w
                                "
                                sizes="
                                    (max-width: 1023px) 100vw,
                                    50vw
                                "
                                width={720}
                                height={480}
                                loading="lazy"
                                decoding="async"
                                fetchPriority="low"
                                alt="বই হাতে একজন শিক্ষার্থী"
                                className="
                                    h-72
                                    w-full
                                    rounded-2xl
                                    object-cover
                                "
                            />
                        </div>

                        <div
                            className="
                                absolute
                                -bottom-4
                                left-2
                                flex
                                items-center
                                gap-3
                                rounded-2xl
                                border
                                border-stone-100
                                bg-white
                                px-5
                                py-3
                                shadow-lg
                                sm:-left-4
                            "
                        >
                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-amber-100
                                "
                            >
                                <TrendingUp
                                    size={18}
                                    aria-hidden="true"
                                    className="text-amber-600"
                                />
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold text-stone-400">
                                    এই সপ্তাহে
                                </p>

                                <p className="text-sm font-extrabold text-stone-900">
                                    ২৪৮টি নতুন
                                    লিস্টিং
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ==========================================================================
   BOTTOM CTA
   ========================================================================== */

const BottomCTASection = () => {
    return (
        <section
            className="bg-stone-50 py-14 sm:py-16"
            style={belowFoldStyle}
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div
                    className="
                        relative
                        overflow-hidden
                        rounded-3xl
                        bg-amber-500
                        px-6
                        py-14
                        text-center
                        sm:px-8
                        sm:py-16
                    "
                >
                    <div
                        aria-hidden="true"
                        className="
                            absolute
                            -left-12
                            -top-12
                            h-48
                            w-48
                            rounded-full
                            bg-amber-400/40
                        "
                    />

                    <div
                        aria-hidden="true"
                        className="
                            absolute
                            -bottom-10
                            -right-10
                            h-60
                            w-60
                            rounded-full
                            bg-amber-600/25
                        "
                    />

                    <div className="relative">
                        <p className="mb-3 text-xs font-bold text-stone-700/70">
                            Grontho Bilash
                        </p>

                        <h2
                            className="
                                mb-3
                                font-display
                                text-3xl
                                font-bold
                                leading-tight
                                text-stone-900
                                lg:text-4xl
                            "
                        >
                            প্রতিটি শিক্ষার্থীর
                            জন্য{" "}
                            <br className="hidden sm:block" />
                            সাশ্রয়ী পড়াশোনা।
                        </h2>

                        <p
                            className="
                                mx-auto
                                mb-8
                                max-w-md
                                text-sm
                                leading-relaxed
                                text-stone-800/65
                            "
                        >
                            বাংলাদেশের হাজারো
                            শিক্ষার্থী ইতিমধ্যে
                            স্মার্টভাবে বই
                            কেনাবেচা করছে, তুমিও
                            যোগ দাও।
                        </p>

                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                to="/books"
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-2xl
                                    bg-stone-900
                                    px-7
                                    py-3.5
                                    text-sm
                                    font-bold
                                    text-white
                                    transition
                                    duration-150
                                    hover:-translate-y-0.5
                                    hover:bg-stone-800
                                    hover:shadow-lg
                                "
                            >
                                সব বই দেখো

                                <ArrowRight
                                    size={15}
                                    aria-hidden="true"
                                />
                            </Link>

                            <Link
                                to="/signup"
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-2xl
                                    bg-white/85
                                    px-7
                                    py-3.5
                                    text-sm
                                    font-bold
                                    text-stone-800
                                    transition
                                    duration-150
                                    hover:-translate-y-0.5
                                    hover:bg-white
                                "
                            >
                                ফ্রিতে যোগ দাও
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ==========================================================================
   HOME

   IMPORTANT:
   Home itself contains no local state.
   ========================================================================== */

const Home = () => {
    return (
        <main className="bg-stone-50">
            <HeroSection />

            <CategoriesSection />

            <RecentListingsSection />

            <FeaturesSection />

            <SellCTASection />

            <BottomCTASection />
        </main>
    );
};

export default Home;