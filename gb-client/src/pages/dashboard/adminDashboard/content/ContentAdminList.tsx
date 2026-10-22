import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Eye, FileText, Pencil, Plus, Trash2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  btn,
  ConfirmDialog,
  DataList,
  EmptyState,
  errorMessage,
  ErrorState,
  formatDate,
  LoadingRows,
  PageHeader,
  Pagination,
  Panel,
  SearchInput,
  SelectFilter,
  Toolbar,
} from "../../../../components/dashboard/ui";
import type { ContentStatus, PageMeta } from "../../../../redux/features/content/contentApi";

export interface ContentRow {
  _id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  updatedAt?: string;
  views: number;
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

// Shared admin list for blog posts and suggestions: search, status filter,
// server-side paging, and edit / view / delete actions.
function ContentAdminList<T extends ContentRow>({
  title,
  description,
  newLabel,
  basePath,
  publicPath,
  icon,
  useList,
  useDelete,
  subtitle,
  extraAction,
}: {
  title: string;
  description: string;
  newLabel: string;
  basePath: string; // e.g. /admin/blogs
  publicPath: string; // e.g. /blogs
  icon: LucideIcon;
  useList: (params: Record<string, string | number | undefined>) => {
    data?: { data: { data: T[]; meta: PageMeta } };
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };
  useDelete: () => readonly [(id: string) => { unwrap: () => Promise<unknown> }, { isLoading: boolean }];
  subtitle: (row: T) => ReactNode;
  // Optional extra header button (e.g. an import).
  extraAction?: ReactNode;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<T | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, refetch } = useList({ page, limit: 20, search, status });
  const [remove, { isLoading: isDeleting }] = useDelete();

  const rows = data?.data.data ?? [];
  const meta = data?.data.meta;

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting._id).unwrap();
      toast.success("Deleted");
      setDeleting(null);
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete"));
    }
  };

  const actions = (row: T) => (
    <div className="flex justify-end gap-1">
      {row.status === "published" && (
        <a href={`${publicPath}/${row.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${row.title}`} className={btn.icon}>
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      )}
      <Link to={`${basePath}/${row._id}/edit`} aria-label={`Edit ${row.title}`} className={btn.icon}>
        <Pencil size={16} aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={() => setDeleting(row)}
        aria-label={`Delete ${row.title}`}
        className={`${btn.icon} hover:!bg-red-50 hover:!text-red-600`}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );

  const statusBadge = (row: T) => (
    <Badge tone={row.status === "published" ? "green" : "stone"}>{row.status === "published" ? "Published" : "Draft"}</Badge>
  );

  const titleCell = (row: T) => (
    <div className="min-w-0">
      <Link to={`${basePath}/${row._id}/edit`} className="block truncate text-sm font-semibold text-stone-900 hover:text-amber-700">
        {row.title}
      </Link>
      <p className="truncate text-xs text-stone-500">{subtitle(row)}</p>
    </div>
  );

  return (
    <>
      <PageHeader
        title={title}
        desc={description}
        action={
          <>
            {extraAction}
            <Link to={`${basePath}/new`} className={btn.primary}>
              <Plus size={16} aria-hidden="true" /> {newLabel}
            </Link>
          </>
        }
      />

      <Toolbar>
        <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search by title" />
        <SelectFilter
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          label="Filter by status"
        />
      </Toolbar>

      <Panel flush className={isFetching && !isLoading ? "opacity-60 transition-opacity" : "transition-opacity"}>
        {isLoading ? (
          <LoadingRows />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={search || status ? FileText : icon}
            title={search || status ? "Nothing matches" : "Nothing here yet"}
            desc={search || status ? "Try another search or status." : "Create the first one to get started."}
            action={
              !search && !status ? (
                <Link to={`${basePath}/new`} className={btn.primary}>
                  <Plus size={16} aria-hidden="true" /> {newLabel}
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            <DataList
              rows={rows}
              rowKey={(row) => row._id}
              columns={[
                { header: "Title", cell: titleCell },
                { header: "Status", cell: statusBadge },
                {
                  header: "Views",
                  cell: (row) => (
                    <span className="flex items-center gap-1 text-stone-600">
                      <Eye size={14} aria-hidden="true" /> {row.views}
                    </span>
                  ),
                },
                { header: "Last edited", cell: (row) => <span className="whitespace-nowrap">{formatDate(row.updatedAt)}</span> },
                { header: "Actions", align: "right", cell: actions },
              ]}
              renderCard={(row) => (
                <div className="space-y-3">
                  {titleCell(row)}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      {statusBadge(row)}
                      <span>{formatDate(row.updatedAt)}</span>
                    </div>
                    {actions(row)}
                  </div>
                </div>
              )}
            />
            <Pagination page={meta?.page ?? 1} pageCount={meta?.totalPages ?? 1} onChange={setPage} />
          </>
        )}
      </Panel>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete this?"
        desc={`"${deleting?.title ?? ""}" will be removed from the site. This cannot be undone from the dashboard.`}
        confirmLabel="Delete"
      />
    </>
  );
}

export default ContentAdminList;
