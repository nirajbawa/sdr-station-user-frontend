import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Theme = 'light' | 'dark'

/** Applies the theme class to <html> immediately (called once per action). */
const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
}

const getSystemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getSystemTheme(),

      setTheme: (theme: Theme) => {
        applyTheme(theme)
        set({ theme })
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      },
    }),
    {
      name: 'app-theme',
      storage: createJSONStorage(() => localStorage),
      // Rehydrate DOM immediately after Zustand restores state from storage
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    }
  )
)

/** Listen for OS-level theme changes and sync if user has no manual preference. */
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', () => {
    // Only follow system if the persisted key doesn't exist
    if (!localStorage.getItem('app-theme')) {
      useThemeStore.getState().setTheme(getSystemTheme())
    }
  })
}
