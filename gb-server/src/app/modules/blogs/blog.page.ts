import { Marked, type Tokens } from "marked";
import { escapeHtml } from "../../utils/mailer";

// Server-rendered blog post pages.
//
// The website is a single-page app, so without this a blog post's HTML is an
// empty shell until JavaScript runs. Search engines cope, but most AI
// crawlers (ChatGPT, Perplexity, Claude) do not run JavaScript, so they saw
// nothing to quote. gb-client/vercel.json sends /blogs/:slug here; we return
// the site's own app shell with the full article, meta tags and structured
// data already in it. The app then starts on top and takes over the page
// (gb-client/src/main.tsx swaps [data-prerendered] out once it is ready).

const SITE_URL = "https://www.gronthobilash.com";
const SHELL_URL = `${SITE_URL}/app.html`;
const SHELL_TTL_MS = 5 * 60 * 1000;

let shellCache: { html: string; at: number } | null = null;

// The deployed app shell (its asset file names change with every build).
export const getShell = async () => {
  if (shellCache && Date.now() - shellCache.at < SHELL_TTL_MS) return shellCache.html;
  const res = await fetch(SHELL_URL, { headers: { "user-agent": "gronthobilash-ssr" } });
  if (!res.ok) throw new Error(`shell ${res.status}`);
  const html = await res.text();
  shellCache = { html, at: Date.now() };
  return html;
};

