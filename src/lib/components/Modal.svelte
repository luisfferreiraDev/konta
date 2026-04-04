<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		open?: boolean;
		onclose?: () => void;
		children: Snippet;
	}

	let { open = $bindable(false), onclose = () => {}, children }: Props = $props();

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) hide();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') hide();
	}

	export function show() {
		open = true;
	}

	export function hide() {
		open = false;
		onclose();
	}

	export function toggle() {
		if (open) {
			hide();
		} else {
			show();
		}
	}
</script>

{#if open}
	<div
		transition:fade={{ duration: 150 }}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={handleBackdrop}
		onkeydown={handleKeydown}
	>
		<div
			class="relative w-full max-w-[480px] animate-[scale-in_0.18s_cubic-bezier(0.34,1.56,0.64,1)] rounded-2xl border border-[rgba(255,255,255,0.7)] bg-[rgba(255,255,255,0.82)] p-7 shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),0_8px_24px_-4px_rgba(0,0,0,0.12),0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-[24px] backdrop-saturate-[180%]"
		>
			<button
				class="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-transparent text-gray-400 transition-[background,color] duration-[120ms] ease-linear hover:bg-black/[0.06] hover:text-gray-700"
				onclick={hide}
				aria-label="Close"
			>
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
					<path
						d="M1 1l12 12M13 1L1 13"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
			</button>
			{@render children()}
		</div>
	</div>
{/if}
