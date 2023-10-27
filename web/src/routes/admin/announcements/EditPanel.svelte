<script lang="ts">
  import ExtraPanel from '$lib/blocks/ExtraPanel.svelte'
  import RxButton from '$lib/components/RxButton.svelte'
  import RxCodearea from '$lib/components/RxCodearea.svelte'
  import RxInput from '$lib/components/RxInput.svelte'
  import { i18n } from '$lib/i18n'
  import type { Announcement } from '$lib/models/announcement'
  import { createEventDispatcher } from 'svelte'

  export let announcement: Announcement
  export let loading = false
  export let submitting = false

  let clazz = ''
  export { clazz as class }

  const dispatch = createEventDispatcher()
</script>

<ExtraPanel class={clazz} on:close={() => dispatch('close')}>
  <div class="join flex-1" slot="header">
    <RxButton
      on:click={() => {
        announcement.pinned = !announcement.pinned
      }}
      ghost
      {loading}
      class="join-item"
    >
      {#if !loading}
        <span class={`icon-[fluent--pin-20-regular] w-5 h-5 ${announcement.pinned ? 'text-error' : 'opacity-60'}`} />
      {/if}
    </RxButton>
    <RxInput
      ghost
      class="flex-1 join-item"
      label="Title"
      placeholder="Title"
      disabled={loading || submitting}
      bind:value={announcement.title}
    />
  </div>
  <RxButton
    ghost
    level="primary"
    disabled={loading || submitting}
    loading={submitting}
    slot="actions"
    on:click={() => {
      dispatch('submit', announcement)
    }}
  >
    {$i18n.t('announcement.submit')}
  </RxButton>
  <RxCodearea
    class="w-full h-full"
    lang="markdown"
    placeholder="Mode = Markdown"
    {loading}
    readonly={loading || submitting}
    bind:value={announcement.content}
    droppable={true}
  />
</ExtraPanel>
