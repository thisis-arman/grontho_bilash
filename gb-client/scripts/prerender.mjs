// Pre-renders the home page into dist/index.html after `vite build`.
//
// Without this, the HTML is an empty <div id="root"> and nothing appears
// until the JavaScript bundle has downloaded and run (about 5 s on a mid-range
// phone). With it, the hero, navbar and footer paint straight from the HTML.
//
//   dist/index.html  home page, with the pre-rendered markup (served for "/")
//   dist/app.html    the empty shell, served for every other URL (vercel.json)
//
// Called by the prerender-home plugin in vite.config.ts once the SSR bundle
// of src/prerender/entry.tsx has been built into dist-ssr.
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

export const prerender = async () => {
  const { render } = await import(pathToFileURL(path.join(ssrDir, "entry.js")).href);

  const shell = await readFile(path.join(dist, "index.html"), "utf8");
  const marker = '<div id="root"></div>';
  if (!shell.includes(marker)) {
    throw new Error(`prerender: ${marker} not found in dist/index.html`);
  }

  const html = render("/");
  if (!html.includes("<h1")) {
    throw new Error("prerender: the rendered home page has no <h1>; refusing to publish it");
  }

  // The app's entry script. On the pre-rendered page it is downloaded right
  // away (modulepreload) but only started after the first frame has been
  // painted; otherwise the browser can run the whole bundle before showing
  // the HTML it already has, and the pre-rendering gains nothing.
  const entry = shell.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
  if (!entry) throw new Error("prerender: entry <script type=module> not found in dist/index.html");
  const [entryTag, entrySrc] = entry;
  const startAfterPaint = `<script>(function(){var started=false;function start(){if(started)return;started=true;var s=document.createElement("script");s.type="module";s.crossOrigin="";s.src=${JSON.stringify(entrySrc)};document.body.appendChild(s)}requestAnimationFrame(function(){setTimeout(start,0)});setTimeout(start,1500)})()</script>`;

  // Preload the Bengali fonts the first screen is set in, so the text is
  // drawn in its real font straight away instead of reflowing (layout shift)
  // when it arrives. Body text everywhere; the hero heading on the home page.
  const assets = await readdir(path.join(dist, "assets"));
  const preload = (prefix) => {
    const file = assets.find((f) => f.startsWith(prefix) && f.endsWith(".woff2"));
    if (!file) throw new Error(`prerender: no font file starting with ${prefix}`);
    return `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin>`;
  };
  const bodyFont = preload("hind-siliguri-bengali-400-normal-");
  const heroFont = preload("baloo-da-2-bengali-800-normal-");
  const withFonts = (html, links) => html.replace("</title>", `</title>\n  ${links.join("\n  ")}`);

  // main.tsx looks for [data-prerendered] and replaces it with the live app.
  const page = withFonts(shell, [bodyFont, heroFont])
    .replace(entryTag, `<link rel="modulepreload" crossorigin href="${entrySrc}">`)
    .replace(marker, `<div id="root"><div data-prerendered>${html}</div></div>`)
    .replace("</body>", `${startAfterPaint}
</body>`);

  await writeFile(path.join(dist, "app.html"), withFonts(shell, [bodyFont]));
  await writeFile(path.join(dist, "index.html"), page);
  await rm(ssrDir, { recursive: true, force: true });

  console.log(`prerender: home page written (${(html.length / 1024).toFixed(1)} KB of markup)`);
};
