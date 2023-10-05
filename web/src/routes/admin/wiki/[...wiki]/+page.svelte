<script lang="ts">
  import { i18n } from '$lib/i18n'
  import { page } from '$app/stores'
  import type { Wiki } from '$lib/models/wiki'
  import { createWiki, editWiki, getWiki } from '$lib/api/wiki'
  import { showMessage } from '$lib/stores/toast'
  import type { AxiosError } from 'axios'
  import { onDestroy } from 'svelte'
  import RxCodearea from '$lib/components/RxCodearea.svelte'
  import RxInput from '$lib/components/RxInput.svelte'
  import RxButton from '$lib/components/RxButton.svelte'
  import { goto } from '$app/navigation'

  let loading = true
  let error = 200
  let isCreate = false
  let wiki: Wiki = {
    id: 0,
    title: '',
    content: '',
    parent: null,
    published_at: 0,
    updated_at: 0,
    author_id: 0,
  }

  let editedWiki: Wiki = {
    id: 0,
    title: '',
    content: '',
    parent: null,
    published_at: 0,
    updated_at: 0,
    author_id: 0,
  }

  const unsubscribe = page.subscribe((value) => {
    const arr = value.params['wiki'].split('/')
    // console.log(arr)
    const id = parseInt(arr[arr.length - 1])
    if (isNaN(id)) {
      loading = false
      return
    }
    // console.log(id)
    if (id === 0) {
      isCreate = true
      //   console.log('create')
      wiki = {
        id: 0,
        title: '',
        content: '',
        parent: null,
        published_at: 0,
        updated_at: 0,
        author_id: 0,
      }
      editedWiki = {
        id: 0,
        title: '',
        content: '',
        parent: null,
        published_at: 0,
        updated_at: 0,
        author_id: 0,
      }
      return
    }
    loading = true
    if (id > 0) {
      getWiki(id)
        .then((data) => {
          wiki = data
          error = 200

          isCreate = $page.url.hash.replace('#', '') === 'create'
          if (isCreate) {
            editedWiki = {
              id: 0,
              title: '',
              content: '',
              parent: null,
              published_at: 0,
              updated_at: 0,
              author_id: 0,
            }
          } else {
            editedWiki = structuredClone(wiki)
          }
        })
        .catch((err) => {
          showMessage('error', `${$i18n.t('wiki.fetchContentFailed')}: ${(err as AxiosError).response?.data}`)
          error = (err as AxiosError).response?.status || 500
        })
        .finally(() => {
          loading = false
        })
    } else {
      loading = false
    }
  })

  onDestroy(unsubscribe)

  function createOrSaveWikiItem() {
    if (isCreate) {
      if (editedWiki.title.trim() === '') {
        showMessage('error', $i18n.t('wiki.titleEmpty'), 5000)
        return
      } else if (editedWiki.content.trim() === '') {
        showMessage('error', $i18n.t('wiki.contentEmpty'), 5000)
        return
      }
      if (wiki.id !== 0) editedWiki.parent = wiki.id
      else editedWiki.parent = null
      createWiki(editedWiki)
        .then((data) => {
          showMessage('success', $i18n.t('wiki.createSuccess'), 5000)
          const pathName = $page.url.pathname.replace('/0#create', '').replace($page.url.hash, '')
          goto(`${pathName}/${data.id}#edit`)
        })
        .catch((err) => {
          showMessage('error', `${$i18n.t('wiki.createFailed')}: ${(err as AxiosError).response?.data}`, 5000)
        })
    } else {
      if (editedWiki.title.trim() === '') {
        showMessage('error', $i18n.t('wiki.titleEmpty'), 5000)
        return
      } else if (editedWiki.content.trim() === '') {
        showMessage('error', $i18n.t('wiki.contentEmpty'), 5000)
        return
      }
      editWiki(wiki.id, editedWiki)
        .then(() => {
          showMessage('success', $i18n.t('wiki.updateSuccess'), 5000)
          const pathName = $page.url.pathname.replace($page.url.hash, '')
          goto(`${pathName}#edit`)
        })
        .catch((err) => {
          showMessage('error', `${$i18n.t('wiki.updateFailed')}: ${(err as AxiosError).response?.data}`, 5000)
        })
    }
  }
  function deleteWikiItem() {}
</script>

<div
  class="h-16 flex-shrink-0 flex flex-row items-center px-2 border-b border-b-base-content/5 bg-base-100/80 backdrop-blur"
>
  <RxInput ghost bind:value={editedWiki.title}></RxInput>
  <RxButton class="join-item" ghost level="info" on:click={createOrSaveWikiItem}>
    {#if isCreate}
      <span class="icon-[fluent--add-16-regular] w-5 h-5"></span>
      <span>{$i18n.t('admin.create')}</span>
    {:else}
      <span class="icon-[fluent--save-16-regular] w-5 h-5"></span>
      <span>{$i18n.t('admin.update')}</span>
    {/if}
  </RxButton>
  {#if !isCreate}
    <RxButton class="join-item" ghost level="error" on:click={deleteWikiItem}>
      <span class="icon-[fluent--delete-16-regular] w-5 h-5"></span>
    </RxButton>
  {/if}
</div>
<RxCodearea class="flex-1" lang="markdown" bind:value={editedWiki.content} droppable={true}></RxCodearea>
