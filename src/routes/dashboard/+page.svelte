<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard — Konta</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b border-gray-200">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
			<span class="font-bold text-gray-900">Konta</span>

			<form method="POST" action="?/logout" use:enhance>
				<button
					type="submit"
					class="text-sm text-gray-500 hover:text-gray-800 transition-colors"
				>
					Sign out
				</button>
			</form>
		</div>
	</header>

	<main class="max-w-5xl mx-auto px-4 sm:px-6 py-12">
		<h2 class="text-2xl font-semibold text-gray-900">
			Welcome, {data.user.name}
		</h2>
		<p class="text-gray-500 mt-1">You're signed in as {data.user.email}.</p>
	</main>
</div>
