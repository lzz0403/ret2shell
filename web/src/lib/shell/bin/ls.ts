import { getChallengeAttachments } from "@api/game";
import type { Challenge } from "@models/challenge";
import { gameStore } from "@storage/game";
import { t } from "@storage/theme";
import ansiColors from "ansi-colors";
import type { ParseEntry } from "shell-quote";
import { link } from "../escapes";
import type { Stdio } from "../stdio";
import type { Command } from "./interface";

export class Ls implements Command {
  name = "ls";
  man = t("shell.ls.man")!;
  func = async (io: Stdio, challenge: Challenge | null, args: ParseEntry[], _origin: string) => {
    console.log(args);
    if (!gameStore.current || !challenge) {
      io.error(t("shell.noGameSpecifiedTips")!);
      return 1;
    }
    if (args.find((arg) => arg.toString().trim().startsWith("-"))) {
      io.error(
        `${t("shell.ls.invalidOption", { option: args.find((arg) => arg.toString().trim().startsWith("-"))?.toString() || "" })}`
      );
      return 1;
    }
    if (args.length > 1) {
      io.error(t("shell.ls.tooManyArgs")!);
      return 1;
    }
    if (args.length > 0) {
      const path = args[0]?.toString().trim() || "";
      if (path.startsWith("/") || path.includes("..")) {
        io.error(t("shell.ls.invalidPath")!);
        return 1;
      }
      if (!path.startsWith("checkers")) {
        io.error(t("shell.ls.noSuchFileOrDirectory")!);
        return 1;
      }
      io.error(t("shell.ls.permissionDenied")!);
      return 1;
    }
    try {
      io.println(
        `${ansiColors.blue("d")}rwx${ansiColors.dim("---")}${ansiColors.dim("---")} ${ansiColors.red("root")} ${ansiColors.blue("checkers")}${ansiColors.dim("/")}`
      );
      io.println(
        `.rw${ansiColors.dim("-")}r${ansiColors.dim("--")}r${ansiColors.dim("--")} ${ansiColors.red("root")} ${ansiColors.yellow(link("README.md\t", "rnix://command/cat README.md"))}`
      );
      const files = await getChallengeAttachments(gameStore.current!.id, challenge.id);
      for (const file of files) {
        io.println(
          `.rw-r--r-- ${ansiColors.red("root")} ${ansiColors.bold(link(`${file.file}\t`, `rnix://command/wget "${file.file}"`))}`
        );
      }
    } catch {
      io.error(t("shell.ls.error")!);
      return 1;
    }
    return 0;
  };
}
