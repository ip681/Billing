export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'billing_theme'
const DEFAULT_THEME: Theme = 'dark'

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : DEFAULT_THEME
}

export function applyTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme)
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
}
