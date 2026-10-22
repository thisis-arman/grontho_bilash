import { Link } from "react-router-dom";
import { ArrowUpRight, Lightbulb } from "lucide-react";
import { TOOLS } from "./toolsList";
import { usePageMeta } from "../../utils/usePageMeta";

const ToolsHub = () => {
  usePageMeta("ফ্রি স্টুডেন্ট টুলস – CGPA, GPA ও বয়স ক্যালকুলেটর", "CGPA ক্যালকুলেটর, SSC/HSC GPA ক্যালকুলেটর, নম্বর থেকে গ্রেড, চাকরির বয়স হিসাব, অ্যাটেনডেন্স ও ফোকাস টাইমার। সম্পূর্ণ ফ্রি, অ্যাকাউন্ট লাগে না।");
  return (
  <>
    <header className="mb-10">
      <p className="mb-3 text-sm font-semibold text-amber-600">ফ্রি স্টুডেন্ট টুলস</p>
      <h1 className="font-display text-3xl font-bold text-stone-900 sm:text-5xl">
        পড়াশোনার কাজের টুলস
      </h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-stone-600">
        সবগুলো টুল ফ্রি, অ্যাকাউন্ট লাগে না। তোমার দেওয়া তথ্য শুধু তোমার
        ব্রাউজারেই থাকে।
      </p>
    </header>

    <ul className="grid gap-4 sm:grid-cols-2">
      {TOOLS.map((tool) => (
        <li key={tool.path}>
          <Link
            to={tool.path}
            className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <div className="mb-5 flex items-start justify-between">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <tool.icon size={22} aria-hidden="true" />
              </span>
              <ArrowUpRight
                size={20}
                aria-hidden="true"
                className="text-stone-300 transition duration-200 group-hover:rotate-45 group-hover:text-amber-500"
              />
            </div>
            <h2 className="font-display text-xl font-bold text-stone-900">{tool.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{tool.desc}</p>
          </Link>
        </li>
      ))}
    </ul>

    <Link
      to="/suggestions"
      className="group mt-4 flex items-center gap-4 rounded-2xl border border-dashed border-stone-300 p-5 transition hover:border-amber-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-stone-200 text-stone-600 transition group-hover:bg-amber-100 group-hover:text-amber-600">
        <Lightbulb size={22} aria-hidden="true" />
      </span>
      <span>
        <span className="block font-display text-lg font-bold text-stone-900">
          পরীক্ষার সাজেশন
        </span>
        <span className="text-sm text-stone-600">
          বিষয়ভিত্তিক সাজেশন, নোট আর PDF এক জায়গায়।
        </span>
      </span>
    </Link>
  </>
  );
};

export default ToolsHub;
