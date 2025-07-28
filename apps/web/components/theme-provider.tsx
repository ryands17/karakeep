"use client";

import type { ThemeProviderProps } from "next-themes/dist/types";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function useToggleTheme() {
  const { theme, setTheme, systemTheme } = useTheme();

  if (theme == "dark" || systemTheme == "dark") {
    return () => setTheme("light");
  } else {
    return () => setTheme("dark");
  }
}
