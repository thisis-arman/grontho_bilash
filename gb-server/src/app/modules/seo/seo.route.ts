import { Router } from "express";
import catchAsync from "../../utils/catchAsync";
import { ProductModel } from "../book/product.model";
import { BlogModel } from "../blogs/blog.model";
import { SuggestionModel } from "../suggestion/suggestion.model";

const router = Router();

const SITE_URL = "https://www.gronthobilash.com";

// Pages that always exist, with how much weight they carry.
const STATIC_PAGES: [string, string][] = [
  ["/", "1.0"],
  ["/books", "0.9"],
  ["/suggestions", "0.8"],
  ["/blogs", "0.7"],
  ["/tools", "0.6"],
  ["/tools/cgpa-calculator", "0.6"],
  ["/tools/target-cgpa", "0.5"],
  ["/tools/attendance", "0.5"],
  ["/tools/focus-timer", "0.5"],
  ["/about", "0.4"],
  ["/faq", "0.4"],
  ["/contact", "0.3"],
  ["/careers", "0.2"],
  ["/privacy", "0.2"],
  ["/terms", "0.2"],
];

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string));

const entry = (path: string, lastmod?: Date, priority?: string) =>
  `  <url><loc>${escapeXml(SITE_URL + path)}</loc>${
    lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ""
  }${priority ? `<priority>${priority}</priority>` : ""}</url>`;

// Served at https://www.gronthobilash.com/sitemap.xml through a rewrite in
// gb-client/vercel.json, so search engines see every published listing,
// post and suggestion, not just the fixed pages.
router.get(
  "/sitemap.xml",
  catchAsync(async (_req, res) => {
    const [products, posts, suggestions] = await Promise.all([
      ProductModel.find({ isDeleted: false, isPublished: true }, { slug: 1, updatedAt: 1 }).lean(),
      BlogModel.find({ isDeleted: false, status: "published" }, { slug: 1, updatedAt: 1 }).lean(),
      SuggestionModel.find({ isDeleted: false, status: "published" }, { slug: 1, updatedAt: 1 }).lean(),
    ]);

    type Row = { slug: string; updatedAt?: Date };
    const lines = [
      ...STATIC_PAGES.map(([path, priority]) => entry(path, undefined, priority)),
      ...(products as Row[]).map((p) => entry(`/products/${p.slug}`, p.updatedAt, "0.8")),
      ...(posts as Row[]).map((p) => entry(`/blogs/${p.slug}`, p.updatedAt, "0.6")),
      ...(suggestions as Row[]).map((s) => entry(`/suggestions/${s.slug}`, s.updatedAt, "0.7")),
    ];

    res
      .status(200)
      .type("application/xml")
      // Cached for an hour at the edge; new listings show up within that.
      .set("Cache-Control", "public, max-age=3600, s-maxage=3600")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join(
          "\n"
        )}\n</urlset>\n`
      );
  })
);

export const seoRoutes = router;
