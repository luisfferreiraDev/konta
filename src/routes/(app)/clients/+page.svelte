<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/DataTable.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import type { PageData, ActionData } from './$types';
	import { routes } from '$lib/routes';
	import Container from '$lib/components/Container.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import { UserPlus } from '@lucide/svelte';

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

<Container>
	<PageHeader title="Clients" subtitle="Manage your clients and track their information">
		<div class="flex gap-2">
			<Button variant="primary" href={routes.clients.new()}
				><UserPlus size={14} /> New Client</Button
			>
		</div>
	</PageHeader>

	<div class="mb-6 rounded-lg glass shadow">
		<form method="GET" class="p-4">
			<div>
				<label for="search" class="block text-sm font-medium text-primary">Search</label>
				<input
					type="text"
					id="search"
					name="search"
					value={data.search}
					placeholder="Search..."
					class="mt-1 block w-full rounded-md text-secondary shadow-sm outline-primary-500 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
				/>
			</div>
		</form>
	</div>

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
</Container>
