import { getGamePlayerChatMessages, sendGamePlayerChatMessage } from "@api/game";
import Spin from "@assets/animates/spin";
import xdsecMascotNormal from "@assets/imgs/xdsec-mascot-normal.webp";
import xdsecMascotUnsee from "@assets/imgs/xdsec-mascot-unsee.webp";
import { mediaPath } from "@lib/utils/media";
import type { Challenge } from "@models/challenge";
import type { Chat } from "@models/chat";
import { A } from "@solidjs/router";
import { accountStore } from "@storage/account";
import { challengeStore } from "@storage/challenge";
import { gameStore, isGameAdmin } from "@storage/game";
import { t } from "@storage/theme";
import { addToast } from "@storage/toast";
import Article from "@widgets/article";
import Avatar from "@widgets/avatar";
import Card from "@widgets/card";
import Editor from "@widgets/editor";
import type { HTTPError } from "ky";
import { For, Show, createMemo, createSignal, onCleanup } from "solid-js";

export default function (_props: {
  onStateChange?: (challenge?: Challenge) => void;
  inGame?: boolean;
}) {
  const [chats, setChats] = createSignal([] as Chat[]);
  const [chat, setChat] = createSignal("");
  const [sending, setSending] = createSignal(false);

  function handleSendChat() {
    if (chat() === "") return;
    if (gameStore.current && challengeStore.current) {
      setSending(true);
      sendGamePlayerChatMessage(gameStore.current.id, challengeStore.current.id, chat())
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
  }

  function refreshChats() {
    if (gameStore.current && challengeStore.current && !isGameAdmin()) {
      getGamePlayerChatMessages(gameStore.current.id, challengeStore.current.id)
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

  const interval = setInterval(refreshChats(), 5000);
  onCleanup(() => clearInterval(interval));
  let chatBottomEl: HTMLDivElement;

  const alreadySend = createMemo(() => chats().at(-1)?.user_id === accountStore.id);

  return (
    <div class="flex flex-col min-h-full relative">
      <div class="flex flex-col flex-1 p-3 lg:p-6 space-y-1">
        <div class="self-start flex-row max-w-[calc(100%-4rem)] flex items-center">
          <img src={xdsecMascotNormal} width={40} height={40} alt="ΦωΦ" class="flex-shrink-0 self-start mt-2" />
          <div class="w-4 flex-shrink-0" />
          <div class="flex flex-col space-y-1">
            <label class="label">Ciallo～(∠・ω&lt; )⌒☆</label>
            <Card contentClass="p-2">
              <p class="text-wrap">{t("game.challenge.hammerTips")}</p>
            </Card>
            <div class="h-3" />
          </div>
        </div>
        <div class="self-start flex-row max-w-[calc(100%-4rem)] flex items-center">
          <img src={xdsecMascotUnsee} width={40} height={40} alt=">ω<" class="flex-shrink-0 self-start mt-2" />
          <div class="w-4 flex-shrink-0" />
          <div class="flex flex-col space-y-1 items-start">
            <label class="label">Ciallo～(∠・ω&lt; )⌒☆</label>
            <Card contentClass="p-2">
              <p class="text-wrap">{t("game.challenge.hammerTips2")}</p>
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
                <A class="w-10 h-10 flex-shrink-0 self-start" href={`/users/${chat.user_id}`}>
                  <Avatar
                    class="w-full h-full"
                    src={chat.avatar ? mediaPath(chat.avatar) : undefined}
                    fallback={chat.user_name}
                  />
                </A>
              </Show>
              <div class="w-4 flex-shrink-0" />
              <div class={`flex flex-col space-y-1 ${chat.user_id !== accountStore.id ? "items-start" : "items-end"}`}>
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
          placeholder={alreadySend() ? t("game.challenge.hammerInputAlreadySend") : t("game.challenge.hammerInput")}
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
      <Show when={isGameAdmin()}>
        <div class="absolute top-0 left-0 w-full h-full bg-layer/60 backdrop-blur flex items-center justify-center">
          <A
            class="font-bold hover:underline hover:text-primary flex items-center space-x-2"
            href={`/games/${gameStore.current?.id}/admin/hammers`}
          >
            <span class="icon-[fluent--open-20-regular] w-5 h-5" />
            <span>{t("game.admin.hammer.shouldGoto")}</span>
          </A>
        </div>
      </Show>
    </div>
  );
}
