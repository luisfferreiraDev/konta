import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { createClientSchema } from '$lib/server/validation';
import { listClients, createClient } from '$lib/server/services/client.service';

export const GET: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);

	const search = event.url.searchParams.get('search') ?? '';
	const page = parseInt(event.url.searchParams.get('page') ?? '1');
	const limit = parseInt(event.url.searchParams.get('limit') ?? '20');

	const result = await listClients(org._id, { search, page, limit });

	return json(result);
};

export const POST: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON');
	}

	const result = createClientSchema.safeParse(body);
	if (!result.success) {
		return json(
			{ error: 'Validation failed', errors: result.error.flatten().fieldErrors },
			{ status: 422 }
		);
	}

	const client = await createClient(org._id, result.data);

	return json(client, { status: 201 });
};
