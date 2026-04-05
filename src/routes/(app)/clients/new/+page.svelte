<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { routes } from '$lib/routes';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>New Client — Konta</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-8 sm:px-6">
	<div class="mb-6">
		<a href={routes.clients.list()} class="text-sm text-gray-500 transition-colors hover:text-gray-800"
			>← Clients</a
		>
		<h1 class="mt-2 text-2xl font-semibold text-gray-900">New Client</h1>
	</div>

	<div class="rounded-lg border border-gray-200 bg-white p-6">
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
					<label for="name" class="mb-1.5 block text-sm font-medium text-gray-700">
						Name <span class="text-red-500">*</span>
					</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						value={form?.values?.name ?? ''}
						class="w-full border px-3 py-2 {form?.errors?.name
							? 'border-red-300'
							: 'border-gray-300'} rounded-lg text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					{#if form?.errors?.name}
						<p class="mt-1 text-xs text-red-600">{form.errors.name[0]}</p>
					{/if}
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="taxId" class="mb-1.5 block text-sm font-medium text-gray-700">Tax ID</label>
						<input
							id="taxId"
							name="taxId"
							type="text"
							value={form?.values?.taxId ?? ''}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="phone" class="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
						<input
							id="phone"
							name="phone"
							type="tel"
							value={form?.values?.phone ?? ''}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="email" class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						value={form?.values?.email ?? ''}
						class="w-full border px-3 py-2 {form?.errors?.email
							? 'border-red-300'
							: 'border-gray-300'} rounded-lg text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					{#if form?.errors?.email}
						<p class="mt-1 text-xs text-red-600">{form.errors.email[0]}</p>
					{/if}
				</div>

				<div>
					<label for="country" class="mb-1.5 block text-sm font-medium text-gray-700">Country</label
					>
					<input
						id="country"
						name="country"
						type="text"
						value={form?.values?.country ?? ''}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="address" class="mb-1.5 block text-sm font-medium text-gray-700">Address</label
					>
					<textarea
						id="address"
						name="address"
						rows="3"
						class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>{form?.values?.address ?? ''}</textarea
					>
				</div>

				{#if data.org?.customFieldDefs?.client?.length}
					<div class="border-t border-gray-100 pt-4">
						<p class="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
							Custom Fields
						</p>
						<div class="space-y-4">
							{#each data.org.customFieldDefs.client as field}
								<div>
									<label
										for="customFields[{field.key}]"
										class="mb-1.5 block text-sm font-medium text-gray-700">{field.label}</label
									>
									{#if field.type === 'textarea'}
										<textarea
											id="customFields[{field.key}]"
											name="customFields[{field.key}]"
											rows="3"
											class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
											>{form?.values?.[`customFields[${field.key}]`] ?? ''}</textarea
										>
									{:else}
										<input
											id="customFields[{field.key}]"
											name="customFields[{field.key}]"
											type={field.type}
											value={form?.values?.[`customFields[${field.key}]`] ?? ''}
											class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
										/>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<div class="mt-6 flex items-center gap-3">
				<button
					type="submit"
					disabled={loading}
					class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{loading ? 'Saving…' : 'Create Client'}
				</button>
				<a href={routes.clients.list()} class="text-sm text-gray-500 transition-colors hover:text-gray-800"
					>Cancel</a
				>
			</div>
		</form>
	</div>
</main>
