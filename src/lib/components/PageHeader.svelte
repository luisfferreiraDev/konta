<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ArrowLeft, ChevronRight } from '@lucide/svelte';

	interface Breadcrumb {
		label: string;
		href?: string;
	}

	interface Props {
		title: string;
		subtitle?: string;
		breadcrumbs?: Breadcrumb[];
		backHref?: string;
		children?: Snippet;
	}

	let { title, subtitle, breadcrumbs, backHref, children }: Props = $props();
</script>

<header class="flex items-center justify-between gap-6 py-4">
	<!-- Left: back button + title block -->
	<div class="flex min-w-0 items-center gap-3">
		{#if backHref}
			<a
				href={backHref}
				aria-label="Go back"
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-secondary transition-colors duration-150 hover:bg-white/10 hover:text-primary"
			>
				<ArrowLeft size={15} />
			</a>
		{/if}

		<div class="min-w-0">
			{#if breadcrumbs && breadcrumbs.length > 0}
				<nav class="mb-0.5 flex items-center gap-1" aria-label="Breadcrumb">
					{#each breadcrumbs as crumb, i (crumb.label + '-' + i)}
						{#if i > 0}
							<ChevronRight size={11} class="shrink-0 text-muted" />
						{/if}
						{#if crumb.href}
							<a
								href={crumb.href}
								class="max-w-40 truncate text-xs text-secondary transition-colors hover:text-primary"
							>
								{crumb.label}
							</a>
						{:else}
							<span class="max-w-40 truncate text-xs text-muted">
								{crumb.label}
							</span>
						{/if}
					{/each}
				</nav>
			{/if}

			<h1 class="truncate text-lg leading-tight font-semibold text-primary">
				{title}
			</h1>

			{#if subtitle}
				<p class="mt-0.5 truncate text-sm text-secondary">{subtitle}</p>
			{/if}
		</div>
	</div>

	<!-- Right: action slot -->
	{#if children}
		<div class="flex shrink-0 items-center gap-2">
			{@render children()}
		</div>
	{/if}
</header>
