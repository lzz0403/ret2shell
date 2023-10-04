<script>
  import { i18n } from '$lib/i18n'

  import { platform } from '$lib/stores/platform'
</script>

<svelte:head><title>{$i18n.t('admin.serverLogs')} - {$platform.name}</title></svelte:head>
