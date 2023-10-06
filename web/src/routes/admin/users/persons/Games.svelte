<script lang="ts">
  import { getUserTeams } from '$lib/api/user'
  import { i18n } from '$lib/i18n'
  import type { TeamWithGameName } from '$lib/models/team'
  import type { User } from '$lib/models/user'
  import { showMessage } from '$lib/stores/toast'
  import type { AxiosError } from 'axios'

  export let user: User | null
  let teams: TeamWithGameName[] = []

  $: if (user)
    getUserTeams(user.id)
      .then((value) => {
        teams = value
      })
      .catch((err) => {
        showMessage('error', `${$i18n.t('account.fetchInfoFailed')}: ${(err as AxiosError).response?.data}`, 5000)
      })
</script>

<div class="flex flex-col space-y-2">
  {#each teams as team}
    <div class="h-16 flex flex-row items-center space-x-2 border-b border-b-base-content/5 px-4">
      <span class="icon-[fluent--trophy-20-regular] w-5 h-5"></span>
      <span class="text-base flex-1"
        >{$i18n.t('account.takePartAs', { team: team.name, game: team.game_name, score: team.score })}</span
      >
      <span class="text-base opacity-60">
        {new Date(team.last_active_at * 1000).toLocaleDateString('default', {
          year: 'numeric',
          day: '2-digit',
          month: '2-digit',
        })}
      </span>
    </div>
  {/each}
</div>
