import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createThemeStore() {
	const { subscribe, set, update } = writable<boolean>(false);

	// Initialize theme on mount
	if (browser) {
		const stored = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const initialDark = stored === 'dark' || (!stored && prefersDark);

		document.documentElement.classList.toggle('dark', initialDark);
		set(initialDark);
	}

	return {
		subscribe,
		toggle: () => {
			if (!browser) return;

			update((isDark) => {
				const newValue = !isDark;
				document.documentElement.classList.toggle('dark', newValue);
				localStorage.setItem('theme', newValue ? 'dark' : 'light');
				return newValue;
			});
		},
		set: (isDark: boolean) => {
			if (!browser) return;

			document.documentElement.classList.toggle('dark', isDark);
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
			set(isDark);
		}
	};
}

export const themeStore = createThemeStore();
