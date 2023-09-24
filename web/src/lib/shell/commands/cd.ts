import type { ParseEntry } from 'shell-quote'
import type { RnixStdio } from '../stdio'
import type { Command } from './interface'

export class Cd implements Command {
  name = 'cd'
  man = 'cd'
  func = async (io: RnixStdio, _args: ParseEntry[], origin: string) => {
    return 0
  }
}
