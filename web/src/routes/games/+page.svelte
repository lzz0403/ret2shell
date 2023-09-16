<script lang="ts">
  import { platform } from '$lib/stores/platform'
  import { i18n } from '$lib/i18n'
  import RxImage from '$lib/components/RxImage.svelte'
  import type { Game } from '$lib/models/game'
  import Bg from '$lib/assets/background-lines.svg'
  import Logo from '$lib/assets/logo.svg'
  import LogoGray from '$lib/assets/logo-gray.svg'
    import RxTag from '$lib/components/RxTag.svelte'

  let games: Game[] = []
  let currentGame: Game | null = null
  let hasCover = false
  let loading = false
</script>

<svelte:head><title>{$i18n.t('games.title')} - {$platform.name}</title></svelte:head>
<div class="flex-1 flex flex-row p-4 lg:p-6 justify-center">
  <div class="w-1/4 min-w-[24rem] max-w-[32rem] flex-shrink-0 hidden lg:flex flex-col items-end"></div>
  <div class="flex-1 flex flex-col p-3 lg:p-6 items-center lg:justify-center">
    <div
      class="w-full lg:w-3/4 h-auto rounded-box bg-base-content/5 backdrop-blur aspect-video transition-all lg:-translate-x-[4rem] rounded-b-none lg:rounded-b-box"
    >
      {#if hasCover}
        <RxImage class="w-full h-full relative" src={currentGame?.cover_path || ''} {loading}>
          <div class="absolute top-0 left-0 w-full h-full flex flex-row justify-center items-center">
            <h1 class="text-3xl font-bold flex flex-row items-center">
              <img alt="CTF" src={Logo} width="128" height="128" />
              <img alt="CTF" src={LogoGray} width="128" height="128" />
            </h1>
          </div>
        </RxImage>
      {:else}
        <RxImage class="w-full h-full relative" src={Bg} {loading}>
          <div class="absolute top-0 left-0 w-full h-full flex flex-row justify-center items-center">
            {#if games.length !== 0}
              <img alt="CTF" src={Logo} width="128" height="128" />
            {:else}
              <img alt="CTF" src={LogoGray} width="128" height="128" />
            {/if}
          </div>
        </RxImage>
      {/if}
    </div>
    <div
      class="h-64 sm:h-40 w-full lg:w-3/4 lg:translate-x-[4rem] lg:-translate-y-[3rem] flex flex-row justify-end transition-all"
    >
      <a
        class="w-full lg:w-2/3 rounded-box bg-neutral/80 backdrop-blur rounded-t-none lg:rounded-t-box overflow-clip flex flex-row"
        href={currentGame ? `/games/${currentGame.id}` : '#'}
      >
      <div class="flex flex-col p-6 space-y-4 sm:space-y-2">
        <h1 class="text-2xl font-bold flex-1 flex flex-row space-x-4 items-center">
          <img alt="CTF" src={Logo} width="36" height="36" />
          <span>{currentGame?.name || $i18n.t('games.noGameTitle')}</span>
        </h1>
        <h2 class="font-bold text-base opacity-60">{currentGame?.brief ? currentGame.brief : $i18n.t('games.noBrief')}</h2>
        <div class="flex-1 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-center justify-center">
          {#if currentGame}
          <RxTag label={new Date(currentGame.start_time * 1000).toLocaleDateString('default', {
            year: 'numeric',
            day: '2-digit',
            month: '2-digit',
          })} />
          <span class="text-primary transform transition-all rotate-90 sm:rotate-0">=&gt;</span>
          <RxTag label={new Date(currentGame.end_time * 1000).toLocaleDateString('default', {
            year: 'numeric',
            day: '2-digit',
            month: '2-digit',
          })} />
          {/if}
        </div>
      </div>
      <div class="md:flex flex-1 flex-row p-8 justify-end items-center hidden">
        <span class="icon-[fluent--chevron-double-right-16-regular] text-primary w-8 h-8" />
      </div>
      </a>
    </div>
  </div>
</div>
