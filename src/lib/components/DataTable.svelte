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
		green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25',
		red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25',
		blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25',
		gray: 'bg-surface-raised text-secondary border-border',
		yellow: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25',
		purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/25',
		orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/25',
		pink: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-500/15 dark:text-pink-400 dark:border-pink-500/25',
		teal: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-400 dark:border-teal-500/25',
		indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/25'
	};

	function badgeClass(color: string): string {
		return BADGE_CLASSES[color] ?? 'bg-surface-raised text-secondary border-border';
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
<div class="relative overflow-x-auto rounded-xl glass">
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
						class="sticky top-0 z-10 border-b border-border bg-surface px-4 py-3 text-xs font-semibold tracking-wider backdrop-blur-md
							{ALIGN_CLASS[align]}
							{col.sortable ? 'cursor-pointer select-none' : ''}
							{isActive ? 'text-primary' : 'text-muted'}
							{col.sortable && !isActive ? 'hover:text-secondary' : ''}
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
										{isActive ? 'opacity-100 text-primary' : 'opacity-25'}"
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
					<tr class="border-b border-subtle last:border-b-0" aria-hidden="true">
						{#each columns as col}
							{@const align = cellAlign(col)}
							<td class="px-4 py-3.5 {ALIGN_CLASS[align]}">
								<div
									class="h-3.5 animate-pulse rounded-md bg-surface-raised"
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
								class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-muted"
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
							<p class="text-sm font-medium text-primary">
								{emptyState?.title ?? 'No data'}
							</p>
							{#if emptyState?.description}
								<p class="max-w-xs text-xs text-muted">{emptyState.description}</p>
							{/if}
						</div>
					</td>
				</tr>
			{:else}
				<!-- Data rows -->
				{#each data as row, rowIndex}
					<tr
						class="group border-b border-subtle transition-colors duration-150 last:border-b-0
							{onRowClick ? 'cursor-pointer hover:bg-surface-raised' : ''}"
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
											class="flex h-7 w-7 items-center justify-center rounded-lg text-muted
												transition-all duration-150
												hover:bg-surface-raised hover:text-primary
												focus:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-1
												opacity-0 group-hover:opacity-100
												{activeDropdownIndex === rowIndex ? 'bg-surface-raised text-primary opacity-100' : ''}"
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
											? 'font-mono tabular-nums text-primary'
											: 'text-secondary'}"
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
		class="fixed z-50 min-w-[11.5rem] overflow-hidden rounded-xl py-1 glass-strong"
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
						focus:outline-none focus-visible:bg-surface-raised
						{action.variant === 'danger'
						? 'text-red-600 hover:bg-red-50/80 dark:text-red-400 dark:hover:bg-red-500/10'
						: 'text-secondary hover:bg-surface-raised'}"
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
