<script lang="ts">
	// ─── Types ────────────────────────────────────────────────────────────────────

	type BadgeColor =
		| 'green'
		| 'red'
		| 'blue'
		| 'gray'
		| 'yellow'
		| 'purple'
		| 'orange'
		| 'pink'
		| 'teal'
		| 'indigo'
		| string;

	interface ActionDefinition {
		label: string;
		icon?: any;
		onClick: (row: Record<string, unknown>) => void;
		variant?: 'default' | 'danger';
		show?: (row: Record<string, unknown>) => boolean;
	}

	interface ColumnDefinition {
		key: string;
		label: string;
		type?: 'text' | 'number' | 'currency' | 'date' | 'badge' | 'actions';
		sortable?: boolean;
		width?: string;
		align?: 'left' | 'center' | 'right';
		badgeMap?: Record<string, BadgeColor>;
		actions?: ActionDefinition[];
	}

	interface EmptyStateConfig {
		title: string;
		description?: string;
	}

	// ─── Props ────────────────────────────────────────────────────────────────────

	let {
		columns = [],
		data = [],
		onRowClick,
		emptyState,
		loading = false,
		sortBy,
		sortDirection = 'asc',
		onsort
	}: {
		columns: ColumnDefinition[];
		data: Record<string, unknown>[];
		onRowClick?: (row: Record<string, unknown>) => void;
		emptyState?: EmptyStateConfig;
		loading?: boolean;
		sortBy?: string;
		sortDirection?: 'asc' | 'desc';
		onsort?: (detail: { key: string; direction: 'asc' | 'desc' }) => void;
	} = $props();

	// ─── State ────────────────────────────────────────────────────────────────────

	let activeDropdownIndex = $state<number | null>(null);
	let dropdownTop = $state(0);
	let dropdownLeft = $state(0);
	let dropdownFlipUp = $state(false);

	const actionsColumn = $derived(columns.find((c) => c.type === 'actions') ?? null);
	const activeRow = $derived(
		activeDropdownIndex !== null ? (data[activeDropdownIndex] ?? null) : null
	);

	const SKELETON_ROWS = 5;

	// ─── Handlers ─────────────────────────────────────────────────────────────────

	function handleSort(col: ColumnDefinition) {
		if (!col.sortable || !onsort) return;
		const direction: 'asc' | 'desc' =
			sortBy === col.key && sortDirection === 'asc' ? 'desc' : 'asc';
		onsort({ key: col.key, direction });
	}

	function openDropdown(index: number, event: MouseEvent) {
		event.stopPropagation();
		if (activeDropdownIndex === index) {
			activeDropdownIndex = null;
			return;
		}
		const btn = event.currentTarget as HTMLElement;
		const rect = btn.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		dropdownFlipUp = spaceBelow < 220;
		dropdownTop = dropdownFlipUp ? rect.top - 4 : rect.bottom + 4;
		dropdownLeft = Math.max(8, rect.right - 184);
		activeDropdownIndex = index;
	}

	function closeDropdown() {
		activeDropdownIndex = null;
	}

	function handleActionClick(
		action: ActionDefinition,
		row: Record<string, unknown>,
		event: MouseEvent
	) {
		event.stopPropagation();
		action.onClick(row);
		activeDropdownIndex = null;
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && activeDropdownIndex !== null) {
			closeDropdown();
		}
	}

	// ─── Formatting ───────────────────────────────────────────────────────────────

	function formatValue(col: ColumnDefinition, value: unknown): string {
		if (value == null || value === '') return '—';
		switch (col.type) {
			case 'date': {
				try {
					return new Date(String(value)).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					});
				} catch {
					return String(value);
				}
			}
			case 'currency':
				return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
					Number(value)
				);
			case 'number':
				return new Intl.NumberFormat('en-US').format(Number(value));
			default:
				return String(value);
		}
	}

	// ─── Style helpers ────────────────────────────────────────────────────────────

	const BADGE_CLASSES: Record<string, string> = {
		green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
		red: 'bg-red-50 text-red-700 border-red-200',
		blue: 'bg-blue-50 text-blue-700 border-blue-200',
		gray: 'bg-gray-100 text-gray-600 border-gray-200',
		yellow: 'bg-amber-50 text-amber-700 border-amber-200',
		purple: 'bg-purple-50 text-purple-700 border-purple-200',
		orange: 'bg-orange-50 text-orange-700 border-orange-200',
		pink: 'bg-pink-50 text-pink-700 border-pink-200',
		teal: 'bg-teal-50 text-teal-700 border-teal-200',
		indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200'
	};

	function badgeClass(color: string): string {
		return BADGE_CLASSES[color] ?? 'bg-gray-100 text-gray-600 border-gray-200';
	}

	function cellAlign(col: ColumnDefinition): 'left' | 'center' | 'right' {
		if (col.align) return col.align;
		if (col.type === 'number' || col.type === 'currency') return 'right';
		if (col.type === 'actions') return 'center';
		return 'left';
	}

	const ALIGN_CLASS = {
		left: 'text-left',
		center: 'text-center',
		right: 'text-right'
	} as const;
