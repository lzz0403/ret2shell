<script lang="ts">
  import { platform } from '$lib/stores/platform'
  import { i18n } from '$lib/i18n'
</script>

<svelte:head><title>{$i18n.t('admin.wikiSettings')} - {$platform.name}</title></svelte:head>

<div class="flex-1 flex flex-col items-center justify-center space-y-4">
  <span class="w-24 h-24 icon-[fluent--hat-graduation-16-regular]" />
  <h1 class="text-base font-bold">{$i18n.t('wiki.welcomeTitle')}</h1>
  <p class="text-base pt-16 opacity-60">{$i18n.t('admin.wikiGuide')}</p>
</div>
