import { writable } from 'svelte/store'
import { browser } from '$app/environment'

class ThemeStore {
  colorScheme = 'dark'
  constructor() {
    if (browser) {
      const stored = localStorage.getItem('theme')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.colorScheme = parsed.colorScheme
        return
      }
      const systemPrefersTheme =
        window && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      this.colorScheme = systemPrefersTheme ? 'dark' : 'light'
    }
  }
}

export const theme = writable(new ThemeStore())

theme.subscribe((value) => {
  if (browser) {
    localStorage.setItem('theme', JSON.stringify(value))
  }
})
