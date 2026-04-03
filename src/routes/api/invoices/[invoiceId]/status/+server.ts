import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { updateStatusSchema } from '$lib/server/validation/invoice.schema';
import { updateInvoiceStatus } from '$lib/server/services/invoice.service';

// PATCH /api/invoices/[invoiceId]/status - Update invoice status
export const PATCH: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);
	const { invoiceId } = event.params;

	const body = await event.request.json();
	const parsed = updateStatusSchema.safeParse(body);

	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	try {
		const invoice = await updateInvoiceStatus(invoiceId, org._id, parsed.data.status);
		return json(invoice);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to update status';
		const status = message.includes('not found') ? 404 : 400;
		return json({ error: message }, { status });
	}
};
