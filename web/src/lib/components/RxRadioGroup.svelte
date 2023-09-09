<script lang="ts">
  import RxRadioButton from './RxRadioButton.svelte'

  export let id: string | undefined = undefined
  export let name: string | undefined = undefined
  export let value: string | number | undefined = undefined
  export let direction: 'row' | 'column' = 'row'
  interface RxRadioItem {
    label: string
    value: string | number
  }
  export let items: RxRadioItem[]

  $: classes = [
    'flex', 'flex-wrap',
    direction === 'row' ? 'flex-row' : 'flex-col', 'space-x-4 space-y-4',
  ].join(' ')
</script>

<input {id} {name} type="text" class="hidden" value />
<div class={classes}>
    <div></div>
  {#each items as item}
    <RxRadioButton
      class="flex-1"
      {value}
      preset={item.value}
      label={item.label}
      on:select={(data) => {
        value = data.detail
      }}
    />
  {/each}
</div>
