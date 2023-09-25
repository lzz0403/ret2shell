<script lang="ts">
  import { getAnnouncementList } from '$lib/api/announcement'
  import type { DTColumnAction, DTColumnsDef, DTDataEntry } from '$lib/blocks/DataTable'
  import DataTable from '$lib/blocks/DataTable.svelte'
  import { i18n } from '$lib/i18n'
  import type { Announcement } from '$lib/models/announcement'
  import { showMessage } from '$lib/stores/toast'
  import type { AxiosError } from 'axios'
  import { onMount } from 'svelte'

  let page: number = 1
  let perPage: number = 12
  let total: number = 0
  let loading = false
  let announcements: Announcement[] = []
  let actions: DTColumnAction[] = [
    {
      icon: 'icon-[fluent--edit-16-regular]',
      label: '',
      level: 'info',
      onClick: (data: DTDataEntry) => {
        // jump to edit page
      },
    },
    {
      icon: 'icon-[fluent--delete-16-regular]',
      label: '',
      level: 'error',
      onClick: (data: DTDataEntry) => {
        // popup delete modal
      },
    },
  ]
  let colDef: DTColumnsDef = {
    id: {
      header: 'ID',
      dimmed: true,
      type: 'number',
      sizePolicy: 'shrink',
      justify: 'text-center',
    },
    title: {
      header: 'Title',
      type: 'plain',
      dimmed: false,
      sizePolicy: 'grow',
      justify: 'text-start',
    },
    updated_at: {
      header: 'Updated At',
      type: 'hidden',
      dimmed: true,
      sizePolicy: 'shrink',
      justify: 'text-start',
    },
    published_at: {
      header: 'Created At',
      type: 'date',
      dimmed: true,
      sizePolicy: 'shrink',
      justify: 'text-start',
    },
    publisher_id: {
      header: 'Publisher ID',
      type: 'hidden',
      dimmed: true,
      sizePolicy: 'shrink',
      justify: 'text-start',
    },
    content: {
      header: 'Content',
      type: 'hidden',
      dimmed: false,
      sizePolicy: 'grow',
      justify: 'text-start',
    },
    pinned: {
      header: 'Pinned',
      type: 'bool',
      dimmed: false,
      sizePolicy: 'shrink',
      justify: 'text-center',
    },
  }

  function fetchAnnouncements() {
    loading = true
    getAnnouncementList(page, perPage)
      .then((res) => {
        announcements = res.announcements
        total = res.total
      })
      .catch((err) => {
        showMessage('error', `${$i18n.t('announcements.fetchFailed')}: ${(err as AxiosError).response?.data}`, 5000)
      })
      .finally(() => {
        loading = false
      })
  }

  onMount(() => {
    fetchAnnouncements()
  })

  $: {
    if (page) {
      fetchAnnouncements()
    }
  }
</script>

<div class="flex-1 flex flex-col items-center">
  <div class="w-full max-w-5xl flex flex-col p-4 lg:p-6">
    <DataTable {actions} data={announcements} {colDef} bind:page {total} {loading} />
  </div>
</div>
