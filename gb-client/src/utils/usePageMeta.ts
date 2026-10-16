import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Per-page SEO for a single-page app: the server always sends the same
// index.html, so each page sets its own title, description, canonical URL,
// share tags and structured data, and the defaults come back when it unmounts.

export const SITE_URL = "https://www.gronthobilash.com";
const SITE_NAME = "Grontho Bilash";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

// Query parameters that change what a page shows enough to deserve their own
// URL in search results. Everything else (search terms, sort order, filters)
// canonicalises to the plain path, so those variations don't compete.
const INDEXED_PARAMS = ["category", "page"];

export const canonicalFor = (pathname: string, search = "") => {
  const params = new URLSearchParams(search);
  const kept = new URLSearchParams();
  for (const key of INDEXED_PARAMS) {
    const value = params.get(key);
    if (value && !(key === "page" && value === "1")) kept.set(key, value);
  }
  const query = kept.toString();
  const path = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  return `${SITE_URL}${path}${query ? `?${query}` : ""}`;
};

const upsert = (selector: string, create: () => HTMLElement) => {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
};

const setMeta = (key: string, value: string, attr: "name" | "property" = "name") => {
  const el = upsert(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute(attr, key);
    return m;
  });
  el.setAttribute("content", value);
};

const setCanonical = (href: string) => {
  const el = upsert('link[rel="canonical"]', () => {
    const l = document.createElement("link");
    l.rel = "canonical";
    return l;
  });
  el.setAttribute("href", href);
};

// The values index.html starts with, captured once so they can be restored.
// (No document while the home page is pre-rendered at build time.)
const DEFAULTS = (() => {
  if (typeof document === "undefined") return { title: "", description: "", robots: "index, follow" };
  const read = (selector: string) => document.head.querySelector(selector)?.getAttribute("content") ?? "";
  return {
    title: document.title,
    description: read('meta[name="description"]'),
    robots: read('meta[name="robots"]') || "index, follow",
  };
})();

const applyDefaults = (url: string) => {
  document.title = DEFAULTS.title;
  setMeta("description", DEFAULTS.description);
  setMeta("robots", DEFAULTS.robots);
  setMeta("og:type", "website", "property");
  setMeta("og:title", DEFAULTS.title, "property");
  setMeta("og:description", DEFAULTS.description, "property");
  setMeta("og:image", DEFAULT_IMAGE, "property");
  setMeta("og:url", url, "property");
  setMeta("twitter:title", DEFAULTS.title);
  setMeta("twitter:description", DEFAULTS.description);
  setMeta("twitter:image", DEFAULT_IMAGE);
  setCanonical(url);
};

export interface PageMetaOptions {
  // Keep the page out of search results (login, bag, account pages, ...).
  noindex?: boolean;
  // "article" for blog posts and suggestions, "product" for listings.
  type?: "website" | "article" | "product";
  // schema.org data for rich results; rendered as JSON-LD.
  jsonLd?: Record<string, unknown> | null;
}

export const usePageMeta = (
  title?: string,
  description?: string,
  image?: string,
  options: PageMetaOptions = {}
) => {
  const { pathname, search } = useLocation();
  const { noindex = false, type = "website", jsonLd } = options;
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    if (!title) return;
    const url = canonicalFor(pathname, search);
    const fullTitle = `${title} | ${SITE_NAME}`;
    const desc = (description || DEFAULTS.description).replace(/\s+/g, " ").trim().slice(0, 160);
    const img = image || DEFAULT_IMAGE;

    document.title = fullTitle;
    setMeta("description", desc);
    setMeta("robots", noindex ? "noindex, follow" : DEFAULTS.robots);
    setMeta("og:type", type, "property");
    setMeta("og:title", title, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:image", img, "property");
    setMeta("og:url", url, "property");
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", img);
    setCanonical(url);

    let script: HTMLScriptElement | null = null;
    if (jsonLdText) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.page = "true";
      script.text = jsonLdText;
      document.head.appendChild(script);
    }

    return () => {
      script?.remove();
      applyDefaults(canonicalFor(window.location.pathname, window.location.search));
    };
  }, [title, description, image, noindex, type, jsonLdText, pathname, search]);
};

// Keeps the canonical URL and og:url right on pages that don't call
// usePageMeta themselves. Mounted once in the main layout.
export const useCanonicalUrl = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const url = canonicalFor(pathname, search);
    setCanonical(url);
    setMeta("og:url", url, "property");
  }, [pathname, search]);
};

// Route-level version for simple pages: <PageMeta title="FAQ" ... />.
export const PageMeta = ({
  title,
  description,
  noindex,
}: {
  title: string;
  description?: string;
  noindex?: boolean;
}) => {
  usePageMeta(title, description, undefined, { noindex });
  return null;
};
