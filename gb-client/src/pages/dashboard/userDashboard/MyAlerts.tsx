import { useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { btn, EmptyState, errorMessage, ErrorState, formatDateBn, LoadingRows, PageHeader, Panel } from "../../../components/dashboard/ui";
import { useCreateBookAlertMutation, useDeleteBookAlertMutation, useGetMyAlertsQuery } from "../../../redux/features/hub/hubApi";

// "আমার খোঁজ": books the student asked to be told about.
const MyAlerts = () => {
  const { data, isLoading, isError, refetch } = useGetMyAlertsQuery();
  const [remove, { isLoading: isRemoving }] = useDeleteBookAlertMutation();
  const [create, { isLoading: isCreating }] = useCreateBookAlertMutation();
  const [query, setQuery] = useState("");
  const alerts = data?.data ?? [];

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 3) return void toast.error("বইয়ের নাম আরেকটু লিখে দাও।");
    try {
      const res = await create(q).unwrap();
      if (res.data.alreadyAvailable) {
        toast.success(`এই বই এখনই পাওয়া যাচ্ছে!`, {
          action: { label: "দেখো", onClick: () => window.location.assign(`/books?search=${encodeURIComponent(q)}`) },
        });
      } else {
        toast.success("খোঁজ সেভ হয়েছে। পাওয়া গেলে ইমেইলে জানাবো।");
        setQuery("");
      }
    } catch (error) {
      toast.error(errorMessage(error, "সেভ করা গেল না"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="আমার খোঁজ" desc="যে বইগুলো পাওয়া গেলে জানতে চেয়েছ। কেউ লিস্ট করলেই ইমেইল পাবে, আর এখানে দেখাবে।" />

      <Panel>
        <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="new-alert" className="sr-only">
            বইয়ের নাম
          </label>
          <input
            id="new-alert"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="যে বই খুঁজছ তার নাম লেখো"
            maxLength={100}
            className="block h-12 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-base text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 sm:text-sm"
          />
          <button type="submit" disabled={isCreating} className={`${btn.primary} h-12 flex-shrink-0`}>
            {isCreating ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <BellRing size={16} aria-hidden="true" />}
            পেলে জানাও
          </button>
        </form>
      </Panel>

      <Panel flush>
        {isLoading ? (
          <LoadingRows rows={4} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : alerts.length === 0 ? (
          <EmptyState icon={BellRing} title="কোনো খোঁজ নেই" desc="শপে কোনো বই না পেলে “পাওয়া গেলে আমাকে জানাও” চাপো, বা উপরে নাম লিখে দাও।" />
        ) : (
          <ul className="divide-y divide-stone-100">
            {alerts.map((alert) => (
              <li key={alert._id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <span
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                    alert.status === "notified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {alert.status === "notified" ? <CheckCircle2 size={18} aria-hidden="true" /> : <BellRing size={18} aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-stone-900">{alert.query}</p>
                  {alert.status === "notified" && alert.matchedProduct ? (
                    <p className="text-sm text-emerald-700">
                      পাওয়া গেছে:{" "}
                      <Link to={`/products/${alert.matchedProduct.slug}`} className="font-semibold underline">
                        {alert.matchedProduct.title}
                      </Link>
                    </p>
                  ) : (
                    <p className="text-sm text-stone-500">অপেক্ষায় আছে · {formatDateBn(alert.createdAt)} থেকে</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await remove(alert._id).unwrap();
                      toast.success("মুছে ফেলা হয়েছে");
                    } catch (error) {
                      toast.error(errorMessage(error, "মুছে ফেলা গেল না"));
                    }
                  }}
                  disabled={isRemoving}
                  aria-label={`${alert.query} খোঁজটি মুছে ফেলো`}
                  className={btn.icon}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export default MyAlerts;
