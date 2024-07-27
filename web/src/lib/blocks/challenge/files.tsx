import { api_root } from "@api";
import { deleteChallengeAttachment, getChallengeAttachments } from "@api/game";
import DownloadButton from "@blocks/download-button";
import UploadButton from "@blocks/upload-button";
import { challengeStore, refreshChallengeAssets, setChallengeStore } from "@storage/challenge";
import { gameStore } from "@storage/game";
import { t } from "@storage/theme";
import { addToast } from "@storage/toast";
import Button from "@widgets/button";
import type { HTTPError } from "ky";
import { For, createEffect, untrack } from "solid-js";

export default function () {
  function fetchAttachments() {
    getChallengeAttachments(challengeStore.current!.game_id, challengeStore.current!.id, true)
      .then((attachments) => {
        setChallengeStore({ allFiles: attachments });
        refreshChallengeAssets();
      })
      .catch((err: HTTPError) => {
        err.response.text().then((text) => {
          addToast({
            level: "error",
            description: `${t("game.challenge.fetchFilesFailed")}: ${text}`,
            duration: 5000,
          });
        });
      });
  }
  createEffect(() => {
    if (challengeStore.current) {
      untrack(fetchAttachments);
    }
  });

  function handleDelete(file: string, folder: "static" | "mapped") {
    deleteChallengeAttachment(challengeStore.current!.game_id, challengeStore.current!.id, folder, file)
      .then(() => {
        fetchAttachments();
      })
      .catch((err: HTTPError) => {
        err.response.text().then((text) => {
          addToast({
            level: "error",
            description: `${t("game.challenge.deleteFileFailed")}: ${text}`,
            duration: 5000,
          });
        });
      });
  }
  return (
    <div class="flex flex-col lg:flex-row min-h-full p-3 lg:p-6 lg:space-x-3">
      <div class="flex-1 flex flex-col">
        <header class="h-12 border-b border-b-layer-content/15 flex flex-row items-center space-x-2 font-bold">
          <span class="icon-[fluent--folder-zip-20-regular] w-5 h-5 flex-shrink-0" />
          <span class="flex-1 text-start">{t("game.challenge.uploadStaticAttachment")}</span>
          <UploadButton
            size="sm"
            url={`${api_root}/game/${gameStore.current?.id}/challenge/${challengeStore.current?.id}/file?folder=static`}
            onDone={fetchAttachments}
          />
        </header>
        <For each={challengeStore.allFiles.filter((s) => s.folder === "static")}>
          {(file) => (
            <div class="min-h-12 py-1 border-b border-b-layer-content/10 flex items-center space-x-2 overflow-hidden">
              <span class="icon-[fluent--folder-zip-20-regular] w-5 h-5 text-primary flex-shrink-0" />
              <span class="font-bold flex-1 text-start truncate">{file.file}</span>
              <DownloadButton
                class="m-1 flex-shrink-0"
                size="sm"
                file={file.file}
                icon="icon-[fluent--arrow-download-20-regular]"
                square
                url={`${api_root}/game/${challengeStore.current!.game_id}/challenge/${challengeStore.current!.id}/file`}
                searchParams={{ file: file.file, folder: file.folder }}
              />
              <Button size="sm" square onClick={() => handleDelete(file.file, file.folder)}>
                <span class="icon-[fluent--delete-16-regular] w-4 h-4" />
              </Button>
            </div>
          )}
        </For>
      </div>
      <div class="flex-1 flex flex-col">
        <header class="h-12 border-b border-b-layer-content/15 flex flex-row items-center space-x-2 font-bold">
          <span class="icon-[fluent--folder-zip-20-regular] w-5 h-5 flex-shrink-0" />
          <span class="flex-1 text-start">{t("game.challenge.uploadDynamicAttachment")}</span>
          <UploadButton
            size="sm"
            url={`${api_root}/game/${gameStore.current?.id}/challenge/${challengeStore.current?.id}/file?folder=mapped`}
            onDone={fetchAttachments}
          />
        </header>
        <For each={challengeStore.allFiles.filter((s) => s.folder === "mapped")}>
          {(file) => (
            <div class="min-h-12 py-1 border-b border-b-layer-content/10 flex items-center space-x-2 overflow-hidden">
              <span class="icon-[fluent--folder-zip-20-regular] w-5 h-5 text-primary flex-shrink-0" />
              <span class="font-bold flex-1 text-start truncate">{file.file}</span>
              <DownloadButton
                class="m-1 flex-shrink-0"
                size="sm"
                file={file.file}
                icon="icon-[fluent--arrow-download-20-regular]"
                square
                url={`${api_root}/game/${challengeStore.current!.game_id}/challenge/${challengeStore.current!.id}/file`}
                searchParams={{ file: file.file, folder: file.folder }}
              />
              <Button size="sm" square onClick={() => handleDelete(file.file, file.folder)}>
                <span class="icon-[fluent--delete-16-regular] w-4 h-4" />
              </Button>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
