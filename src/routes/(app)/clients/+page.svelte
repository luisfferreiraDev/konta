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

<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-gray-900">Clients</h1>
		<a
			href="/clients/new"
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

	{#if data.clients.length === 0}
		<div class="py-16 text-center text-sm text-gray-500">
			{#if data.search}
				No clients match "{data.search}".
			{:else}
				No clients yet. <a href="/clients/new" class="text-blue-600 hover:underline"
					>Add your first client.</a
				>
			{/if}
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
			<table class="w-full text-sm">
				<thead class="border-b border-gray-200 bg-gray-50">
					<tr>
						<th class="px-4 py-3 text-left font-medium text-gray-700">Name</th>
						<th class="hidden px-4 py-3 text-left font-medium text-gray-700 sm:table-cell"
							>Tax ID</th
						>
						<th class="hidden px-4 py-3 text-left font-medium text-gray-700 sm:table-cell">Email</th
						>
						<th class="hidden px-4 py-3 text-left font-medium text-gray-700 sm:table-cell"
							>Country</th
						>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.clients as client}
						<tr class="transition-colors hover:bg-gray-50">
							<td class="px-4 py-3 font-medium text-gray-900">{client.name}</td>
							<td class="hidden px-4 py-3 text-gray-500 sm:table-cell">{client.taxId ?? '—'}</td>
							<td class="hidden px-4 py-3 text-gray-500 sm:table-cell">{client.email ?? '—'}</td>
							<td class="hidden px-4 py-3 text-gray-500 sm:table-cell">{client.country ?? '—'}</td>
							<td class="px-4 py-3">
								<div class="flex items-center justify-end gap-3">
									<a
										href="/clients/{client._id}/edit"
										class="text-blue-600 transition-colors hover:text-blue-800">Edit</a
									>
									<form
										method="POST"
										action="?/deleteClient"
										use:enhance={({ cancel }) => {
											if (!confirm('Delete this client? This cannot be undone.')) cancel();
										}}
									>
										<input type="hidden" name="clientId" value={client._id} />
										<button type="submit" class="text-red-500 transition-colors hover:text-red-700"
											>Delete</button
										>
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
	{/if}
</main>