// Same classes as gb-client/src/components/content/Markdown.tsx, so the
// server-rendered article looks exactly like the app's.
const md = new Marked({ gfm: true, breaks: false });
md.use({
  renderer: {
    // Raw HTML in a post is shown as text, never rendered (as in the app).
    html({ text }: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(text);
    },
    heading({ tokens, depth }: Tokens.Heading) {
      const text = this.parser.parseInline(tokens);
      const cls =
        depth <= 2
          ? "mb-4 mt-10 font-display text-2xl font-bold text-stone-900 sm:text-[1.75rem]"
          : depth === 3
            ? "mb-3 mt-8 font-display text-xl font-bold text-stone-900"
            : "mb-2 mt-6 text-lg font-semibold text-stone-900";
      const tag = depth <= 2 ? "h2" : depth === 3 ? "h3" : "h4";
      return `<${tag} class="${cls}">${text}</${tag}>`;
    },
    paragraph({ tokens }: Tokens.Paragraph) {
      return `<p class="my-5 leading-[1.85] text-stone-700">${this.parser.parseInline(tokens)}</p>`;
    },
    link({ href, tokens }: Tokens.Link) {
      const safe = /^(https?:|\/|#|mailto:)/i.test(href) ? href : "#";
      const external = /^https?:\/\//.test(safe) && !safe.includes("gronthobilash.com");
      return `<a href="${escapeHtml(safe)}" class="font-medium text-amber-700 underline decoration-amber-300 underline-offset-4 hover:decoration-amber-600"${
        external ? ' target="_blank" rel="noopener noreferrer nofollow"' : ""
      }>${this.parser.parseInline(tokens)}</a>`;
    },
    list(token: Tokens.List) {
      const items = token.items.map((item) => `<li class="pl-1 leading-relaxed">${this.parser.parse(item.tokens)}</li>`).join("");
      return token.ordered
        ? `<ol class="my-5 list-decimal space-y-2 pl-6 text-stone-700 marker:font-semibold marker:text-stone-500">${items}</ol>`
        : `<ul class="my-5 list-disc space-y-2 pl-6 text-stone-700 marker:text-amber-500">${items}</ul>`;
    },
    blockquote({ tokens }: Tokens.Blockquote) {
      return `<blockquote class="my-6 border-l-4 border-amber-400 bg-amber-50/60 py-1 pl-5 pr-3 italic text-stone-700">${this.parser.parse(tokens)}</blockquote>`;
    },
    table(token: Tokens.Table) {
      const head = token.header.map((c) => `<th class="px-4 py-2.5 font-semibold">${this.parser.parseInline(c.tokens)}</th>`).join("");
      const rows = token.rows
        .map((row) => `<tr>${row.map((c) => `<td class="border-t border-stone-100 px-4 py-2.5 text-stone-700">${this.parser.parseInline(c.tokens)}</td>`).join("")}</tr>`)
        .join("");
      return `<div class="my-6 overflow-x-auto rounded-xl border border-stone-200"><table class="w-full text-left text-sm"><thead class="bg-stone-50 text-stone-600"><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
    },
    hr() {
      return `<hr class="my-10 border-stone-200">`;
    },
    image({ href, text }: Tokens.Image) {
      if (!/^https?:\/\//.test(href)) return "";
      return `<figure class="my-8"><img src="${escapeHtml(href)}" alt="${escapeHtml(text ?? "")}" loading="lazy" class="w-full rounded-2xl bg-stone-100">${
        text ? `<figcaption class="mt-2 text-center text-sm text-stone-500">${escapeHtml(text)}</figcaption>` : ""
      }</figure>`;
    },
  },
});

export const renderMarkdown = (source: string) => md.parse(source ?? "", { async: false }) as string;

// Questions under a "সাধারণ প্রশ্ন" / "FAQ" heading, for FAQPage data:
// "### Question" followed by its answer paragraphs.
export const extractFaq = (source: string) => {
  const section = (source ?? "").split(/\n(?=## )/).find((s) => /^##\s+(সাধারণ প্রশ্ন|প্রশ্নোত্তর|FAQ)/i.test(s.trim()));
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

type PagePost = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category: string;
  tags?: string[];
  publishedAt?: Date;
  updatedAt?: Date;
  readingTime?: number;
  author?: { name?: string } | null;
};

const CATEGORY_BN: Record<string, string> = {
  "Book Review": "বই রিভিউ",
  "Study Tips": "পড়াশোনার টিপস",
  "Exam Preparation": "পরীক্ষার প্রস্তুতি",
  Career: "ক্যারিয়ার",
  "Student Life": "শিক্ষার্থী জীবন",
  Guides: "গাইড",
  "Platform News": "গ্রন্থবিলাসের খবর",
};

const bnDate = (d?: Date) =>
  d ? new Date(d).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" }) : "";

const attr = (value: string) => escapeHtml(value).replace(/\n/g, " ");

// Escapes "</" so JSON inside <script> can never close the tag early.
const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export const blogPageHtml = (shell: string, post: PagePost) => {
  const url = `${SITE_URL}/blogs/${post.slug}`;
  const title = `${post.title} | গ্রন্থবিলাস`;
  const description = (post.excerpt || post.title).slice(0, 300);
  const image = post.coverImage || `${SITE_URL}/og-image.jpg`;
  const authorName = post.author?.name || "গ্রন্থবিলাস টিম";
  const faq = extractFaq(post.content);

  const graph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.title.slice(0, 110),
      description,
      url,
      mainEntityOfPage: url,
      image: [image],
      inLanguage: "bn-BD",
      datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      dateModified: new Date(post.updatedAt ?? post.publishedAt ?? Date.now()).toISOString(),
      author: { "@type": "Person", name: authorName },
      publisher: { "@type": "Organization", name: "Grontho Bilash", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
      articleSection: CATEGORY_BN[post.category] ?? post.category,
      keywords: (post.tags ?? []).join(", "),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "হোম", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "ব্লগ", item: `${SITE_URL}/blogs` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
  if (faq.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    });
  }

  const head = `
  <link rel="canonical" href="${attr(url)}" />
  <meta property="article:published_time" content="${post.publishedAt ? new Date(post.publishedAt).toISOString() : ""}" />
  <meta property="article:modified_time" content="${new Date(post.updatedAt ?? post.publishedAt ?? Date.now()).toISOString()}" />
  <script type="application/ld+json">${jsonLd({ "@context": "https://schema.org", "@graph": graph })}</script>
`;

  const article = `<main class="bg-stone-50">
  <article class="mx-auto max-w-3xl px-5 py-12 sm:py-16">
    <nav aria-label="অবস্থান" class="mb-6 text-sm text-stone-500"><a href="/" class="hover:text-stone-900">হোম</a> › <a href="/blogs" class="hover:text-stone-900">ব্লগ</a> › <span>${escapeHtml(CATEGORY_BN[post.category] ?? post.category)}</span></nav>
    <h1 class="font-display text-3xl font-bold leading-tight text-stone-900 sm:text-5xl">${escapeHtml(post.title)}</h1>
    ${post.excerpt ? `<p class="mt-5 text-lg leading-relaxed text-stone-600">${escapeHtml(post.excerpt)}</p>` : ""}
    <p class="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-sm text-stone-500"><span class="font-semibold text-stone-900">${escapeHtml(authorName)}</span><span>প্রকাশ: ${bnDate(post.publishedAt)}</span>${
      post.updatedAt ? `<span>হালনাগাদ: ${bnDate(post.updatedAt)}</span>` : ""
    }${post.readingTime ? `<span>${post.readingTime} মিনিটে পড়া</span>` : ""}</p>
    ${post.coverImage ? `<img src="${attr(post.coverImage)}" alt="" class="mt-8 w-full rounded-3xl bg-stone-100">` : ""}
    <div class="mt-8 break-words text-base sm:text-[1.0625rem]">${renderMarkdown(post.content)}</div>
  </article>
</main>`;

  return shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/?>/, `<meta name="description" content="${attr(description)}" />`)
    .replace(/<meta\s+property="og:type"[^>]*>/, `<meta property="og:type" content="article" />`)
    .replace(/<meta\s+property="og:url"[^>]*>/, `<meta property="og:url" content="${attr(url)}" />`)
    .replace(/<meta\s+property="og:title"[^>]*>/, `<meta property="og:title" content="${attr(post.title)}" />`)
    .replace(/<meta\s+property="og:description"[\s\S]*?\/?>/, `<meta property="og:description" content="${attr(description)}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${attr(image)}" />`)
    .replace(/<meta\s+name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${attr(post.title)}" />`)
    .replace(/<meta\s+name="twitter:description"[\s\S]*?\/?>/, `<meta name="twitter:description" content="${attr(description)}" />`)
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${attr(image)}" />`)
    .replace("</head>", `${head}</head>`)
    .replace('<div id="root"></div>', `<div id="root"><div data-prerendered data-wait-ready>${article}</div></div>`);
};
