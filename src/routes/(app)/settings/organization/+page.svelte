<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData, ActionData } from './$types';
	import { routes } from '$lib/routes';
	import Button from '$lib/components/Button.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// ── General settings ──────────────────────────────────────────────────────
	let generalLoading = $state(false);

	// ── Logo ──────────────────────────────────────────────────────────────────
	let logoFile = $state<File | null>(null);
	let logoPreviewUrl = $state<string | null>(data.org?.logo ?? null);
	let logoLoading = $state(false);
	let logoError = $state('');
	let logoSuccess = $state('');

	function onLogoFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0] ?? null;
		logoError = '';
		logoSuccess = '';
		if (!file) {
			logoFile = null;
			logoPreviewUrl = data.org?.logo ?? null;
			return;
		}
		const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
		if (!allowed.includes(file.type)) {
			logoError = 'Invalid file type. Allowed: PNG, JPG, SVG, WebP.';
			logoFile = null;
			return;
		}
		if (file.size > 2 * 1024 * 1024) {
			logoError = 'File too large. Maximum size is 2MB.';
			logoFile = null;
			return;
		}
		logoFile = file;
		logoPreviewUrl = URL.createObjectURL(file);
	}

	async function uploadLogo() {
		if (!logoFile) return;
		logoLoading = true;
		logoError = '';
		logoSuccess = '';
		try {
			const fd = new FormData();
			fd.append('logo', logoFile);
			const res = await fetch(`/api/organizations/${data.org._id}/logo`, {
				method: 'POST',
				body: fd
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				logoError = body?.message ?? 'Upload failed.';
			} else {
				logoSuccess = 'Logo updated.';
				logoFile = null;
				await invalidateAll();
			}
		} catch {
			logoError = 'Upload failed.';
		} finally {
			logoLoading = false;
		}
	}

	async function removeLogo() {
		logoLoading = true;
		logoError = '';
		logoSuccess = '';
		try {
			const res = await fetch(`/api/organizations/${data.org._id}/logo`, { method: 'DELETE' });
			if (!res.ok) {
				logoError = 'Failed to remove logo.';
			} else {
				logoSuccess = 'Logo removed.';
				logoPreviewUrl = null;
				logoFile = null;
				await invalidateAll();
			}
		} catch {
			logoError = 'Failed to remove logo.';
		} finally {
			logoLoading = false;
		}
	}

	// ── Custom fields ──────────────────────────────────────────────────────────
	let customFieldsLoading = $state(false);

	type FieldType = 'text' | 'textarea' | 'number' | 'date';
	interface FieldDef {
		key: string;
		label: string;
		type: FieldType;
	}

	let invoiceFields = $state<FieldDef[]>(
		(data.org?.customFieldDefs?.invoice ?? []).map((f) => ({ ...f }))
	);
	let clientFields = $state<FieldDef[]>(
		(data.org?.customFieldDefs?.client ?? []).map((f) => ({ ...f }))
	);

	function slugify(str: string) {
		return str
			.toLowerCase()
			.replace(/\s+/g, '_')
			.replace(/[^a-z0-9_]/g, '')
			.replace(/^[^a-z_]/, '_');
	}

	function addField(target: 'invoice' | 'client') {
		const blank: FieldDef = { key: '', label: '', type: 'text' };
		if (target === 'invoice') invoiceFields = [...invoiceFields, blank];
		else clientFields = [...clientFields, blank];
	}

	function removeField(target: 'invoice' | 'client', index: number) {
		if (target === 'invoice') invoiceFields = invoiceFields.filter((_, i) => i !== index);
		else clientFields = clientFields.filter((_, i) => i !== index);
	}

	function onLabelChange(target: 'invoice' | 'client', index: number, value: string) {
		if (target === 'invoice') {
			const fields = [...invoiceFields];
			if (!fields[index].key || fields[index].key === slugify(fields[index].label)) {
				fields[index] = { ...fields[index], label: value, key: slugify(value) };
			} else {
				fields[index] = { ...fields[index], label: value };
			}
			invoiceFields = fields;
		} else {
			const fields = [...clientFields];
			if (!fields[index].key || fields[index].key === slugify(fields[index].label)) {
				fields[index] = { ...fields[index], label: value, key: slugify(value) };
			} else {
				fields[index] = { ...fields[index], label: value };
			}
			clientFields = fields;
		}
	}

	function onKeyChange(target: 'invoice' | 'client', index: number, value: string) {
		if (target === 'invoice') {
			const fields = [...invoiceFields];
			fields[index] = { ...fields[index], key: value };
			invoiceFields = fields;
		} else {
			const fields = [...clientFields];
			fields[index] = { ...fields[index], key: value };
			clientFields = fields;
		}
	}

	function onTypeChange(target: 'invoice' | 'client', index: number, value: string) {
		if (target === 'invoice') {
			const fields = [...invoiceFields];
			fields[index] = { ...fields[index], type: value as FieldType };
			invoiceFields = fields;
		} else {
			const fields = [...clientFields];
			fields[index] = { ...fields[index], type: value as FieldType };
			clientFields = fields;
		}
	}

	let customFieldsJson = $derived(JSON.stringify({ invoice: invoiceFields, client: clientFields }));

	// ── Danger zone ───────────────────────────────────────────────────────────
	let showDeleteOrgModal = $state(false);
	let deleteOrgConfirmName = $state('');
	let deleteOrgLoading = $state(false);
	let deleteOrgError = $state('');

	async function deleteOrg() {
		if (deleteOrgConfirmName !== data.org?.name) return;
		deleteOrgLoading = true;
		deleteOrgError = '';
		try {
			const res = await fetch(`/api/organizations/${data.org._id}`, { method: 'DELETE' });
			if (res.ok || res.status === 204) {
				window.location.href = routes.auth.onboarding();
			} else {
				deleteOrgError = 'Failed to delete organization.';
			}
		} catch {
			deleteOrgError = 'Failed to delete organization.';
		} finally {
			deleteOrgLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Organization Settings — Konta</title>
</svelte:head>

<div class="space-y-8">
	<!-- ── Section: General Information ──────────────────────────────────────── -->
	<section class="rounded-lg glass p-6">
		<h2 class="mb-5 text-base font-semibold text-primary">General Information</h2>

		{#if form?.action === 'updateGeneral' && form?.success}
			<div class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
				Settings saved.
			</div>
		{/if}
		{#if form?.action === 'updateGeneral' && form?.errors?._form}
			<div class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
				{form.errors._form[0]}
			</div>
		{/if}

		<form
			method="POST"
			action="?/updateGeneral"
			use:enhance={() => {
				generalLoading = true;
				return async ({ update }) => {
					generalLoading = false;
					await update();
				};
			}}
		>
			<div class="space-y-4">
				<div>
					<label for="name" class="mb-1.5 block text-sm font-medium text-primary">
						Organization Name <span class="text-red-500">*</span>
					</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						value={form?.action === 'updateGeneral'
							? (form?.values?.name ?? data.org?.name ?? '')
							: (data.org?.name ?? '')}
						class="w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none {form?.action ===
							'updateGeneral' && form?.errors?.name
							? 'border-red-300'
							: 'border-gray-300'}"
					/>
					{#if form?.action === 'updateGeneral' && form?.errors?.name}
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
							value={form?.action === 'updateGeneral'
								? (form?.values?.taxId ?? data.org?.taxId ?? '')
								: (data.org?.taxId ?? '')}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="country" class="mb-1.5 block text-sm font-medium text-primary"
							>Country</label
						>
						<input
							id="country"
							name="country"
							type="text"
							value={form?.action === 'updateGeneral'
								? (form?.values?.country ?? data.org?.country ?? '')
								: (data.org?.country ?? '')}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="address" class="mb-1.5 block text-sm font-medium text-primary"
						>Address</label
					>
					<textarea
						id="address"
						name="address"
						rows="2"
						class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>{form?.action === 'updateGeneral'
							? (form?.values?.address ?? data.org?.address ?? '')
							: (data.org?.address ?? '')}</textarea
					>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="currency" class="mb-1.5 block text-sm font-medium text-primary"
							>Currency</label
						>
						<select
							id="currency"
							name="currency"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							{#each ['EUR', 'USD', 'GBP', 'CHF', 'BRL'] as c}
								<option value={c} selected={data.org?.currency === c}>{c}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="defaultTaxRate" class="mb-1.5 block text-sm font-medium text-primary"
							>Default Tax Rate</label
						>
						<div class="relative">
							<input
								id="defaultTaxRate"
								name="defaultTaxRate"
								type="number"
								min="0"
								max="100"
								step="0.01"
								value={form?.action === 'updateGeneral'
									? (form?.values?.defaultTaxRate ?? data.org?.defaultTaxRate ?? 0)
									: (data.org?.defaultTaxRate ?? 0)}
								class="w-full rounded-lg border border-gray-300 py-2 pr-8 pl-3 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
							<span
								class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-secondary"
								>%</span
							>
						</div>
						{#if form?.action === 'updateGeneral' && form?.errors?.defaultTaxRate}
							<p class="mt-1 text-xs text-red-600">{form.errors.defaultTaxRate[0]}</p>
						{/if}
					</div>
				</div>
			</div>

			<div class="mt-6">
				<Button type="submit" disabled={generalLoading}>
					{generalLoading ? 'Saving…' : 'Save Changes'}
				</Button>
			</div>
		</form>
	</section>

	<!-- ── Section: Logo ──────────────────────────────────────────────────────── -->
	<section class="rounded-lg glass p-6">
		<h2 class="mb-5 text-base font-semibold text-primary">Logo</h2>

		{#if logoSuccess}
			<div class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{logoSuccess}</div>
		{/if}
		{#if logoError}
			<div class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{logoError}</div>
		{/if}

		<div class="flex items-start gap-6">
			<div
				class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5"
			>
				{#if logoPreviewUrl}
					<img src={logoPreviewUrl} alt="Logo preview" class="h-full w-full object-contain p-1" />
				{:else}
					<svg class="h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v13.5a.75.75 0 01-.75.75H3.75A.75.75 0 013 17.25V3.75A.75.75 0 013.75 3z"
						/>
					</svg>
				{/if}
			</div>

			<div class="flex-1">
				<label for="logoFile" class="mb-1.5 block text-sm font-medium text-primary"
					>Upload Logo</label
				>
				<input
					id="logoFile"
					type="file"
					accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
					onchange={onLogoFileChange}
					class="block w-full text-sm text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-white/15"
				/>
				<p class="mt-1 text-xs text-muted">Max 2MB. PNG, JPG, SVG, or WebP.</p>

				<div class="mt-3 flex gap-2">
					{#if logoFile}
						<Button onclick={uploadLogo} disabled={logoLoading}>
							{logoLoading ? 'Uploading…' : 'Upload'}
						</Button>
					{/if}
					{#if data.org?.logo && !logoFile}
						<Button variant="danger" onclick={removeLogo} disabled={logoLoading}>
							{logoLoading ? 'Removing…' : 'Remove Logo'}
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<!-- ── Section: Custom Field Definitions ─────────────────────────────────── -->
	<section class="rounded-lg glass p-6">
		<h2 class="mb-1 text-base font-semibold text-primary">Custom Field Definitions</h2>
		<p class="mb-5 text-sm text-secondary">
			Define extra fields that appear on invoice and client forms.
		</p>

		{#if form?.action === 'updateCustomFields' && form?.success}
			<div class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
				Custom fields saved.
				{#if form?.warnings?.length}
					<ul class="mt-1 list-inside list-disc text-yellow-700">
						{#each form.warnings as w}
							<li>{w}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
		{#if form?.action === 'updateCustomFields' && form?.errors?._form}
			<div class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
				{form.errors._form[0]}
			</div>
		{/if}

		<div class="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
			Removing a custom field will not delete existing data, but the field will no longer appear on
			forms.
		</div>

		<form
			method="POST"
			action="?/updateCustomFields"
			use:enhance={() => {
				customFieldsLoading = true;
				return async ({ update }) => {
					customFieldsLoading = false;
					await update();
				};
			}}
		>
			<input type="hidden" name="customFieldDefsJson" value={customFieldsJson} />

			<!-- Invoice fields -->
			<div class="mb-6">
				<div class="mb-3 flex items-center justify-between">
					<h3 class="text-sm font-medium text-primary">Invoice Custom Fields</h3>
					<button
						type="button"
						onclick={() => addField('invoice')}
						class="text-xs font-medium text-primary-500 transition-colors hover:text-primary-700"
					>
						+ Add Field
					</button>
				</div>

				{#if invoiceFields.length === 0}
					<p class="text-xs text-muted italic">No invoice custom fields defined.</p>
				{:else}
					<div class="space-y-2">
						{#each invoiceFields as field, i (i)}
							<div class="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
								<input
									type="text"
									placeholder="Label"
									value={field.label}
									oninput={(e) =>
										onLabelChange('invoice', i, (e.currentTarget as HTMLInputElement).value)}
									class="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
								/>
								<input
									type="text"
									placeholder="key_name"
									value={field.key}
									oninput={(e) =>
										onKeyChange('invoice', i, (e.currentTarget as HTMLInputElement).value)}
									class="rounded-md border border-gray-300 px-2.5 py-1.5 font-mono text-xs focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
								/>
								<select
									value={field.type}
									onchange={(e) =>
										onTypeChange('invoice', i, (e.currentTarget as HTMLSelectElement).value)}
									class="rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
								>
									<option value="text">Text</option>
									<option value="textarea">Textarea</option>
									<option value="number">Number</option>
									<option value="date">Date</option>
								</select>
								<button
									type="button"
									onclick={() => removeField('invoice', i)}
									class="p-1.5 text-muted transition-colors hover:text-red-500"
									title="Remove field"
								>
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Client fields -->
			<div class="mb-6 border-t border-white/10 pt-5">
				<div class="mb-3 flex items-center justify-between">
					<h3 class="text-sm font-medium text-primary">Client Custom Fields</h3>
					<button
						type="button"
						onclick={() => addField('client')}
						class="text-xs font-medium text-primary-500 transition-colors hover:text-primary-700"
					>
						+ Add Field
					</button>
				</div>

				{#if clientFields.length === 0}
					<p class="text-xs text-muted italic">No client custom fields defined.</p>
				{:else}
					<div class="space-y-2">
						{#each clientFields as field, i (i)}
							<div class="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
								<input
									type="text"
									placeholder="Label"
									value={field.label}
									oninput={(e) =>
										onLabelChange('client', i, (e.currentTarget as HTMLInputElement).value)}
									class="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
								/>
								<input
									type="text"
									placeholder="key_name"
									value={field.key}
									oninput={(e) =>
										onKeyChange('client', i, (e.currentTarget as HTMLInputElement).value)}
									class="rounded-md border border-gray-300 px-2.5 py-1.5 font-mono text-xs focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
								/>
								<select
									value={field.type}
									onchange={(e) =>
										onTypeChange('client', i, (e.currentTarget as HTMLSelectElement).value)}
									class="rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
								>
									<option value="text">Text</option>
									<option value="textarea">Textarea</option>
									<option value="number">Number</option>
									<option value="date">Date</option>
								</select>
								<button
									type="button"
									onclick={() => removeField('client', i)}
									class="p-1.5 text-muted transition-colors hover:text-red-500"
									title="Remove field"
								>
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<Button type="submit" disabled={customFieldsLoading}>
				{customFieldsLoading ? 'Saving…' : 'Save Custom Fields'}
			</Button>
		</form>
	</section>

	<!-- ── Section: Danger Zone ───────────────────────────────────────────────── -->
	<section class="rounded-lg border-2 border-red-500/30 p-6">
		<h2 class="mb-1 text-base font-semibold text-red-500">Danger Zone</h2>
		<p class="mb-5 text-sm text-secondary">
			Irreversible actions that affect your entire organization.
		</p>

		<div class="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4">
			<div>
				<p class="text-sm font-medium text-primary">Delete Organization</p>
				<p class="text-xs text-secondary">Permanently delete this organization and all its data.</p>
			</div>
			<Button
				variant="danger"
				onclick={() => {
					deleteOrgConfirmName = '';
					deleteOrgError = '';
					showDeleteOrgModal = true;
				}}
			>
				Delete Organization
			</Button>
		</div>
	</section>
</div>

<!-- ── Delete Org Confirmation Modal ─────────────────────────────────────────── -->
{#if showDeleteOrgModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
		<div class="w-full max-w-md rounded-xl glass p-6 shadow-xl">
			<h3 class="mb-2 text-base font-semibold text-primary">Delete Organization</h3>
			<p class="mb-4 text-sm text-secondary">
				This will permanently delete <strong class="text-primary">{data.org?.name}</strong> and all
				associated clients, invoices, and data. This action cannot be undone.
			</p>
			<p class="mb-2 text-sm font-medium text-primary">
				Type <strong>{data.org?.name}</strong> to confirm:
			</p>
			<input
				type="text"
				bind:value={deleteOrgConfirmName}
				placeholder={data.org?.name}
				class="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-red-500 focus:outline-none"
			/>
			{#if deleteOrgError}
				<p class="mb-3 text-sm text-red-500">{deleteOrgError}</p>
			{/if}
			<div class="flex justify-end gap-3">
				<Button variant="secondary" onclick={() => (showDeleteOrgModal = false)}>Cancel</Button>
				<Button
					variant="danger"
					onclick={deleteOrg}
					disabled={deleteOrgConfirmName !== data.org?.name || deleteOrgLoading}
				>
					{deleteOrgLoading ? 'Deleting…' : 'Delete Organization'}
				</Button>
			</div>
		</div>
	</div>
{/if}
