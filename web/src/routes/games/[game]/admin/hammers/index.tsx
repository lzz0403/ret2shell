import { getChallenge, getGameAdminChatMessages, getTeamInfo, sendGameAdminChatMessage } from "@api/game";
import Spin from "@assets/animates/spin";
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
import Article from "@widgets/article";
import Avatar from "@widgets/avatar";
import Card from "@widgets/card";
import Editor from "@widgets/editor";
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
          if (
            result.length > chats().length ||
            chats().some((v, i) => v.challenge_id !== result[i].challenge_id || v.team_id !== result[i].team_id)
          ) {
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
    <div class="flex-1 h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
      <div class="h-16 flex flex-row px-4 space-x-2 items-center backdrop-blur border-b border-b-layer-content/10">
        <span class="icon-[fluent--chat-20-regular] w-5 h-5" />
        <A class="font-bold" href={`/games/${gameStore.current?.id}/teams/${teamId()}`}>
          {team() ? team()?.name : t("game.admin.chat.title")}
        </A>
        <span class="flex-1" />
        <Show when={challenge()}>
          <A
            class="flex flex-row space-x-2 hover:underline items-center"
            href={`/games/${gameStore.current?.id}/challenges?challenge=${challengeId()}`}
          >
            <span class="icon-[fluent--flag-20-regular] w-5 h-5" />
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
            <div class="flex flex-col flex-1 p-3 lg:p-6 space-y-1">
              <div class="self-start flex-row max-w-[calc(100%-4rem)] flex items-center">
                <img src={xdsecMascotNormal} width={40} height={40} alt="ΦωΦ" class="flex-shrink-0 self-start mt-2" />
                <div class="w-4 flex-shrink-0" />
                <div class="flex flex-col space-y-1">
                  <label class="label">Ciallo～(∠・ω&lt; )⌒☆</label>
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
                  <div class="h-3" />
                </div>
              </div>
              <For each={chats()}>
                {(chat, index) => (
                  <div
                    class={`${chat.user_id !== accountStore.id ? "self-start flex-row" : "self-end flex-row-reverse"} max-w-[calc(100%-4rem)] flex items-center`}
                  >
                    <Show
                      when={index() === 0 || chats().at(index() - 1)?.user_id !== chat.user_id}
                      fallback={<div class="w-10 h-10 flex-shrink-0 self-start" />}
                    >
                      <A class="w-10 h-10 flex-shrink-0 self-start mt-2" href={`/users/${chat.user_id}`}>
                        <Avatar
                          class="w-full h-full"
                          src={chat.avatar ? mediaPath(chat.avatar) : undefined}
                          fallback={chat.user_name}
                        />
                      </A>
                    </Show>
                    <div class="w-4 flex-shrink-0" />
                    <div
                      class={`flex flex-col space-y-1 ${chat.user_id !== accountStore.id ? "items-start" : "items-end"}`}
                    >
                      <Show when={index() === 0 || chats().at(index() - 1)?.user_id !== chat.user_id}>
                        <label class="label space-x-2">
                          <Show
                            when={chat.is_admin}
                            fallback={<span class="text-info">[{t("game.challenge.chatPlayerRole")}]</span>}
                          >
                            <span class="text-error">[{t("game.challenge.chatAdminRole")}]</span>
                          </Show>
                          <A href={`/users/${chat.user_id}`}>{chat.user_name}</A>
                        </label>
                      </Show>
                      <Card class="peer" contentClass="p-2">
                        <Article content={chat.content} noExtraPaddings compact extra />
                      </Card>
                      <Show when={index() === chats().length - 1 || chats().at(index() + 1)?.user_id !== chat.user_id}>
                        <label class="opacity-0 peer-hover:opacity-60 text-sm transition-all duration-300">
                          {chat.created_at.toFormat("yyyy-MM-dd HH:mm:ss")}
                        </label>
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            </div>
            <div class="sticky bottom-0 p-3 lg:p-6">
              <Editor
                class="h-24 bg-layer"
                value={chat()}
                placeholder={t("game.admin.chat.sendPlaceholder")}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleSendChat();
                  }
                }}
                lang="markdown"
                onValueChanged={(v) => setChat(v)}
              />
            </div>
            <Show when={sending()}>
              <div class="absolute right-6 bottom-6 lg:right-9 lg:bottom-9">
                <Spin width={20} height={20} />
              </div>
            </Show>
            <div ref={chatBottomEl!} />
          </div>
        </Show>
      </OverlayScrollbarsComponent>
    </div>
  );
}
