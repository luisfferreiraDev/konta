<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		variant?: Variant;
		size?: Size;
		class?: string;
		href?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let { variant = 'primary', size = 'md', class: className = '', href, children, ...props }: Props =
		$props();

	const base =
		'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

	const variants: Record<Variant, string> = {
		primary:
			'border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500',
		secondary:
			'border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-indigo-500',
		ghost: 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-indigo-500',
		danger:
			'border border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500'
	};

	const sizes: Record<Size, string> = {
		sm: 'rounded px-2.5 py-1.5 text-xs gap-1.5',
		md: 'rounded-md px-4 py-2 text-sm gap-2',
		lg: 'rounded-md px-6 py-3 text-base gap-2.5'
	};

	const classes = [base, variants[variant], sizes[size], className].filter(Boolean).join(' ');
	const tag = href ? 'a' : 'button';
</script>

<svelte:element this={tag} {href} class={classes} {...props}>
	{@render children()}
</svelte:element>
