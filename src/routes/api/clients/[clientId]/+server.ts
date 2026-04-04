import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { updateClientSchema } from '$lib/server/validation';
import { getClient, updateClient, deleteClient } from '$lib/server/services/client.service';

export const GET: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);
	const { clientId } = event.params;

	try {
		const client = await getClient(clientId, org._id);
		return json(client);
	} catch (err) {
		error(404, 'Client not found');
	}
};

export const PATCH: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);
	const { clientId } = event.params;

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON');
	}

	const result = updateClientSchema.safeParse(body);
	if (!result.success) {
		return json(
			{ error: 'Validation failed', errors: result.error.flatten().fieldErrors },
			{ status: 422 }
		);
	}

	try {
		const client = await updateClient(clientId, org._id, result.data);
		return json(client);
	} catch (err) {
		error(404, 'Client not found');
	}
};

export const DELETE: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);
	const { clientId } = event.params;

	try {
		await deleteClient(clientId, org._id);
		return new Response(null, { status: 204 });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to delete client';
		error(message.includes('invoices') ? 400 : 404, message);
	}
};
