import { getChallengeAttachments } from "@/lib/api/game";
import { gameStore } from "@/lib/storage/game";
import { t } from "@/lib/storage/theme";
import type { Challenge } from "@models/challenge";
import ansiColors from "ansi-colors";
import type { ParseEntry } from "shell-quote";
import { link } from "../escapes";
import type { Stdio } from "../stdio";
import type { Command } from "./interface";

export class Ls implements Command {
  name = "ls";
  man = t("shell.ls.man")!;
  func = async (io: Stdio, challenge: Challenge | null, _args: ParseEntry[], _origin: string) => {
    if (!gameStore.current || !challenge) {
      io.error(t("shell.noGameSpecifiedTips")!);
      return 1;
    }
    try {
      io.println(
        `.rw${ansiColors.dim("-")}r${ansiColors.dim("--")}r${ansiColors.dim("--")} ${ansiColors.red("root")} ${ansiColors.yellow(link("README.md\t", "rnix://command/cat README.md"))}`
      );
      const files = await getChallengeAttachments(gameStore.current!.id, challenge.id);
      for (const file of files) {
        io.print(
          `.rw-r--r-- ${ansiColors.red("root")} ${ansiColors.bold(link(`${file.file}\t`, `rnix://command/wget "${file.file}"`))}`
        );
      }
      io.println("");
    } catch {
      io.error(t("shell.ls.error")!);
      return 1;
    }
    return 0;
  };
}
