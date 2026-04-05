<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/DataTable.svelte';
	import type { PageData } from './$types';
	import { routes } from '$lib/routes';

	let { data }: { data: PageData } = $props();

	function updateFilters() {
		const form = document.querySelector('form[data-filter-form]') as HTMLFormElement;
		if (form) form.submit();
	}

	let deleteInvoiceId = $state('');
	let showDeleteModal = $state(false);

	function confirmDelete(row: Record<string, unknown>) {
		deleteInvoiceId = String(row._id);
		showDeleteModal = true;
	}

	const STATUS_BADGE_MAP: Record<string, string> = {
		draft: 'gray',
		scheduled: 'blue',
		sent: 'blue',
		paid: 'green',
		overdue: 'red',
		cancelled: 'gray'
	};

	const columns = [
		{ key: 'number', label: 'Number', type: 'text' as const },
		{ key: 'clientName', label: 'Client', type: 'text' as const },
		{ key: 'status', label: 'Status', type: 'badge' as const, badgeMap: STATUS_BADGE_MAP },
		{ key: 'issueDate', label: 'Issue Date', type: 'date' as const },
		{ key: 'dueDate', label: 'Due Date', type: 'date' as const },
		{ key: 'amount', label: 'Amount', type: 'text' as const, align: 'right' as const },
		{
			key: '_actions',
			label: '',
			type: 'actions' as const,
			actions: [
				{
					label: 'View',
					onClick: (row: Record<string, unknown>) => goto(routes.invoices.view(String(row._id)))
				},
				{
					label: 'Edit',
					show: (row: Record<string, unknown>) =>
						row.status === 'draft' || row.status === 'scheduled',
					onClick: (row: Record<string, unknown>) => goto(routes.invoices.edit(String(row._id)))
				},
				{
					label: 'Download PDF',
					onClick: (row: Record<string, unknown>) =>
						window.open(routes.api.invoicePdf(String(row._id)), '_blank')
				},
				{
					label: 'Delete',
					variant: 'danger' as const,
					show: (row: Record<string, unknown>) =>
						row.status === 'draft' || row.status === 'cancelled',
					onClick: confirmDelete
				}
			]
		}
	];

	const rows = $derived(
		data.invoices.map((inv) => ({
			...inv,
			clientName: inv.client?.name ?? 'N/A',
			amount: new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: inv.currency
			}).format(inv.totalAmount)
		})) as Record<string, unknown>[]
	);

	function pageUrl(page: number) {
		const params = new URLSearchParams();
		if (data.filters.status) params.set('status', data.filters.status);
		if (data.filters.clientId) params.set('clientId', data.filters.clientId);
		if (data.filters.search) params.set('search', data.filters.search);
		params.set('page', String(page));
		return `?${params}`;
	}
</script>

<svelte:head>
	<title>Invoices - Konta</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6 sm:flex sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-semibold text-gray-900">Invoices</h1>
			<p class="mt-1 text-sm text-gray-500">Manage your invoices and track payments</p>
		</div>
		<div class="mt-4 sm:mt-0">
			<a
				href={routes.invoices.new()}
				class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
			>
				New Invoice
			</a>
		</div>
	</div>

	<!-- Filters -->
	<div class="mb-6 rounded-lg bg-white shadow">
		<form method="get" data-filter-form class="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
			<div>
				<label for="status" class="block text-sm font-medium text-gray-700">Status</label>
				<select
					id="status"
					name="status"
					value={data.filters.status}
					onchange={updateFilters}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				>
					<option value="">All statuses</option>
					<option value="draft">Draft</option>
					<option value="scheduled">Scheduled</option>
					<option value="sent">Sent</option>
					<option value="paid">Paid</option>
					<option value="overdue">Overdue</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</div>

			<div>
				<label for="clientId" class="block text-sm font-medium text-gray-700">Client</label>
				<select
					id="clientId"
					name="clientId"
					value={data.filters.clientId}
					onchange={updateFilters}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				>
					<option value="">All clients</option>
					{#each data.clients as client (client._id)}
						<option value={client._id}>{client.name}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="search" class="block text-sm font-medium text-gray-700">Invoice Number</label>
				<input
					type="text"
					id="search"
					name="search"
					value={data.filters.search}
					placeholder="Search..."
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				/>
			</div>
		</form>
	</div>

	<DataTable
		{columns}
		data={rows}
		onRowClick={(row) => goto(routes.invoices.view(String(row._id)))}
		emptyState={{
			title: 'No invoices',
			description: 'Get started by creating your first invoice.'
		}}
	/>

	{#if data.totalPages > 1}
		<div class="mt-6 flex items-center justify-between">
			<div class="text-sm text-gray-700">
				Showing page {data.page} of {data.totalPages} ({data.total} total)
			</div>
			<div class="flex gap-2">
				{#if data.page > 1}
					<a
						href={pageUrl(data.page - 1)}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Previous
					</a>
				{/if}
				{#if data.page < data.totalPages}
					<a
						href={pageUrl(data.page + 1)}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Next
					</a>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Delete Modal -->
{#if showDeleteModal}
	<div class="fixed inset-0 z-10 overflow-y-auto">
		<div
			class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
		>
			<div class="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"></div>

			<div
				class="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
			>
				<div class="sm:flex sm:items-start">
					<div
						class="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
					>
						<svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
						<h3 class="text-lg leading-6 font-medium text-gray-900">Delete Invoice</h3>
						<div class="mt-2">
							<p class="text-sm text-gray-500">
								Are you sure you want to delete this invoice? This action cannot be undone.
							</p>
						</div>
					</div>
				</div>
				<div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
					<form method="post" action="?/deleteInvoice" class="w-full sm:w-auto">
						<input type="hidden" name="invoiceId" value={deleteInvoiceId} />
						<button
							type="submit"
							class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
							onclick={() => (showDeleteModal = false)}
						>
							Delete
						</button>
					</form>
					<button
						type="button"
						onclick={() => (showDeleteModal = false)}
						class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
