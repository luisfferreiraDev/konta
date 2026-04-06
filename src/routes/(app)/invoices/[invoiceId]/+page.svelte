<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { routes } from '$lib/routes';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	const statusColors = {
		draft: 'bg-gray-100 text-gray-800',
		scheduled: 'bg-blue-100 text-blue-800',
		sent: 'bg-blue-100 text-blue-800',
		paid: 'bg-green-100 text-green-800',
		overdue: 'bg-red-100 text-red-800',
		cancelled: 'bg-gray-100 text-gray-500'
	};

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatCurrency(amount: number, currency: string) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency
		}).format(amount);
	}

	let showDeleteModal = $state(false);
</script>

<svelte:head>
	<title>Invoice {data.invoice.number} - Konta</title>
</svelte:head>

<div class="mx-auto px-4 py-8 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="mb-6">
		<div class="flex items-center justify-between">
			<div>
				<div class="flex items-center gap-3">
					<h1 class="text-2xl font-semibold text-primary">{data.invoice.number}</h1>
					<span
						class="inline-flex rounded-full px-3 py-1 text-sm font-semibold {statusColors[
							data.invoice.status
						]}"
					>
						{data.invoice.status}
					</span>
				</div>
				<div class="mt-1 space-y-1 text-sm text-secondary">
					<p>
						Issued {formatDate(data.invoice.issueDate)} • Due {formatDate(data.invoice.dueDate)}
					</p>
					{#if data.invoice.sentDate}
						<p>Sent {formatDate(data.invoice.sentDate)}</p>
					{/if}
					{#if data.invoice.paidAt}
						<p class="font-medium text-green-600">Paid {formatDate(data.invoice.paidAt)}</p>
					{/if}
				</div>
			</div>
			<a
				href={routes.invoices.list()}
				class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
			>
				Back to Invoices
			</a>
		</div>
	</div>

	{#if form?.error}
		<div class="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
			<p class="text-sm text-red-800">{form.error}</p>
		</div>
	{/if}

	{#if form?.success}
		<div class="mb-6 rounded-md border border-green-200 bg-green-50 p-4">
			<p class="text-sm text-green-800">Status updated successfully!</p>
		</div>
	{/if}

	<!-- Invoice Details -->
	<div class="mb-6 rounded-lg glass p-8 shadow">
		<!-- Client Info -->
		<div class="mb-8">
			<h2 class="mb-2 text-sm font-medium tracking-wide text-secondary uppercase">Bill To</h2>
			{#if data.client}
				<div class="text-sm">
					<p class="font-semibold text-primary">{data.client.name}</p>
					{#if data.client.address}
						<p class="text-secondary">{data.client.address}</p>
					{/if}
					{#if data.client.country}
						<p class="text-secondary">{data.client.country}</p>
					{/if}
					{#if data.client.taxId}
						<p class="text-secondary">Tax ID: {data.client.taxId}</p>
					{/if}
					{#if data.client.email}
						<p class="text-secondary">{data.client.email}</p>
					{/if}
				</div>
			{:else}
				<p class="text-sm text-secondary">No client information available</p>
			{/if}
		</div>

		<!-- Line Items -->
		<div class="mb-8">
			<table class="min-w-full divide-y divide-gray-200">
				<thead>
					<tr>
						<th
							class="px-0 py-3 text-left text-xs font-medium tracking-wider text-secondary uppercase"
						>
							Description
						</th>
						<th
							class="px-3 py-3 text-right text-xs font-medium tracking-wider text-secondary uppercase"
						>
							Qty
						</th>
						<th
							class="px-3 py-3 text-right text-xs font-medium tracking-wider text-secondary uppercase"
						>
							Unit Price
						</th>
						<th
							class="px-3 py-3 text-right text-xs font-medium tracking-wider text-secondary uppercase"
						>
							Tax Rate
						</th>
						<th
							class="px-0 py-3 text-right text-xs font-medium tracking-wider text-secondary uppercase"
						>
							Total
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each data.invoice.lineItems as item (item.description)}
						<tr>
							<td class="px-0 py-4 text-sm text-primary">{item.description}</td>
							<td class="px-3 py-4 text-right text-sm text-secondary">{item.qty}</td>
							<td class="px-3 py-4 text-right text-sm text-secondary">
								{formatCurrency(item.unitPrice, data.invoice.currency)}
							</td>
							<td class="px-3 py-4 text-right text-sm text-secondary">
								{((item.taxRate ?? data.invoice.taxRate) * 100).toFixed(2)}%
							</td>
							<td class="px-0 py-4 text-right text-sm font-medium text-primary">
								{formatCurrency(item.total || 0, data.invoice.currency)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Totals -->
		<div class="border-t pt-6">
			<div class="ml-auto max-w-xs space-y-2">
				<div class="flex justify-between text-sm">
					<span class="text-secondary">Subtotal:</span>
					<span class="font-medium"
						>{formatCurrency(data.invoice.subtotal, data.invoice.currency)}</span
					>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-secondary">Tax:</span>
					<span class="font-medium"
						>{formatCurrency(data.invoice.taxAmount, data.invoice.currency)}</span
					>
				</div>
				<div class="flex justify-between border-t pt-2 text-lg font-semibold">
					<span class="text-secondary">Total:</span>
					<span class="font-medium"
						>{formatCurrency(data.invoice.totalAmount, data.invoice.currency)}</span
					>
				</div>
			</div>
		</div>

		<!-- Custom Fields -->
		{#if Object.keys(data.invoice.customFields).length > 0}
			<div class="mt-8 border-t pt-6">
				<h3 class="mb-3 text-sm font-medium text-secondary">Additional Information</h3>
				<dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each Object.entries(data.invoice.customFields) as [key, value] (key)}
						<div>
							<dt class="text-sm font-medium text-secondary capitalize">{key}</dt>
							<dd class="mt-1 text-sm text-secondary">{value}</dd>
						</div>
					{/each}
				</dl>
			</div>
		{/if}

		<!-- Payment Info -->
		{#if data.invoice.paymentMethod}
			<div class="mt-8 border-t pt-6">
				<h3 class="mb-3 text-sm font-medium text-secondary">Payment Information</h3>
				<dl class="space-y-2">
					<div>
						<dt class="text-sm font-medium text-secondary">Payment Method</dt>
						<dd class="mt-1 text-sm text-secondary">{data.invoice.paymentMethod}</dd>
					</div>
				</dl>
			</div>
		{/if}
	</div>

	<!-- Actions -->
	<div class="flex items-center justify-between">
		<div class="flex gap-3">
			<a
				href={routes.api.invoicePdf(data.invoice._id)}
				target="_blank"
				class="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				Download PDF
			</a>
			<a
				href={routes.api.invoicePreview(data.invoice._id)}
				target="_blank"
				class="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
					/>
				</svg>
				Preview
			</a>
			{#if data.invoice.status === 'draft'}
				<a
					href={routes.invoices.edit(data.invoice._id)}
					class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Edit
				</a>
				<form method="post" action="?/updateStatus" use:enhance>
					<input type="hidden" name="status" value="sent" />
					<button
						type="submit"
						class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
					>
						Mark as Sent
					</button>
				</form>
			{/if}

			{#if data.invoice.status === 'sent' || data.invoice.status === 'overdue'}
				<form method="post" action="?/updateStatus" use:enhance>
					<input type="hidden" name="status" value="paid" />
					<button
						type="submit"
						class="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
					>
						Mark as Paid
					</button>
				</form>
			{/if}

			{#if data.invoice.status === 'scheduled'}
				<a
					href={routes.invoices.edit(data.invoice._id)}
					class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Edit
				</a>
			{/if}
		</div>

		{#if data.invoice.status === 'draft' || data.invoice.status === 'cancelled'}
			<button
				type="button"
				onclick={() => (showDeleteModal = true)}
				class="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
			>
				Delete Invoice
			</button>
		{/if}
	</div>
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
								Are you sure you want to delete invoice {data.invoice.number}? This action cannot be
								undone.
							</p>
						</div>
					</div>
				</div>
				<div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
					<form method="post" action="?/delete" use:enhance class="w-full sm:w-auto">
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
