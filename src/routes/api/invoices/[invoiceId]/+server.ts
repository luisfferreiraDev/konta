import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { Invoice } from '$lib/server/models';
import { updateInvoiceSchema } from '$lib/server/validation/invoice.schema';
import { updateInvoice, deleteInvoice } from '$lib/server/services/invoice.service';
import mongoose from 'mongoose';

// GET /api/invoices/[invoiceId] - Get single invoice
export const GET: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);
	const { invoiceId } = event.params;

	if (!mongoose.isValidObjectId(invoiceId)) {
		error(400, { message: 'Invalid invoice ID' });
	}

	const invoice = await Invoice.findOne({ _id: invoiceId, orgId: org._id })
		.populate('clientId')
		.lean();

	if (!invoice) {
		error(404, { message: 'Invoice not found' });
	}

	return json(invoice);
};

// PATCH /api/invoices/[invoiceId] - Update invoice
export const PATCH: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);
	const { invoiceId } = event.params;

	const body = await event.request.json();
	const parsed = updateInvoiceSchema.safeParse(body);

	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	try {
		const invoice = await updateInvoice(invoiceId, org._id, parsed.data);
		return json(invoice);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to update invoice';
		const status = message.includes('not found') ? 404 : 400;
		return json({ error: message }, { status });
	}
};

// DELETE /api/invoices/[invoiceId] - Delete invoice
export const DELETE: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);
	const { invoiceId } = event.params;

	try {
		await deleteInvoice(invoiceId, org._id);
		return new Response(null, { status: 204 });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to delete invoice';
		const status = message.includes('not found') ? 404 : 400;
		return json({ error: message }, { status });
	}
};
