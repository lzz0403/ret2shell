import { getGameAdminChatSessions } from "@api/game";
import type { ChatSession } from "@models/chat";
import { useSearchParams } from "@solidjs/router";
import { accountStore } from "@storage/account";
import { gameStore } from "@storage/game";
import { fullTheme, t } from "@storage/theme";
import { addToast } from "@storage/toast";
import Avatar from "@widgets/avatar";
import Divider from "@widgets/divider";
import Link from "@widgets/link";
import type { HTTPError } from "ky";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { For, Show, createEffect, createMemo, createSignal } from "solid-js";

export default function ChatList() {
  const [sessions, setSessions] = createSignal([] as ChatSession[]);
  const [searchParams, _] = useSearchParams();
  const teamId = createMemo(() => Number.parseInt(searchParams.team ?? "") || null);
  const challengeId = createMemo(() => Number.parseInt(searchParams.challenge ?? "") || null);
  createEffect(() => {
    if (gameStore.current) {
      getGameAdminChatSessions(gameStore.current.id)
        .then(setSessions)
        .catch((err: HTTPError) => {
          err.response.text().then((text) => {
            addToast({
              level: "error",
              description: `${t("game.challenge.fetchChatSessionError")}: ${text}`,
              duration: 5000,
            });
          });
        });
    }
  });
  return (
    <div class="w-full h-full overflow-hidden flex flex-col">
      <OverlayScrollbarsComponent
        class="w-full flex-1 relative"
        options={{
          scrollbars: {
            theme: `os-theme-${fullTheme()}`,
            autoHide: "scroll",
          },
        }}
        defer
      >
        <Show
          when={sessions().length > 0}
          fallback={
            <div class="w-full min-h-full flex flex-row space-x-2 p-3 lg:p-6 items-center justify-center">
              <span class="icon-[fluent--chat-20-regular] w-5 h-5" />
              <span class="font-bold">{t("game.admin.chat.noSession")}</span>
            </div>
          }
        >
          <div class="w-full min-h-full overflow-hidden flex flex-col space-y-2 p-3 lg:p-6">
            <For each={sessions()}>
              {(session) => (
                <>
                  <Link
                    href={`/games/${gameStore.current?.id}/admin/hammers?challenge=${session.challenge_id}&team=${session.team_id}`}
                    ghost={!(teamId() === session.team_id && challengeId() === session.challenge_id)}
                    class="flex-row space-x-2 items-center h-auto py-2 !px-3"
                  >
                    <Avatar class="w-10 aspect-square flex-shrink-0" src={undefined} fallback={session.team_name} />
                    <div class="flex-col flex-1">
                      <div class="flex flex-row space-x-2 items-center">
                        <span class="flex-1 truncate font-bold text-start">{session.team_name}</span>
                        <span class="icon-[fluent--flag-20-regular] w-5 h-5" />
                        <span class="flex-none truncate">{session.challenge_name}</span>
                      </div>
                      <Divider />
                      <div class="flex flex-row space-x-2 items-center overflow-hidden">
                        <Show when={!session.checked && session.last_user_id !== accountStore.id}>
                          <span class="icon-[fluent--alert-20-regular] w-5 h-5 text-error" />
                        </Show>
                        <span class="text-info truncate flex-1 text-end">
                          {session.last_active_at.toFormat("MM-dd HH:mm")}
                        </span>
                      </div>
                    </div>
                  </Link>
                </>
              )}
            </For>
          </div>
        </Show>
      </OverlayScrollbarsComponent>
    </div>
  );
}
