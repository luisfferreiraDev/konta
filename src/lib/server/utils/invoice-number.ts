import { Invoice } from '../models';
import type { Types } from 'mongoose';

/**
 * Generates a sequential invoice number for the given organization.
 * Format: INV-YYYY-XXX where YYYY is current year and XXX is zero-padded sequential number.
 *
 * @param orgId - The organization ID
 * @returns Generated invoice number (e.g., "INV-2026-001")
 */
export async function generateInvoiceNumber(orgId: Types.ObjectId | string): Promise<string> {
	const currentYear = new Date().getFullYear();
	const yearStart = new Date(currentYear, 0, 1);
	const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

	// Find the latest invoice for this org in the current year
	const latestInvoice = await Invoice.findOne({
		orgId,
		issueDate: { $gte: yearStart, $lte: yearEnd }
	})
		.sort({ number: -1 })
		.select('number')
		.lean();

	let sequentialNumber = 1;

	if (latestInvoice?.number) {
		// Extract the sequential part from the existing number (e.g., "INV-2026-005" -> 5)
		const match = latestInvoice.number.match(/INV-\d{4}-(\d+)$/);
		if (match) {
			sequentialNumber = parseInt(match[1], 10) + 1;
		}
	}

	// Format as INV-YYYY-XXX with zero-padding
	const paddedNumber = sequentialNumber.toString().padStart(3, '0');
	return `INV-${currentYear}-${paddedNumber}`;
}
