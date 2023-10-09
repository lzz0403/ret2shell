<script lang="ts">
  import { i18n } from '$lib/i18n'
</script>

<div class="flex-1 flex flex-row p-4 lg:p-6 justify-center">
  <div class="flex-1 flex flex-col max-w-5xl">
    <div class="p-12 flex flex-row justify-center">
      <span class="icon-[fluent--warning-24-filled] text-error w-24 h-24"></span>
    </div>
    <h1 class="text-center text-lg font-bold text-error">{$i18n.t('account.deleteAccountTitle')}</h1>
  </div>
</div>
