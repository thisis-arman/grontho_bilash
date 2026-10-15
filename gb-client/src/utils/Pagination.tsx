import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | 'gap';

// First, last, and the pages around the current one, with gaps between:
// 1 … 4 5 6 … 12
export const getPageList = (current: number, total: number): PageItem[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: PageItem[] = [1];
  const start = Math.max(2, Math.min(current - 1, total - 4));
  const end = Math.min(total - 1, Math.max(current + 1, 5));

  if (start > 2) pages.push('gap');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('gap');
  pages.push(total);
  return pages;
};

const arrow =
  'inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-40';

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;
  const pages = getPageList(page, totalPages);

  return (
    <nav className="flex items-center justify-between gap-2 sm:justify-center" aria-label="Pagination">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={arrow} aria-label="Previous page">
        <ChevronLeft size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Phones: a compact counter instead of a row of numbers. */}
      <p className="text-sm text-stone-600 sm:hidden">
        Page <span className="font-semibold text-stone-900">{page}</span> of {totalPages}
      </p>

      <ul className="hidden items-center gap-1 sm:flex">
        {pages.map((item, i) =>
          item === 'gap' ? (
            <li key={`gap-${i}`} className="w-8 select-none text-center text-stone-400" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={`h-10 min-w-[2.5rem] rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  item === page ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {item}
              </button>
            </li>
          )
        )}
      </ul>

      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className={arrow} aria-label="Next page">
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pagination;
