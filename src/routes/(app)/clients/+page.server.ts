import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { listClients, deleteClient } from '$lib/server/services/client.service';

export const load: PageServerLoad = async (event) => {
	const { org } = await requireOrg(event);

	const search = event.url.searchParams.get('search') ?? '';
	const page = parseInt(event.url.searchParams.get('page') ?? '1');

	const { clients, total, totalPages } = await listClients(org._id, { search, page, limit: 20 });

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
		totalPages,
		search
	};
};

export const actions: Actions = {
	deleteClient: async (event) => {
		const { org } = await requireOrg(event);
		const formData = await event.request.formData();
		const clientId = formData.get('clientId') as string;

		if (!clientId) {
			return fail(400, { deleteError: 'Invalid client ID' });
		}

		try {
			await deleteClient(clientId, org._id);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to delete client';
			const status = message.includes('invoices') ? 400 : 404;
			return fail(status, { deleteError: message });
		}
	}
};
