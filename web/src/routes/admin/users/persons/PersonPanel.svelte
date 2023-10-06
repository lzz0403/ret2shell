<script lang="ts">
  import { page } from '$app/stores'
  import RxButton from '$lib/components/RxButton.svelte'
  import type { User } from '$lib/models/user'
  import { theme } from '$lib/stores/theme'
  import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte'
  import { createEventDispatcher, onDestroy } from 'svelte'
  import Info from './Info.svelte'
  import Games from './Games.svelte'
  import Statistics from './Statistics.svelte'
  import { i18n } from '$lib/i18n'

  export let user: User | null

  let clazz = ''
  let activeTab = 'info'
  export { clazz as class }

  $: classes = `absolute w-full bottom-0 flex flex-col overflow-hidden ${clazz}`
  const dispatch = createEventDispatcher()
</script>

<div class={classes}>
  <OverlayScrollbarsComponent
    options={{
      scrollbars: { theme: $theme.colorScheme === 'light' ? 'os-theme-dark' : 'os-theme-light', autoHide: 'scroll' },
    }}
    class="w-full h-full relative print:hidden bg-base-100/80 backdrop-blur"
    defer
  >
    <div
      class="sticky top-0 h-16 min-h-16 border-b border-b-base-content/5 backdrop-blur bg-base-100 flex flex-row px-2 items-center space-x-2"
    >
      <div class="flex-1 flex flex-row items-center space-x-2 px-4">
        <h1 class="text-base font-bold">{user?.name}</h1>
        <RxButton class="!ml-12" ghost on:click={() => (activeTab = 'info')} active={activeTab === 'info'}>
          {$i18n.t('admin.userInfo')}
        </RxButton>
        <RxButton ghost on:click={() => (activeTab = 'statistics')} active={activeTab === 'statistics'}>
          {$i18n.t('admin.userStatistics')}
        </RxButton>
        <RxButton ghost on:click={() => (activeTab = 'games')} active={activeTab === 'games'}>
          {$i18n.t('admin.userGames')}
        </RxButton>
      </div>
      <RxButton
        ghost
        level="error"
        class="join-item ml-0"
        on:click={() => {
          dispatch('close')
        }}
      >
        <span class="icon-[fluent--dismiss-16-regular] w-5 h-5"></span>
      </RxButton>
    </div>
    {#if activeTab === 'info'}
      <Info {user} />
    {:else if activeTab === 'games'}
      <Games {user} />
    {:else if activeTab === 'statistics'}
      <Statistics {user} />
    {/if}
  </OverlayScrollbarsComponent>
</div>
