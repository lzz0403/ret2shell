import { getTeamExtras, getTeamInfo, getTeamMembers, getTeamSolves, updateSelfteam } from "@api/game";
import SidebarLayout from "@blocks/sidebar-layout";
import type { Extra } from "@models/extra";
import type { Submission } from "@models/submission";
import type { Team } from "@models/team";
import type { User } from "@models/user";
import { createForm, maxLength, required, setValue, setValues } from "@modular-forms/solid";
import { A, useNavigate, useParams } from "@solidjs/router";
import { accountStore, refreshInstitutes } from "@storage/account";
import { gameStore, setGameStore } from "@storage/game";
import { Title } from "@storage/header";
import { t } from "@storage/theme";
import { addToast } from "@storage/toast";
import Button from "@widgets/button";
import Chart from "@widgets/chart";
import Clipboard from "@widgets/clipboard";
import Input from "@widgets/input";
import Select from "@widgets/select";
import type { HTTPError } from "ky";
import { For, Show, createEffect, createMemo, createSignal, untrack } from "solid-js";
import Sidebar from "./_blocks/sidebar";

type TeamUpdateForm = {
  name: string;
  institute_id: number;
};

function SelfManagement(props: {
  members: User[];
}) {
  const [form, { Form, Field }] = createForm<TeamUpdateForm>();
  createEffect(() => {
    if (gameStore.team) {
      untrack(() => {
        setValues(form, {
          name: gameStore.team!.name,
          institute_id: gameStore.team?.institute_id || 0,
        });
      });
    }
  });
  const institutesSelect = createMemo(() => {
    const result = [] as { value: string; label: string; icon: string }[];
    result.push({
      value: "0",
      label: t("game.team.noInstitute")!,
      icon: "icon-[fluent--earth-20-regular] w-5 h-5",
    });
    const institute_id = props.members.at(0)?.institute_id ?? null;
    if (!institute_id) return result;
    for (const member of props.members) {
      if (member.institute_id !== institute_id) {
        return result;
      }
    }
    result.push({
      value: institute_id.toString(),
      label: accountStore.institutes.find((i) => i.id === institute_id)?.name || "Unknown",
      icon: "icon-[fluent--hat-graduation-20-regular] w-5 h-5",
    });
    return result;
  });
  refreshInstitutes();
  const [updating, setUpdating] = createSignal(false);
  function onSubmit(result: TeamUpdateForm) {
    setUpdating(true);
    updateSelfteam(gameStore.current!.id, {
      name: result.name,
      institute_id: result.institute_id || null,
    })
      .then((team) => {
        setGameStore({ team });
        addToast({
          level: "success",
          description: t("form.saveSuccess")!,
          duration: 5000,
        });
      })
      .catch((err: HTTPError) => {
        err.response.text().then((text) => {
          addToast({
            level: "error",
            description: `${t("form.saveFailed")}: ${text}`,
            duration: 5000,
          });
        });
      })
      .finally(() => {
        setUpdating(false);
      });
  }
  return (
    <>
      <h3 class="h-12 flex items-center border-b border-b-layer-content/15 font-bold space-x-2">
        <span class="icon-[fluent--settings-20-regular] w-5 h-5" />
        <span>{t("game.team.selfManagement")}</span>
      </h3>
      <section class="flex flex-col space-y-2 mt-2">
        <div class="flex flex-col space-y-1">
          <label class="label">{t("game.team.token")}</label>
          <Clipboard value={gameStore.team?.token || undefined} />
        </div>
        <Form class="flex flex-col space-y-2" onSubmit={onSubmit}>
          <div class="flex flex-row space-x-2">
            <Field
              name="name"
              validate={[
                required(t("game.team.create.nameRequired")!),
                maxLength(32, t("game.team.create.nameMaxLength")!),
              ]}
            >
              {(field, props) => (
                <Input
                  class="flex-1"
                  icon={<span class="icon-[fluent--number-symbol-20-regular] w-5 h-5" />}
                  title={t("game.team.name")}
                  placeholder={t("game.team.name")}
                  {...props}
                  value={field.value}
                  error={field.error}
                  required
                  disabled={gameStore.current?.team_size === 1}
                />
              )}
            </Field>
            <Field name="institute_id" type="number">
              {(field) => (
                <Select
                  class="flex-1 min-w-0"
                  label={t("admin.users.institute")}
                  placeholder={t("admin.users.selectInstitute")}
                  items={institutesSelect()}
                  onValueChange={(v) => {
                    setValue(form, "institute_id", (v.value.at(0) && Number.parseInt(v.value.at(0)!)) || 0);
                  }}
                  value={field.value ? [field.value.toString()] : undefined}
                />
              )}
            </Field>
          </div>
          <Button type="submit" level="primary" class="!mt-4" loading={updating()} disabled={updating()}>
            {t("form.save")}
          </Button>
        </Form>
      </section>
      <div class="h-16" />
    </>
  );
}

