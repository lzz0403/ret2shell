import type { ParseEntry } from 'shell-quote'
import type { RnixStdio } from '../stdio'
import type { Command } from './interface'

export class Ls implements Command {
  name = 'ls'
  man = 'ls'
  func = async (io: RnixStdio, _args: ParseEntry[], origin: string) => {
    return 0
  }
}
