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

	$inspect(data);
</script>

<div class="mx-auto flex min-h-screen max-w-400 gap-8">
	<header class=" fixed top-4 flex h-14 w-full items-center justify-between px-4">
		<a
			class="flex h-14 w-14 items-center justify-center rounded-lg glass"
			href={routes.dashboard.index()}
		>
			K.
		</a>

		<div class=" flex h-full items-center justify-center gap-2 rounded-lg glass px-4">
			<button
				class=" flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-all hover:bg-white/10"
			>
				<Search size={16} />
			</button>
			<div class=" h-6 w-px bg-white/10"></div>
			<button
				class=" flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-all hover:bg-white/10"
			>
				<Bell size={16} />
			</button>
			<div class=" h-6 w-px bg-white/10"></div>
			<button
				class=" flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-all hover:bg-white/10"
			>
				<div
					class=" flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs text-black"
				>
					{data.user.name.slice(0, 2).toUpperCase()}
				</div>
			</button>
		</div>
	</header>
	<aside class="sticky top-20 h-[calc(100dvh-112px)] w-14 shrink-0 pl-4">
		<div class="flex h-full w-14 flex-col items-center justify-between">
			<nav class="w-full">
				<ul class="flex w-full flex-col items-center gap-2 rounded-lg glass py-4">
					<li>
						<a class=" flex h-10 w-10 items-center justify-center" href={routes.dashboard.index()}
							><House /></a
						>
					</li>
					<li><a href={routes.clients.list()}><Users /></a></li>
					<li><a href={routes.invoices.list()}><FileSpreadsheet /></a></li>
				</ul>
			</nav>

			<div class="flex w-full flex-col items-center gap-2 rounded-lg glass py-4">
				<button><Settings /></button>
				<button><PanelLeftOpen /></button>
			</div>
		</div>
	</aside>
	<!-- <header class="border-b border-gray-200 bg-white">
		<div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
			<div class="flex items-center gap-6">
				<span class="font-bold text-gray-900">Konta</span>
				<nav class="flex gap-4 text-sm">
					<a
						href={routes.clients.list()}
						class="{page.url.pathname.startsWith('/clients')
							? 'font-medium text-gray-900'
							: 'text-gray-500 hover:text-gray-800'} transition-colors">Clients</a
					>
					<a
						href={routes.invoices.list()}
						class="{page.url.pathname.startsWith('/invoices')
							? 'font-medium text-gray-900'
							: 'text-gray-500 hover:text-gray-800'} transition-colors">Invoices</a
					>
				</nav>
			</div>
			<div class="flex items-center gap-4 text-sm">
				<span class="text-gray-500">{data.org.name}</span>
				{#if data.membership.role === 'owner'}
					<a
						href={routes.settings.index()}
						class="{page.url.pathname.startsWith('/settings')
							? 'text-gray-900'
							: 'text-gray-400 hover:text-gray-700'} transition-colors"
						title="Settings"
					>
						<svg
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</a>
				{/if}
				<button onclick={logout} class="text-gray-500 transition-colors hover:text-gray-800">
					Sign out
				</button>
			</div>
		</div>
	</header> -->

	{@render children()}
</div>
