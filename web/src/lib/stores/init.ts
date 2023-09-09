import type { Config } from '$lib/models/config'
import { writable } from 'svelte/store'

class InitConfigStore {
  config: Config
  token: string
  processing: boolean
  constructor() {
    this.config = {}
    this.token = ''
    this.processing = false
  }
}

export const initConfig = writable(new InitConfigStore())
