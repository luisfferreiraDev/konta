import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { Client } from '$lib/server/models';
import { createClientSchema } from '$lib/server/validation';

export const GET: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);

	const search = event.url.searchParams.get('search') ?? '';
	const page = Math.max(1, parseInt(event.url.searchParams.get('page') ?? '1'));
	const limit = Math.min(100, Math.max(1, parseInt(event.url.searchParams.get('limit') ?? '20')));
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

	return json({
		clients,
		total,
		page,
		totalPages: Math.ceil(total / limit)
	});
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
		error(422, 'Validation error');
	}

	const client = await Client.create({ ...result.data, orgId: org._id });

	return json(client.toJSON(), { status: 201 });
};
