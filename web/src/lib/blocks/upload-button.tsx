import { uploadFile } from "@api/file";
import Spin from "@assets/animates/spin";
import { humanFileSize } from "@lib/utils/size";
import { t } from "@storage/theme";
import { addToast } from "@storage/toast";
import Button, { type ButtonProps } from "@widgets/button";
import Progress from "@widgets/progress";
import type { DownloadProgress } from "ky";
import { Match, Show, Switch, createEffect, createSignal, splitProps, untrack } from "solid-js";

export default function UploadButton(
  props: ButtonProps & {
    url: string;
    onDone?: () => void;
  }
) {
  const [uploadProps, nativeProps] = splitProps(props, ["url", "onDone"]);
  const [uploading, setUploading] = createSignal(false);
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [progress, setProgress] = createSignal(null as DownloadProgress | null);
  const [uploadComplete, setUploadComplete] = createSignal(false);
  let hiddenInput: HTMLInputElement;

  function handleSelectFile() {
    hiddenInput.click();
  }

  function handleSelectedFile(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }

  function handleUploadFile() {
    if (!selectedFile()) {
      return;
    }
    setUploading(true);
    uploadFile(uploadProps.url, selectedFile()?.name || "file", selectedFile()!, (progress) => {
      setProgress(progress);
    })
      .then(() => {
        setSelectedFile(null);
        setUploadComplete(true);
        uploadProps.onDone?.();
      })
      .catch((err: string) => {
        addToast({
          level: "error",
          description: `${t("form.uploadFailed")}: ${err}`,
          duration: 5000,
        });
      })
      .finally(() => {
        setUploading(false);
      });
  }
  createEffect(() => {
    if (uploadComplete()) {
      untrack(() => {
        setTimeout(() => {
          setUploadComplete(false);
          setProgress(null);
        }, 2000);
      });
    }
  });

  return (
    <Button {...nativeProps} onClick={selectedFile() ? handleUploadFile : handleSelectFile}>
      <Switch>
        <Match when={uploading()}>
          <Spin width={20} height={20} />
          <span class="opacity-80">P:</span>
          <span class="text-info">
            {humanFileSize(progress()?.transferredBytes || 0, true)}/{humanFileSize(progress()?.totalBytes || 0, true)}
          </span>
        </Match>
        <Match when={selectedFile()}>
          <span class="icon-[fluent--cloud-arrow-up-20-regular] w-5 h-5" />
          <span>{selectedFile()?.name}</span>
        </Match>
        <Match when={true}>
          <span class="icon-[fluent--folder-open-20-regular] w-5 h-5" />
          <span>{t("form.selectFile")}</span>
        </Match>
      </Switch>
      <Show when={uploading()}>
        <Progress
          class="absolute left-1 right-1 bottom-0"
          min={0}
          max={progress()?.totalBytes ?? 1}
          value={progress()?.transferredBytes ?? 0}
          static
        />
      </Show>
      <Show when={uploadComplete()}>
        <span class="text-success font-bold">DONE</span>
      </Show>
      <input class="hidden" hidden ref={hiddenInput!} type="file" onChange={handleSelectedFile} />
    </Button>
  );
}
