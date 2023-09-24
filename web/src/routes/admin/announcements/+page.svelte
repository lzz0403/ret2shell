<script lang="ts">
  import type { DTColumnAction, DTColumnsDef, DTDataEntry } from '$lib/blocks/DataTable'
  import DataTable from '$lib/blocks/DataTable.svelte'
  import type { Announcement } from '$lib/models/announcement'

  let page: number = 0
  let perPage: number = 0
  let total: number = 0
  let announcements: Announcement[] = [
    {
      id: 1,
      title: 'New Feature Release',
      updated_at: 1631232000,
      published_at: 1631232000,
      publisher_id: 1,
      content: 'We are excited to announce the release of our new feature!',
      pinned: true,
    },
    {
      id: 2,
      title: 'Upcoming Maintenance',
      updated_at: 1631232000,
      published_at: 1631232000,
      publisher_id: 2,
      content: 'We will be performing maintenance on our servers on October 1st.',
      pinned: false,
    },
    {
      id: 3,
      title: 'Holiday Schedule',
      updated_at: 1631232000,
      published_at: 1631232000,
      publisher_id: 3,
      content: 'Our office will be closed on December 25th for the holiday.',
      pinned: true,
    },
  ]
  let actions: DTColumnAction[] = []
  let colDef: DTColumnsDef = {
    id: {
      header: 'ID',
      dimmed: true,
      type: 'number',
      sizePolicy: 'shrink',
      justify: 'justify-center',
    },
    title: {
      header: 'Title',
      type: 'plain',
      dimmed: false,
      sizePolicy: 'shrink',
      justify: 'justify-start',
    },
    updated_at: {
      header: 'Updated At',
      type: 'hidden',
      dimmed: true,
      sizePolicy: 'shrink',
      justify: 'justify-start',
    },
    published_at: {
      header: 'Created At',
      type: 'date',
      dimmed: true,
      sizePolicy: 'shrink',
      justify: 'justify-start',
    },
    publisher_id: {
      header: 'Publisher ID',
      type: 'hidden',
      dimmed: true,
      sizePolicy: 'shrink',
      justify: 'justify-start',
    },
    content: {
      header: 'Content',
      type: 'plain',
      dimmed: false,
      sizePolicy: 'grow',
      justify: 'justify-start',
    },
    pinned: {
      header: 'Pinned',
      type: 'tag',
      dimmed: false,
      sizePolicy: 'shrink',
      justify: 'justify-center',
    },
  }
</script>

<div class="flex-1 flex flex-col items-center">
  <div class="w-full max-w-5xl flex flex-col p-4 lg:p-6">
    <DataTable {actions} data={announcements} {colDef} />
  </div>
</div>
