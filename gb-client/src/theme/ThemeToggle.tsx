import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

// Sun/moon switch. `className` lets each header size and colour it to fit.
const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "দিনের থিমে যাও" : "রাতের থিমে যাও";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`relative inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${className}`}
    >
      <Sun
        size={18}
        aria-hidden="true"
        className={`absolute transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
      />
      <Moon
        size={18}
        aria-hidden="true"
        className={`absolute transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
      />
    </button>
  );
};

export default ThemeToggle;
