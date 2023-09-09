<script lang="ts">
  import RxButton from './RxButton.svelte'

  let clazz = ''
  export { clazz as class }
  export let hasError = false
  export let disabled = false
  export let type: 'text' | 'password' | 'number' = 'text'
  export let icon: string | undefined = undefined
  export let id: string | undefined = undefined
  export let name: string | undefined = undefined
  export let value: string | number = ''

  let passwordVisible = false

  function togglePasswordVisible() {
    passwordVisible = !passwordVisible
  }

  $: computedType = type == 'password' && passwordVisible ? 'text' : type

  $: classes = ['input', 'backdrop-blur', 'bg-base-content/5', 'min-w-0', hasError && 'input-error', clazz]
    .filter(Boolean)
    .join(' ')

  const handleInput = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    // in here, you can switch on type and implement
    // whatever behaviour you need
    value = type.match(/^(number|range)$/) ? +e.currentTarget.value : e.currentTarget.value
  }
</script>

{#if icon || type == 'password'}
  <div class="input-group">
    {#if icon}
      <span class="bg-base-content/20">
        <div class={`w-5 h-5 ${icon}`} />
      </span>
    {/if}
    <input {id} {name} class={classes} {disabled} type={computedType} {...$$restProps} value on:input={handleInput} />
    {#if type == 'password'}
      <RxButton on:click={togglePasswordVisible}>
        <!-- icon-[fluent--eye-16-regular] and icon-[fluent--eye-off-16-regular] -->
        <div class={`w-5 h-5 icon-[fluent--${passwordVisible ? 'eye' : 'eye-off'}-16-regular]`} />
      </RxButton>
    {/if}
    <slot />
  </div>
{:else}
  <input {id} class={classes} type={computedType} {...$$restProps} />
{/if}
