<script lang="ts">
  import RxButton from '$lib/components/RxButton.svelte'
  import { fly } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'
  import WikiSidebar from '$lib/blocks/WikiSidebar.svelte'
  import { transformToWikiEntry, type WikiEntry } from '$lib/models/wiki'
  import { onMount } from 'svelte'
  import { getWikiList } from '$lib/api/wiki'
  import type { AxiosError } from 'axios'
  import { showMessage } from '$lib/stores/toast'
  import { i18n } from '$lib/i18n'
  import { page } from '$app/stores'

  let toggleSidebar = false
  let screenWidth: number
  let activeChains: number[] = []
  let wikiEntries: WikiEntry[] = []
  let loading = false

  // give path:  /wiki/1/2/3/4 ...
  // we should loop through the path and request-and-insert the path children into the tree
  // if the path children returns not found or activeId do not exist in the path children,
  // we should show error page.
  async function recursiveInsertPath(path: number[]) {
    let currentId = 0
    let currentChildren: WikiEntry[] = wikiEntries
    for (let i = 0; i < path.length; i++) {
      currentId = path[i]
      // console.log(currentId)
      // console.log(currentChildren)
      let currentChild = currentChildren.find((item) => item.id === currentId)
      if (!currentChild) {
        loading = false
        return
      }
      const newChildren = await getWikiList(currentId)
      currentChild.children = transformToWikiEntry(newChildren)
      currentChildren = currentChild.children
    }
    wikiEntries = wikiEntries

    loading = false
  }

  onMount(() => {
    loading = true
    getWikiList()
      .then((data) => {
        wikiEntries = transformToWikiEntry(data)
      })
      .catch((err) => {
        let error = err as AxiosError
        showMessage('error', `${$i18n.t('wiki.fetchFailed')}: ${error.response?.data}`)
      })
      .finally(() => {
        if (!$page.params['wiki']) {
          loading = false
          return
        }
        const path = $page.params['wiki'].split('/').map((item) => {
          try {
            return parseInt(item)
          } catch (err) {
            return -1
          }
        })
        activeChains = path
        recursiveInsertPath(path)
      })
  })

  $: showSidebar = screenWidth > 1024 // lg

  page.subscribe((value) => {
    if (value.params['wiki']) {
      activeChains = value.params['wiki'].split('/').map((item) => {
        try {
          return parseInt(item)
        } catch (err) {
          return -1
        }
      })
    } else {
      activeChains = [-1]
    }
  })
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="flex-1 flex flex-row">
  {#if showSidebar}
    <div
      class="fixed w-1/4 h-[calc(100vh_-_4rem)] max-w-[512px] bg-base-100/60 backdrop-blur border-r border-r-base-content/5 shadow"
    >
      <WikiSidebar bind:wiki={wikiEntries} {activeChains} {loading} />
    </div>
    <div class="w-1/4 flex-shrink-0" />
  {:else}
    <RxButton
      size="lg"
      class="fixed right-6 bottom-6"
      on:click={() => {
        toggleSidebar = !toggleSidebar
      }}
    >
      <span class="icon-[fluent--navigation-16-regular] w-5 h-5" />
    </RxButton>
  {/if}
  <div class="flex-1 min-w-0">
      <slot />
  </div>
  {#if toggleSidebar && !showSidebar}
    <div
      class="fixed w-full max-w-[400px] h-[calc(100vh_-_4rem)] overflow-hidden backdrop-blur bg-base-100/40 border-r border-r-base-content/5 shadow"
      transition:fly={{ delay: 100, duration: 300, x: -256, y: 0, opacity: 0, easing: quintOut }}
    >
      <WikiSidebar bind:wiki={wikiEntries} {activeChains} {loading} />
    </div>
    <RxButton
      size="lg"
      class="fixed right-6 bottom-6"
      on:click={() => {
        toggleSidebar = !toggleSidebar
      }}
    >
      <span class="icon-[fluent--dismiss-16-regular] w-5 h-5" />
    </RxButton>
  {/if}
</div>
