import type { Game } from '$lib/models/game'
import { writable } from 'svelte/store'

class GameStore {
    current: Game | null
    constructor() {
        this.current = null
    }
}

export const game = writable(new GameStore())
