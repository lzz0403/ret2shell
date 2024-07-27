import { accountStore } from "@storage/account";
import { t } from "@storage/theme";
import ansiColors from "ansi-colors";
import { link } from "../escapes";
import type { Stdio } from "../stdio";
import type { Command } from "./interface";

export class Whoami implements Command {
  name = "whoami";
  man = t("shell.whoami.man")!;
  func = async (io: Stdio) => {
    const email = ansiColors.dim(
      link(accountStore.info?.email || "guest@private.ret.sh.cn", `mailto:${accountStore.info?.email}`)
    );
    io.println(
      `${ansiColors.blue(accountStore.account || "guest")} (${accountStore.nickname}) ${ansiColors.dim("<")}${ansiColors.dim(
        email
      )}${ansiColors.dim(">")}`
    );
    return 0;
  };
}
