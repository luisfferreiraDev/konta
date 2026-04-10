<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { routes } from '$lib/routes';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/components/toast/toast-store';
	import { goto } from '$app/navigation';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	interface LineItem {
		description: string;
		qty: number;
		unitPrice: number;
		taxRate: number | null;
	}

	let lineItems: LineItem[] = $state([{ description: '', qty: 1, unitPrice: 0, taxRate: null }]);

	let clientId = $state('');
	let issueDate = $state(new Date().toISOString().split('T')[0]);
	let dueDate = $state(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 30 days from now
	let currency = $state(data.org.currency);
	let taxRate = $state(0); // Default to 0% tax rate

	function addLineItem() {
		lineItems = [...lineItems, { description: '', qty: 1, unitPrice: 0, taxRate: null }];
	}

	function removeLineItem(index: number) {
		if (lineItems.length > 1) {
			lineItems = lineItems.filter((_, i) => i !== index);
		}
	}

	function calculateLineTotal(item: LineItem): number {
		return item.qty * item.unitPrice;
	}

	function calculateLineTax(item: LineItem): number {
		const lineTotal = calculateLineTotal(item);
		const effectiveTaxRate =
			item.taxRate !== null && !isNaN(item.taxRate)
				? item.taxRate / 100
				: taxRate && !isNaN(taxRate)
					? taxRate / 100
					: 0;
		return lineTotal * effectiveTaxRate;
	}

	let subtotal = $derived(lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0));
	let totalTax = $derived(lineItems.reduce((sum, item) => sum + calculateLineTax(item), 0));
	let total = $derived(subtotal + totalTax);

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency
		}).format(amount);
	}
</script>

<svelte:head>
	<title>New Invoice - Konta</title>
</svelte:head>

