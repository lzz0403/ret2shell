<script lang="ts">
    export let label: string = ''
    export let level: 'info' | 'warning' | 'error' | 'success' = 'info'
    let clazz = ''
    export {clazz as class}

    // maybe you are curious why we use this instead of a simple `bg-${level}`
    // tailwind compiler need the full class name to work properly
    // dynamic constucted class name will not be compiled
    $: tagColor = {
        info: 'bg-info',
        warning: 'bg-warning',
        error: 'bg-error',
        success: 'bg-success',
    }[level]

    $: classes = [
        'rounded-full',
        'h-8',
        'flex',
        'flex-row',
        'items-center',
        'space-x-3',
        'px-3',
        'bg-base-content/5',
        'backdrop-blur',
        clazz,
    ].join(' ')

</script>

<div class={classes}>
    <div class={`rounded-full w-2 h-2 ${tagColor}`}></div>
    <slot>
        <span class="text-base font-medium">{label}</span>
    </slot>
</div>
