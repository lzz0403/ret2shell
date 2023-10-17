<script lang="ts">
  import { fly } from 'svelte/transition'
  import { step } from './store'
  import { i18n } from '$lib/i18n'
  import { onMount } from 'svelte'
  let goNext = true

  onMount(() => {
    setTimeout(() => {
      goNext = false
    })

    setTimeout(() => {
      next()
    }, 2000)
  })

  function next() {
    goNext = true
    setTimeout(() => {
      $step = $step + 1
    }, 500)
  }
</script>

{#if !goNext}
  <div class="flex-1 flex flex-col justify-center items-center space-y-24" out:fly={{ y: -32, duration: 500 }}>
    <h1 class="text-4xl font-bold" in:fly={{ y: 32, duration: 1000 }}>
      🎉&nbsp;{$i18n.t('tutorial.F12Ok')}
    </h1>
    <div class="h-32"></div>
  </div>
{/if}
