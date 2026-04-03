<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function pageUrl(p: number) {
		const params = new URLSearchParams();
		if (data.search) params.set('search', data.search);
		params.set('page', String(p));
		return `?${params}`;
	}
</script>

<svelte:head>
	<title>Clients — Konta</title>
</svelte:head>

<main class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-semibold text-gray-900">Clients</h1>
		<a
			href="/clients/new"
			class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
		>
			New Client
		</a>
	</div>

	{#if form?.deleteError}
		<div class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
			{form.deleteError}
		</div>
	{/if}

	<form method="GET" class="mb-4">
		<input
			type="text"
			name="search"
			value={data.search}
			placeholder="Search by name or email…"
			class="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
		/>
	</form>

	{#if data.clients.length === 0}
		<div class="text-center py-16 text-gray-500 text-sm">
			{#if data.search}
				No clients match "{data.search}".
			{:else}
				No clients yet. <a href="/clients/new" class="text-blue-600 hover:underline">Add your first client.</a>
			{/if}
		</div>
	{:else}
		<div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
			<table class="w-full text-sm">
				<thead class="bg-gray-50 border-b border-gray-200">
					<tr>
						<th class="text-left px-4 py-3 font-medium text-gray-700">Name</th>
						<th class="text-left px-4 py-3 font-medium text-gray-700 hidden sm:table-cell">Tax ID</th>
						<th class="text-left px-4 py-3 font-medium text-gray-700 hidden sm:table-cell">Email</th>
						<th class="text-left px-4 py-3 font-medium text-gray-700 hidden sm:table-cell">Country</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.clients as client}
						<tr class="hover:bg-gray-50 transition-colors">
							<td class="px-4 py-3 font-medium text-gray-900">{client.name}</td>
							<td class="px-4 py-3 text-gray-500 hidden sm:table-cell">{client.taxId ?? '—'}</td>
							<td class="px-4 py-3 text-gray-500 hidden sm:table-cell">{client.email ?? '—'}</td>
							<td class="px-4 py-3 text-gray-500 hidden sm:table-cell">{client.country ?? '—'}</td>
							<td class="px-4 py-3">
								<div class="flex items-center justify-end gap-3">
									<a
										href="/clients/{client._id}/edit"
										class="text-blue-600 hover:text-blue-800 transition-colors"
									>Edit</a>
									<form
										method="POST"
										action="?/deleteClient"
										use:enhance={({ cancel }) => {
											if (!confirm('Delete this client? This cannot be undone.')) cancel();
										}}
									>
										<input type="hidden" name="clientId" value={client._id} />
										<button
											type="submit"
											class="text-red-500 hover:text-red-700 transition-colors"
										>Delete</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if data.totalPages > 1}
			<div class="mt-4 flex items-center justify-between text-sm text-gray-500">
				<span>
					Showing {(data.page - 1) * 20 + 1}–{Math.min(data.page * 20, data.total)} of {data.total}
				</span>
				<div class="flex gap-2">
					{#if data.page > 1}
						<a
							href={pageUrl(data.page - 1)}
							class="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
						>Previous</a>
					{/if}
					{#if data.page < data.totalPages}
						<a
							href={pageUrl(data.page + 1)}
							class="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
						>Next</a>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</main>
