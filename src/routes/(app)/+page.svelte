<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard — Konta</title>
</svelte:head>

<main class="mx-auto max-w-5xl px-4 py-12 sm:px-6">
	<h2 class="text-primary">
		Welcome, {data.user.name}
	</h2>
	<p class="text-secondary mt-1">You're signed in as {data.user.email}.</p>
</main>
