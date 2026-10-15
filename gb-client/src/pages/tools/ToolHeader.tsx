import type { LucideIcon } from "lucide-react";
import { usePageMeta } from "../../utils/usePageMeta";

const ToolHeader = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
}) => {
  usePageMeta(title, desc);
  return (
  <header className="mb-8">
    <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
      <Icon size={22} aria-hidden="true" />
    </span>
    <h1 className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">{title}</h1>
    <p className="mt-2 max-w-2xl leading-relaxed text-stone-600">{desc}</p>
  </header>
  );
};

export default ToolHeader;
