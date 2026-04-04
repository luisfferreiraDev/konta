/**
 * Shared form parsing utilities for server actions and API routes.
 */

export interface ParsedLineItem {
	description: string;
	qty: number;
	unitPrice: number;
	taxRate: number;
}

/**
 * Parses line items from a form submission.
 * Expects fields named `lineItems[N][description]`, `lineItems[N][qty]`, etc.
 */
export function parseLineItems(formData: FormData): ParsedLineItem[] {
	const lineItems: ParsedLineItem[] = [];
	let index = 0;
	while (formData.has(`lineItems[${index}][description]`)) {
		const description = formData.get(`lineItems[${index}][description]`) as string;
		const qty = parseFloat(formData.get(`lineItems[${index}][qty]`) as string);
		const unitPrice = parseFloat(formData.get(`lineItems[${index}][unitPrice]`) as string);
		const taxRateValue = formData.get(`lineItems[${index}][taxRate]`);

		lineItems.push({
			description,
			qty,
			unitPrice,
			taxRate: parseTaxRateField(taxRateValue)
		});
		index++;
	}
	return lineItems;
}

/**
 * Parses custom fields from a form submission.
 * Expects fields named `customFields[key]`.
 */
export function parseCustomFields(formData: FormData): Record<string, string> {
	const customFields: Record<string, string> = {};
	for (const [key, value] of formData.entries()) {
		if (key.startsWith('customFields[') && key.endsWith(']') && typeof value === 'string' && value) {
			customFields[key.slice('customFields['.length, -1)] = value;
		}
	}
	return customFields;
}

/**
 * Converts a percentage tax rate field value (e.g. "20") to a decimal (0.2).
 * Returns 0 if the value is empty or missing.
 */
export function parseTaxRateField(value: FormDataEntryValue | null): number {
	if (value && typeof value === 'string' && value.trim() !== '') {
		return parseFloat(value) / 100;
	}
	return 0;
}

/**
 * Safely extracts a message string from an unknown error.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
	return err instanceof Error ? err.message : fallback;
}

/**
 * Parses page and limit query params with safe fallbacks and NaN guards.
 */
export function parsePaginationParams(
	searchParams: URLSearchParams,
	defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): { page: number; limit: number; skip: number } {
	const { page: defaultPage = 1, limit: defaultLimit = 20, maxLimit = 100 } = defaults;

	const rawPage = parseInt(searchParams.get('page') ?? String(defaultPage));
	const rawLimit = parseInt(searchParams.get('limit') ?? String(defaultLimit));

	const page = Math.max(1, isNaN(rawPage) ? defaultPage : rawPage);
	const limit = Math.min(maxLimit, Math.max(1, isNaN(rawLimit) ? defaultLimit : rawLimit));

	return { page, limit, skip: (page - 1) * limit };
}
