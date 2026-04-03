import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { Client, Invoice } from '$lib/server/models';
import { updateClientSchema } from '$lib/server/validation';
import mongoose from 'mongoose';

export const GET: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);
	const { clientId } = event.params;

	if (!mongoose.isValidObjectId(clientId)) error(404, 'Client not found');

	const client = await Client.findOne({ _id: clientId, orgId: org._id }).lean();
	if (!client) error(404, 'Client not found');

	return json(client);
};

export const PATCH: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);
	const { clientId } = event.params;

	if (!mongoose.isValidObjectId(clientId)) error(404, 'Client not found');

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON');
	}

	const result = updateClientSchema.safeParse(body);
	if (!result.success) error(422, 'Validation error');

	const client = await Client.findOneAndUpdate(
		{ _id: clientId, orgId: org._id },
		{ $set: result.data },
		{ returnDocument: 'after' }
	).lean();

	if (!client) error(404, 'Client not found');

	return json(client);
};

export const DELETE: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);
	const { clientId } = event.params;

	if (!mongoose.isValidObjectId(clientId)) error(404, 'Client not found');

	const client = await Client.findOne({ _id: clientId, orgId: org._id });
	if (!client) error(404, 'Client not found');

	const invoiceCount = await Invoice.countDocuments({ clientId: client._id, orgId: org._id });
	if (invoiceCount > 0) {
		error(400, 'Cannot delete client with existing invoices');
	}

	await client.deleteOne();
	return new Response(null, { status: 204 });
};
