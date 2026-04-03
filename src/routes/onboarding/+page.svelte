<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
	<div class="w-full max-w-md bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
		<h1 class="text-2xl font-semibold text-gray-900 mb-1">Create your organization</h1>
		<p class="text-sm text-gray-500 mb-6">Set up your workspace to start issuing invoices.</p>

		{#if form?.errors?.name}
			<p class="text-sm text-red-600 mb-4">{form.errors.name[0]}</p>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
					Organization name <span class="text-red-500">*</span>
				</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					value={form?.values?.name ?? ''}
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Acme Ltd."
				/>
			</div>

			<div>
				<label for="taxId" class="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
				<input
					id="taxId"
					name="taxId"
					type="text"
					value={form?.values?.taxId ?? ''}
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="PT123456789"
				/>
			</div>

			<div>
				<label for="country" class="block text-sm font-medium text-gray-700 mb-1">Country</label>
				<input
					id="country"
					name="country"
					type="text"
					value={form?.values?.country ?? ''}
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Portugal"
				/>
			</div>

			<div>
				<label for="currency" class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
				<select
					id="currency"
					name="currency"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="EUR" selected={!form?.values?.currency || form.values.currency === 'EUR'}>EUR — Euro</option>
					<option value="USD" selected={form?.values?.currency === 'USD'}>USD — US Dollar</option>
					<option value="GBP" selected={form?.values?.currency === 'GBP'}>GBP — British Pound</option>
					<option value="CHF" selected={form?.values?.currency === 'CHF'}>CHF — Swiss Franc</option>
					<option value="BRL" selected={form?.values?.currency === 'BRL'}>BRL — Brazilian Real</option>
				</select>
			</div>

			<button
				type="submit"
				class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			>
				Create organization
			</button>
		</form>
	</div>
</div>
