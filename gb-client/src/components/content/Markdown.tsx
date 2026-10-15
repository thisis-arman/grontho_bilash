import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders post and suggestion text. react-markdown never renders raw HTML
// and strips javascript: links, so author content cannot inject scripts.

const isExternal = (href = "") => /^https?:\/\//.test(href) && !href.includes("gronthobilash.com");

const components: Components = {
  h1: ({ children }) => <h2 className="mb-4 mt-10 font-display text-2xl font-bold text-stone-900 sm:text-3xl">{children}</h2>,
  h2: ({ children }) => <h2 className="mb-4 mt-10 font-display text-2xl font-bold text-stone-900 sm:text-[1.75rem]">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-3 mt-8 font-display text-xl font-bold text-stone-900">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-2 mt-6 text-lg font-semibold text-stone-900">{children}</h4>,
  p: ({ children }) => <p className="my-5 leading-[1.85] text-stone-700">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-amber-700 underline decoration-amber-300 underline-offset-4 hover:decoration-amber-600"
      {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-6 text-stone-700 marker:text-amber-500">{children}</ul>,
  ol: ({ children }) => <ol className="my-5 list-decimal space-y-2 pl-6 text-stone-700 marker:font-semibold marker:text-stone-500">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-amber-400 bg-amber-50/60 py-1 pl-5 pr-3 italic text-stone-700">{children}</blockquote>
  ),
  hr: () => <hr className="my-10 border-stone-200" />,
  img: ({ src, alt }) => (
    <figure className="my-8">
      <img src={src} alt={alt ?? ""} loading="lazy" className="w-full rounded-2xl bg-stone-100" />
      {alt && <figcaption className="mt-2 text-center text-sm text-stone-500">{alt}</figcaption>}
    </figure>
  ),
  code: ({ className, children }) =>
    className ? (
      <code className={`${className} font-mono text-sm`}>{children}</code>
    ) : (
      <code className="rounded-md bg-stone-100 px-1.5 py-0.5 font-mono text-[0.9em] text-stone-800">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-2xl bg-stone-950 p-5 text-sm leading-relaxed text-stone-100">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-stone-200">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-stone-50 text-stone-600">{children}</thead>,
  th: ({ children }) => <th className="px-4 py-2.5 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-t border-stone-100 px-4 py-2.5 text-stone-700">{children}</td>,
};

const Markdown = ({ children }: { children: string }) => (
  <div className="break-words text-base sm:text-[1.0625rem]">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  </div>
);

export default Markdown;
