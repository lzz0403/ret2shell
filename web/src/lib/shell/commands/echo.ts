import type { ParseEntry } from 'shell-quote'
import type { RnixStdio } from '../stdio'
import type { Command } from './interface'
import { get } from 'svelte/store'
import { i18n } from '$lib/i18n'

export class Echo implements Command {
  name = 'echo'
  man = get(i18n).t('shell.echo.man')
  func = async (io: RnixStdio, _args: ParseEntry[], origin: string) => {
    io.println(origin.replace('echo', '').trim())
    return 0
  }
}
