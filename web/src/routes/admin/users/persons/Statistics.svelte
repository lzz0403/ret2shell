<script lang="ts">
  import { getUserIpAddresses } from '$lib/api/user'
  import RxTag from '$lib/components/RxTag.svelte'
  import { i18n } from '$lib/i18n'
  import type { IpAddress } from '$lib/models/ip'
  import type { User } from '$lib/models/user'
  import { showMessage } from '$lib/stores/toast'
  import type { AxiosError } from 'axios'

  export let user: User | null
  export let ipAddrs: IpAddress[] = []

  $: if (user)
    getUserIpAddresses(user.id)
      .then((value) => {
        ipAddrs = value
      })
      .catch((err) => {
        showMessage('error', `${$i18n.t('account.fetchInfoFailed')}: ${(err as AxiosError).response?.data}`, 5000)
      })
</script>

<div class="flex flex-col p-6">
  <div class="h-16 flex flex-row items-center space-x-2 border-b border-b-base-content/5 px-4">
    <span class="icon-[fluent--globe-location-20-regular] w-5 h-5"></span>
    <span class="text-base font-bold">{$i18n.t('admin.userIpAddresses')}</span>
  </div>
  <div class="p-2 flex flex-row flex-wrap">
    {#each ipAddrs as ip}
      <RxTag label={ip.address} class="m-1"></RxTag>
    {/each}
  </div>
</div>
