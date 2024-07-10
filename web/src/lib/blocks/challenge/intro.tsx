import { getChallengeAttachments } from "@/lib/api/game";
import type { Challenge } from "@/lib/models/challenge";
import { fullTheme, t } from "@/lib/storage/theme";
import { addToast } from "@/lib/storage/toast";
import Article from "@/lib/widgets/article";
import Button from "@/lib/widgets/button";
import type { HTTPError } from "ky";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { passiveSupport } from "passive-events-support/src/utils";
import { createEffect, createSignal, For, Show, untrack } from "solid-js";
import challenge from ".";
import Card from "@/lib/widgets/card";
import Tag from "@/lib/widgets/tag";

passiveSupport({
    events: ["mousewheel", "wheel"],
    listeners: [
        {
            element: "challenge-header",
            event: "wheel",
        },
    ],
});

export default function (props: { challenge?: Challenge; solved?: boolean; solves?: number }) {
    const [files, setFiles] = createSignal([] as { folder: "mapped" | "static"; file: string }[]);
    const [hasEnv, setHasEnv] = createSignal(false);
    let cachedChallengeId = 0;
    createEffect(() => {
        if (props.challenge && props.challenge.id !== cachedChallengeId) {
            cachedChallengeId = props.challenge.id;
            untrack(() => {
                getChallengeAttachments(props.challenge!.game_id, props.challenge!.id)
                    .then((resp) => {
                        setFiles(resp);
                    })
                    .catch((e: HTTPError) => {
                        e.response.text().then((text) => {
                            addToast({
                                level: "error",
                                description: `${t("game.challenge.fetchFilesFailed")}: ${text}`,
                                duration: 5000,
                            });
                        });
                    });
            });
        }
    });
    return (
        <div class="w-full h-full overflow-hidden flex flex-col">
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
                <div class="flex flex-col items-center">
                    <div class="flex flex-col w-full max-w-5xl p-3 lg:p-6">
                        <header class="h-12 border-b border-b-layer-content/15 flex flex-row items-center space-x-6 font-bold">
                            <span class="flex flex-row space-x-2 items-center flex-1 overflow-hidden">
                                <span class="icon-[fluent--info-20-regular] w-5 h-5" />
                                <span class="flex-1 truncate">{props.challenge?.name}</span>
                            </span>
                            <span
                                class={`font-bold flex flex-row space-x-2 items-center ${props.solved ? "text-success" : "text-warning"}`.trim()}
                            >
                                <span
                                    class={
                                        props.solved
                                            ? "icon-[fluent--checkmark-circle-20-regular] w-5 h-5"
                                            : "icon-[fluent--flag-20-regular] w-5 h-5"
                                    }
                                />
                                <span>{props.challenge?.score} pts</span>
                            </span>
                            <span class="font-bold flex flex-row space-x-2 items-center">
                                <span class="icon-[fluent--data-bar-vertical-24-regular] w-5 h-5" />
                                <span>
                                    {props.solves ?? 0} solve{props.solves && props.solves > 1 ? "s" : ""}
                                </span>
                            </span>
                        </header>
                        <Show when={props.challenge}>
                            <section class="flex flex-row-reverse flex-wrap items-center min-h-12 border-b border-b-layer-content/15">
                                <For each={props.challenge!.tag}>
                                    {(tag) => (
                                        <Tag class="mx-1" level={tag.primary ? "error" : "info"}>
                                            <span>{tag.name}</span>
                                        </Tag>
                                    )}
                                </For>
                            </section>
                        </Show>
                        <Show when={hasEnv()}>
                            <section class="h-12 border-b border-b-layer-content/15 flex flex-row items-center space-x-6" />
                        </Show>
                        <Show when={files().length > 0}>
                            <section class="inline-flex flex-row items-center flex-wrap min-h-12 border-b border-b-layer-content/15">
                                <h3 class="font-bold flex space-x-2 items-center">
                                    <span class="icon-[fluent--folder-zip-20-regular] w-5 h-5" />
                                    <span>{t("game.challenge.files")}:</span>
                                </h3>
                                <div class="w-4" />
                                <For each={files()}>
                                    {(file) => (
                                        <Button class="m-1" size="sm">
                                            <span class="icon-[fluent--arrow-download-20-regular] w-5 h-5 flex-shrink-0" />
                                            <span class="truncate flex-1 text-start">{file.file}</span>
                                        </Button>
                                    )}
                                </For>
                            </section>
                        </Show>
                        <Article content={props.challenge?.content ?? ""} extra />
                    </div>
                </div>
            </OverlayScrollbarsComponent>
        </div>
    );
}
