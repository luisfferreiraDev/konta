<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Setup — Konta</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Konta</h1>
			<p class="text-gray-500 mt-2">Create your admin account to get started</p>
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
				<div class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
						<input
							id="name"
							name="name"
							type="text"
							autocomplete="name"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
							placeholder="Your name"
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
							placeholder="you@example.com"
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-1.5"
							>Password</label
						>
						<input
							id="password"
							name="password"
							type="password"
							autocomplete="new-password"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
							placeholder="Minimum 8 characters"
						/>
					</div>

					<div>
						<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1.5"
							>Confirm password</label
						>
						<input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							autocomplete="new-password"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
							placeholder="Repeat your password"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
				>
					{loading ? 'Creating account…' : 'Create account'}
				</button>
			</form>
		</div>

		<p class="text-center text-xs text-gray-400 mt-6">
			This page is only available once, before any users exist.
		</p>
	</div>
</div>
