export interface LineItem {
	description: string;
	qty: number;
	unitPrice: number;
	taxRate?: number;
	total?: number;
}

export interface CalculatedInvoice {
	lineItems: LineItem[];
	subtotal: number;
	taxAmount: number;
	totalAmount: number;
}

/**
 * Calculates invoice totals including line item totals, subtotal, tax, and total amount.
 * Each line item can have its own tax rate; if not provided, uses the default rate.
 *
 * @param lineItems - Array of line items with description, qty, unitPrice, and optional taxRate
 * @param defaultTaxRate - Default tax rate to use when line item doesn't specify one (e.g., 0.21 for 21%)
 * @returns Calculated invoice with updated line items and totals
 */
export function calculateInvoiceTotals(
	lineItems: LineItem[],
	defaultTaxRate: number
): CalculatedInvoice {
	let subtotal = 0;
	let taxAmount = 0;

	// Calculate each line item total and accumulate subtotal and tax
	const calculatedLineItems = lineItems.map((item) => {
		const lineTotal = item.qty * item.unitPrice;
		const lineTaxRate = item.taxRate ?? defaultTaxRate;
		const lineTax = lineTotal * lineTaxRate;

		subtotal += lineTotal;
		taxAmount += lineTax;

		return {
			...item,
			total: lineTotal
		};
	});

	const totalAmount = subtotal + taxAmount;

	return {
		lineItems: calculatedLineItems,
		subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
		taxAmount: Math.round(taxAmount * 100) / 100,
		totalAmount: Math.round(totalAmount * 100) / 100
	};
}
