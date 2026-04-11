<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import Button from '$lib/components/Button.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let templateLoading = $state(false);
	let accentColor = $state(data.org?.templateSettings?.accentColor ?? '#2563eb');
	let accentColorText = $state(data.org?.templateSettings?.accentColor ?? '#2563eb');

	function onColorPickerChange(e: Event) {
		const v = (e.currentTarget as HTMLInputElement).value;
		accentColor = v;
		accentColorText = v;
	}

	function onColorTextChange(e: Event) {
		const v = (e.currentTarget as HTMLInputElement).value.trim();
		if (/^#[0-9a-fA-F]{6}$/.test(v)) {
			accentColor = v;
		}
		accentColorText = v;
	}
</script>

<svelte:head>
	<title>Invoice Design — Konta</title>
</svelte:head>

<div class="space-y-8">
	<!-- ── Section: Invoice Template ─────────────────────────────────────────── -->
	<section class="rounded-lg glass p-6">
		<h2 class="mb-5 text-base font-semibold text-primary">Invoice Template</h2>

		{#if form?.action === 'updateTemplate' && form?.success}
			<div class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
				Template settings saved.
			</div>
		{/if}
		{#if form?.action === 'updateTemplate' && form?.errors?._form}
			<div class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
				{form.errors._form[0]}
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<form
				method="POST"
				action="?/updateTemplate"
				use:enhance={() => {
					templateLoading = true;
					return async ({ update }) => {
						templateLoading = false;
						await update();
					};
				}}
				class="space-y-5"
			>
				<div>
					<label class="mb-1.5 block text-sm font-medium text-primary">Accent Color</label>
					<div class="flex items-center gap-2">
						<input
							type="color"
							name="accentColorPicker"
							value={accentColor}
							oninput={onColorPickerChange}
							class="h-9 w-12 cursor-pointer rounded border border-gray-300 p-0.5"
						/>
						<input
							type="text"
							name="accentColor"
							value={accentColorText}
							oninput={onColorTextChange}
							placeholder="#2563eb"
							class="w-28 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					{#if form?.action === 'updateTemplate' && form?.errors?.accentColor}
						<p class="mt-1 text-xs text-red-600">{form.errors.accentColor[0]}</p>
					{/if}
				</div>

				<div>
					<Button type="submit" disabled={templateLoading}>
						{templateLoading ? 'Saving…' : 'Save Template'}
					</Button>
				</div>
			</form>

			<!-- Live preview -->
			<div class="flex flex-col">
				<p class="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Preview</p>
				<div
					class="flex-1 rounded-xl border-2 bg-white p-5 transition-all"
					style="border-color: {accentColor};"
				>
					<div class="mb-4 flex items-center justify-between">
						<span
							class="text-xs font-bold tracking-widest uppercase"
							style="color: {accentColor};">INVOICE</span
						>
						<span class="text-xs text-gray-400">#INV-001</span>
					</div>
					<div class="mb-3">
						<div class="h-2 rounded" style="background: {accentColor}; width: 60%;"></div>
						<div class="mt-1.5 h-1.5 w-2/5 rounded bg-gray-100"></div>
					</div>
					<div class="mt-4 flex items-end justify-between">
						<div class="space-y-1">
							<div class="h-1.5 w-24 rounded bg-gray-200"></div>
							<div class="h-1.5 w-16 rounded bg-gray-200"></div>
						</div>
						<span class="text-lg font-bold" style="color: {accentColor};">€0.00</span>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
