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
