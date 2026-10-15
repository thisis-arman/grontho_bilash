import { ReactNode, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X, type LucideIcon } from "lucide-react";

/* ── Formatting ─────────────────────────────────────────────────────────── */

const MONEY = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 });

export const money = (amount: number | undefined | null) => `৳${MONEY.format(amount ?? 0)}`;

export const formatDate = (value?: string | Date) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

// RTK Query error → message the API sent, or a fallback.
export const errorMessage = (error: unknown, fallback: string) =>
  (error as { data?: { message?: string } })?.data?.message || fallback;

/* ── Class strings ──────────────────────────────────────────────────────── */

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const btn = {
  primary: `${btnBase} bg-amber-400 text-stone-950 hover:bg-amber-300`,
  secondary: `${btnBase} border border-stone-200 bg-white text-stone-700 hover:bg-stone-50`,
  danger: `${btnBase} bg-red-600 text-white hover:bg-red-700`,
  // Square icon-only button for row actions.
  icon: "inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-40",
};

export const inputClass =
  "block w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-stone-50 disabled:text-stone-500";

/* ── Layout pieces ──────────────────────────────────────────────────────── */

export const PageHeader = ({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) => (
  <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <h1 className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">{title}</h1>
      {desc && <p className="mt-1 text-sm text-stone-500">{desc}</p>}
    </div>
    {action && <div className="flex flex-shrink-0 gap-2">{action}</div>}
  </header>
);

export const Panel = ({
  title,
  action,
  children,
  className = "",
  flush = false,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  // No inner padding (for tables and lists that run edge to edge).
  flush?: boolean;
}) => (
  <section className={`min-w-0 rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3.5 sm:px-5">
        {title && <h2 className="font-display text-base font-bold text-stone-900">{title}</h2>}
        {action}
      </div>
    )}
    <div className={flush ? "" : "p-4 sm:p-5"}>{children}</div>
  </section>
);

export const StatCard = ({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  hint?: string;
}) => (
  <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-2">
      <p className="text-xs font-semibold text-stone-500 sm:text-sm">{label}</p>
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
        <Icon size={16} aria-hidden="true" />
      </span>
    </div>
    <p className="mt-2 truncate font-display text-2xl font-bold text-stone-900 sm:text-3xl">{value}</p>
    {hint && <p className="mt-1 truncate text-xs text-stone-500">{hint}</p>}
  </div>
);

export const StatGrid = ({ children }: { children: ReactNode }) => (
  <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{children}</div>
);

/* ── Status badges ──────────────────────────────────────────────────────── */

type Tone = "green" | "amber" | "red" | "blue" | "stone";

const TONES: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  stone: "bg-stone-100 text-stone-600 ring-stone-200",
};

export const Badge = ({ tone = "stone", children }: { tone?: Tone; children: ReactNode }) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${TONES[tone]}`}
  >
    {children}
  </span>
);

const ORDER_TONE: Record<string, Tone> = {
  pending: "amber",
  confirmed: "blue",
  shipped: "blue",
  delivered: "green",
  cancelled: "red",
};

const PAYMENT_TONE: Record<string, Tone> = {
  pending: "amber",
  "partially-paid": "blue",
  paid: "green",
  failed: "red",
};

export const OrderStatusBadge = ({ status }: { status: string }) => (
  <Badge tone={ORDER_TONE[status] ?? "stone"}>{status}</Badge>
);

export const PaymentStatusBadge = ({ status }: { status: string }) => (
  <Badge tone={PAYMENT_TONE[status] ?? "stone"}>{status.replace("-", " ")}</Badge>
);

/* ── States ─────────────────────────────────────────────────────────────── */

export const EmptyState = ({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: LucideIcon;
  title: string;
  desc?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center px-4 py-12 text-center">
    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
      <Icon size={22} aria-hidden="true" />
    </span>
    <p className="font-display text-lg font-bold text-stone-900">{title}</p>
    {desc && <p className="mt-1 max-w-sm text-sm text-stone-500">{desc}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const LoadingRows = ({ rows = 5 }: { rows?: number }) => (
  <div className="divide-y divide-stone-100" aria-busy="true" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-4 sm:px-5">
        <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-stone-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/5 animate-pulse rounded bg-stone-100" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-stone-100" />
        </div>
        <div className="h-6 w-16 animate-pulse rounded-full bg-stone-100" />
      </div>
    ))}
  </div>
);

export const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="px-4 py-12 text-center">
    <p className="mb-4 text-sm text-stone-600">We could not load this right now.</p>
    <button type="button" onClick={onRetry} className={btn.secondary}>
      Try again
    </button>
  </div>
);

/* ── Inputs ─────────────────────────────────────────────────────────────── */

export const SearchInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className="relative min-w-0 flex-1">
    <Search
      size={16}
      aria-hidden="true"
      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
    />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className={`${inputClass} pl-10`}
    />
  </div>
);

export const SelectFilter = ({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label={label}
    className={`${inputClass} w-full cursor-pointer sm:w-auto sm:min-w-[9.5rem]`}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export const Toolbar = ({ children }: { children: ReactNode }) => (
  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>
);

export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-stone-700">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
  </label>
);

/* ── Responsive data list ───────────────────────────────────────────────── */

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "right";
}

// A table from the md breakpoint up; stacked cards below it, so nothing
// ever needs horizontal scrolling on a phone.
export function DataList<T>({
  rows,
  rowKey,
  columns,
  renderCard,
}: {
  rows: T[];
  rowKey: (row: T) => string;
  columns: Column<T>[];
  renderCard: (row: T) => ReactNode;
}) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-xs uppercase tracking-wide text-stone-500">
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className={`whitespace-nowrap px-5 py-3 font-semibold ${column.align === "right" ? "text-right" : ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="transition-colors hover:bg-stone-50/70">
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`px-5 py-3.5 align-middle ${column.align === "right" ? "text-right" : ""}`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-stone-100 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="p-4">
            {renderCard(row)}
          </li>
        ))}
      </ul>
    </>
  );
}

/* ── Pagination ─────────────────────────────────────────────────────────── */

export const Pagination = ({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) => {
  if (pageCount <= 1) return null;
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-3 border-t border-stone-100 px-4 py-3 sm:px-5"
    >
      <p className="text-sm text-stone-500">
        Page <span className="font-semibold text-stone-900">{page}</span> of {pageCount}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`${btn.secondary} px-3`}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className={`${btn.secondary} px-3`}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

// Client-side paging for lists that arrive in one response.
export function usePaged<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  // Filtering can shrink the list below the current page.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  return { page, setPage, pageCount, pageItems };
}

/* ── Modal ──────────────────────────────────────────────────────────────── */

// Centered dialog on larger screens, bottom sheet on phones.
export const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl ${
          wide ? "sm:max-w-2xl" : "sm:max-w-md"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-stone-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className={btn.icon}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-stone-100 px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  desc,
  confirmLabel,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  desc: string;
  confirmLabel: string;
  loading?: boolean;
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    footer={
      <>
        <button type="button" onClick={onClose} className={btn.secondary}>
          Go back
        </button>
        <button type="button" onClick={onConfirm} disabled={loading} className={btn.danger}>
          {loading ? "Working..." : confirmLabel}
        </button>
      </>
    }
  >
    <p className="text-sm leading-relaxed text-stone-600">{desc}</p>
  </Modal>
);
