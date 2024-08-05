import { publishChallenge, withdrawChallenge } from "@api/game";
import type { Challenge } from "@models/challenge";
import { Permission } from "@models/user";
import { accountStore } from "@storage/account";
import { challengeStore, setChallengeStore } from "@storage/challenge";
import { gameStore } from "@storage/game";
import { fullTheme, t } from "@storage/theme";
import { addToast } from "@storage/toast";
import Button from "@widgets/button";
import Card from "@widgets/card";
import Divider from "@widgets/divider";
import Popover from "@widgets/popover";
import Splitter from "@widgets/splitter";
import type { HTTPError } from "ky";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { Show, createSignal, onCleanup } from "solid-js";
import { Dynamic } from "solid-js/web";
import Answer from "./answer";
import Checker from "./checker";
import Files from "./files";
import Hammer from "./hammer";
import Hints from "./hints";
import Instances from "./instances";
import Intro from "./intro";
import Settings from "./settings";
import Statistics from "./statistics";
import Terminal from "./terminal";

function BottomPanel(props: {
  onStateChange?: (challenge: Challenge) => void;
  inGame: boolean;
}) {
  const [page, setPage] = createSignal(0);
  const pages = [Terminal, Hints, Files, Hammer, Answer, Statistics, Instances, Checker, Settings];
  const [publishing, setPublishing] = createSignal(false);

  function handlePublishChallenge() {
    setPublishing(true);
    if (challengeStore.current?.hidden) {
      publishChallenge(challengeStore.current.game_id, challengeStore.current.id)
        .then((resp) => {
          props.onStateChange?.(resp);
        })
        .catch((err: HTTPError) => {
          void err.response.text().then((text) => {
            addToast({
              level: "error",
              description: `${t("game.challenge.publishChallengeFailed")}: ${text}`,
              duration: 5000,
            });
          });
        })
        .finally(() => {
          setPublishing(false);
        });
    } else {
      withdrawChallenge(challengeStore.current!.game_id, challengeStore.current!.id)
        .then((resp) => {
          props.onStateChange?.(resp);
        })
        .catch((err: HTTPError) => {
          void err.response.text().then((text) => {
            addToast({
              level: "error",
              description: `${t("game.challenge.withdrawChallengeFailed")}: ${text}`,
              duration: 5000,
            });
          });
        })
        .finally(() => {
          setPublishing(false);
        });
    }
  }
  return (
    <div class="w-full h-full overflow-hidden flex flex-col">
      <OverlayScrollbarsComponent
        class="w-full h-16 backdrop-blur border-b border-b-layer-content/10 relative"
        options={{
          scrollbars: {
            theme: `os-theme-${fullTheme()}`,
            autoHide: "scroll",
          },
        }}
        defer
      >
        <div class="h-full flex px-2 py-0 items-center space-x-2 min-w-max w-max">
          <Button onClick={() => setPage(0)} ghost={page() !== 0}>
            <span class="icon-[fluent--code-20-regular] w-5 h-5" />
            <span>{t("game.challenge.terminal")}</span>
          </Button>
          <Button onClick={() => setPage(1)} ghost={page() !== 1}>
            <span class="icon-[fluent--info-20-regular] w-5 h-5" />
            <span>{t("game.challenge.hint")}</span>
          </Button>
          <Button onClick={() => setPage(3)} ghost={page() !== 3} disabled={!props.inGame}>
            <span class="icon-[fluent-emoji-flat--hammer] w-5 h-5" />
            <span>{t("game.challenge.hammer")}</span>
          </Button>
          <Button
            onClick={() => setPage(4)}
            ghost={page() !== 4}
            disabled={
              props.inGame &&
              !(
                !!accountStore.id &&
                accountStore.permissions.includes(Permission.Game) &&
                gameStore.current?.admins.includes(accountStore.id)
              )
            }
          >
            <span class="icon-[fluent--checkmark-circle-20-regular] w-5 h-5" />
            <span>{t("game.challenge.answer")}</span>
          </Button>
          <Show
            when={
              !!accountStore.id &&
              accountStore.permissions.includes(Permission.Game) &&
              gameStore.current?.admins.includes(accountStore.id)
            }
          >
            <Divider direction="vertical" class="h-8" />
            <Button onClick={() => setPage(5)} ghost={page() !== 5}>
              <span class="icon-[fluent--data-pie-20-regular] w-5 h-5" />
              <span>{t("game.challenge.statistics")}</span>
            </Button>
            <Button onClick={() => setPage(2)} ghost={page() !== 2}>
              <span class="icon-[fluent--save-20-regular] w-5 h-5" />
              <span>{t("game.challenge.files")}</span>
            </Button>
            <Button onClick={() => setPage(6)} ghost={page() !== 6}>
              <span class="icon-[fluent--production-20-regular] w-5 h-5" />
              <span>{t("game.challenge.instances")}</span>
            </Button>
            <Button onClick={() => setPage(7)} ghost={page() !== 7}>
              <span class="icon-[fluent--flash-play-20-regular] w-5 h-5" />
              <span>{t("game.challenge.checker")}</span>
            </Button>
            <Button onClick={() => setPage(8)} ghost={page() !== 8}>
              <span class="icon-[fluent--settings-20-regular] w-5 h-5" />
              <span>{t("game.challenge.settings")}</span>
            </Button>
            <Popover
              ghost
              btnContent={
                <Show
                  when={challengeStore.current?.hidden}
                  fallback={
                    <>
                      <span class="icon-[fluent--chevron-double-down-20-regular] w-5 h-5 text-warning" />
                      <span class="text-warning">{t("game.challenge.withdraw")}</span>
                    </>
                  }
                >
                  <span class="icon-[fluent--chevron-double-up-20-regular] w-5 h-5 text-success" />
                  <span class="text-success">{t("game.challenge.publishChallenge")}</span>
                </Show>
              }
            >
              <Card contentClass="p-2 flex flex-col space-x-2 max-w-96">
                <span class="inline-block space-x-2">
                  <span class="icon-[fluent--info-20-regular] w-5 h-5 text-primary align-middle" />
                  <Show
                    when={challengeStore.current?.hidden}
                    fallback={
                      <>
                        <span>{t("game.challenge.withdrawTips")}</span>
                      </>
                    }
                  >
                    <span>{t("game.challenge.publishTips")}</span>
                  </Show>
                </span>
                <Button
                  level="primary"
                  size="sm"
                  class="self-end"
                  onClick={handlePublishChallenge}
                  loading={publishing()}
                >
                  {t("platform.accept")}
                </Button>
              </Card>
            </Popover>
          </Show>
        </div>
      </OverlayScrollbarsComponent>
      <OverlayScrollbarsComponent
        options={{
          scrollbars: {
            theme: `os-theme-${fullTheme()}`,
            autoHide: "scroll",
          },
        }}
        class="relative w-full flex-1 print:h-auto print:overflow-auto"
        defer
      >
        <Dynamic component={pages[page()]} />
      </OverlayScrollbarsComponent>
    </div>
  );
}

export default function (props: {
  onStateChange?: (challenge: Challenge) => void;
  inGame?: boolean;
}) {
  onCleanup(() => {
    setChallengeStore({ current: null, env: null, files: [], adminFiles: [] });
  });
  return (
    <div class="flex-1">
      <Splitter
        startPanel={() => <Intro inGame={props.inGame} />}
        endPanel={() => <BottomPanel inGame={props.inGame ?? false} onStateChange={props.onStateChange} />}
        orientation="vertical"
        size={[
          { id: "a", size: 64, minSize: 24 },
          { id: "b", size: 36, minSize: 20 },
        ]}
      />
    </div>
  );
}
