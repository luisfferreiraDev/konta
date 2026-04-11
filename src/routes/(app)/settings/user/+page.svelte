<script lang="ts">
	import type { PageData } from './$types';
	import { themeStore } from '$lib/theme-store';
	import { Moon, Sun } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>User Settings — Konta</title>
</svelte:head>

<div class="space-y-8">
	<!-- ── Section: Profile ───────────────────────────────────────────────────── -->
	<section class="rounded-lg glass p-6">
		<h2 class="mb-5 text-base font-semibold text-primary">Profile</h2>

		<div class="flex items-center gap-4">
			<div
				class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-sm font-semibold text-primary-500"
			>
				{data.user?.name?.slice(0, 2).toUpperCase() ?? '??'}
			</div>
			<div>
				<p class="text-sm font-medium text-primary">{data.user?.name}</p>
				<p class="text-xs text-secondary">{data.user?.email}</p>
			</div>
		</div>
	</section>

	<!-- ── Section: Appearance ────────────────────────────────────────────────── -->
	<section class="rounded-lg glass p-6">
		<h2 class="mb-1 text-base font-semibold text-primary">Appearance</h2>
		<p class="mb-5 text-sm text-secondary">Choose your preferred color theme.</p>

		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5"
				>
					{#if $themeStore}
						<Moon size={15} />
					{:else}
						<Sun size={15} />
					{/if}
				</div>
				<div>
					<p class="text-sm font-medium text-primary">{$themeStore ? 'Dark' : 'Light'} mode</p>
					<p class="text-xs text-secondary">
						{$themeStore ? 'Using dark theme' : 'Using light theme'}
					</p>
				</div>
			</div>

			<button
				type="button"
				onclick={() => themeStore.toggle()}
				class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none {$themeStore
					? 'bg-primary-500'
					: 'bg-gray-200'}"
				role="switch"
				aria-checked={$themeStore}
				aria-label="Theme switcher"
			>
				<span
					class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 {$themeStore
						? 'translate-x-5'
						: 'translate-x-0'}"
				></span>
			</button>
		</div>
	</section>
</div>
