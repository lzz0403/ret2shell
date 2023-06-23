<script lang="ts">
  import logo from '$lib/assets/logo.svg'
  import { platform } from '$lib/stores/platform'
  import { user } from '$lib/stores/user'
  import GlobalMenu from '$lib/blocks/GlobalMenu.svelte'
  import CustomizeBox from './CustomizeBox.svelte'
  import { _ } from 'svelte-i18n'
  import RxLink from '$lib/components/RxLink.svelte'
  import RxButton from '$lib/components/RxButton.svelte'
  import RxPopup from '$lib/components/RxPopup.svelte'
</script>

<div class="navbar w-auto backdrop-blur shadow bg-neutral/80 transition-shadow z-40 print:hidden px-2 py-0">
  <RxPopup class="btn-square btn-ghost xl:hidden" name="navPopup">
    <span slot="button" class="icon-[fluent--navigation-16-regular] w-5 h-5" />
    <ul class="menu menu-vertical">
      <GlobalMenu />
    </ul>
  </RxPopup>
  <RxLink ghost href="/" exactlyMatched>
    <img class="hidden xl:block" width="28" height="28" src={logo} alt="RX" />
    <span>{$platform.name}</span>
  </RxLink>
  <ul class="menu menu-horizontal px-6 space-x-2 hidden xl:flex">
    <GlobalMenu />
  </ul>
  <div class="flex-1" />
  <RxPopup class="btn-square btn-ghost hidden sm:inline-flex mr-2" name="customizeBoxPopup">
    <span slot="button" class="icon-[fluent--wand-16-regular] w-5 h-5" />
    <CustomizeBox />
  </RxPopup>
  {#if $user.isLoggedIn}
    <RxButton ghost>
      <span class="w-6 h-6 icon-[fluent--person-16-regular]" />
      <span>{$user.name}</span>
    </RxButton>
  {:else}
    <RxLink href="/account/login" exactlyMatched>
      <span class="w-6 h-6 icon-[fluent--person-16-regular]" />
      <span>{$_('account.login')}</span>
    </RxLink>
  {/if}
</div>
