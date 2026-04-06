<script module lang="ts">
	// Shared state across all Dropdown instances — only one open at a time
	let activeId = $state<symbol | null>(null);
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { clickOutside } from '$lib/utils';

	interface Props {
		align?: 'left' | 'right';
		width?: string;
		trigger: Snippet;
		children: Snippet;
	}

	let { align = 'right', width = 'auto', trigger, children }: Props = $props();

	const id = Symbol();
	let isOpen = $derived(activeId === id);

	let wrapperEl = $state<HTMLElement | null>(null);
	let flipped = $state(false);

	function open() {
		if (wrapperEl) {
			const rect = wrapperEl.getBoundingClientRect();
			flipped = window.innerHeight - rect.bottom < 260;
		}
		activeId = id;
	}

	function close() {
		if (isOpen) activeId = null;
	}

	function toggle() {
		if (isOpen) close();
		else open();
	}

	// Escape key handling while open
	$effect(() => {
		if (!isOpen) return;

		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') close();
		}

		document.addEventListener('keydown', onKeydown);

		return () => {
			document.removeEventListener('keydown', onKeydown);
		};
	});
</script>

<div
	class="relative inline-flex"
	bind:this={wrapperEl}
	use:clickOutside={{ callback: close, enabled: isOpen }}
>
	<!-- Trigger wrapper -->
	<div onclick={toggle} role="none">
		{@render trigger()}
	</div>

	<!-- Dropdown panel -->
	{#if isOpen}
		<div
			transition:slide
			class="absolute z-50 overflow-hidden rounded-lg bg-surface py-1 shadow-xl"
			class:top-full={!flipped}
			class:mt-4={!flipped}
			class:bottom-full={flipped}
			class:mb-4={flipped}
			class:left-0={align === 'left'}
			class:right-0={align === 'right'}
			style:width
			role="menu"
			tabindex="-1"
		>
			{@render children()}
		</div>
	{/if}
</div>
