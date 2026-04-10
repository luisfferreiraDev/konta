<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/DataTable.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import type { PageData, ActionData } from './$types';
	import { routes } from '$lib/routes';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let deleteForm: HTMLFormElement;
	let deleteClientId = $state('');

	function pageUrl(p: number) {
		const params = new URLSearchParams();
		if (data.search) params.set('search', data.search);
		params.set('page', String(p));
		return `?${params}`;
	}

	function deleteClient(row: Record<string, unknown>) {
		deleteClientId = String(row._id);
		deleteModal?.toggle();
	}

	const columns = [
		{ key: 'name', label: 'Name', type: 'text' as const },
		{ key: 'taxId', label: 'Tax ID', type: 'text' as const },
		{ key: 'email', label: 'Email', type: 'text' as const },
		{ key: 'country', label: 'Country', type: 'text' as const },
		{
			key: '_actions',
			label: '',
			type: 'actions' as const,
			actions: [
				{
					label: 'Edit',
					onClick: (row: Record<string, unknown>) => goto(routes.clients.edit(String(row._id)))
				},
				{
					label: 'Delete',
					variant: 'danger' as const,
					onClick: deleteClient
				}
			]
		}
	];

	let deleteModal = $state<Modal | null>(null);
</script>

<svelte:head>
	<title>Clients — Konta</title>
</svelte:head>

<Modal bind:this={deleteModal} onclose={() => (deleteClientId = '')}>
	<h2>Delete Client</h2>
	<p>Are you sure you want to delete this client? This action cannot be undone.</p>
	<button
		onclick={() => {
			deleteForm.requestSubmit();
			deleteModal?.hide();
		}}>Delete</button
	>
</Modal>

<form method="POST" action="?/deleteClient" bind:this={deleteForm} use:enhance class="hidden">
	<input type="hidden" name="clientId" bind:value={deleteClientId} />
</form>

<main class="py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-gray-900">Clients</h1>
		<a
			href={routes.clients.new()}
			class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
		>
			New Client
		</a>
	</div>

	{#if form?.deleteError}
		<div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			{form.deleteError}
		</div>
	{/if}

	<form method="GET" class="mb-4">
		<input
			type="text"
			name="search"
			value={data.search}
			placeholder="Search by name or email…"
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-72"
		/>
	</form>

	<DataTable
		{columns}
		data={data.clients as Record<string, unknown>[]}
		onRowClick={(row) => goto(routes.clients.edit(String(row._id)))}
		emptyState={data.search
			? { title: `No clients match "${data.search}".` }
			: { title: 'No clients yet.', description: 'Add your first client to get started.' }}
	/>

	{#if data.totalPages > 1}
		<div class="mt-4 flex items-center justify-between text-sm text-gray-500">
			<span>
				Showing {(data.page - 1) * 20 + 1}–{Math.min(data.page * 20, data.total)} of {data.total}
			</span>
			<div class="flex gap-2">
				{#if data.page > 1}
					<a
						href={pageUrl(data.page - 1)}
						class="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 transition-colors hover:bg-gray-50"
						>Previous</a
					>
				{/if}
				{#if data.page < data.totalPages}
					<a
						href={pageUrl(data.page + 1)}
						class="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 transition-colors hover:bg-gray-50"
						>Next</a
					>
				{/if}
			</div>
		</div>
	{/if}
</main>
