<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data, children } = $props();

	async function logout() {
		await authClient.signOut();
		goto('/login');
	}
</script>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b border-gray-200">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
			<div class="flex items-center gap-6">
				<span class="font-bold text-gray-900">Konta</span>
				<nav class="flex gap-4 text-sm">
					<a
						href="/clients"
						class="{$page.url.pathname.startsWith('/clients')
							? 'text-gray-900 font-medium'
							: 'text-gray-500 hover:text-gray-800'} transition-colors"
					>Clients</a>
					<a
						href="/invoices"
						class="{$page.url.pathname.startsWith('/invoices')
							? 'text-gray-900 font-medium'
							: 'text-gray-500 hover:text-gray-800'} transition-colors"
					>Invoices</a>
				</nav>
			</div>
			<div class="flex items-center gap-4 text-sm">
				<span class="text-gray-500">{data.org.name}</span>
				<button onclick={logout} class="text-gray-500 hover:text-gray-800 transition-colors">
					Sign out
				</button>
			</div>
		</div>
	</header>

	{@render children()}
</div>
