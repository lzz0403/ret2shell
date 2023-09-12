<script lang="ts">
  import { page } from '$app/stores'
  import Error from '$lib/blocks/Error.svelte'
</script>

<Error status={$page.status} />
