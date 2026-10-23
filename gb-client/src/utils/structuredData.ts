import { SITE_URL } from "./usePageMeta";

// schema.org builders for rich results (price and stock on product pages,
// article details on posts). Kept apart from the pages so they are easy to
// check against Google's Rich Results Test.

const absolute = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

const CONDITION: Record<string, string> = {
  New: "https://schema.org/NewCondition",
  "Like New": "https://schema.org/UsedCondition",
  Used: "https://schema.org/UsedCondition",
  "Digital Content": "https://schema.org/NewCondition",
};

export const productJsonLd = (product: {
  title: string;
  slug: string;
  description?: string;
  images?: string[];
  sku?: string;
  category?: string;
  condition?: string;
  stockStatus?: string;
  price: { basePrice: number };
  bookMetadata?: { author?: string; isbn?: string };
  seller?: { name?: string } | string | null;
}) => {
  const isbn = product.bookMetadata?.isbn?.replace(/[^0-9X]/gi, "");
  const sellerName = typeof product.seller === "object" ? product.seller?.name : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    url: absolute(`/products/${product.slug}`),
    ...(product.images?.length ? { image: product.images } : {}),
    ...(product.description ? { description: product.description.slice(0, 500) } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.category ? { category: product.category } : {}),
    ...(isbn && isbn.length === 13 ? { gtin13: isbn } : {}),
    ...(product.bookMetadata?.author ? { brand: { "@type": "Brand", name: product.bookMetadata.author } } : {}),
    offers: {
      "@type": "Offer",
      url: absolute(`/products/${product.slug}`),
      priceCurrency: "BDT",
      price: product.price.basePrice,
      availability:
        product.stockStatus === "Out of Stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: CONDITION[product.condition ?? ""] ?? "https://schema.org/UsedCondition",
      ...(sellerName ? { seller: { "@type": "Person", name: sellerName } } : {}),
    },
  };
};

// Questions under a "সাধারণ প্রশ্ন" / "FAQ" heading in a post's Markdown
// ("### Question" + answer), for FAQPage data. Mirrors extractFaq in
// gb-server/src/app/modules/blogs/blog.page.ts (the server-rendered page).
export const faqFromMarkdown = (source = "") => {
  const section = source.split(/\n(?=## )/).find((s) => /^##\s+(সাধারণ প্রশ্ন|প্রশ্নোত্তর|FAQ)/i.test(s.trim()));
  if (!section) return [];
  return section
    .split(/\n(?=### )/)
    .slice(1)
    .map((block) => {
      const [first, ...rest] = block.split("\n");
      const question = first.replace(/^###\s+/, "").trim();
      const answer = rest.join(" ").replace(/[*_`>#]|\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
      return { question, answer };
    })
    .filter((f) => f.question && f.answer);
};

export const faqJsonLd = (items: { question: string; answer: string }[]) => ({
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
});

export const articleJsonLd = (article: {
  type?: "BlogPosting" | "Article";
  title: string;
  path: string;
  description?: string;
  image?: string;
  authorName?: string;
  publishedAt?: string;
  updatedAt?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": article.type ?? "Article",
  headline: article.title.slice(0, 110),
  url: absolute(article.path),
  mainEntityOfPage: absolute(article.path),
  ...(article.description ? { description: article.description } : {}),
  image: article.image ? [article.image] : [`${SITE_URL}/og-image.jpg`],
  ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
  ...(article.updatedAt || article.publishedAt ? { dateModified: article.updatedAt ?? article.publishedAt } : {}),
  author: article.authorName
    ? { "@type": "Person", name: article.authorName }
    : { "@type": "Organization", name: "Grontho Bilash", url: SITE_URL },
  publisher: { "@id": `${SITE_URL}/#organization` },
});
