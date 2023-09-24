<script lang="ts">
  import RxButton from '$lib/components/RxButton.svelte'
  import RxPaginator from '$lib/components/RxPaginator.svelte'
  import RxTag from '$lib/components/RxTag.svelte'
  import type { DTColumnAction, DTColumnsDef, DTDataEntry } from './DataTable'

  export let data: object[]
  export let colDef: DTColumnsDef
  export let page: number = 1
  export let total: number = 1
  // level: text-info text-success text-warning text-error
  export let actions: DTColumnAction[] = []
  $: types = Object.keys(colDef)
    .map((key) => {
      return {
        [key]: colDef[key].type,
      }
    })
    .reduce((a, b) => ({ ...a, ...b }), {})
  let dataEntries = data as DTDataEntry[]
</script>

<div class="flex flex-col space-y-2">
  <table class="w-full max-w-full table table-auto rounded-box overflow-hidden bg-base-content/5 backdrop-blur">
    <thead class="text-base bg-neutral/80">
      <tr>
        {#each Object.keys(colDef) as key}
          {#if types[key] != 'hidden'}
            <td
              class={colDef[key].justify && colDef[key].justify}
              style={`${typeof colDef[key].sizePolicy === 'number' ? `width: ${colDef[key].sizePolicy}px` : ''}`}
              >{colDef[key].header}</td
            >
          {/if}
        {/each}
        {#if actions.length > 0}
          <td class="w-0"></td>
        {/if}
      </tr>
    </thead>
    <tbody class="w-full max-w-full overflow-hidden">
      {#each dataEntries as dataEntry}
        <tr>
          {#each Object.keys(dataEntry) as key}
            {#if types[key] == 'plain'}
              <td
                title={dataEntry[key]?.toString()}
                class={`truncate ${colDef[key].sizePolicy === 'shrink' ? 'w-0' : 'w-full max-w-0'} ${
                  colDef[key].justify && colDef[key].justify
                }`}
                >{dataEntry[key]}
              </td>
            {:else if types[key] == 'number' && typeof dataEntry[key] === 'number'}
              <td
                class={`${colDef[key].sizePolicy === 'shrink' && 'w-0'} ${colDef[key].justify && colDef[key].justify}`}
              >
                <span>{dataEntry[key]}</span>
              </td>
            {:else if types[key] == 'tag'}
              <td
                class={`whitespace-nowrap ${colDef[key].sizePolicy === 'shrink' && 'w-0'} ${
                  colDef[key].justify && colDef[key].justify
                }`}
              >
                <div class="flex flex-row items-center justify-start">
                  <RxTag level="info" label={dataEntry[key]?.toString()} />
                </div>
              </td>
            {:else if types[key] == 'date' && typeof dataEntry[key] === 'number'}
              <td
                class={`whitespace-nowrap ${colDef[key].sizePolicy === 'shrink' && 'w-0'} ${
                  colDef[key].justify && colDef[key].justify
                }`}
              >
                <span>
                  {new Date(
                    //@ts-expect-error fuck you ts
                    (dataEntry[key] || 0) * 1000
                  ).toLocaleString()}
                </span>
              </td>
            {:else if types[key] == 'bool' && typeof dataEntry[key] === 'boolean'}
              <td
                class={`whitespace-nowrap ${colDef[key].sizePolicy === 'shrink' && 'w-0'} ${
                  colDef[key].justify && colDef[key].justify
                }`}
              >
                {#if dataEntry[key] === true}
                  <span class="icon-[fluent--checkmark-circle-16-regular] w-6 h-6 text-success" />
                {:else}
                  <span class="icon-[fluent--dismiss-circle-16-regular] w-6 h-6 text-warning" />
                {/if}
              </td>
            {/if}
          {/each}
          {#if actions.length > 0}
            <td class="w-0 whitespace-nowrap">
              <div class="flex flex-row space-x-2">
                {#each actions as item}
                  <RxButton
                    size="sm"
                    ghost
                    square={item.label.length === 0}
                    on:click={() => {
                      item.onClick(dataEntry)
                    }}
                  >
                    <span class={`${item.icon} w-4 h-4 text-${item.level}`}></span>
                    {#if item.label.length > 0}
                      <span class="text-sm">{item.label}</span>
                    {/if}
                  </RxButton>
                {/each}
              </div>
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
  <div class="flex flex-row items-center justify-center w-full">
    <RxPaginator {page} {total} />
  </div>
</div>
