import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { Invoice, Client } from '$lib/server/models';
import mongoose from 'mongoose';

export const load: PageServerLoad = async (event) => {
	const { org } = await requireOrg(event);

	const url = event.url;
	const status = url.searchParams.get('status') || '';
	const clientId = url.searchParams.get('clientId') || '';
	const search = url.searchParams.get('search') || '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
	const limit = 20;
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

	// Fetch invoices and clients for filter dropdown
	const [invoices, total, clients] = await Promise.all([
		Invoice.find(filter)
			.sort({ issueDate: -1 })
			.skip(skip)
			.limit(limit)
			.populate('clientId', 'name')
			.lean(),
		Invoice.countDocuments(filter),
		Client.find({ orgId: org._id }).sort({ name: 1 }).select('_id name').lean()
	]);

	return {
		invoices: invoices.map((inv) => ({
			_id: String(inv._id),
			number: inv.number,
			status: inv.status,
			issueDate: inv.issueDate.toISOString(),
			dueDate: inv.dueDate.toISOString(),
			totalAmount: inv.totalAmount,
			currency: inv.currency,
			client: inv.clientId
				? {
						_id: String((inv.clientId as { _id: unknown; name: string })._id),
						name: (inv.clientId as { _id: unknown; name: string }).name
					}
				: null
		})),
		clients: clients.map((c) => ({
			_id: String(c._id),
			name: c.name
		})),
		filters: {
			status,
			clientId,
			search
		},
		total,
		page,
		totalPages: Math.ceil(total / limit)
	};
};

export const actions: Actions = {
	deleteInvoice: async (event) => {
		const { org } = await requireOrg(event);
		const formData = await event.request.formData();
		const invoiceId = formData.get('invoiceId') as string;

		if (!invoiceId || !mongoose.isValidObjectId(invoiceId)) {
			return fail(400, { deleteError: 'Invalid invoice ID' });
		}

		const invoice = await Invoice.findOne({ _id: invoiceId, orgId: org._id });
		if (!invoice) {
			return fail(404, { deleteError: 'Invoice not found' });
		}

		if (invoice.status !== 'draft' && invoice.status !== 'cancelled') {
			return fail(400, { deleteError: 'Can only delete draft or cancelled invoices' });
		}

		await invoice.deleteOne();

		return { success: true };
	}
};