</script>

<svelte:window onclick={closeDropdown} onkeydown={handleWindowKeydown} />

<!-- ─── Table container ──────────────────────────────────────────────────────── -->
<div
	class="relative overflow-x-auto rounded-xl border border-gray-200/60 bg-white/60 shadow-sm backdrop-blur-sm"
>
	<table class="w-full min-w-full border-collapse text-sm">
		<!-- ─── Header ─────────────────────────────────────────────────────────── -->
		<thead>
			<tr>
				{#each columns as col}
					{@const align = cellAlign(col)}
					{@const isActive = sortBy === col.key}
					<th
						scope="col"
						style={col.width ? `width: ${col.width}` : undefined}
						class="sticky top-0 z-10 border-b border-gray-200/70 bg-white/90 px-4 py-3 text-xs font-semibold tracking-wider backdrop-blur-md
							{ALIGN_CLASS[align]}
							{col.sortable ? 'cursor-pointer select-none' : ''}
							{isActive ? 'text-gray-900' : 'text-gray-400'}
							{col.sortable && !isActive ? 'hover:text-gray-600' : ''}
							transition-colors duration-150"
						onclick={col.sortable ? () => handleSort(col) : undefined}
						onkeydown={col.sortable
							? (e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handleSort(col);
									}
								}
							: undefined}
						tabindex={col.sortable ? 0 : undefined}
						aria-sort={col.sortable && isActive
							? sortDirection === 'asc'
								? 'ascending'
								: 'descending'
							: undefined}
					>
						<span
							class="inline-flex items-center gap-1
								{align === 'right' ? 'flex-row-reverse w-full' : ''}
								{align === 'center' ? 'justify-center' : ''}"
						>
							<span class="uppercase">{col.label}</span>
							{#if col.sortable}
								<span
									class="shrink-0 transition-opacity duration-150
										{isActive ? 'opacity-100 text-gray-700' : 'opacity-25'}"
									aria-hidden="true"
								>
									{#if isActive && sortDirection === 'asc'}
										<!-- Chevron up -->
										<svg
											width="11"
											height="11"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="3"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<polyline points="18 15 12 9 6 15" />
										</svg>
									{:else if isActive && sortDirection === 'desc'}
										<!-- Chevron down -->
										<svg
											width="11"
											height="11"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="3"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<polyline points="6 9 12 15 18 9" />
										</svg>
									{:else}
										<!-- Chevrons up-down (unsorted) -->
										<svg
											width="11"
											height="11"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<polyline points="18 15 12 9 6 15" />
											<polyline points="6 9 12 15 18 9" opacity="0.35" />
										</svg>
									{/if}
								</span>
							{/if}
						</span>
					</th>
				{/each}
			</tr>
		</thead>

		<!-- ─── Body ───────────────────────────────────────────────────────────── -->
		<tbody>
			{#if loading}
				<!-- Skeleton -->
				{#each { length: SKELETON_ROWS } as _, i}
					<tr class="border-b border-gray-100/80 last:border-b-0" aria-hidden="true">
						{#each columns as col}
							{@const align = cellAlign(col)}
							<td class="px-4 py-3.5 {ALIGN_CLASS[align]}">
								<div
									class="h-3.5 animate-pulse rounded-md bg-gray-100"
									style="
										width: {col.type === 'actions'
										? '24px'
										: col.type === 'badge'
											? '56px'
											: col.type === 'number' || col.type === 'currency'
												? '72px'
												: '70%'};
										margin-left: {align === 'right' ? 'auto' : align === 'center' ? 'auto' : '0'};
										margin-right: {align === 'center' ? 'auto' : '0'};
										animation-delay: {i * 80}ms;
									"
								></div>
							</td>
						{/each}
					</tr>
				{/each}
			{:else if data.length === 0}
				<!-- Empty state -->
				<tr>
					<td colspan={columns.length} class="px-6 py-16 text-center">
						<div class="flex flex-col items-center gap-3">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-300"
							>
								<svg
									width="22"
									height="22"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<rect x="3" y="3" width="18" height="18" rx="2" />
									<path d="M3 9h18M9 21V9" />
								</svg>
							</div>
							<p class="text-sm font-medium text-gray-700">
								{emptyState?.title ?? 'No data'}
							</p>
							{#if emptyState?.description}
								<p class="max-w-xs text-xs text-gray-400">{emptyState.description}</p>
							{/if}
						</div>
					</td>
				</tr>
			{:else}
				<!-- Data rows -->
				{#each data as row, rowIndex}
					<tr
						class="group border-b border-gray-100/80 transition-colors duration-150 last:border-b-0
							{onRowClick ? 'cursor-pointer hover:bg-gray-50/70' : ''}"
						onclick={onRowClick ? () => onRowClick(row) : undefined}
						tabindex={onRowClick ? 0 : undefined}
						onkeydown={onRowClick
							? (e) => {
									if (e.key === 'Enter') onRowClick(row);
								}
							: undefined}
					>
						{#each columns as col}
							{@const align = cellAlign(col)}
							{@const value = row[col.key]}
							<td
								class="px-4 py-3.5 {ALIGN_CLASS[align]}"
								style={col.width ? `width: ${col.width}` : undefined}
							>
								{#if col.type === 'badge'}
									{@const strVal = String(value ?? '')}
									{@const color = col.badgeMap?.[strVal] ?? 'gray'}
									<span
										class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize {badgeClass(color)}"
									>
										{strVal}
									</span>
								{:else if col.type === 'actions'}
									<!-- Stop row-click from firing when interacting with the actions cell -->
									<div
										class="flex justify-center"
										onclick={(e) => e.stopPropagation()}
										role="none"
									>
										<button
											type="button"
											onclick={(e) => openDropdown(rowIndex, e)}
											class="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400
												transition-all duration-150
												hover:bg-gray-100 hover:text-gray-700
												focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-1
												opacity-0 group-hover:opacity-100
												{activeDropdownIndex === rowIndex ? 'bg-gray-100 text-gray-700 opacity-100' : ''}"
											aria-label="Row actions"
											aria-haspopup="menu"
											aria-expanded={activeDropdownIndex === rowIndex}
										>
											<!-- Three dots icon -->
											<svg
												width="15"
												height="15"
												viewBox="0 0 24 24"
												fill="currentColor"
												aria-hidden="true"
											>
												<circle cx="5" cy="12" r="1.5" />
												<circle cx="12" cy="12" r="1.5" />
												<circle cx="19" cy="12" r="1.5" />
											</svg>
										</button>
									</div>
								{:else}
									<span
										class="block max-w-xs truncate
											{col.type === 'number' || col.type === 'currency'
											? 'font-mono tabular-nums text-gray-800'
											: 'text-gray-700'}"
										title={value != null && value !== '' ? String(value) : undefined}
									>
										{formatValue(col, value)}
									</span>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<!-- ─── Actions dropdown (fixed/portal-like) ────────────────────────────────── -->
{#if activeDropdownIndex !== null && actionsColumn && activeRow}
	<div
		role="menu"
		aria-label="Row actions"
		tabindex="-1"
		class="fixed z-50 min-w-[11.5rem] overflow-hidden rounded-xl border border-gray-200/60 bg-white/95 py-1 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
		style="
			top: {dropdownTop}px;
			left: {dropdownLeft}px;
			transform: {dropdownFlipUp ? 'translateY(-100%)' : 'none'};
		"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		{#each actionsColumn.actions ?? [] as action}
			{#if !action.show || action.show(activeRow)}
				<button
					type="button"
					role="menuitem"
					class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm
						transition-colors duration-100
						focus:outline-none focus-visible:bg-gray-50
						{action.variant === 'danger'
						? 'text-red-600 hover:bg-red-50/80'
						: 'text-gray-700 hover:bg-gray-50'}"
					onclick={(e) => handleActionClick(action, activeRow, e)}
				>
					{#if action.icon}
						{@const ActionIcon = action.icon}
						<ActionIcon size={14} class="shrink-0" />
					{/if}
					{action.label}
				</button>
			{/if}
		{/each}
	</div>
{/if}
