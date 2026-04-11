<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { routes } from '$lib/routes';
	import Container from '$lib/components/Container.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Button from '$lib/components/Button.svelte';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	interface LineItem {
		description: string;
		qty: number;
		unitPrice: number;
		taxRate: number | null;
	}

	let lineItems = $state<LineItem[]>(
		data.invoice.lineItems.map((item) => ({
			description: item.description,
			qty: item.qty,
			unitPrice: item.unitPrice,
			taxRate: item.taxRate
		}))
	);

	let clientId = $state(data.invoice.clientId);
	let issueDate = $state(data.invoice.issueDate);
	let dueDate = $state(data.invoice.dueDate);
	let currency = $state(data.invoice.currency);
	let taxRate = $state(data.invoice.taxRate);

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
	<title>Edit Invoice - Konta</title>
</svelte:head>

<Container>
	<PageHeader title="Edit Invoice" subtitle="Update invoice details"></PageHeader>
	<form method="post" class="space-y-6">
		<div class="space-y-6 rounded-lg glass p-6 shadow">
			<!-- Basic Info -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<label for="clientId" class="block text-sm font-medium text-primary">
						Client <span class="text-red-500">*</span>
					</label>
					<select
						id="clientId"
						name="clientId"
						bind:value={clientId}
						required
						class=" cursor-pointer text-secondary"
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
					<label for="currency" class="block text-sm font-medium text-primary">Currency</label>
					<input
						type="text"
						id="currency"
						name="currency"
						bind:value={currency}
						maxlength="3"
						class=" cursor-pointer text-secondary"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div>
					<label for="issueDate" class="block text-sm font-medium text-primary">
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
					<label for="dueDate" class="block text-sm font-medium text-primary">
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
					<label for="taxRate" class="block text-sm font-medium text-primary"
						>Default Tax Rate (%) <span class="text-xs text-secondary">blank = 0%</span></label
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
					<h3 class="text-lg font-medium text-primary">Line Items</h3>
					<Button onclick={addLineItem}>Add Line Item</Button>
				</div>

				<div class="space-y-3">
					{#each lineItems as item, index (index)}
						<div class="rounded-md border glass p-4">
							<div class="grid grid-cols-12 gap-3">
								<div class="col-span-12 md:col-span-5">
									<label for="desc-{index}" class="block text-sm font-medium text-primary"
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
									<label for="qty-{index}" class="block text-sm font-medium text-primary">Qty</label
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
									<label for="price-{index}" class="block text-sm font-medium text-primary"
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
									<label for="tax-{index}" class="block text-sm font-medium text-primary"
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

							<div class="mt-2 text-sm text-secondary">
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
					<h3 class="mb-3 text-lg font-medium text-primary">Custom Fields</h3>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each data.org.customFieldDefs as fieldDef (fieldDef.key)}
							<div>
								<label for="custom-{fieldDef.key}" class="block text-sm font-medium text-primary">
									{fieldDef.label}
								</label>
								{#if fieldDef.type === 'text'}
									<input
										type="text"
										id="custom-{fieldDef.key}"
										name="customFields[{fieldDef.key}]"
										value={data.invoice.customFields[fieldDef.key] || ''}
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									/>
								{:else if fieldDef.type === 'number'}
									<input
										type="number"
										id="custom-{fieldDef.key}"
										name="customFields[{fieldDef.key}]"
										value={data.invoice.customFields[fieldDef.key] || ''}
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									/>
								{:else if fieldDef.type === 'date'}
									<input
										type="date"
										id="custom-{fieldDef.key}"
										name="customFields[{fieldDef.key}]"
										value={data.invoice.customFields[fieldDef.key] || ''}
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
						<span class="text-secondary">Subtotal:</span>
						<span class="font-medium">{formatCurrency(subtotal)}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-secondary">Tax:</span>
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
			<Button variant="secondary" href={routes.invoices.view(data.invoice._id)}>Cancel</Button>
			<Button type="submit">Save Changes</Button>
		</div>
	</form>
</Container>
