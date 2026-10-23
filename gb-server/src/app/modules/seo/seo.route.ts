import { Router } from "express";
import catchAsync from "../../utils/catchAsync";
import { ProductModel } from "../book/product.model";
import { BlogModel } from "../blogs/blog.model";
import { SuggestionModel } from "../suggestion/suggestion.model";
import { BookListModel } from "../booklist/booklist.model";
import { CurriculumModel } from "../curriculum/curriculum.model";
import { blogService } from "../blogs/blog.service";
import { blogPageHtml, getShell, renderMarkdown } from "../blogs/blog.page";
import { escapeHtml } from "../../utils/mailer";

const router = Router();

const SITE_URL = "https://www.gronthobilash.com";

// Pages that always exist, with how much weight they carry.
const STATIC_PAGES: [string, string][] = [
  ["/", "1.0"],
  ["/books", "0.9"],
  ["/suggestions", "0.8"],
  ["/questions", "0.8"],
  ["/booklists", "0.8"],
  ["/courses", "0.8"],
  ["/blogs", "0.7"],
  ["/tools", "0.6"],
  ["/tools/cgpa-calculator", "0.6"],
  ["/tools/target-cgpa", "0.5"],
  ["/tools/attendance", "0.5"],
  ["/tools/focus-timer", "0.5"],
  ["/tools/gpa-calculator", "0.6"],
  ["/tools/grade-converter", "0.5"],
  ["/tools/age-calculator", "0.5"],
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
    const [products, posts, suggestions, bookLists, departments] = await Promise.all([
      ProductModel.find({ isDeleted: false, isPublished: true }, { slug: 1, updatedAt: 1 }).lean(),
      BlogModel.find({ isDeleted: false, status: "published" }, { slug: 1, updatedAt: 1 }).lean(),
      SuggestionModel.find({ isDeleted: false, status: "published" }, { slug: 1, updatedAt: 1, kind: 1 }).lean(),
      BookListModel.find({ isDeleted: false, status: "published" }, { slug: 1, updatedAt: 1 }).lean(),
      CurriculumModel.find({ isDeleted: false, status: "published" }, { slug: 1, updatedAt: 1 }).lean(),
    ]);

    type Row = { slug: string; updatedAt?: Date; kind?: string };
    const lines = [
      ...STATIC_PAGES.map(([path, priority]) => entry(path, undefined, priority)),
      ...(products as Row[]).map((p) => entry(`/products/${p.slug}`, p.updatedAt, "0.8")),
      ...(posts as Row[]).map((p) => entry(`/blogs/${p.slug}`, p.updatedAt, "0.6")),
      ...(suggestions as Row[]).map((s) =>
        entry(`/${s.kind === "question" ? "questions" : "suggestions"}/${s.slug}`, s.updatedAt, "0.7")
      ),
      ...(bookLists as Row[]).map((l) => entry(`/booklists/${l.slug}`, l.updatedAt, "0.7")),
      ...(departments as Row[]).map((d) => entry(`/courses/${d.slug}`, d.updatedAt, "0.7")),
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

// Full HTML for /blogs/:slug (rewritten here by gb-client/vercel.json), so
// crawlers that do not run JavaScript, AI assistants included, can read and
// quote the article. See blogs/blog.page.ts.
router.get(
  "/blog-page/:slug",
  catchAsync(async (req, res) => {
    const slug = String(req.params.slug).toLowerCase().slice(0, 200);
    const post = await blogService.getPublishedPage(slug);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");

    let shell: string | null = null;
    try {
      shell = await getShell();
    } catch {
      shell = null;
    }

    if (!post) {
      // Unknown post: the app shows its own "not found" page.
      res.status(404).send(shell ?? "<!doctype html><title>Not found</title>");
      return;
    }
    if (!shell) {
      // The site itself could not be reached: still serve the readable article.
      res.send(
        `<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(post.title)}</title></head><body><article><h1>${escapeHtml(post.title)}</h1>${renderMarkdown(post.content)}</article></body></html>`
      );
      return;
    }
    res.send(blogPageHtml(shell, post));
  })
);

export const seoRoutes = router;
