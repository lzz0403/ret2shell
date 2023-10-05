<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import Sidebar from './Sidebar.svelte'
  import { admin } from '$lib/stores/admin'
  onMount(() => {
    admin.update((val) => {
      return {
        ...val,
        secondLevelComponent: Sidebar,
      }
    })
  })

  onDestroy(() => {
    admin.update((val) => {
      return {
        ...val,
        secondLevelComponent: null,
      }
    })
  })
</script>

<slot />
