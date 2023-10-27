<script lang="ts">
  import RxButton from '$lib/components/RxButton.svelte'
  import RxCodearea from '$lib/components/RxCodearea.svelte'
  import RxInput from '$lib/components/RxInput.svelte'
  import { i18n } from '$lib/i18n'
  import { createEventDispatcher } from 'svelte'
  import type { Notification } from '$lib/models/game'
  import ExtraPanel from '$lib/blocks/ExtraPanel.svelte'

  export let notification: Notification
  export let loading = false
  export let submitting = false

  let clazz = ''
  export { clazz as class }

  const dispatch = createEventDispatcher()
</script>

<ExtraPanel class={clazz} on:close={() => dispatch('close')}>
  <RxInput
    ghost
    slot="header"
    class="flex-1 join-item"
    label="Title"
    placeholder="Title"
    disabled={loading || submitting}
    bind:value={notification.title}
  />
  <RxButton
    ghost
    slot="actions"
    level="primary"
    disabled={loading || submitting}
    loading={submitting}
    class="join-item"
    on:click={() => {
      dispatch('submit', notification)
    }}
  >
    {$i18n.t('notification.submit')}
  </RxButton>
  <RxCodearea
    class="w-full h-full"
    lang="text"
    placeholder="Mode = text"
    {loading}
    readonly={loading || submitting}
    bind:value={notification.content}
    droppable={true}
  />
</ExtraPanel>
