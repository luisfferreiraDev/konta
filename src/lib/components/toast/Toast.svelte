<script lang="ts">
	import { X, Info, CircleCheck, CircleX } from '@lucide/svelte';
	import { cubicOut } from 'svelte/easing';
	import type { ToastType } from './toast-store.js';

	interface Props {
		id: string;
		type: ToastType;
		message: string;
		duration: number;
		ondismiss: () => void;
	}

	let { type, message, duration, ondismiss }: Props = $props();

	const CONFIG: Record<ToastType, { icon: typeof CircleCheck; color: string }> = {
		success: { icon: CircleCheck, color: '#5bd97b' },
		error: { icon: CircleX, color: '#d95b5b' },
		info: { icon: Info, color: '#5ba4d9' }
	};

	const { icon: Icon, color } = CONFIG[type];

	// Timer management — pauses on hover
	let isPaused = $state(false);
	let remaining = duration;
	let pauseStartTime = 0;
	let dismissTimer: ReturnType<typeof setTimeout> | null = null;

	function schedule() {
		dismissTimer = setTimeout(ondismiss, remaining);
	}

	function handleMouseEnter() {
		isPaused = true;
		if (dismissTimer) {
			clearTimeout(dismissTimer);
			dismissTimer = null;
		}
		pauseStartTime = Date.now();
	}

	function handleMouseLeave() {
		isPaused = false;
		remaining = Math.max(0, remaining - (Date.now() - pauseStartTime));
		schedule();
	}

	$effect(() => {
		schedule();
		return () => {
			if (dismissTimer) clearTimeout(dismissTimer);
		};
	});

	// Transition: slide in/out from the right + fade
	// t: 0→1 for `in:`, 1→0 for `out:` — same function handles both directions
	const reducedMotion =
		typeof window !== 'undefined'
			? window.matchMedia('(prefers-reduced-motion: reduce)').matches
			: false;

	function slideRight(_node: Element, { d = 250 }: { d?: number } = {}) {
		return {
			duration: reducedMotion ? 0 : d,
			css: (t: number) => {
				const ease = cubicOut(t);
				return `opacity: ${ease}; transform: translateX(${(1 - ease) * 100}%)`;
			}
		};
	}
</script>

<div
	in:slideRight={{ d: 280 }}
	out:slideRight={{ d: 200 }}
	role="alert"
	aria-live="assertive"
	aria-atomic="true"
	class="relative w-full max-w-sm overflow-hidden rounded-lg border glass shadow-xl"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<!-- Left accent bar -->
	<div class="absolute inset-y-0 left-0 w-1 rounded-l-lg" style:background-color={color}></div>

	<!-- Content row -->
	<div class="flex items-start gap-3 py-3.5 pr-9 pl-5 text-[{color}]">
		<Icon size={16} class="mt-0.5 shrink-0" />
		<p class="text-sm leading-snug text-primary">{message}</p>
	</div>

	<!-- Close button -->
	<button
		onclick={ondismiss}
		aria-label="Dismiss notification"
		class="absolute top-2.5 right-2.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded text-primary transition-colors hover:bg-white/10"
	>
		<X size={12} />
	</button>
</div>
