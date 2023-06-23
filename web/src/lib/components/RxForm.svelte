<script lang="ts">
  import type { FormAction } from '@felte/core'

  let clazz = ''
  export { clazz as class }
  export let horizontal = false
  export let form: FormAction

  $: classes = [
    'flex',
    'flex-col',
    'space-y-2',
    'space-x-0',
    horizontal && 'md:flex-row',
    horizontal && 'md:space-x-4',
    horizontal && 'md:space-y-0',
    clazz,
  ]
    .filter(Boolean)
    .join(' ')
</script>

<form use:form class={classes}>
  <slot />
</form>
