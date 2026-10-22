import { FormEvent, Fragment, KeyboardEvent, ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpLeft,
  BookOpen,
  Clock,
  FileQuestion,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Loader2,
  Newspaper,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { useGetPopularSearchesQuery, useGetSearchSuggestionsQuery, type SuggestContent } from "../../redux/features/hub/hubApi";
import { conditionLabel, taka } from "../../i18n/labels";

// The site's search box: suggestions while typing (books, related searches,
// suggestions/questions/book lists), recent and popular searches when empty.
// Bangla and English both work; the server maps "হিসাববিজ্ঞান" ↔ "Accounting".

const RECENT_KEY = "gb-recent-searches";
const MAX_RECENT = 6;

const readRecent = (): string[] => {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((x) => typeof x === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
};
const writeRecent = (list: string[]) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    // Private mode: recent searches just aren't remembered.
  }
};
export const rememberSearch = (term: string) => {
  const clean = term.trim();
  if (clean.length < 2) return;
  writeRecent([clean, ...readRecent().filter((t) => t.toLowerCase() !== clean.toLowerCase())]);
};

const useDebounced = (value: string, ms: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
};

const thumb = (url: string) =>
  url.includes("res.cloudinary.com") && url.includes("/image/upload/")
    ? url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_80,h_100,c_fill/")
    : url;

const CONTENT_META: Record<SuggestContent["kind"], { label: string; icon: typeof BookOpen }> = {
  booklist: { label: "বইয়ের তালিকা", icon: ListChecks },
  suggestion: { label: "সাজেশন", icon: Lightbulb },
  question: { label: "প্রশ্ন", icon: FileQuestion },
  blog: { label: "ব্লগ", icon: Newspaper },
  course: { label: "কোর্স (সিলেবাস)", icon: GraduationCap },
};

type Option =
  | { type: "search"; term: string }
  | { type: "recent" | "popular" | "term"; term: string }
  | { type: "product"; slug: string; title: string; image: string; price: number; author: string; condition: string }
  | { type: "content"; url: string; title: string; kind: SuggestContent["kind"] };

export interface SearchBoxProps {
  // Called with the search text when the shopper searches (Enter, button,
  // or picking a suggested term). Defaults to opening the shop.
  onSearch?: (term: string) => void;
  defaultValue?: string;
  // Lets the parent keep the text in sync, e.g. with the URL.
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  variant?: "hero" | "field";
  autoFocus?: boolean;
  id?: string;
}

