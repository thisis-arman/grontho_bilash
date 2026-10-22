import { BellRing, SearchX, TrendingUp } from "lucide-react";
import { EmptyState, ErrorState, formatDate, LoadingRows, PageHeader, Panel, StatCard, StatGrid } from "../../../components/dashboard/ui";
import { useGetSearchInsightsQuery } from "../../../redux/features/hub/hubApi";

// What students search for, and above all what they search for and don't
// find: the list of books worth sourcing next.
const SearchInsights = () => {
  const { data, isLoading, isError, refetch } = useGetSearchInsightsQuery(undefined, { refetchOnMountOrArgChange: 60 });
  const insights = data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search insights"
        desc="Searches that found nothing, the most common searches, and books students asked to be notified about. Source these books first."
      />

      {isLoading ? (
        <Panel flush>
          <LoadingRows rows={6} />
        </Panel>
      ) : isError || !insights ? (
        <Panel flush>
          <ErrorState onRetry={refetch} />
        </Panel>
      ) : (
        <>
          <StatGrid>
            <StatCard label="Different searches" value={insights.totals.distinctSearches} icon={TrendingUp} />
            <StatCard label="Waiting for a book" value={insights.totals.openAlerts} icon={BellRing} />
            <StatCard label="Alerts sent" value={insights.totals.notifiedAlerts} icon={BellRing} />
          </StatGrid>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="Searched but not found" flush>
              {insights.notFound.length === 0 ? (
                <EmptyState icon={SearchX} title="Nothing yet" desc="Searches with no results will appear here." />
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-stone-500">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold sm:px-5">Search</th>
                      <th className="px-2 py-2.5 text-right font-semibold">Times</th>
                      <th className="px-4 py-2.5 text-right font-semibold sm:px-5">Last</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.notFound.map((row) => (
                      <tr key={row._id} className="border-t border-stone-100">
                        <td className="px-4 py-2.5 font-medium text-stone-900 sm:px-5">{row.display}</td>
                        <td className="px-2 py-2.5 text-right text-stone-700">{row.zeroCount}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right text-stone-500 sm:px-5">{formatDate(row.lastSearchedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>

            <Panel title="Students waiting to be notified" flush>
              {insights.openAlerts.length === 0 ? (
                <EmptyState icon={BellRing} title="No open alerts" desc="When a student taps “notify me”, the book shows up here." />
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-stone-500">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold sm:px-5">Book</th>
                      <th className="px-2 py-2.5 text-right font-semibold">Students</th>
                      <th className="px-4 py-2.5 text-right font-semibold sm:px-5">Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.openAlerts.map((row) => (
                      <tr key={row.query} className="border-t border-stone-100">
                        <td className="px-4 py-2.5 font-medium text-stone-900 sm:px-5">{row.query}</td>
                        <td className="px-2 py-2.5 text-right text-stone-700">{row.people}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right text-stone-500 sm:px-5">{formatDate(row.since)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </div>

          <Panel title="Most searched" flush>
            {insights.top.length === 0 ? (
              <EmptyState icon={TrendingUp} title="No searches yet" desc="Searches from the shop page will appear here." />
            ) : (
              <ul className="flex flex-wrap gap-2 p-4 sm:p-5">
                {insights.top.map((row) => (
                  <li key={row._id} className={`rounded-full border px-3 py-1.5 text-sm ${row.lastResults ? "border-stone-200 text-stone-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                    {row.display} <span className="text-stone-400">· {row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </div>
  );
};

export default SearchInsights;
