import { Invoice, Counter } from '../models';
import type { Types } from 'mongoose';

/**
 * Generates a sequential invoice number for the given organization.
 * Format: INV-YYYY-XXX where YYYY is current year and XXX is zero-padded sequential number.
 *
 * Uses an atomic counter to prevent duplicate numbers under concurrent requests.
 *
 * @param orgId - The organization ID
 * @returns Generated invoice number (e.g., "INV-2026-001")
 */
export async function generateInvoiceNumber(orgId: Types.ObjectId | string): Promise<string> {
	const currentYear = new Date().getFullYear();
	const counterId = `invoice:${orgId.toString()}:${currentYear}`;

	// Bootstrap: find the current max so the counter starts above existing invoices.
	// $max is idempotent — concurrent calls with the same seed value are harmless.
	const yearStart = new Date(currentYear, 0, 1);
	const yearEnd = new Date(currentYear + 1, 0, 1);

	const latestInvoice = await Invoice.findOne({
		orgId,
		issueDate: { $gte: yearStart, $lt: yearEnd }
	})
		.sort({ number: -1 })
		.select('number')
		.lean();

	let seedValue = 0;
	if (latestInvoice?.number) {
		const match = latestInvoice.number.match(/INV-\d{4}-(\d+)$/);
		if (match) {
			seedValue = parseInt(match[1], 10);
		}
	}

	// Ensure the counter exists and is at least seedValue (safe for concurrent init)
	await Counter.updateOne({ _id: counterId }, { $max: { seq: seedValue } }, { upsert: true });

	// Atomically claim the next number
	const counter = await Counter.findOneAndUpdate(
		{ _id: counterId },
		{ $inc: { seq: 1 } },
		{ new: true }
	);

	const paddedNumber = counter!.seq.toString().padStart(3, '0');
	return `INV-${currentYear}-${paddedNumber}`;
}