const SearchBox = ({
  onSearch,
  defaultValue = "",
  value: controlled,
  onValueChange,
  placeholder = "বইয়ের নাম, লেখক বা বিষয় লেখো",
  variant = "field",
  autoFocus,
  id,
}: SearchBoxProps) => {
  const navigate = useNavigate();
  const [inner, setInner] = useState(defaultValue);
  const value = controlled ?? inner;
  const setValue = (v: string) => {
    setInner(v);
    onValueChange?.(v);
  };

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>(readRecent);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const inputId = id ?? `search-${listId}`;

  const query = value.trim();
  const debounced = useDebounced(query, 150);
  const typing = debounced.length >= 2;
  const { data, isFetching } = useGetSearchSuggestionsQuery(debounced, { skip: !open || !typing });
  const { data: popularData } = useGetPopularSearchesQuery(undefined, { skip: !open });
  const result = typing && data?.data.query.toLowerCase() === debounced.toLowerCase() ? data.data : undefined;

  const options = useMemo<Option[]>(() => {
    if (!typing) {
      const popular = (popularData?.data ?? []).filter((p) => !recent.some((r) => r.toLowerCase() === p.toLowerCase()));
      return [
        ...recent.map((term) => ({ type: "recent" as const, term })),
        ...popular.slice(0, 6).map((term) => ({ type: "popular" as const, term })),
      ];
    }
    return [
      { type: "search" as const, term: query },
      ...(result?.products ?? []).map((p) => ({ type: "product" as const, ...p })),
      ...(result?.terms ?? []).map((term) => ({ type: "term" as const, term })),
      ...(result?.content ?? []).map((c) => ({ type: "content" as const, ...c })),
    ];
  }, [typing, popularData, recent, result, query]);

  useEffect(() => setActive(-1), [debounced, open]);

  // Close when clicking or tapping anywhere else.
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [open]);

  const runSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    rememberSearch(clean);
    setRecent(readRecent());
    setValue(clean);
    setOpen(false);
    inputRef.current?.blur();
    if (onSearch) onSearch(clean);
    else navigate(`/books?search=${encodeURIComponent(clean)}`);
  };

  const choose = (option: Option) => {
    if (option.type === "product") {
      if (query) rememberSearch(query);
      setOpen(false);
      navigate(`/products/${option.slug}`);
    } else if (option.type === "content") {
      setOpen(false);
      navigate(option.url);
    } else {
      runSearch(option.term);
    }
  };

  const removeRecent = (term: string) => {
    const next = recent.filter((t) => t !== term);
    writeRecent(next);
    setRecent(next);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (options.length ? (i + 1) % options.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (options.length ? (i <= 0 ? options.length - 1 : i - 1) : -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" && open && active >= 0 && options[active]) {
      e.preventDefault();
      choose(options[active]);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    runSearch(value);
  };

  const hero = variant === "hero";
  const showPanel = open && (options.length > 0 || (typing && isFetching));
  const optionId = (i: number) => `${listId}-opt-${i}`;

  // Section headings inside the list.
  const heading = (text: string, icon?: ReactNode) => (
    <li role="presentation" className="flex items-center gap-1.5 px-4 pb-1 pt-3 text-xs font-semibold text-stone-500">
      {icon}
      {text}
    </li>
  );

  const row = (option: Option, i: number, children: ReactNode, extra?: ReactNode) => (
    <li
      key={`${option.type}-${i}`}
      id={optionId(i)}
      role="option"
      aria-selected={active === i}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => choose(option)}
      onMouseEnter={() => setActive(i)}
      className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-stone-800 ${
        active === i ? "bg-amber-50" : ""
      }`}
    >
      {children}
      {extra}
    </li>
  );

  const rendered: ReactNode[] = [];
  let lastGroup = "";
  options.forEach((option, i) => {
    const group =
      option.type === "recent" ? "recent" : option.type === "popular" ? "popular" : option.type === "term" ? "term" : option.type === "content" ? "content" : option.type === "product" ? "product" : "search";
    if (group !== lastGroup) {
      if (group === "recent") rendered.push(<Fragment key="h-recent">{heading("সাম্প্রতিক খোঁজ", <Clock size={12} />)}</Fragment>);
      if (group === "popular") rendered.push(<Fragment key="h-popular">{heading("অন্যরা যা খুঁজছে", <TrendingUp size={12} />)}</Fragment>);
      if (group === "product") rendered.push(<Fragment key="h-product">{heading(result?.total ? `বই (${result.total}টি মিলেছে)` : "বই")}</Fragment>);
      if (group === "term") rendered.push(<Fragment key="h-term">{heading("সম্পর্কিত খোঁজ")}</Fragment>);
      if (group === "content") rendered.push(<Fragment key="h-content">{heading("পড়াশোনার রিসোর্স")}</Fragment>);
      lastGroup = group;
    }

    if (option.type === "search") {
      rendered.push(
        row(option, i, <>
          <Search size={16} className="flex-shrink-0 text-amber-600" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">
            “<b className="font-semibold">{option.term}</b>” খুঁজো
          </span>
          <ArrowRight size={15} className="text-stone-400" aria-hidden="true" />
        </>)
      );
    } else if (option.type === "recent" || option.type === "popular" || option.type === "term") {
      rendered.push(
        row(
          option,
          i,
          <>
            {option.type === "recent" ? (
              <Clock size={15} className="flex-shrink-0 text-stone-400" aria-hidden="true" />
            ) : option.type === "popular" ? (
              <TrendingUp size={15} className="flex-shrink-0 text-stone-400" aria-hidden="true" />
            ) : (
              <Search size={15} className="flex-shrink-0 text-stone-400" aria-hidden="true" />
            )}
            <span className="min-w-0 flex-1 truncate">{option.term}</span>
          </>,
          option.type === "recent" ? (
            <button
              type="button"
              aria-label={`"${option.term}" মুছে ফেলো`}
              onClick={(e) => {
                e.stopPropagation();
                removeRecent(option.term);
              }}
              className="-mr-1 flex h-7 w-7 items-center justify-center rounded-full text-stone-400 hover:bg-stone-200 hover:text-stone-700"
            >
              <X size={14} aria-hidden="true" />
            </button>
          ) : (
            <ArrowUpLeft size={15} className="text-stone-300" aria-hidden="true" />
          )
        )
      );
    } else if (option.type === "product") {
      rendered.push(
        row(option, i, <>
          {option.image ? (
            <img src={thumb(option.image)} alt="" width={36} height={45} loading="lazy" className="h-[45px] w-9 flex-shrink-0 rounded-md bg-stone-100 object-cover" />
          ) : (
            <span className="flex h-[45px] w-9 flex-shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-400">
              <BookOpen size={16} aria-hidden="true" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-stone-900">{option.title}</span>
            <span className="block truncate text-xs text-stone-500">
              {[option.author, conditionLabel(option.condition)].filter(Boolean).join(" · ")}
            </span>
          </span>
          {option.price > 0 && <span className="flex-shrink-0 font-semibold text-stone-900">{taka(option.price)}</span>}
        </>)
      );
    } else if (option.type === "content") {
      const meta = CONTENT_META[option.kind];
      const Icon = meta.icon;
      rendered.push(
        row(option, i, <>
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Icon size={16} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-stone-900">{option.title}</span>
            <span className="block text-xs text-stone-500">{meta.label}</span>
          </span>
        </>)
      );
    }
  });

  return (
    <div ref={wrapRef} className="relative w-full">
      <form
        role="search"
        onSubmit={onSubmit}
        className={
          hero
            ? "flex w-full items-center gap-3 border-b border-white/25 pb-3 transition-colors duration-200 focus-within:border-amber-400"
            : "flex h-12 w-full items-center gap-2 rounded-xl border border-stone-200 bg-white pl-4 pr-1.5 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/30"
        }
      >
        <Search size={hero ? 20 : 18} aria-hidden="true" className={`flex-shrink-0 ${hero ? "text-stone-500" : "text-stone-400"}`} />
        <label htmlFor={inputId} className="sr-only">
          বই খুঁজো
        </label>
        <input
          ref={inputRef}
          id={inputId}
          // Plain text input: type=search adds a second, browser-drawn clear button.
          type="text"
          inputMode="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? optionId(active) : undefined}
          autoComplete="off"
          enterKeyHint="search"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={
            hero
              ? "min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-0 sm:text-lg"
              : "min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-0 sm:text-sm"
          }
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
              setOpen(true);
            }}
            aria-label="লেখা মুছে ফেলো"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:text-stone-600"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          aria-label="খুঁজো"
          className={
            hero
              ? "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-stone-950 transition duration-200 hover:bg-amber-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              : "flex h-9 flex-shrink-0 items-center justify-center gap-1 rounded-lg bg-amber-400 px-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
          }
        >
          {hero ? <ArrowRight size={18} aria-hidden="true" /> : "খুঁজো"}
        </button>
      </form>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
          <ul id={listId} role="listbox" aria-label="খোঁজার পরামর্শ" className="max-h-[min(70vh,28rem)] overflow-y-auto pb-2">
            {rendered}
          </ul>
          {typing && isFetching && (
            <p className="flex items-center gap-2 border-t border-stone-100 px-4 py-2 text-xs text-stone-500" aria-live="polite">
              <Loader2 size={12} className="animate-spin" aria-hidden="true" /> খোঁজা হচ্ছে…
            </p>
          )}
          {typing && !isFetching && result && result.products.length === 0 && (
            <p className="border-t border-stone-100 px-4 py-2.5 text-xs leading-relaxed text-stone-500">
              এই নামে এখন কোনো বই নেই। খুঁজলে বইটি পাওয়া গেলে জানানোর ব্যবস্থা পাবে।
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
