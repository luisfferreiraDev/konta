import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { Client, Invoice } from '$lib/server/models';
import mongoose from 'mongoose';

export const load: PageServerLoad = async (event) => {
	const { org } = await requireOrg(event);

	const search = event.url.searchParams.get('search') ?? '';
	const page = Math.max(1, parseInt(event.url.searchParams.get('page') ?? '1'));
	const limit = 20;
	const skip = (page - 1) * limit;

	const filter: Record<string, unknown> = { orgId: org._id };
	if (search) {
		filter.$or = [
			{ name: { $regex: search, $options: 'i' } },
			{ email: { $regex: search, $options: 'i' } }
		];
	}

	const [clients, total] = await Promise.all([
		Client.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
		Client.countDocuments(filter)
	]);

	return {
		clients: clients.map((c) => ({
			_id: String(c._id),
			name: c.name,
			taxId: c.taxId ?? null,
			email: c.email ?? null,
			country: c.country ?? null
		})),
		total,
		page,
		totalPages: Math.ceil(total / limit),
		search
	};
};

export const actions: Actions = {
	deleteClient: async (event) => {
		const { org } = await requireOrg(event);
		const formData = await event.request.formData();
		const clientId = formData.get('clientId') as string;

		if (!clientId || !mongoose.isValidObjectId(clientId)) {
			return fail(400, { deleteError: 'Invalid client ID' });
		}

		const client = await Client.findOne({ _id: clientId, orgId: org._id });
		if (!client) return fail(404, { deleteError: 'Client not found' });

		const invoiceCount = await Invoice.countDocuments({ clientId: client._id, orgId: org._id });
		if (invoiceCount > 0) {
			return fail(400, { deleteError: 'Cannot delete client with existing invoices' });
		}

		await client.deleteOne();
	}
};
