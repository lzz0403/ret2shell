import Form, { type ChallengeForm } from "@/lib/blocks/challenge/form";
import LoadingTips from "@/lib/widgets/loading-tips";
import Challenge from "@blocks/challenge";
import ChallengeList from "@blocks/challenge/list";
import SidebarLayout from "@blocks/sidebar-layout";
import type { Challenge as ChallengeModel } from "@models/challenge";
import { Permission } from "@models/user";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { accountStore } from "@storage/account";
import { gameStore, refreshChallenges } from "@storage/game";
import { Title } from "@storage/header";
import { fullTheme, t } from "@storage/theme";
import Link from "@widgets/link";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { For, Match, Show, Switch, createEffect, createMemo, createSignal, untrack } from "solid-js";
import Notifications from "./_blocks/notifications";
import Team from "./_blocks/team";
import Welcome from "./_blocks/welcome";
import { DateTime } from "luxon";
import { createChallenge, getChallenge } from "@/lib/api/game";
import type { HTTPError } from "ky";
import { addToast } from "@/lib/storage/toast";
import Button from "@/lib/widgets/button";
import { TransitionGroup } from "solid-transition-group";

export default function () {
    const navigate = useNavigate();
    if (accountStore.token === null) {
        navigate(`/account/login?redirect=/games/${gameStore.current ? gameStore.current.id : ""}`);
        return null;
    }
    const [loadingChallenge, setLoadingChallenge] = createSignal(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedChallengeId = createMemo(() => Number.parseInt(searchParams.challenge || "NaN") || null);
    const [selectedChallenge, setSelectedChallenge] = createSignal(null as null | ChallengeModel);
    createEffect(() => {
        if (selectedChallengeId() && gameStore.current) {
            untrack(() => {
                setLoadingChallenge(true);
                getChallenge(gameStore.current!.id, selectedChallengeId()!)
                    .then((resp) => {
                        setSelectedChallenge(resp);
                        appendChallengeHistory(resp);
                    })
                    .catch((e: HTTPError) => {
                        e.response.text().then((text) => {
                            addToast({
                                level: "error",
                                description: `${t("game.challenge.fetchChallengeFailed")}: ${text}`,
                                duration: 5000,
                            });
                        });
                    })
                    .finally(() => {
                        setLoadingChallenge(false);
                    });
            });
        } else {
            setSelectedChallenge(null);
        }
    });

    const inCreate = createMemo(() => searchParams.create === "true");
    const [creating, setCreating] = createSignal(false);
    const [challengeHistory, setChallengeHistory] = createSignal<{ id: number; name: string }[]>([]);
    function appendChallengeHistory(challenge: ChallengeModel) {
        if (challengeHistory().find((c) => c.id === challenge.id)) {
            setTimeout(() => {
                document
                    .getElementById(`challenge-${challenge.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
            }, 100);
            return;
        }
        setChallengeHistory([...challengeHistory(), { id: challenge.id, name: challenge.name }]);
        setTimeout(() => {
            document
                .getElementById(`challenge-${challenge.id}`)
                ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }, 100);
    }
    function onCreateChallenge(result: ChallengeForm) {
        setCreating(true);
        const tags = result.tag.split("/").map((t) => {
            return { name: t, primary: false };
        });
        tags[0].primary = true;

        const challenge = {
            id: 0,
            name: result.name,
            updated_at: DateTime.now(),
            hidden: true,
            content: result.content,
            game_id: gameStore.current?.id,
            tag: tags,
            score_rule: {
                initial: result.initial,
                minimum: result.minimum,
                decay: result.decay,
            },
            score: result.initial,
            bucket: null,
        } as ChallengeModel;
        createChallenge(gameStore.current!.id, challenge)
            .then((result) => {
                setSearchParams({
                    create: null,
                    challenge: result.id,
                });
                refreshChallenges();
            })
            .catch((e: HTTPError) => {
                e.response.text().then((text) => {
                    addToast({
                        level: "error",
                        description: `${t("game.challenge.createFailed")}: ${text}`,
                        duration: 5000,
                    });
                });
            })
            .finally(() => {
                setCreating(false);
            });
    }
    // TODO: fetchSelfTeam and redirect
    return (
        <>
            <Title title={`${t("game.challenge.title")} - ${gameStore.current?.name || "CTF"}`} />
            <SidebarLayout
                leftBar={() => (
                    <>
                        <div class="border-b border-b-layer-content/10 px-2 h-16 flex items-center justify-center">
                            <Link
                                class="w-full"
                                ghost
                                justify="start"
                                href={`/games/${gameStore.current?.id}/challenges`}
                            >
                                <span class="icon-[fluent--flag-20-filled] w-5 h-5 text-primary" />
                                <span>{t("game.challenge.list")}</span>
                            </Link>
                        </div>
                        <ChallengeList showScore inGame />
                    </>
                )}
                rightBar={() => (
                    <div class="flex flex-col">
                        <Team />
                        <Notifications />
                    </div>
                )}
            >
                <div class="flex-1 flex flex-col w-0">
                    <OverlayScrollbarsComponent
                        class="w-full h-16 backdrop-blur border-b border-b-layer-content/10 relative"
                        options={{
                            scrollbars: {
                                theme: `os-theme-${fullTheme()}`,
                                autoHide: "scroll",
                            },
                        }}
                        defer
                    >
                        <div class="h-full flex pr-2 py-0 items-center space-x-2 min-w-max w-max">
                            <TransitionGroup name="fade-group-dive-left">
                                <div class="fade-group-dive-left flex space-x-2 items-center sticky left-0 pl-2 bg-layer z-20">
                                    <Link
                                        href={`/games/${gameStore.current?.id}/challenges`}
                                        onClick={() => setSearchParams({ challenge: null })}
                                        square={challengeHistory().length > 0}
                                        ghost
                                        class="transition-all duration-300 overflow-hidden"
                                        active={selectedChallengeId() === null && inCreate() === false}
                                    >
                                        <span class="icon-[fluent--home-20-regular] w-5 h-5" />
                                        <Show when={challengeHistory().length === 0}>
                                            <span>{t("game.challenge.welcome")}</span>
                                        </Show>
                                    </Link>
                                    <Show when={accountStore.permissions.includes(Permission.Game)}>
                                        <Link
                                            active={inCreate()}
                                            title={t("form.create")}
                                            square={challengeHistory().length > 0}
                                            ghost
                                            class="transition-all duration-300 overflow-hidden"
                                            href={`/games/${gameStore.current?.id}/challenges?create=true`}
                                        >
                                            <span class="icon-[fluent--add-20-regular] w-5 h-5" />
                                            <Show when={challengeHistory().length === 0}>
                                                <span>{t("form.create")}</span>
                                            </Show>
                                        </Link>
                                    </Show>
                                    <Show when={challengeHistory().length > 0}>
                                        <span class="h-12 w-[1px] bg-layer-content/15" />
                                    </Show>
                                </div>
                                <For each={challengeHistory()}>
                                    {(challenge) => (
                                        <div class="fade-group-dive-left flex flex-row">
                                            <Link
                                                href={`/games/${gameStore.current?.id}/challenges?challenge=${challenge.id}`}
                                                onClick={() => setSearchParams({ challenge: challenge.id })}
                                                id={`challenge-${challenge.id}`}
                                                active={challenge.id === selectedChallengeId() && inCreate() === false}
                                                ghost
                                                class="max-w-48 rounded-r-none"
                                            >
                                                <span class="icon-[fluent--code-20-regular] w-5 h-5" />
                                                <span class="truncate flex-1 text-left">{challenge.name}</span>
                                            </Link>
                                            <Button
                                                class={`!rounded-l-none ${challenge.id === selectedChallengeId() && inCreate() === false ? "btn-active" : ""}`}
                                                square
                                                ghost
                                                onClick={() => {
                                                    if (challenge.id === selectedChallengeId())
                                                        setSearchParams({ challenge: null });
                                                    setChallengeHistory([
                                                        ...challengeHistory().filter((s) => s.id !== challenge.id),
                                                    ]);
                                                }}
                                            >
                                                <span class="icon-[fluent--dismiss-20-regular] w-5 h-5 opacity-60" />
                                            </Button>
                                        </div>
                                    )}
                                </For>
                            </TransitionGroup>
                            <Show when={loadingChallenge()}>
                                <Button class="opacity-60" loading ghost>
                                    <span>{t("form.loading")}</span>
                                </Button>
                            </Show>
                        </div>
                    </OverlayScrollbarsComponent>
                    <Switch fallback={<Welcome />}>
                        <Match when={loadingChallenge()}>
                            <div class="flex-1 flex flex-row space-x-2 items-center justify-center">
                                <LoadingTips />
                            </div>
                        </Match>
                        <Match when={inCreate()}>
                            <Form onDone={onCreateChallenge} loading={creating()} inGame />
                        </Match>
                        <Match when={selectedChallenge()}>
                            <Challenge inGame challenge={selectedChallenge()!} />
                        </Match>
                    </Switch>
                </div>
            </SidebarLayout>
        </>
    );
}
