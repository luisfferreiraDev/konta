import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { Invoice } from '$lib/server/models';
import { createInvoiceSchema } from '$lib/server/validation/invoice.schema';
import { createInvoice } from '$lib/server/services/invoice.service';
import mongoose from 'mongoose';

// POST /api/invoices - Create invoice
export const POST: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON');
	}

	const parsed = createInvoiceSchema.safeParse(body);

	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	try {
		const invoice = await createInvoice(org._id, parsed.data, {
			currency: org.currency,
			defaultTaxRate: org.defaultTaxRate
		});
		return json(invoice, { status: 201 });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to create invoice';
		const status = message.includes('not found') ? 404 : 400;
		return json({ error: message }, { status });
	}
};

// GET /api/invoices - List invoices
export const GET: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);

	const url = event.url;
	const status = url.searchParams.get('status');
	const clientId = url.searchParams.get('clientId');
	const search = url.searchParams.get('search') || '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
	const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
	const sort = url.searchParams.get('sort') || '-issueDate';
	const skip = (page - 1) * limit;

	// Build filter
	const filter: Record<string, unknown> = { orgId: org._id };

	if (status) {
		filter.status = status;
	}

	if (clientId && mongoose.isValidObjectId(clientId)) {
		filter.clientId = clientId;
	}

	if (search) {
		filter.number = { $regex: search, $options: 'i' };
	}

	// Execute query with pagination
	const [invoices, total] = await Promise.all([
		Invoice.find(filter)
			.sort(sort)
			.skip(skip)
			.limit(limit)
			.populate('clientId', 'name email')
			.lean(),
		Invoice.countDocuments(filter)
	]);

	return json({
		invoices,
		total,
		page,
		totalPages: Math.ceil(total / limit)
	});
};
