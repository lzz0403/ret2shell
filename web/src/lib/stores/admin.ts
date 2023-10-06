import { i18n } from '$lib/i18n'
import type { Challenge } from '$lib/models/challenge'
import type { Game } from '$lib/models/game'
import type { Wiki } from '$lib/models/wiki'
import type { ComponentType } from 'svelte'
import { get, writable } from 'svelte/store'

interface RouteItem {
  name: string
  path: string
}

class AdminStore {
  game: Game | null
  challenge: Challenge | null
  wiki: Wiki | null
  route: RouteItem[]
  secondLevelComponent: ComponentType | null

  constructor() {
    this.game = null
    this.challenge = null
    this.wiki = null
    this.route = [{ name: get(i18n).t('admin.title'), path: '/admin' }]
    this.secondLevelComponent = null
  }
}

export const admin = writable(new AdminStore())

export function refreshAdminRoute(path: string) {
  const routes = path.split('/').filter((x) => x !== '')
  const routeItems: RouteItem[] = []
  let routePath = ''
  for (const route in routes) {
    routePath += '/' + routes[route]
    if (!Number.isNaN(parseInt(routes[route]))) {
      if (get(admin).game) {
        routeItems.push({ name: get(admin).game?.name || '', path: routePath })
      } else if (get(admin).challenge) {
        routeItems.push({ name: get(admin).challenge?.name || '', path: routePath })
      } else if (get(admin).wiki) {
        routeItems.push({ name: get(admin).wiki?.title || '', path: routePath })
      }
    } else {
      routeItems.push({ name: get(i18n).t(`admin.routes.${routes[route]}`), path: routePath })
    }
  }

  admin.update((a) => {
    a.route = routeItems
    return a
  })
}
