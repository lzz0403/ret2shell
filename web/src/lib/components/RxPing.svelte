<script lang="ts">
  export let level: 'info' | 'success' | 'warning' | 'error' | null = null

  // bg-info bg-success bg-warning bg-error
  $: levelClass = `bg-${level}`
</script>

<div class={`absolute w-2 h-2 right-1 top-1 rounded-full ${levelClass}`}>
  <div class={`w-2 h-2 rounded-full animate-ping ${levelClass}`}></div>
</div>
