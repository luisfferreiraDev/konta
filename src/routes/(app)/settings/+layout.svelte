<script lang="ts">
	import { page } from '$app/state';
	import { routes } from '$lib/routes';
	import Container from '$lib/components/Container.svelte';

	let { children } = $props();

	const tabs = [
		{ label: 'Organization', href: routes.settings.organization() },
		{ label: 'User', href: routes.settings.user() },
		{ label: 'Invoice Design', href: routes.settings.invoiceDesign() }
	];
</script>

<Container>
	<div class="py-6">
		<h1 class="text-xl font-semibold text-primary">Settings</h1>
		<p class="mt-1 text-sm text-secondary">Manage your organization and preferences.</p>
	</div>

	<nav class="mb-8 flex border-b border-white/10" aria-label="Settings navigation">
		{#each tabs as tab}
			<a
				href={tab.href}
				class="border-b-2 px-4 py-2.5 text-sm font-medium transition-colors
				       {page.url.pathname === tab.href
					? 'border-primary-500 text-primary-500'
					: 'border-transparent text-secondary hover:text-primary'}"
			>
				{tab.label}
			</a>
		{/each}
	</nav>

	{@render children()}
</Container>
