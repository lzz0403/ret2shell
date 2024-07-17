import { getChallengeEnv } from "@/lib/api/game";
import type { Challenge } from "@/lib/models/challenge";
import { t } from "@/lib/storage/theme";
import ansiColors from "ansi-colors";
import { HTTPError } from "ky";
import type { ParseEntry } from "shell-quote";
import { link } from "../escapes";
import type { Stdio } from "../stdio";
import type { Command } from "./interface";

type ChallengeEnv = {
  port: number;
  images: { tag: string; cpu: number; mem: string }[];
};

export class Service implements Command {
  name = "service";
  man = t("shell.service.man")!;
  func = async (io: Stdio, challenge: Challenge, args: ParseEntry[], _origin: string) => {
    const action = {
      start: this.start,
      stop: this.stop,
      restart: this.restart,
      status: this.status,
      delay: this.delay,
    };
    if (args.length !== 1 || !Object.keys(action).includes(args[0].toString().trim())) {
      io.error(t("shell.service.needAction")!);
      io.info(t("shell.service.usage")!);
      io.info(`\t${ansiColors.green(link("start", "rnix://command/service start"))}\t${t("shell.service.startTips")}`);
      io.info(`\t${ansiColors.green(link("stop", "rnix://command/service stop"))}\t${t("shell.service.stopTips")}`);
      io.info(
        `\t${ansiColors.green(link("restart", "rnix://command/service restart"))}\t${t("shell.service.restartTips")}`
      );
      io.info(
        `\t${ansiColors.green(link("status", "rnix://command/service status"))}\t${t("shell.service.statusTips")}`
      );
      io.info(`\t${ansiColors.green(link("delay", "rnix://command/service delay"))}\t${t("shell.service.delayTips")}`);
      return 1;
    }
    const env = await this.getEnv(io, challenge);
    if (!env) return 1;
    return action[args[0].toString().trim() as "start" | "stop" | "restart" | "status" | "delay"](io, challenge, env);
  };

  async getEnv(io: Stdio, challenge: Challenge) {
    try {
      const env = await getChallengeEnv(challenge.game_id, challenge.id);
      if (!env) {
        io.error(t("shell.service.noEnv")!);
        return null;
      }
      return env;
    } catch (e) {
      if (e instanceof HTTPError) {
        const text = await e.response.text();
        io.error(`${t("shell.service.error")!}: ${text}`);
      } else {
        io.error(`${t("shell.service.error")!}: ${e}`);
      }
      return null;
    }
  }

  async start(io: Stdio, challenge: Challenge, env: ChallengeEnv) {
    return 0;
  }

  async stop(io: Stdio, challenge: Challenge, env: ChallengeEnv) {
    return 0;
  }

  async restart(io: Stdio, challenge: Challenge, env: ChallengeEnv) {
    return 0;
  }

  async status(io: Stdio, challenge: Challenge, env: ChallengeEnv) {
    return 0;
  }

  async delay(io: Stdio, challenge: Challenge, env: ChallengeEnv) {
    return 0;
  }
}