<div class="py-8">
	<div class="mb-6">
		<h1 class="text-2xl font-semibold text-gray-900">Create Invoice</h1>
		<p class="mt-1 text-sm text-gray-500">Fill in the details to create a new invoice</p>
	</div>

	{#if form?.errors?._form}
		<div class="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
			<p class="text-sm text-red-800">{form.errors._form[0]}</p>
		</div>
	{/if}

	<form
		method="post"
		class="space-y-6"
		use:enhance={() => {
			return ({ result }) => {
				if (result.status === 303) {
					toast.success('Invoice saved successfully');
					goto(routes.invoices.list());
				} else {
					toast.error('Failed to save invoice');
				}
			};
		}}
	>
		<div class="space-y-6 rounded-lg bg-white p-6 shadow">
			<!-- Basic Info -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<label for="clientId" class="block text-sm font-medium text-gray-700">
						Client <span class="text-red-500">*</span>
					</label>
					<select
						id="clientId"
						name="clientId"
						bind:value={clientId}
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						class:border-red-300={form?.errors?.clientId}
					>
						<option value="">Select a client</option>
						{#each data.clients as client (client._id)}
							<option value={client._id}>{client.name}</option>
						{/each}
					</select>
					{#if form?.errors?.clientId}
						<p class="mt-1 text-sm text-red-600">{form.errors.clientId[0]}</p>
					{/if}
				</div>

				<div>
					<label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
					<input
						type="text"
						id="currency"
						name="currency"
						bind:value={currency}
						maxlength="3"
						class="mt-1 block w-full rounded-md border-gray-300 uppercase shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div>
					<label for="issueDate" class="block text-sm font-medium text-gray-700">
						Issue Date <span class="text-red-500">*</span>
					</label>
					<input
						type="date"
						id="issueDate"
						name="issueDate"
						bind:value={issueDate}
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						class:border-red-300={form?.errors?.issueDate}
					/>
					{#if form?.errors?.issueDate}
						<p class="mt-1 text-sm text-red-600">{form.errors.issueDate[0]}</p>
					{/if}
				</div>

				<div>
					<label for="dueDate" class="block text-sm font-medium text-gray-700">
						Due Date <span class="text-red-500">*</span>
					</label>
					<input
						type="date"
						id="dueDate"
						name="dueDate"
						bind:value={dueDate}
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						class:border-red-300={form?.errors?.dueDate}
					/>
					{#if form?.errors?.dueDate}
						<p class="mt-1 text-sm text-red-600">{form.errors.dueDate[0]}</p>
					{/if}
				</div>

				<div>
					<label for="taxRate" class="block text-sm font-medium text-gray-700"
						>Default Tax Rate (%) <span class="text-xs text-gray-500">blank = 0%</span></label
					>
					<input
						type="number"
						id="taxRate"
						name="taxRate"
						bind:value={taxRate}
						min="0"
						max="100"
						step="0.01"
						placeholder="0"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
					/>
				</div>
			</div>

			<!-- Line Items -->
			<div>
				<div class="mb-3 flex items-center justify-between">
					<h3 class="text-lg font-medium text-gray-900">Line Items</h3>
					<button
						type="button"
						onclick={addLineItem}
						class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
					>
						Add Line Item
					</button>
				</div>

				<div class="space-y-3">
					{#each lineItems as item, index (index)}
						<div class="rounded-md border border-gray-200 bg-gray-50 p-4">
							<div class="grid grid-cols-12 gap-3">
								<div class="col-span-12 md:col-span-5">
									<label for="desc-{index}" class="block text-sm font-medium text-gray-700"
										>Description</label
									>
									<input
										type="text"
										id="desc-{index}"
										name="lineItems[{index}][description]"
										bind:value={item.description}
										required
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									/>
								</div>

								<div class="col-span-4 md:col-span-2">
									<label for="qty-{index}" class="block text-sm font-medium text-gray-700"
										>Qty</label
									>
									<input
										type="number"
										id="qty-{index}"
										name="lineItems[{index}][qty]"
										bind:value={item.qty}
										min="1"
										step="1"
										required
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									/>
								</div>

								<div class="col-span-4 md:col-span-2">
									<label for="price-{index}" class="block text-sm font-medium text-gray-700"
										>Unit Price</label
									>
									<input
										type="number"
										id="price-{index}"
										name="lineItems[{index}][unitPrice]"
										bind:value={item.unitPrice}
										min="0"
										step="0.01"
										required
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									/>
								</div>

								<div class="col-span-4 md:col-span-2">
									<label for="tax-{index}" class="block text-sm font-medium text-gray-700"
										>Tax % (opt)</label
									>
									<input
										type="number"
										id="tax-{index}"
										name="lineItems[{index}][taxRate]"
										bind:value={item.taxRate}
										min="0"
										max="100"
										step="0.01"
										placeholder="Use default"
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									/>
								</div>

								<div class="col-span-12 flex items-end md:col-span-1">
									<button
										type="button"
										onclick={() => removeLineItem(index)}
										disabled={lineItems.length === 1}
										class="w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
									>
										Remove
									</button>
								</div>
							</div>

							<div class="mt-2 text-sm text-gray-600">
								Line total: {formatCurrency(calculateLineTotal(item) + calculateLineTax(item))}
								<span class="text-gray-400">
									({formatCurrency(calculateLineTotal(item))} + {formatCurrency(
										calculateLineTax(item)
									)} tax)
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Custom Fields -->
			{#if data.org.customFieldDefs.length > 0}
				<div>
					<h3 class="mb-3 text-lg font-medium text-gray-900">Custom Fields</h3>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each data.org.customFieldDefs as fieldDef (fieldDef.key)}
							<div>
								<label for="custom-{fieldDef.key}" class="block text-sm font-medium text-gray-700">
									{fieldDef.label}
								</label>
								{#if fieldDef.type === 'text'}
									<input
										type="text"
										id="custom-{fieldDef.key}"
										name="customFields[{fieldDef.key}]"
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									/>
								{:else if fieldDef.type === 'number'}
									<input
										type="number"
										id="custom-{fieldDef.key}"
										name="customFields[{fieldDef.key}]"
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									/>
								{:else if fieldDef.type === 'date'}
									<input
										type="date"
										id="custom-{fieldDef.key}"
										name="customFields[{fieldDef.key}]"
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									/>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Totals Summary -->
			<div class="border-t pt-6">
				<div class="ml-auto max-w-xs space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-gray-600">Subtotal:</span>
						<span class="font-medium">{formatCurrency(subtotal)}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-gray-600">Tax:</span>
						<span class="font-medium">{formatCurrency(totalTax)}</span>
					</div>
					<div class="flex justify-between border-t pt-2 text-lg font-semibold">
						<span>Total:</span>
						<span>{formatCurrency(total)}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex items-center justify-end gap-3">
			<a
				href={routes.invoices.list()}
				class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
			>
				Cancel
			</a>
			<button
				type="submit"
				class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
			>
				Create Invoice
			</button>
		</div>
	</form>
</div>
