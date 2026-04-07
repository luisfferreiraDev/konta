import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
	id: string;
	type: ToastType;
	message: string;
	duration: number;
}

export interface ToastOptions {
	duration?: number;
}

const DEFAULT_DURATION: Record<ToastType, number> = {
	success: 6000,
	info: 4000,
	error: 6000
};

const MAX_TOASTS = 5;

function createToastStore() {
	const { subscribe, update } = writable<ToastItem[]>([]);

	function add(type: ToastType, message: string, options?: ToastOptions) {
		const id = crypto.randomUUID();
		const duration = options?.duration ?? DEFAULT_DURATION[type];

		update((toasts) => {
			const next = [...toasts, { id, type, message, duration }];
			return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
		});
	}

	function dismiss(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		success: (message: string, options?: ToastOptions) => add('success', message, options),
		error: (message: string, options?: ToastOptions) => add('error', message, options),
		info: (message: string, options?: ToastOptions) => add('info', message, options),
		dismiss
	};
}

export const toast = createToastStore();
