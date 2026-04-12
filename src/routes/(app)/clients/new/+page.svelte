<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { routes } from '$lib/routes';
	import Container from '$lib/components/Container.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Button from '$lib/components/Button.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>New Client — Konta</title>
</svelte:head>

<Container>
	<PageHeader title="New Client" backHref={routes.clients.list()} />

	<div class="rounded-lg glass p-6">
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
					<label for="name" class="mb-1.5 block text-sm font-medium text-primary">
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
						<label for="taxId" class="mb-1.5 block text-sm font-medium text-primary">Tax ID</label>
						<input
							id="taxId"
							name="taxId"
							type="text"
							value={form?.values?.taxId ?? ''}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="phone" class="mb-1.5 block text-sm font-medium text-primary">Phone</label>
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
					<label for="email" class="mb-1.5 block text-sm font-medium text-primary">Email</label>
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
					<label for="country" class="mb-1.5 block text-sm font-medium text-primary">Country</label>
					<input
						id="country"
						name="country"
						type="text"
						value={form?.values?.country ?? ''}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="address" class="mb-1.5 block text-sm font-medium text-primary">Address</label>
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
						<p class="mb-3 text-xs font-semibold tracking-wide text-secondary uppercase">
							Custom Fields
						</p>
						<div class="space-y-4">
							{#each data.org.customFieldDefs.client as field}
								<div>
									<label
										for="customFields[{field.key}]"
										class="mb-1.5 block text-sm font-medium text-primary">{field.label}</label
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
				<Button type="submit" disabled={loading}>
					{loading ? 'Saving…' : 'Create Client'}
				</Button>
				<Button variant="secondary" href={routes.clients.list()}>Cancel</Button>
			</div>
		</form>
	</div>
</Container>
