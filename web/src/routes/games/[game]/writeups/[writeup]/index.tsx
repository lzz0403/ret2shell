import { useNavigate } from "@solidjs/router";
import { gameStore, isGameAdmin } from "@storage/game";
import { t } from "@storage/theme";
import { addToast } from "@storage/toast";
import { DateTime } from "luxon";
import { createEffect, untrack } from "solid-js";

export default function () {
  const navigate = useNavigate();
  createEffect(() => {
    if (gameStore.current?.archive_at && !isGameAdmin()) {
      untrack(() => {
        if (gameStore.current?.archive_at && gameStore.current.archive_at > DateTime.now()) {
          addToast({
            level: "warning",
            description: t("game.writeupsOnlyOpenWhenArchived")!,
            duration: 10 * 1000,
          });
          navigate(`/games/${gameStore.current.id}`);
        }
      });
    }
  });
  return <></>;
}
