import { i18n } from '$lib/i18n'
import { get } from 'svelte/store'

export enum Permission {
  Basic,
  Verified,
  Publish,
  Audit,
  Organize,
  Devops,
  Statistics,
  Calendar,
  Certificates,
}

export interface User {
  id: number
  name: string
  email: string
  intro: string
  cover_path: string | null
  institute_info: string | null
  institute_id: number | null
  permissions: Permission[]
  hidden: boolean
  banned: boolean
}

export function permissionToString(permission: Permission) {
  switch (permission) {
    case Permission.Basic:
      return get(i18n).t('permission.basic')
    case Permission.Verified:
      return get(i18n).t('permission.verified')
    case Permission.Publish:
      return get(i18n).t('permission.publish')
    case Permission.Audit:
      return get(i18n).t('permission.audit')
    case Permission.Organize:
      return get(i18n).t('permission.organize')
    case Permission.Devops:
      return get(i18n).t('permission.devops')
    case Permission.Statistics:
      return get(i18n).t('permission.statistics')
    case Permission.Calendar:
      return get(i18n).t('permission.calendar')
    case Permission.Certificates:
      return get(i18n).t('permission.certificates')
  }
}

export interface Token {
  id: number
  name: string
  permissions: Permission[]
  exp: number
}
