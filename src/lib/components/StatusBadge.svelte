<script lang="ts">
	import { BadgeCheck, ClockAlert, Pencil, Send } from '@lucide/svelte';

	interface Status {
		label: 'draft' | 'sent' | 'paid' | 'overdue';
	}

	let { status, size = 'md' }: { status: Status; size?: 'sm' | 'md' | 'lg' } = $props();

	let statusMapping = {
		draft: {
			icon: Pencil,
			colors: 'bg-yellow-100 text-yellow-800',
			label: 'Draft'
		},
		sent: {
			icon: Send,
			colors: 'bg-blue-100 text-blue-800',
			label: 'Sent'
		},
		paid: {
			icon: BadgeCheck,
			colors: 'bg-green-100 text-green-800',
			label: 'Paid'
		},
		overdue: {
			icon: ClockAlert,
			colors: 'bg-red-100 text-red-800',
			label: 'Overdue'
		}
	};

	const sizeMapping = {
		sm: 'text-xs px-2 py-0.5',
		md: 'text-sm px-3 py-1',
		lg: 'text-base px-4 py-2'
	};
</script>

<span
	class=" flex items-center rounded-full font-medium {sizeMapping[size]} {statusMapping[status]
		.colors}"
>
	<svelte:boundary>
		{@const Icon = statusMapping[status].icon}
		<Icon class="mr-1 h-4 w-4" />
		{statusMapping[status].label}
	</svelte:boundary>
</span>
