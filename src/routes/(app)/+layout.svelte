<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { routes } from '$lib/routes';
	import {
		Bell,
		FileSpreadsheet,
		House,
		PanelLeftOpen,
		Search,
		Settings,
		Users
	} from '@lucide/svelte';

	let { data, children } = $props();

	async function logout() {
		await authClient.signOut();
		goto(routes.auth.login());
	}

	const topMenu = [
		{
			label: 'Search',
			icon: Search,
			onClick: () => {}
		},
		{
			label: 'Notifications',
			icon: Bell,
			onClick: () => {}
		},
		{
			label: 'User',
			content: `<div
						class=" flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs text-black"
					>
						${data.user.name.slice(0, 2).toUpperCase()}
					</div>`,
			onClick: () => {}
		}
	];

	const sideMenu = [
		{
			label: 'Dashboard',
			icon: House,
			href: routes.dashboard.index()
		},
		{
			label: 'Clients',
			icon: Users,
			href: routes.clients.list()
		},
		{
			label: 'Invoices',
			icon: FileSpreadsheet,
			href: routes.invoices.list()
		}
	];

	const bottomMenu = [
		{
			label: 'Settings',
			icon: Settings,
			onClick: () => {}
		},
		{
			label: 'Expand',
			icon: PanelLeftOpen,
			onClick: () => {}
		}
	];

	// $inspect(data);
</script>

<div class="mx-auto flex min-h-screen max-w-400 gap-4 pr-4">
	<header class=" fixed top-4 w-full max-w-400 px-4">
		<div class="flex h-14 w-full items-center justify-between">
			<a
				class="flex h-14 w-14 items-center justify-center rounded-lg glass"
				href={routes.dashboard.index()}
			>
				K.
			</a>

			<div class=" flex h-full items-center justify-center gap-2 rounded-lg glass px-2">
				{#each topMenu as item, i (item.label)}
					{@const Icon = item.icon}
					{#if i !== 0}
						<div class=" h-6 w-px bg-white/10"></div>
					{/if}
					<button
						class=" flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-white transition-all hover:bg-white/10"
					>
						{#if item.content}
							{@html item.content}
						{:else}
							<Icon size={16} />
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</header>
	<aside class="sticky top-20 ml-4 h-[calc(100dvh-112px)] w-14 shrink-0">
		<div class="flex h-full w-14 flex-col items-center justify-between">
			<nav class="w-full">
				<ul class="flex w-full flex-col items-center gap-2 rounded-lg glass py-2">
					{#each sideMenu as item, i (item.label)}
						{@const Icon = item.icon}
						{#if i !== 0}
							<div class=" h-px w-6 bg-white/10"></div>
						{/if}
						<a
							href={item.href}
							class=" flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-white transition-all hover:bg-white/10"
						>
							<Icon size={16} />
						</a>
					{/each}
				</ul>
			</nav>

			<div class="flex w-full flex-col items-center gap-2 rounded-lg glass py-2">
				{#each bottomMenu as item, i (item.label)}
					{@const Icon = item.icon}
					{#if i !== 0}
						<div class=" h-px w-6 bg-white/10"></div>
					{/if}
					<button
						class=" flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-white transition-all hover:bg-white/10"
					>
						<Icon size={16} />
					</button>
				{/each}
			</div>
		</div>
	</aside>

	<main class=" mt-20 grow">
		{@render children()}
	</main>
</div>
