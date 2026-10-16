import { Suspense } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { TOOLS } from "./toolsList";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
    isActive
      ? "bg-stone-900 text-white"
      : "text-stone-600 hover:bg-stone-200/70 hover:text-stone-900"
  }`;

// Wraps every tool page with the same background and a tab bar for jumping
// between tools.
const ToolsLayout = () => (
  <div className="min-h-screen bg-stone-50 font-sans">
    <nav
      aria-label="টুলস"
      className="border-b border-stone-200 bg-stone-50/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-3 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <NavLink to="/tools" end className={tabClass}>
          <LayoutGrid size={15} aria-hidden="true" />
          সব টুলস
        </NavLink>
        {TOOLS.map((tool) => (
          <NavLink key={tool.path} to={tool.path} className={tabClass}>
            <tool.icon size={15} aria-hidden="true" />
            {tool.shortTitle}
          </NavLink>
        ))}
      </div>
    </nav>

    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <Suspense fallback={<div className="min-h-[40vh]" aria-busy="true" />}>
        <Outlet />
      </Suspense>
    </div>
  </div>
);

export default ToolsLayout;
