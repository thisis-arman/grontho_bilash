import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DownloadCloud, ExternalLink, GraduationCap, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge, btn, EmptyState, errorMessage, ErrorState, LoadingRows, PageHeader, Panel, SearchInput } from "../../../../components/dashboard/ui";
import { useGetAdminCurriculaQuery, useImportNuHonoursMutation } from "../../../../redux/features/hub/hubApi";

// Course catalogue admin: departments per program, with each year's courses.
const CurriculumAdmin = () => {
  const { data, isLoading, isError, refetch } = useGetAdminCurriculaQuery();
  const [importNu, { isLoading: importing }] = useImportNuHonoursMutation();
  const [search, setSearch] = useState("");
  const rows = data?.data ?? [];

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? rows.filter((r) => `${r.program} ${r.department} ${r.departmentBn ?? ""}`.toLowerCase().includes(q)) : rows;
  }, [rows, search]);

  const runImport = async () => {
    try {
      const res = await importNu().unwrap();
      const { departmentsAdded, yearsAdded } = res.data;
      toast.success(
        departmentsAdded || yearsAdded
          ? `Imported ${departmentsAdded} departments and ${yearsAdded} year syllabi.`
          : "Everything from the NU dataset is already here. Nothing was changed."
      );
    } catch (error) {
      toast.error(errorMessage(error, "Import failed"));
    }
  };

  return (
    <div>
      <PageHeader
        title="Courses & syllabus"
        desc="Departments and their courses for each year. Students see these at /courses, and sellers pick a course when listing a book."
        action={
          <>
            <button type="button" onClick={runImport} disabled={importing} className={btn.secondary}>
              <DownloadCloud size={16} aria-hidden="true" /> {importing ? "Importing…" : "Import NU Honours 2024-25"}
            </button>
            <Link to="/admin/curriculum/new" className={btn.primary}>
              <Plus size={16} aria-hidden="true" /> New department
            </Link>
          </>
        }
      />

      <Panel flush>
        <div className="border-b border-stone-100 p-4 sm:p-5">
          <SearchInput value={search} onChange={setSearch} placeholder="Search program or department" />
          <p className="mt-2 text-xs text-stone-500">
            “Import” adds National University Honours departments (new curriculum, session 2024-25) that are not here yet, and any missing
            years. It never changes what you have edited.
          </p>
        </div>
        {isLoading ? (
          <LoadingRows rows={6} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={rows.length ? "No match" : "No departments yet"}
            desc={rows.length ? "Try another search." : "Import the National University Honours catalogue, or add a department yourself."}
          />
        ) : (
          <ul className="divide-y divide-stone-100">
            {visible.map((r) => (
              <li key={r._id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-900">
                    {r.departmentBn ? `${r.departmentBn} · ` : ""}
                    {r.department}
                  </p>
                  <p className="text-xs text-stone-500">
                    {r.program} · {r.level} ·{" "}
                    {r.years
                      .map((y) => `Year ${y.year} (${y.courses?.length ?? 0})`)
                      .join(", ") || "no years yet"}
                  </p>
                </div>
                {r.status === "draft" && <Badge tone="stone">Draft</Badge>}
                <a href={`/courses/${r.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${r.department}`} className={btn.icon}>
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
                <Link to={`/admin/curriculum/${r._id}/edit`} aria-label={`Edit ${r.department}`} className={btn.icon}>
                  <Pencil size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export default CurriculumAdmin;
