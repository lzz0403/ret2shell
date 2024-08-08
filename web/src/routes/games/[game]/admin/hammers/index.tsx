import { getChallenge, getGameAdminChatMessages, getTeamInfo, sendGameAdminChatMessage } from "@api/game";
import xdsecMascotNormal from "@assets/imgs/xdsec-mascot-normal.webp";
import { mediaPath } from "@lib/utils/media";
import type { Challenge } from "@models/challenge";
import type { Chat } from "@models/chat";
import type { Team } from "@models/team";
import { A, useSearchParams } from "@solidjs/router";
import { accountStore } from "@storage/account";
import { gameStore } from "@storage/game";
import { fullTheme, t } from "@storage/theme";
import { addToast } from "@storage/toast";
import Avatar from "@widgets/avatar";
import Button from "@widgets/button";
import Card from "@widgets/card";
import Input from "@widgets/input";
import Link from "@widgets/link";
import type { HTTPError } from "ky";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { For, Show, createEffect, createMemo, createSignal, onCleanup, untrack } from "solid-js";

export default function () {
  const [searchParams, _] = useSearchParams();
  const teamId = createMemo(() => Number.parseInt(searchParams.team ?? "") || null);
  const challengeId = createMemo(() => Number.parseInt(searchParams.challenge ?? "") || null);
  const [challenge, setChallenge] = createSignal(null as Challenge | null);
  const [team, setTeam] = createSignal(null as Team | null);
  createEffect(() => {
    if (gameStore.current && challengeId()) {
      getChallenge(gameStore.current.id, challengeId()!)
        .then(setChallenge)
        .catch((err: HTTPError) => {
          err.response.text().then((text) => {
            addToast({
              level: "error",
              description: `${t("game.challenge.fetchChallengeFailed")}: ${text}`,
              duration: 5000,
            });
          });
        });
    }
    if (gameStore.current && teamId()) {
      getTeamInfo(gameStore.current.id, teamId()!)
        .then(setTeam)
        .catch((err: HTTPError) => {
          err.response.text().then((text) => {
            addToast({
              level: "error",
              description: `${t("game.team.fetchTeamFailed")}: ${text}`,
              duration: 5000,
            });
          });
        });
    }
  });
  const [chats, setChats] = createSignal([] as Chat[]);
  const [chat, setChat] = createSignal("");
  const [sending, setSending] = createSignal(false);
  function handleSendChat() {
    if (chat() === "") return;
    setSending(true);
    sendGameAdminChatMessage(gameStore.current!.id, challengeId()!, teamId()!, chat())
      .then(() => {
        setChat("");
        refreshChats();
      })
      .catch((err: HTTPError) => {
        err.response.text().then((text) => {
          addToast({
            level: "error",
            description: `${t("game.challenge.sendChatError")}: ${text}`,
            duration: 5000,
          });
        });
      })
      .finally(() => setSending(false));
  }
  let chatBottomEl: HTMLDivElement;

  function refreshChats() {
    if (gameStore.current && challengeId() && teamId()) {
      getGameAdminChatMessages(gameStore.current.id, challengeId()!, teamId()!)
        .then((result) => {
          if (result.length > chats().length) {
            setChats(result);
            setTimeout(() => chatBottomEl?.scrollIntoView({ behavior: "smooth" }), 300);
          }
        })
        .catch((err: HTTPError) => {
          err.response.text().then((text) => {
            addToast({
              level: "error",
              description: `${t("game.challenge.fetchChatError")}: ${text}`,
              duration: 5000,
            });
          });
        });
    }
    return refreshChats;
  }

  createEffect(() => {
    if (gameStore.current && challengeId() && teamId()) {
      untrack(refreshChats);
    }
  });

  const interval = setInterval(refreshChats(), 5000);
  onCleanup(() => clearInterval(interval));
  return (
    <div class="flex-1 overflow-hidden flex flex-col">
      <div class="h-16 flex flex-row px-4 space-x-2 items-center backdrop-blur border-b border-b-layer-content/10">
        <span class="icon-[fluent--chat-20-regular] w-5 h-5" />
        <span class="font-bold">{t("game.admin.chat.title")}</span>
        <span class="flex-1" />
        <Show when={challenge()}>
          <A
            class="flex flex-row space-x-2 hover:underline items-center"
            href={`/games/${gameStore.current?.id}/teams/${teamId()}`}
          >
            <span class="icon-[fluent--flag-20-regular] w-5 h-5" />
            <span>{team()?.name}</span>
          </A>
        </Show>
        <Show when={team()}>
          <A
            class="flex flex-row space-x-2 hover:underline items-center"
            href={`/games/${gameStore.current?.id}/challenges?challenge=${challengeId()}`}
          >
            <span class="icon-[fluent--code-20-regular] w-5 h-5" />
            <span>{challenge()?.name}</span>
          </A>
        </Show>
      </div>
      <OverlayScrollbarsComponent
        class="w-full flex-1 backdrop-blur relative"
        options={{
          scrollbars: {
            theme: `os-theme-${fullTheme()}`,
            autoHide: "scroll",
          },
        }}
        defer
      >
        <Show
          when={teamId() && challengeId()}
          fallback={
            <div class="min-h-full w-full flex items-center justify-center space-x-2">
              <span class="icon-[fluent--chat-20-regular] w-5 h-5" />
              <span class="font-bold">{t("game.admin.chat.selectToShow")}</span>
            </div>
          }
        >
          <div class="flex flex-col min-h-full relative">
            <div class="flex flex-col flex-1 p-3 lg:p-6 space-y-4">
              <div class="self-start flex-row max-w-[calc(100%-4rem)] flex items-center">
                <img src={xdsecMascotNormal} width={40} height={40} alt="ΦωΦ" class="flex-shrink-0 self-start mt-2" />
                <div class="w-4 flex-shrink-0" />
                <div class="flex flex-col space-y-1">
                  <label class="label">Ciallo～(∠・ω&lt; )</label>
                  <Card contentClass="flex flex-col space-y-2 p-2">
                    <span>{t("game.challenge.adminHammerTips")}</span>
                    <div class="flex flex-row space-x-2">
                      <Link
                        class="!h-auto p-2"
                        href={`/games/${gameStore.current?.id}/challenges?challenge=${challengeId()}`}
                      >
                        <div class="flex flex-row space-x-2 items-center pr-4">
                          <span class="icon-[fluent--code-20-filled] w-8 h-8 m-2" />
                          <div class="flex flex-col items-start">
                            <h3 class="font-bold">{challenge()?.name}</h3>
                            <p class="opacity-60">{challenge()?.score} pts</p>
                          </div>
                        </div>
                      </Link>
                      <Link class="!h-auto p-2" href={`/games/${gameStore.current?.id}/teams/${teamId()}`}>
                        <div class="flex flex-row space-x-2 items-center pr-4">
                          <span class="icon-[fluent--flag-20-filled] w-8 h-8 m-2" />
                          <div class="flex flex-col items-start">
                            <h3 class="font-bold">{team()?.name}</h3>
                            <p class="opacity-60">{team()?.score} pts</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </Card>
                </div>
              </div>
              <For each={chats()}>
                {(chat) => (
                  <div
                    class={`${chat.user_id !== accountStore.id ? "self-start flex-row" : "self-end flex-row-reverse"} max-w-[calc(100%-4rem)] flex items-center`}
                  >
                    <Avatar
                      class="w-10 h-10 flex-shrink-0 self-start mt-2"
                      src={chat.avatar ? mediaPath(chat.avatar) : undefined}
                      fallback={chat.user_name}
                    />
                    <div class="w-4 flex-shrink-0" />
                    <div
                      class={`flex flex-col space-y-1 ${chat.user_id !== accountStore.id ? "items-start" : "items-end"}`}
                    >
                      <label class="label space-x-2">
                        <Show
                          when={chat.is_admin}
                          fallback={<span class="text-info">[{t("game.challenge.chatPlayerRole")}]</span>}
                        >
                          <span class="text-error">[{t("game.challenge.chatAdminRole")}]</span>
                        </Show>
                        <span>{chat.user_name}</span>
                      </label>
                      <Card contentClass="p-2">
                        <p class="text-wrap">{chat.content}</p>
                      </Card>
                    </div>
                  </div>
                )}
              </For>
            </div>
            <div class="sticky bottom-0 p-3 lg:p-6">
              <Input
                placeholder={t("game.admin.chat.sendPlaceholder")}
                extraBtn={
                  <Button class="!rounded-l-none" onClick={handleSendChat} disabled={sending() || chat() === ""}>
                    <span class="icon-[fluent--send-20-regular] w-5 h-5" />
                  </Button>
                }
                onInput={(e) => setChat(e.currentTarget.value)}
              />
            </div>
            <div ref={chatBottomEl!} />
          </div>
        </Show>
      </OverlayScrollbarsComponent>
    </div>
  );
}
