<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { routes } from '$lib/routes';
	import {
		Bell,
		FileSpreadsheet,
		House,
		Paintbrush,
		PanelLeftOpen,
		Search,
		Settings,
		User,
		Users,
		LogOut
	} from '@lucide/svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import ToastContainer from '$lib/components/toast/ToastContainer.svelte';
	import { themeStore } from '$lib/theme-store.js';

	let { data, children } = $props();
	let sidebarExpanded = $state(false);

	async function logout() {
		await authClient.signOut();
		goto(routes.auth.login());
	}

	const sideMenu = [
		{ label: 'Dashboard', icon: House, href: routes.dashboard.index() },
		{ label: 'Clients', icon: Users, href: routes.clients.list() },
		{ label: 'Invoices', icon: FileSpreadsheet, href: routes.invoices.list() }
	];

	function isActive(href: string) {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}

	const userInitials = data.user.name.slice(0, 2).toUpperCase();
</script>

<ToastContainer />

<!-- ─── Root layout ────────────────────────────────────────────────────────── -->
<div class="mx-auto flex h-dvh max-w-[1400px] flex-col gap-8 md:h-auto md:min-h-screen md:flex-row">
	<!-- ─── Desktop sidebar ──────────────────────────────────────────────────── -->
	<aside
		class="sticky top-0 hidden h-screen shrink-0 flex-col gap-2 px-2 py-2
		       transition-[width] duration-300 ease-in-out md:flex
		       {sidebarExpanded ? 'w-52' : 'w-18'}"
	>
		<!-- logo -->
		<a
			href={routes.dashboard.index()}
			class="flex h-11 min-w-14 shrink-0 items-center overflow-hidden rounded-xl glass px-3
			       transition-all duration-300"
		>
			<span class="shrink-0 pl-2 text-base font-bold tracking-tight text-primary">K.</span>
			<span
				class="ml-2 overflow-hidden text-sm font-semibold whitespace-nowrap text-secondary
				       transition-[opacity,max-width] duration-300
				       {sidebarExpanded ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0'}"
			>
				konta
			</span>
		</a>

		<!-- nav links -->
		<nav class="flex min-w-14 flex-1 flex-col gap-1 rounded-xl glass py-2">
			{#each sideMenu as item (item.label)}
				{@const Icon = item.icon}
				{@const active = isActive(item.href)}
				<div class="group relative px-2">
					<a
						href={item.href}
						class="relative flex h-10 w-full shrink-0 items-center gap-3 overflow-hidden rounded-lg px-2
						       transition-all duration-200
						       {active
							? 'bg-primary-500/12 text-primary-500 dark:bg-primary-500/18'
							: 'text-secondary hover:bg-white/8 hover:text-primary'}"
					>
						<!-- active pill -->
						{#if active}
							<span
								class="absolute top-2 bottom-2 left-0 w-0.5 animate-[slide-in_0.2s_ease-out] rounded-full
								       bg-primary-500"
							></span>
						{/if}

						<span class="flex w-5 shrink-0 items-center justify-center">
							<Icon size={16} />
						</span>

						<span
							class="overflow-hidden text-sm font-medium whitespace-nowrap
							       transition-[opacity,max-width] duration-300
							       {sidebarExpanded ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0'}"
						>
							{item.label}
						</span>
					</a>

					<!-- tooltip (collapsed only) -->
					{#if !sidebarExpanded}
						<div
							class="pointer-events-none absolute top-1/2 left-12 z-50 -translate-y-1/2
							       opacity-0 transition-opacity duration-150 group-hover:opacity-100"
						>
							<div
								class="rounded-md glass px-2.5 py-1 text-xs font-medium
								       text-primary shadow-lg"
							>
								{item.label}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</nav>

		<!-- bottom actions -->
		<div class="flex min-w-14 flex-col gap-1 rounded-xl glass py-2">
			<!-- settings -->
			<div class="group relative px-2">
				<a
					href={routes.settings.index()}
					class="relative flex h-10 w-full shrink-0 items-center gap-3 overflow-hidden rounded-lg px-2
					       transition-all duration-200
					       {isActive(routes.settings.index())
						? 'bg-primary-500/12 text-primary-500 dark:bg-primary-500/18'
						: 'text-secondary hover:bg-white/8 hover:text-primary'}"
				>
					{#if isActive(routes.settings.index())}
						<span class="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-primary-500"></span>
					{/if}
					<span class="flex w-5 shrink-0 items-center justify-center">
						<Settings size={16} />
					</span>
					<span
						class="overflow-hidden text-sm font-medium whitespace-nowrap
						       transition-[opacity,max-width] duration-300
						       {sidebarExpanded ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0'}"
					>
						Settings
					</span>
				</a>
				{#if !sidebarExpanded}
					<div
						class="pointer-events-none absolute top-1/2 left-12 z-50 -translate-y-1/2
						       opacity-0 transition-opacity duration-150 group-hover:opacity-100"
					>
						<div class="rounded-md glass px-2.5 py-1 text-xs font-medium text-primary shadow-lg">
							Settings
						</div>
					</div>
				{/if}
			</div>

			<!-- divider -->
			<div class="mx-3 h-px bg-border"></div>

			<!-- expand / collapse toggle -->
			<div class="group relative px-2">
				<button
					onclick={() => (sidebarExpanded = !sidebarExpanded)}
					class="flex h-10 w-full cursor-pointer items-center gap-3 overflow-hidden rounded-lg px-2
					       text-secondary transition-all duration-200
					       hover:bg-white/8 hover:text-primary"
				>
					<span
						class="flex w-5 shrink-0 items-center justify-center transition-transform duration-300
						       {sidebarExpanded ? 'rotate-180' : ''}"
					>
						<PanelLeftOpen size={16} />
					</span>
					<span
						class="overflow-hidden text-sm font-medium whitespace-nowrap
						       transition-[opacity,max-width] duration-300
						       {sidebarExpanded ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0'}"
					>
						Collapse
					</span>
				</button>
				{#if !sidebarExpanded}
					<div
						class="pointer-events-none absolute top-1/2 left-12 z-50 -translate-y-1/2
						       opacity-0 transition-opacity duration-150 group-hover:opacity-100"
					>
						<div class="rounded-md glass px-2.5 py-1 text-xs font-medium text-primary shadow-lg">
							Expand
						</div>
					</div>
				{/if}
			</div>
		</div>
	</aside>

	<!-- ─── Content area (shifts right with sidebar) ─────────────────────────── -->
	<div class="flex min-h-0 flex-1 flex-col md:min-h-screen">
		<!-- ─── Top header ──────────────────────────────────────────────────────── -->
		<header class="sticky top-0 z-30 flex items-center justify-between px-2 py-2">
			<!-- mobile: logo -->
			<a
				href={routes.dashboard.index()}
				class="flex h-11 w-11 items-center justify-center rounded-lg glass text-sm font-bold md:hidden"
			>
				K.
			</a>

			<!-- desktop: spacer so actions sit on the right -->
			<div class="hidden md:block"></div>

			<!-- right actions -->
			<div class="flex h-11 items-center gap-1 rounded-xl glass px-2">
				<button
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg
					       text-secondary transition-all hover:bg-white/10 hover:text-primary"
				>
					<Search size={15} />
				</button>
				<div class="h-5 w-px bg-border"></div>
				<button
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg
					       text-secondary transition-all hover:bg-white/10 hover:text-primary"
				>
					<Bell size={15} />
				</button>
				<div class="h-5 w-px bg-border"></div>
				<Dropdown>
					{#snippet trigger()}
						<span
							class="ring-border flex h-8 w-8 cursor-pointer items-center justify-center
					       rounded-full bg-white/10 text-xs font-semibold
					       text-primary ring-1 transition-all hover:bg-white/20"
						>
							{userInitials}
						</span>
					{/snippet}
					<div class=" flex w-64 flex-col">
						<div class=" flex items-center gap-1.5 px-4 pt-4">
							<span
								class="ring-border flex h-8 w-8 cursor-pointer items-center justify-center
					       rounded-full bg-white/10 text-xs font-semibold
					       text-primary ring-1 transition-all hover:bg-white/20"
							>
								{userInitials}
							</span>
							<div class=" flex flex-col gap-0.5">
								<p class=" truncate text-sm font-medium text-primary">
									{data.user.name}
								</p>
								<p class=" truncate text-sm text-secondary">
									{data.user.email}
								</p>
							</div>
						</div>
						<div class=" flex flex-col p-2">
							<div class="my-2 w-full border-t border-border"></div>

							<a
								href={routes.settings.index()}
								class=" flex cursor-pointer items-center gap-1.5 rounded-md p-2 text-sm hover:bg-surface-hover"
								><User size={16} />Profile</a
							>
							<a
								href={routes.settings.index()}
								class=" flex cursor-pointer items-center gap-1.5 rounded-md p-2 text-sm hover:bg-surface-hover"
								><Paintbrush size={16} />Invoice Design</a
							>
							<a
								href={routes.settings.index()}
								class=" flex cursor-pointer items-center gap-1.5 rounded-md p-2 text-sm hover:bg-surface-hover"
								><Settings size={16} />Settings</a
							>
							<div class="my-2 w-full border-t border-border"></div>
							<button
								onclick={() => themeStore.toggle()}
								class="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-surface-hover"
							>
								<span class="text-sm">Dark mode</span>
								<div
									class="relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none {$themeStore
										? 'bg-primary-500'
										: 'bg-gray-200'}"
									role="switch"
									aria-checked={$themeStore}
									aria-label="Theme switcher"
								>
									<span
										class="pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow ring-0 transition-transform duration-200 {$themeStore
											? 'translate-x-4'
											: 'translate-x-0'}"
									></span>
								</div>
							</button>

							<div class="my-2 w-full border-t border-border"></div>
							<button
								onclick={logout}
								class=" flex cursor-pointer items-center gap-1.5 rounded-md p-2 text-sm hover:bg-surface-hover"
							>
								<LogOut size={16} />
								Log out
							</button>
						</div>
					</div>
				</Dropdown>
			</div>
		</header>

		<!-- ─── Page content ────────────────────────────────────────────────────── -->
		<main class="mr-2 flex-1 overflow-x-hidden overflow-y-auto pb-6">
			{@render children()}
		</main>
	</div>

	<!-- ─── Mobile bottom nav ────────────────────────────────────────────────── -->
	<nav class="shrink-0 border-t border-border glass md:hidden">
		<div class="flex h-16 items-center justify-around px-2">
			{#each sideMenu as item (item.label)}
				{@const Icon = item.icon}
				{@const active = isActive(item.href)}
				<a
					href={item.href}
					class="flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-200
					       {active ? 'text-primary-500' : 'text-muted hover:text-secondary'}"
				>
					<Icon size={18} />
					<span class="text-[10px] leading-none font-medium">{item.label}</span>
				</a>
			{/each}
			<a
				href={routes.settings.index()}
				class="flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-200
				       {isActive(routes.settings.index()) ? 'text-primary-500' : 'text-muted hover:text-secondary'}"
			>
				<Settings size={18} />
				<span class="text-[10px] leading-none font-medium">Settings</span>
			</a>
		</div>
	</nav>
</div>

<style>
	@keyframes slide-in {
		from {
			transform: scaleY(0);
			opacity: 0;
		}
		to {
			transform: scaleY(1);
			opacity: 1;
		}
	}
</style>
