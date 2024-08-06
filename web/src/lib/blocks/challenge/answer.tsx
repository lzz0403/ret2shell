import type { Challenge } from "@models/challenge";
import { HostType } from "@models/game";
import { gameStore, inArchived, inArchiving } from "@storage/game";
import { t } from "@storage/theme";
import { Show } from "solid-js";

export default function (_props: {
  onStateChange?: (challenge?: Challenge) => void;
  inGame?: boolean;
}) {
  return (
    <div class="flex flex-col p-3 lg:p-6">
      <Show
        when={
          gameStore.current?.host_type &&
          gameStore.current.host_type === HostType.CTFGame &&
          !inArchiving() &&
          !inArchived()
        }
      >
        <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div class="font-bold flex items-center space-x-2">
            <span class="icon-[fluent--subtract-circle-20-regular] w-5 h-5" />
            <span>{t("game.admin.answer.notAccessableWhenInGame")}</span>
          </div>
        </div>
      </Show>
    </div>
  );
}
