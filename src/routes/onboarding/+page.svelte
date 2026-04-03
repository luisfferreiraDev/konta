<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Create your organization — Konta</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Konta</h1>
			<p class="text-gray-500 mt-2">Create your organization to get started</p>
		</div>

		<div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
			{#if form?.error}
				<div class="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						update();
					};
				}}
			>
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1.5">
						Organization name
					</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						autofocus
						placeholder="Acme Ltd."
						class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
				>
					{loading ? 'Creating…' : 'Create organization'}
				</button>
			</form>
		</div>
	</div>
</div>
