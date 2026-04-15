/**
 * Thin wrapper around the Zustand theme store.
 * Using a store (singleton) prevents multiple `useTheme()` callers from
 * maintaining separate state instances and causing infinite update loops.
 */
import { useThemeStore } from '../store/themeStore'

export const useTheme = () => {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const setTheme = useThemeStore((s) => s.setTheme)
  return { theme, toggleTheme, setTheme }
}
