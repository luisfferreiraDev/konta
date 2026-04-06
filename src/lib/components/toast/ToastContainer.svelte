<script lang="ts">
	import { toast } from './toast-store.js';
	import Toast from './Toast.svelte';
</script>

<div
	class="pointer-events-none fixed top-4 right-4 z-9999 flex w-full max-w-sm flex-col gap-2"
	aria-label="Notifications"
	aria-live="polite"
>
	{#each $toast as item (item.id)}
		<div class="pointer-events-auto">
			<Toast {...item} ondismiss={() => toast.dismiss(item.id)} />
		</div>
	{/each}
</div>
