import type { RnixStdio } from '../stdio'
import type { Command } from './interface'
import * as commands from '.'
import { get } from 'svelte/store'
import { i18n } from '$lib/i18n'
import ansiColors from 'ansi-colors'
import ansiEscapes from 'isomorphic-ansi-escapes'

export class Help implements Command {
  name = 'help'
  man = get(i18n).t('shell.help.man')
  func = async (io: RnixStdio) => {
    io.println(get(i18n).t('shell.helpWelcome', { terminal: ansiColors.blueBright('Rnix Shell') }))
    io.println(get(i18n).t('shell.helpCommands'))
    io.println('')
    for (const command of Object.values(commands)) {
      const cmd = new command()
      io.println(
        ansiEscapes.link(ansiColors.green(cmd.name), `rnix-cmd://${cmd.name}`) +
          ' '.repeat(10 - cmd.name.length) +
          cmd.man
      )
    }
    io.println('')
    io.println(get(i18n).t('shell.helpExit'))
    io.println('')
    return 0
  }
}
