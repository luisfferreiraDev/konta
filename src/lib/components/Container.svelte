<script lang="ts">
	interface Props {
		size?: 'sm' | 'default' | 'lg';
		class?: string;
		children?: any;
	}

	let { size = 'default', class: className = '', children }: Props = $props();

	// const maxWidths = {
	// 	sm: 'max-w-[1080px]',
	// 	default: 'max-w-[1280px]',
	// 	lg: 'max-w-[1440px]'
	// };

	// const maxWidth = $derived(maxWidths[size]);
</script>

<div class="mx-auto w-full {className}">
	{@render children?.()}
</div>
