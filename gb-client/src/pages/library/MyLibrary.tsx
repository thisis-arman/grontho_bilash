import { Link } from "react-router-dom";
import { BookOpenCheck, Clock3, Library, MessageCircle, XCircle } from "lucide-react";
import { btn, EmptyState, ErrorState, formatDateBn, LoadingRows, PageHeader, Panel } from "../../components/dashboard/ui";
import { whatsappLink } from "../../components/WhatsAppButton";
import { useGetLibraryQuery, type LibraryItem } from "../../redux/features/library/libraryApi";
import { bnNumber } from "../../i18n/labels";

// "আমার লাইব্রেরি": every digital book the user bought. A book opens once
// the bKash payment is confirmed; until then it shows as waiting.

const STATUS = {
  ready: { text: "পড়ার জন্য তৈরি", tone: "bg-emerald-50 text-emerald-700", icon: BookOpenCheck },
  awaiting: { text: "পেমেন্ট যাচাই হচ্ছে", tone: "bg-amber-50 text-amber-800", icon: Clock3 },
  failed: { text: "পেমেন্ট পাওয়া যায়নি", tone: "bg-red-50 text-red-700", icon: XCircle },
} as const;

const BookRow = ({ item }: { item: LibraryItem }) => {
  const status = STATUS[item.status];
  const StatusIcon = status.icon;
  const facts = [item.fileType, item.pages ? `${bnNumber(item.pages)} পৃষ্ঠা` : null, item.fileSize].filter(Boolean).join(" · ");

  return (
    <li className="flex gap-4 p-4 sm:p-5">
      <Link to={`/products/${item.slug}`} className="flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" className="h-24 w-[4.5rem] rounded-lg bg-stone-100 object-cover shadow-sm" />
        ) : (
          <span className="flex h-24 w-[4.5rem] items-center justify-center rounded-lg bg-stone-100 text-stone-400">
            <Library size={22} aria-hidden="true" />
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="line-clamp-2 font-semibold text-stone-900">{item.title}</h3>
        {item.author && <p className="text-sm text-stone-500">{item.author}</p>}
        {facts && <p className="mt-0.5 text-xs text-stone-500">{facts}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}>
            <StatusIcon size={13} aria-hidden="true" /> {status.text}
          </span>
          {item.status === "ready" ? (
            <Link to={`/read/${item.product}`} className={`${btn.primary} ml-auto`}>
              <BookOpenCheck size={16} aria-hidden="true" /> পড়ো
            </Link>
          ) : (
            <a
              href={whatsappLink(`আসসালামু আলাইকুম, অর্ডার ${item.orderId}-এর পেমেন্ট নিয়ে জানতে চাই।`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn.secondary} ml-auto`}
            >
              <MessageCircle size={16} aria-hidden="true" /> সাহায্য
            </a>
          )}
        </div>
        {item.status === "awaiting" && (
          <p className="mt-2 text-xs leading-relaxed text-stone-500">
            অর্ডার {item.orderId} · {formatDateBn(item.orderedAt)}। bKash পেমেন্ট মিলিয়ে দেখা হলেই বইটি খুলে যাবে, ইমেইলেও জানিয়ে দেব।
          </p>
        )}
      </div>
    </li>
  );
};

const MyLibrary = () => {
  const { data, isLoading, isError, refetch } = useGetLibraryQuery();
  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="আমার লাইব্রেরি" desc="কেনা ডিজিটাল বই এখানে থাকে। যেকোনো ফোন বা কম্পিউটার থেকে লগইন করে পড়তে পারবে।" />
      <Panel flush>
        {isLoading ? (
          <LoadingRows rows={3} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Library}
            title="লাইব্রেরি এখনো খালি"
            desc="PDF নোট, সাজেশন বা ই-বুক কিনলে এখানে পাবে। ডেলিভারি চার্জ লাগে না।"
            action={
              <Link to="/books?type=Digital" className={btn.primary}>
                ডিজিটাল বই দেখো
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-stone-100">
            {items.map((item) => (
              <BookRow key={item.product} item={item} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export default MyLibrary;
