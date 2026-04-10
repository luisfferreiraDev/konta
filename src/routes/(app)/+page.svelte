<script lang="ts">
	import { routes } from '$lib/routes';
	import { FileSpreadsheet, Plus, Users, AlertCircle, Clock } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const STATUS_COLORS: Record<string, string> = {
		draft: 'text-gray-500 bg-gray-500/10',
		scheduled: 'text-blue-500 bg-blue-500/10',
		sent: 'text-blue-500 bg-blue-500/10',
		paid: 'text-green-500 bg-green-500/10',
		overdue: 'text-red-500 bg-red-500/10',
		cancelled: 'text-gray-400 bg-gray-400/10'
	};

	function formatCurrency(amount: number, currency: string) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Dashboard — Konta</title>
</svelte:head>

<div class="space-y-8 py-8">
	<!-- ─── Header ─────────────────────────────────────────────────────────────── -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-xl font-semibold text-primary">Welcome back, {data.user.name}</h1>
			<p class="mt-0.5 text-sm text-muted">
				{data.activeOrg?.name ?? 'Your organization'}
			</p>
		</div>

		<!-- Quick actions -->
		<div class="flex gap-2">
			<a
				href={routes.clients.new()}
				class="flex items-center gap-1.5 rounded-lg glass px-3 py-2 text-sm font-medium
				       text-secondary transition-colors hover:text-primary"
			>
				<Plus size={14} />
				New Client
			</a>
			<a
				href={routes.invoices.new()}
				class="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-sm
				       font-medium text-white transition-opacity hover:opacity-90"
			>
				<FileSpreadsheet size={14} />
				New Invoice
			</a>
		</div>
	</div>

	<!-- ─── Summary cards ──────────────────────────────────────────────────────── -->
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		<div class="rounded-xl glass px-4 py-4">
			<p class="text-xs font-medium tracking-wide text-muted uppercase">Total</p>
			<p class="mt-1 text-2xl font-semibold text-primary">{data.summary.total}</p>
			<p class="mt-0.5 text-xs text-muted">invoices</p>
		</div>

		<div class="rounded-xl glass px-4 py-4">
			<p class="text-xs font-medium tracking-wide text-muted uppercase">Draft</p>
			<p class="mt-1 text-2xl font-semibold text-primary">{data.summary.draft}</p>
			<p class="mt-0.5 text-xs text-muted">not yet sent</p>
		</div>

		<div class="rounded-xl glass px-4 py-4">
			<p class="text-xs font-medium tracking-wide text-muted uppercase">Open</p>
			<p class="mt-1 text-2xl font-semibold text-primary">{data.summary.open}</p>
			<p class="mt-0.5 text-xs text-muted">awaiting payment</p>
		</div>

		<div class="rounded-xl glass px-4 py-4">
			<p class="text-xs font-medium tracking-wide text-muted uppercase">Overdue</p>
			<p
				class="mt-1 text-2xl font-semibold {data.summary.overdue > 0
					? 'text-red-500'
					: 'text-primary'}"
			>
				{data.summary.overdue}
			</p>
			<p class="mt-0.5 text-xs text-muted">past due date</p>
		</div>
	</div>

	<!-- ─── Main content grid ──────────────────────────────────────────────────── -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Recent invoices (wider) -->
		<section class="rounded-xl glass lg:col-span-2">
			<div class="flex items-center justify-between px-4 pt-4 pb-3">
				<h2 class="text-sm font-semibold text-primary">Recent Invoices</h2>
				<a href={routes.invoices.list()} class="text-xs text-muted hover:text-secondary">
					View all
				</a>
			</div>
			<div class="border-t border-border">
				{#if data.recentInvoices.length === 0}
					<div class="flex flex-col items-center gap-2 px-4 py-10 text-center">
						<FileSpreadsheet size={24} class="text-muted" />
						<p class="text-sm text-muted">No invoices yet.</p>
						<a
							href={routes.invoices.new()}
							class="text-xs font-medium text-primary-500 hover:underline"
						>
							Create your first invoice
						</a>
					</div>
				{:else}
					<ul>
						{#each data.recentInvoices as inv (inv._id)}
							<li class="border-b border-border last:border-0">
								<a
									href={routes.invoices.view(inv._id)}
									class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/4"
								>
									<div class="min-w-0 flex-1">
										<div class="flex items-center gap-2">
											<span class="text-sm font-medium text-primary">{inv.number}</span>
											<span
												class="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize
												       {STATUS_COLORS[inv.status] ?? STATUS_COLORS['draft']}"
											>
												{inv.status}
											</span>
										</div>
										<p class="mt-0.5 truncate text-xs text-muted">{inv.clientName}</p>
									</div>
									<div class="shrink-0 text-right">
										<p class="text-sm font-medium text-primary">
											{formatCurrency(inv.totalAmount, inv.currency)}
										</p>
										<p class="mt-0.5 text-xs text-muted">
											Due {formatDate(inv.dueDate)}
										</p>
									</div>
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</section>

		<!-- Needs attention -->
		<section class="rounded-xl glass">
			<div class="px-4 pt-4 pb-3">
				<h2 class="flex items-center gap-1.5 text-sm font-semibold text-primary">
					<AlertCircle size={14} class={data.overdueInvoices.length > 0 ? 'text-red-500' : ''} />
					Needs Attention
				</h2>
			</div>
			<div class="border-t border-border">
				{#if data.overdueInvoices.length === 0}
					<div class="flex flex-col items-center gap-2 px-4 py-10 text-center">
						<Clock size={24} class="text-muted" />
						<p class="text-sm text-muted">All caught up.</p>
						<p class="text-xs text-muted">No overdue invoices.</p>
					</div>
				{:else}
					<ul>
						{#each data.overdueInvoices as inv (inv._id)}
							<li class="border-b border-border last:border-0">
								<a
									href={routes.invoices.view(inv._id)}
									class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/4"
								>
									<div class="min-w-0 flex-1">
										<p class="text-sm font-medium text-primary">{inv.number}</p>
										<p class="mt-0.5 truncate text-xs text-muted">{inv.clientName}</p>
									</div>
									<div class="shrink-0 text-right">
										<p class="text-sm font-medium text-red-500">
											{formatCurrency(inv.totalAmount, inv.currency)}
										</p>
										<p class="mt-0.5 text-xs text-red-400">
											Due {formatDate(inv.dueDate)}
										</p>
									</div>
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</section>
	</div>
</div>
