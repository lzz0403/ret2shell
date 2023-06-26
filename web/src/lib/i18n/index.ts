import i18next from 'i18next'
import { createI18nStore } from 'svelte-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18next.use(LanguageDetector).init({
  fallbackLng: 'en_US',
  resources: {
    en_US: {
      translation: await import('./en-us.json')
    },
    zh_CN: {
      translation: await import('./zh-cn.json')
    },
  },
  interpolation: {
    escapeValue: false,
  }
})

export const i18n = createI18nStore(i18next)
