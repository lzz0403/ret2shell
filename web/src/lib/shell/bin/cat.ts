import { getChallengeAttachments } from "@/lib/api/game";
import { gameStore } from "@/lib/storage/game";
import { t } from "@/lib/storage/theme";
import type { Challenge } from "@models/challenge";
import type { ParseEntry } from "shell-quote";
import type { Stdio } from "../stdio";
import type { Command } from "./interface";

export class Cat implements Command {
  name = "cat";
  man = t("shell.cat.man")!;
  func = async (io: Stdio, challenge: Challenge | null, args: ParseEntry[]) => {
    if (!gameStore.current || !challenge) {
      io.error(t("shell.noGameSpecifiedTips")!);
      return 1;
    }
    if (args.length === 0) {
      io.error(t("shell.cat.noFileSpecified")!);
      return 1;
    }
    if (args.length > 1) {
      io.error(t("shell.cat.tooManyFiles")!);
      return 1;
    }
    const file = args[0].toString().trim();
    if (file === "README.md") {
      io.println(challenge.content || "");
    } else {
      try {
        const files = await getChallengeAttachments(gameStore.current!.id, challenge.id);
        if (!files.find((f) => f.file === file)) {
          io.error(t("shell.cat.fileNotFound")!);
          return 1;
        }
        io.warning("[BINARY DATA]");
      } catch {
        io.error(t("shell.cat.error")!);
        return 1;
      }
    }
    return 0;
  };
}
