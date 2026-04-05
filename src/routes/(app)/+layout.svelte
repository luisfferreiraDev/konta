<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { routes } from '$lib/routes';

	let { data, children } = $props();

	async function logout() {
		await authClient.signOut();
		goto(routes.auth.login());
	}
</script>

<div class="min-h-screen">
	<header class="border-b border-gray-200 bg-white">
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
	</header>

	{@render children()}
</div>
