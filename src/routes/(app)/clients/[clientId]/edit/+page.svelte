<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);

	function fieldValue(name: string, fallback: string) {
		return form?.values?.[name] ?? fallback;
	}

	function customFieldValue(key: string) {
		if (form?.values) return form.values[`customField_${key}`] ?? '';
		return data.client.customFields?.[key] ?? '';
	}
</script>

<svelte:head>
	<title>Edit Client — Konta</title>
</svelte:head>

<main class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
	<div class="mb-6">
		<a href="/clients" class="text-sm text-gray-500 hover:text-gray-800 transition-colors">← Clients</a>
		<h1 class="text-2xl font-semibold text-gray-900 mt-2">Edit Client</h1>
	</div>

	<div class="bg-white border border-gray-200 rounded-lg p-6">
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
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1.5">
						Name <span class="text-red-500">*</span>
					</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						value={fieldValue('name', data.client.name)}
						class="w-full px-3 py-2 border {form?.errors?.name ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
					{#if form?.errors?.name}
						<p class="mt-1 text-xs text-red-600">{form.errors.name[0]}</p>
					{/if}
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="taxId" class="block text-sm font-medium text-gray-700 mb-1.5">Tax ID</label>
						<input
							id="taxId"
							name="taxId"
							type="text"
							value={fieldValue('taxId', data.client.taxId)}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label for="phone" class="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
						<input
							id="phone"
							name="phone"
							type="tel"
							value={fieldValue('phone', data.client.phone)}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						value={fieldValue('email', data.client.email)}
						class="w-full px-3 py-2 border {form?.errors?.email ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
					{#if form?.errors?.email}
						<p class="mt-1 text-xs text-red-600">{form.errors.email[0]}</p>
					{/if}
				</div>

				<div>
					<label for="country" class="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
					<input
						id="country"
						name="country"
						type="text"
						value={fieldValue('country', data.client.country)}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label for="address" class="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
					<textarea
						id="address"
						name="address"
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
					>{fieldValue('address', data.client.address)}</textarea>
				</div>

				{#if data.org?.customFieldDefs?.client?.length}
					<div class="border-t border-gray-100 pt-4">
						<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Custom Fields</p>
						<div class="space-y-4">
							{#each data.org.customFieldDefs.client as field}
								<div>
									<label
										for="customField_{field.key}"
										class="block text-sm font-medium text-gray-700 mb-1.5"
									>{field.label}</label>
									{#if field.type === 'textarea'}
										<textarea
											id="customField_{field.key}"
											name="customField_{field.key}"
											rows="3"
											class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
										>{customFieldValue(field.key)}</textarea>
									{:else}
										<input
											id="customField_{field.key}"
											name="customField_{field.key}"
											type={field.type}
											value={customFieldValue(field.key)}
											class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
					class="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
				>
					{loading ? 'Saving…' : 'Save Changes'}
				</button>
				<a href="/clients" class="text-sm text-gray-500 hover:text-gray-800 transition-colors">Cancel</a>
			</div>
		</form>
	</div>
</main>