export default function () {
  const [team, setTeam] = createSignal(null as Team | null);
  const [solves, setSolves] = createSignal([] as Submission[]);
  const [extras, setExtras] = createSignal([] as Extra[]);
  const params = useParams();
  const teamId = () => Number.parseInt(params.team) || null;
  const isSelfTeam = () => team() && team()?.id === gameStore.team?.id;
  const navigate = useNavigate();
  createEffect(() => {
    if (gameStore.current && teamId()) {
      untrack(() => {
        getTeamInfo(gameStore.current!.id, teamId()!, true)
          .then((resp) => {
            setTeam(resp);
          })
          .catch((err: HTTPError) => {
            if (err.response.status === 404) {
              navigate("/sigtrap/404");
            } else {
              err.response.text().then((text) => {
                addToast({
                  level: "error",
                  description: `${t("game.team.fetchTeamFailed")}: ${text}`,
                  duration: 5000,
                });
              });
            }
          });
        getTeamExtras(gameStore.current!.id, teamId()!)
          .then((resp) => {
            setExtras(resp);
          })
          .catch((err: HTTPError) => {
            if (err.response.status === 404) {
              navigate("/sigtrap/404");
            } else {
              err.response.text().then((text) => {
                addToast({
                  level: "error",
                  description: `${t("game.team.fetchTeamExtrasFailed")}: ${text}`,
                  duration: 5000,
                });
              });
            }
          });
        getTeamSolves(gameStore.current!.id, teamId()!)
          .then((resp) => {
            setSolves(resp);
          })
          .catch((err: HTTPError) => {
            if (err.response.status === 404) {
              navigate("/sigtrap/404");
            } else {
              err.response.text().then((text) => {
                addToast({
                  level: "error",
                  description: `${t("game.team.fetchTeamSubmissionsFailed")}: ${text}`,
                  duration: 5000,
                });
              });
            }
          });
      });
    }
  });
  const teamChartSeries = () => {
    return [
      {
        name: team()?.name || "unknown",
        type: "line",
        step: "end",
        data: team()?.history.map((h) => [h.changed_at.toMillis(), h.score]),
      },
    ];
  };
  const [members, setMembers] = createSignal([] as User[]);
  const [loadingMembers, setLoadingMembers] = createSignal(false);
  createEffect(() => {
    if (team()) {
      untrack(() => {
        setLoadingMembers(true);
        getTeamMembers(team()!.game_id, team()!.id)
          .then(setMembers)
          .catch((err: HTTPError) => {
            err.response.text().then((text) => {
              addToast({
                level: "error",
                description: `${t("game.team.fetchMembersFailed")}: ${text}`,
                duration: 5000,
              });
            });
          })
          .finally(() => setLoadingMembers(false));
      });
    }
  });
  return (
    <>
      <Title title={`${team()?.name ?? t("game.team.title")} - ${gameStore.current?.name ?? "CTF"}`} />
      <SidebarLayout leftBar={() => <Sidebar team={team()} members={members()} loading={loadingMembers()} />}>
        <div class="flex-1 flex flex-col items-center p-3 lg:p-6">
          <div class="flex flex-col w-full max-w-5xl">
            <Show when={isSelfTeam()}>
              <SelfManagement members={members()} />
            </Show>
            <h3 class="h-12 flex items-center border-b border-b-layer-content/15 font-bold space-x-2">
              <span class="icon-[fluent--data-trending-20-regular] w-5 h-5" />
              <span>{t("game.team.scoreChart")}</span>
            </h3>
            <section class="w-full h-64 lg:h-96">
              <Chart
                option={{
                  grid: {
                    left: "72px",
                    right: "24px",
                    bottom: "80px",
                    top: "48px",
                  },
                  tooltip: {
                    trigger: "axis",
                    axisPointer: {
                      type: "line",
                      label: {
                        precision: 0,
                      },
                      snap: true,
                    },
                    borderColor: "transparent",
                  },
                  dataZoom: [
                    {
                      type: "slider",
                      filterMode: "none",
                      show: true,
                    },
                  ],
                  toolbox: {},
                  xAxis: {
                    type: "time",
                  },
                  yAxis: {
                    type: "value",
                    min: () => 0,
                    max: (value: { min: number; max: number }) => {
                      if (value.max < 100) return 100;
                      return Math.ceil(value.max + value.max * 0.1);
                    },
                    axisLabel: {
                      fontFamily: "JetBrains Mono",
                    },
                  },
                  series: teamChartSeries(),
                }}
              />
            </section>
            <h3 class="h-12 flex items-center border-b border-b-layer-content/15 font-bold space-x-2">
              <span class="icon-[fluent--flag-20-regular] w-5 h-5" />
              <span>{t("game.team.solves")}</span>
            </h3>
            <section class="flex flex-col">
              <For
                each={solves()}
                fallback={
                  <div class="h-12 flex items-center border-b border-b-layer-content/10 space-x-2 opacity-60">
                    <span class="icon-[fluent--emoji-sad-slight-20-regular] w-5 h-5" />
                    <span>{t("game.team.noSolves")}</span>
                  </div>
                }
              >
                {(submission) => (
                  <A
                    class="h-12 flex items-center border-b border-b-layer-content/10 hover:bg-layer-content/5 space-x-2"
                    href={`/games/${gameStore.current?.id}/challenges?challenge=${submission.challenge_id}`}
                  >
                    <span class="icon-[fluent--checkmark-circle-20-regular] w-5 h-5 text-success" />
                    <span class="flex-1 text-start truncate">
                      {t("game.team.solvesJournal", {
                        challenge: submission.challenge_name!,
                        user: submission.user_name!,
                      })}
                    </span>
                    <span class="text-success font-bold">{submission.score} pts</span>
                    <span class="opacity-60">{submission.created_at.toFormat("yyyy-MM-dd HH:mm:ss")}</span>
                  </A>
                )}
              </For>
            </section>
            <div class="h-16" />
            <h3 class="h-12 flex items-center border-b border-b-layer-content/15 font-bold space-x-2">
              <span class="icon-[fluent--trophy-20-regular] w-5 h-5" />
              <span>{t("game.team.extras")}</span>
            </h3>
            <section class="flex flex-col">
              <For
                each={extras()}
                fallback={
                  <div class="h-12 flex items-center border-b border-b-layer-content/10 space-x-2 opacity-60">
                    <span class="icon-[fluent--emoji-sad-slight-20-regular] w-5 h-5" />
                    <span>{t("game.team.noExtras")}</span>
                  </div>
                }
              >
                {(extra) => (
                  <div class="h-12 flex items-center border-b border-b-layer-content/10 hover:bg-layer-content/5 space-x-2">
                    <span class="icon-[fluent--checkmark-circle-20-regular] w-5 h-5 text-success" />
                    <span class="flex-1 text-start truncate">{extra.reason}</span>
                    <span class={`font-bold ${extra.score > 0 ? "text-success" : "text-warning"}`}>
                      {extra.score} pts
                    </span>
                    <span class="opacity-60">{extra.created_at.toFormat("yyyy-MM-dd HH:mm:ss")}</span>
                  </div>
                )}
              </For>
            </section>
          </div>
        </div>
      </SidebarLayout>
    </>
  );
}
