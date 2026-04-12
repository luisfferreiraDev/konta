<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData, ActionData } from './$types';
	import Button from '$lib/components/Button.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type Layout = 'default' | 'minimal' | 'boxed';

	let templateLoading = $state(false);
	let accentColor = $state(data.org?.templateSettings?.accentColor ?? '#2563eb');
	let accentColorText = $state(data.org?.templateSettings?.accentColor ?? '#2563eb');

	// $state so Svelte tracks it as a real DOM property on the hidden input.
	let selectedLayout = $state<Layout>(
		((data.org?.templateSettings?.layout as Layout) || null) ?? 'default'
	);

	// Re-sync to the saved value whenever data changes (navigation or after save).
	$effect(() => {
		const saved = ((data.org?.templateSettings?.layout as Layout) || null) ?? 'default';
		selectedLayout = saved;
	});

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

	function openPreview() {
		const params = new URLSearchParams({
			layout: selectedLayout,
			accentColor: accentColor,
			font: data.org?.templateSettings?.font ?? 'inter'
		});
		window.open(`/api/preview-template?${params}`, '_blank', 'noopener');
	}

	const LAYOUTS: {
		id: 'default' | 'minimal' | 'boxed';
		label: string;
		description: string;
	}[] = [
		{
			id: 'default',
			label: 'Classic',
			description: 'Accent border header with colored table headings'
		},
		{
			id: 'minimal',
			label: 'Minimal',
			description: 'Clean whitespace layout with accent used sparingly'
		},
		{
			id: 'boxed',
			label: 'Boxed',
			description: 'Bold accent header band with bordered sections'
		}
	];
</script>

<svelte:head>
	<title>Invoice Design — Konta</title>
</svelte:head>

{#snippet radioIndicator(isSelected: boolean)}
	<div
		class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors
		{isSelected ? 'border-primary-500' : 'border-white/20'}"
	>
		{#if isSelected}
			<div class="h-2 w-2 rounded-full bg-primary-500"></div>
		{/if}
	</div>
{/snippet}

{#snippet layoutCardLabel(layout: (typeof LAYOUTS)[number], isSelected: boolean)}
	<div class="flex items-start gap-2">
		{@render radioIndicator(isSelected)}
		<div>
			<p class="text-sm font-semibold text-primary">{layout.label}</p>
			<p class="text-xs text-muted">{layout.description}</p>
		</div>
	</div>
{/snippet}

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

		<form
			method="POST"
			action="?/updateTemplate"
			use:enhance={() => {
				templateLoading = true;
				return async ({ update }) => {
					await update();
					await invalidateAll();
					templateLoading = false;
				};
			}}
			class="space-y-6"
		>
			<!-- Layout selection -->
			<div>
				<label class="mb-3 block text-sm font-medium text-primary">Layout</label>
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
					{#each LAYOUTS as layout (layout.id)}
						{@const isSelected = selectedLayout === layout.id}
						<button
							type="button"
							onclick={() => (selectedLayout = layout.id)}
							class="relative flex flex-col rounded-lg border-2 p-4 text-left transition-all focus:ring-2 focus:ring-offset-1 focus:outline-none
							{isSelected ? 'border-primary-500 bg-primary-50/10' : 'border-white/10 hover:border-white/20'}"
						>
							<!-- Mini preview -->
							<div class="mb-3 aspect-[3/2] w-full overflow-hidden rounded border border-gray-200 bg-white">
								{#if layout.id === 'default'}
									<!-- Classic preview -->
									<div class="flex h-full flex-col">
										<div
											class="flex h-[28%] items-center justify-between border-b-2 px-2 py-1.5"
											style="border-bottom-color: {accentColor};"
										>
											<div
												class="h-1.5 w-[28%] rounded-sm opacity-90"
												style="background: {accentColor};"
											></div>
											<div class="text-right">
												<div
													class="ml-auto h-1 w-6 rounded-sm"
													style="background: {accentColor};"
												></div>
												<div class="ml-auto mt-0.5 h-1 w-4 rounded-sm bg-gray-300"></div>
											</div>
										</div>
										<div class="flex-1 px-2 py-1.5">
											<div
												class="mb-1.5 h-1 w-2/5 rounded-sm opacity-70"
												style="background: {accentColor};"
											></div>
											<div class="mb-1 h-0.5 w-[90%] rounded-sm bg-gray-100"></div>
											<div class="h-0.5 w-3/4 rounded-sm bg-gray-100"></div>
										</div>
										<div
											class="flex h-[18%] items-center justify-end px-2"
											style="background: {accentColor};"
										>
											<div class="h-1 w-6 rounded-sm bg-white/80"></div>
										</div>
									</div>

								{:else if layout.id === 'minimal'}
									<!-- Minimal preview -->
									<div class="flex h-full flex-col p-2.5">
										<div class="mb-2 flex items-start justify-between">
											<div class="h-1 w-[28%] rounded-sm bg-gray-900 opacity-80"></div>
											<div class="text-right">
												<div class="ml-auto h-1 w-5 rounded-sm bg-gray-200"></div>
												<div
													class="ml-auto mt-0.5 h-0.5 w-3.5 rounded-sm"
													style="background: {accentColor};"
												></div>
											</div>
										</div>
										<div class="mb-2 h-px bg-gray-200"></div>
										<div class="flex-1">
											<div class="mb-1 h-0.5 w-4/5 rounded-sm bg-gray-100"></div>
											<div class="h-0.5 w-[65%] rounded-sm bg-gray-100"></div>
										</div>
										<div class="mt-1 flex items-center justify-end">
											<div
												class="h-1 w-7 rounded-sm opacity-90"
												style="background: {accentColor};"
											></div>
										</div>
									</div>

								{:else}
									<!-- Boxed preview -->
									<div class="flex h-full flex-col">
										<div
											class="flex h-[30%] items-center justify-between px-2 py-1.5"
											style="background: {accentColor};"
										>
											<div class="h-1 w-[30%] rounded-sm bg-white/80"></div>
											<div class="h-1 w-5 rounded-sm bg-white/70"></div>
										</div>
										<div class="flex-1 px-2 py-1.5">
											<div class="mb-1.5 grid grid-cols-2 gap-1">
												<div class="rounded-sm border border-gray-200 p-1">
													<div class="mb-0.5 h-0.5 w-[70%] rounded-sm bg-gray-300"></div>
													<div class="h-0.5 w-1/2 rounded-sm bg-gray-200"></div>
												</div>
												<div
													class="rounded-sm border border-gray-200 p-1"
													style="border-left: 2px solid {accentColor};"
												>
													<div class="mb-0.5 h-0.5 w-[70%] rounded-sm bg-gray-300"></div>
													<div class="h-0.5 w-1/2 rounded-sm bg-gray-200"></div>
												</div>
											</div>
											<div class="h-0.5 w-[90%] rounded-sm bg-gray-100"></div>
										</div>
									</div>
								{/if}
							</div>

							{@render layoutCardLabel(layout, isSelected)}
						</button>
					{/each}
				</div>
				<input type="hidden" name="layout" value={selectedLayout} />
			</div>

			<!-- Accent Color -->
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

			<div class="flex items-center gap-3">
				<Button type="submit" disabled={templateLoading}>
					{templateLoading ? 'Saving…' : 'Save Template'}
				</Button>
				<Button type="button" variant="secondary" onclick={openPreview}>Preview</Button>
			</div>
		</form>
	</section>
</div>
