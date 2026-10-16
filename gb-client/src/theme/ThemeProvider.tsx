import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";

export type Theme = "dark" | "light";

// Must match the inline script in index.html, which applies the saved theme
// before React loads so the page never flashes the wrong colours.
const STORAGE_KEY = "gb-theme";
const DEFAULT_THEME: Theme = "dark";

const THEME_COLOR: Record<Theme, string> = { dark: "#0c0a09", light: "#fafaf9" };

const readTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: DEFAULT_THEME,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private mode: the choice just won't be remembered.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {/* sonner draws its own surfaces, so it needs the theme too. */}
      <Toaster position="top-center" theme={theme} richColors closeButton />
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
