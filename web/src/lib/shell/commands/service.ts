import type { ParseEntry } from 'shell-quote'
import type { RnixStdio } from '../stdio'
import type { Command } from './interface'

export class Service implements Command {
  name = 'service'
  man = 'service'
  func = async (io: RnixStdio, _args: ParseEntry[], origin: string) => {
    return 0
  }
}
