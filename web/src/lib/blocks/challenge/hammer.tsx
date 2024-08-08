import { getGamePlayerChatMessages, sendGamePlayerChatMessage } from "@api/game";
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
import Avatar from "@widgets/avatar";
import Button from "@widgets/button";
import Card from "@widgets/card";
import Input from "@widgets/input";
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
      <div class="flex flex-col flex-1 p-3 lg:p-6 space-y-4">
        <div class="self-start flex-row max-w-[calc(100%-4rem)] flex items-center">
          <img src={xdsecMascotNormal} width={40} height={40} alt="ΦωΦ" class="flex-shrink-0 self-start mt-2" />
          <div class="w-4 flex-shrink-0" />
          <div class="flex flex-col space-y-1">
            <label class="label">Ciallo～(∠・ω&lt; )</label>
            <Card contentClass="p-2">
              <p class="text-wrap">{t("game.challenge.hammerTips")}</p>
            </Card>
          </div>
        </div>
        <div class="self-start flex-row max-w-[calc(100%-4rem)] flex items-center">
          <img src={xdsecMascotUnsee} width={40} height={40} alt=">ω<" class="flex-shrink-0 self-start mt-2" />
          <div class="w-4 flex-shrink-0" />
          <div class="flex flex-col space-y-1 items-start">
            <label class="label">Ciallo～(∠・ω&lt; )</label>
            <Card contentClass="p-2">
              <p class="text-wrap">{t("game.challenge.hammerTips2")}</p>
            </Card>
          </div>
        </div>
        <For each={chats()}>
          {(chat) => (
            <div
              class={`${chat.user_id !== accountStore.id ? "self-start flex-row" : "self-end flex-row-reverse"} max-w-[calc(100%-4rem)] flex items-center`}
            >
              <Avatar
                class="w-10 h-10 flex-shrink-0 self-start"
                src={chat.avatar ? mediaPath(chat.avatar) : undefined}
                fallback={chat.user_name}
              />
              <div class="w-4 flex-shrink-0" />
              <div class={`flex flex-col space-y-1 ${chat.user_id !== accountStore.id ? "items-start" : "items-end"}`}>
                <label class="label space-x-2">
                  <Show
                    when={chat.is_admin}
                    fallback={<span class="text-info">[{t("game.challenge.chatPlayerRole")}]</span>}
                  >
                    <span class="text-error">[{t("game.challenge.chatAdminRole")}]</span>
                  </Show>
                  <span>{chat.user_name}</span>
                </label>
                <Card contentClass="p-2 min-w-min">
                  <p class="text-wrap">{chat.content}</p>
                </Card>
              </div>
            </div>
          )}
        </For>
      </div>
      <div class="sticky bottom-0 p-3 lg:p-6">
        <Input
          placeholder={alreadySend() ? t("game.challenge.hammerInputAlreadySend") : t("game.challenge.hammerInput")}
          extraBtn={
            <Button
              class="!rounded-l-none"
              onClick={handleSendChat}
              disabled={sending() || chat() === "" || alreadySend()}
            >
              <span class="icon-[fluent--send-20-regular] w-5 h-5" />
            </Button>
          }
          onInput={(e) => setChat(e.currentTarget.value)}
        />
      </div>
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
