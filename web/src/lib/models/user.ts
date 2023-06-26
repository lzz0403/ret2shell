import { i18n } from '$lib/i18n'
import { get } from 'svelte/store'

export interface User {
  id: number
  name: string
  email: string
  level: number
  intro: string
  cover_path: string | null
  institute_info: string | null
  institute_id: number | null
  hidden: boolean
  banned: boolean
}

export function getUserRole(level: number): string {
  switch (level) {
    case 0:
      return get(i18n).t('account.unverified')
    case 1:
      return get(i18n).t('account.player')
    case 2:
      return get(i18n).t('account.domainAdmin')
    case 3:
      return get(i18n).t('account.superAdmin')
    default:
      return get(i18n).t('account.unknown')
  }
}
