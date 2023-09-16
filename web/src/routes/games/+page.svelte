<script lang="ts">
  import { platform } from '$lib/stores/platform'
  import { i18n } from '$lib/i18n'
  import RxButton from '$lib/components/RxButton.svelte'
    import RxImage from '$lib/components/RxImage.svelte'
  // import type { Game } from '$lib/models/game'

  // let games: Game[] = []
</script>

<svelte:head><title>{$i18n.t('games.title')} - {$platform.name}</title></svelte:head>
<div class="flex-1 flex flex-row p-4 lg:p-6 justify-center">
  <div class="w-1/4 min-w-[24rem] max-w-[32rem] flex-shrink-0 hidden lg:flex">
  </div>
  <div class="flex-1 flex flex-col p-3 lg:p-6 items-center lg:justify-center">
    <div class="w-full lg:w-2/3 h-auto rounded-box bg-base-content/5 backdrop-blur aspect-video transition-all lg:-translate-x-[4rem] rounded-b-none lg:rounded-b-box">
    </div>
    <div class="h-48 w-full lg:w-2/3 lg:translate-x-[4rem] lg:-translate-y-[4rem] flex flex-row justify-end transition-all">
      <div class="w-full lg:w-2/3 rounded-box bg-neutral/80 backdrop-blur rounded-t-none lg:rounded-t-box"></div>
    </div>
  </div>
</div>
