<script lang="ts">
  import type { DTColumnAction, DTColumnsDef, DTDataEntry } from '$lib/blocks/DataTable'
  import DataTable from '$lib/blocks/DataTable.svelte'
  import { i18n } from '$lib/i18n'
  import { platform } from '$lib/stores/platform'
  import { showMessage } from '$lib/stores/toast'
  import type { AxiosError } from 'axios'
  import { admin } from '$lib/stores/admin'
  import type { Game } from '$lib/models/game'
  import { getGameWriteUp } from '$lib/api/game'
  import RxLink from '$lib/components/RxLink.svelte'
  import RxButton from '$lib/components/RxButton.svelte'
  import { blur } from 'svelte/transition'
  import { page } from '$app/stores'
  import { onDestroy } from 'svelte'
  import type { WriteUpOnlyTeamInfo } from '$lib/models/write_up'

  let currentPage: number = 1
  let perPage: number = 15
  let total: number = 0
  let showAuditPanel: boolean = false
  let loading: boolean = false
  let loadingWriteUp: boolean = false
  let submitting: boolean = false
  let writeUps: WriteUpOnlyTeamInfo[] = []
  $: readerWriteUps = writeUps.map((a) => {
    return {
      ...a,
      team_name: `${encodeURI(a.team_name)}|${encodeURI(`/admin/games/${$admin.game?.id}/teams#${a.team_id}`)}`,
    }
  })

  let actions: DTColumnAction[] = [
    {
      icon: 'icon-[fluent--edit-20-regular]',
      label: '',
      level: 'info',
      type: 'link',
      href: '#audit',
    },
  ]

  let colDef: DTColumnsDef = {
    id: {
      header: 'ID',
      dimmed: true,
      type: 'number',
      sizePolicy: 'shrink',
      justify: 'text-center',
    },
    title: {
      header: $i18n.t('writeup.title'),
      type: 'plain',
      dimmed: false,
      sizePolicy: 'shrink',
      justify: 'text-start',
    },
    team_id: {
      header: '',
      type: 'hidden',
      dimmed: false,
      sizePolicy: 'shrink',
      justify: 'text-center',
    },
    team_name: {
      header: $i18n.t('writeup.team_name'),
      type: 'plain',
      dimmed: false,
      sizePolicy: 'grow',
      justify: 'text-start',
    },
    hidden: {
      header: '',
      type: 'bool',
      dimmed: false,
      sizePolicy: 'shrink',
      justify: 'text-center',
    },
  }

  function fetchWriteUps() {
    if (!$admin.game) return
    loading = true
    getGameWriteUp($admin.game.id, currentPage, perPage)
      .then((res) => {
        writeUps = res.writeups
        total = res.total
      })
      .catch((err) => {
        showMessage('error', `${$i18n.t('witeup.fetchFailed')}: ${(err as AxiosError).response?.data}`, 5000)
      })
      .finally(() => {
        loading = false
      })
  }

  let storedPage: number | undefined = undefined
  let storedGameId: number | undefined = undefined

  function watchPage(p: number, g: Game | null) {
    if (p && g && (p !== storedPage || storedGameId !== g.id)) {
      fetchWriteUps()
      storedPage = p
      storedGameId = g.id
    }
  }

  $: watchPage(currentPage, $admin.game)

  const unsubscribe = page.subscribe((val) => {
    if (val.url.hash && val.url.hash.replace('#', '')) {
      if (val.url.hash.replace('#', '') == 'audit') {
        showAuditPanel = true
      }
    } else {
      showAuditPanel = false
    }
  })

  onDestroy(() => {
    unsubscribe()
  })
</script>

<svelte:head><title>{$i18n.t('admin.WriteUpListSettings')} - {$platform.name}</title></svelte:head>
<div class="w-full flex-1 flex flex-col relative">
  {#if !showAuditPanel}
    <div class="w-full flex-1 flex flex-col px-6 lg:px-12">
      <div class="h-16 flex flex-row items-center space-x-2">
        <h2 class="text-base font-bold flex-1">{$i18n.t('admin.WriteUpListSettings')}</h2>
      </div>
      <DataTable
        class="flex-1"
        {actions}
        data={readerWriteUps}
        {colDef}
        bind:page={currentPage}
        {total}
        {loading}
        booleanIconsDef={{
          hidden: {
            true: 'icon-[fluent--eye-off-20-regular] text-warning',
            false: 'icon-[fluent--checkmark-20-regular] text-success',
          },
        }}
      />
    </div>
  {/if}
</div>
