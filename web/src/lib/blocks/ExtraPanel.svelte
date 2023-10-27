<script lang="ts">
  import RxButton from '$lib/components/RxButton.svelte'
  import { theme } from '$lib/stores/theme'
  import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte'
  import { createEventDispatcher } from 'svelte'

  export let title: string = ''

  const dispatch = createEventDispatcher()
  let clazz = ''
  export { clazz as class }
  $: classes = `w-full bg-neutral/20 backdrop-blur overflow-hidden ${clazz}`
</script>

<div class={classes}>
  <div class="absolute top-0 left-0 w-full h-full flex flex-col overflow-hidden">
    <div class="h-16 flex-shrink-0 border-b border-b-base-content/5 flex flex-row px-2 items-center space-x-2">
      <slot name="header">
        <div class="flex-1 flex flex-row items-center px-4">
          <h1 class="text-base font-bold">{title}</h1>
        </div>
      </slot>
      <slot name="actions" />
      <RxButton
        ghost
        level="error"
        class="join-item ml-0"
        on:click={() => {
          dispatch('close')
        }}
      >
        <span class="icon-[fluent--dismiss-20-regular] w-5 h-5"></span>
      </RxButton>
    </div>
    <OverlayScrollbarsComponent
      options={{
        scrollbars: { theme: $theme.colorScheme === 'light' ? 'os-theme-dark' : 'os-theme-light', autoHide: 'scroll' },
      }}
      class="w-full flex-1 overflow-hidden relative print:hidden"
      defer
    >
      <slot />
    </OverlayScrollbarsComponent>
  </div>
</div>
