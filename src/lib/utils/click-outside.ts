/**
 * Svelte action that calls a callback when a click happens outside the element
 * @param node - The element to track clicks outside of
 * @param options - Callback function or options object
 * @returns Action with update and destroy functions
 *
 * @example
 * ```svelte
 * <div use:clickOutside={() => close()}>
 *   Content
 * </div>
 *
 * <div use:clickOutside={{ callback: () => close(), enabled: isOpen }}>
 *   Content
 * </div>
 * ```
 */
export function clickOutside(
	node: HTMLElement,
	options:
		| ((event: MouseEvent) => void)
		| { callback: (event: MouseEvent) => void; enabled?: boolean }
) {
	let callback: (event: MouseEvent) => void;
	let enabled = true;

	if (typeof options === 'function') {
		callback = options;
		enabled = true;
	} else {
		callback = options.callback;
		enabled = options.enabled ?? true;
	}

	function handleClick(event: MouseEvent) {
		if (enabled && node && !node.contains(event.target as Node)) {
			callback(event);
		}
	}

	// Use capture phase to ensure we catch the event before it's stopped
	document.addEventListener('click', handleClick, true);

	return {
		update(
			newOptions:
				| ((event: MouseEvent) => void)
				| { callback: (event: MouseEvent) => void; enabled?: boolean }
		) {
			if (typeof newOptions === 'function') {
				callback = newOptions;
				enabled = true;
			} else {
				callback = newOptions.callback;
				enabled = newOptions.enabled ?? true;
			}
		},
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
