/**
 * Client Service Layer
 *
 * Centralized business logic for client operations.
 * Used by both API routes and form actions to ensure consistency.
 */

import mongoose from 'mongoose';
import { Client, Invoice } from '$lib/server/models';
import type { IClient } from '$lib/server/models';
import type { CreateClientInput, UpdateClientInput } from '$lib/server/validation/client.schema';

export interface ListClientsOptions {
	search?: string;
	page?: number;
	limit?: number;
}

export interface ListClientsResult {
	clients: IClient[];
	total: number;
	page: number;
	totalPages: number;
}

/**
 * List clients for an organization with optional search and pagination.
 */
export async function listClients(
	orgId: mongoose.Types.ObjectId,
	options: ListClientsOptions = {}
): Promise<ListClientsResult> {
	const page = Math.max(1, options.page ?? 1);
	const limit = Math.min(100, Math.max(1, options.limit ?? 20));
	const skip = (page - 1) * limit;

	const filter: Record<string, unknown> = { orgId };
	if (options.search) {
		filter.$or = [
			{ name: { $regex: options.search, $options: 'i' } },
			{ email: { $regex: options.search, $options: 'i' } }
		];
	}

	const [clients, total] = await Promise.all([
		Client.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
		Client.countDocuments(filter)
	]);

	return { clients, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Get a single client by ID, scoped to an organization.
 * Throws if the ID is invalid or the client does not exist.
 */
export async function getClient(
	clientId: string,
	orgId: mongoose.Types.ObjectId
): Promise<IClient> {
	if (!mongoose.isValidObjectId(clientId)) {
		throw new Error('Client not found');
	}

	const client = await Client.findOne({ _id: clientId, orgId }).lean();
	if (!client) throw new Error('Client not found');

	return client;
}

/**
 * Create a new client for an organization.
 */
export async function createClient(
	orgId: mongoose.Types.ObjectId,
	data: CreateClientInput
): Promise<IClient> {
	const client = await Client.create({ ...data, orgId });
	return client;
}

/**
 * Update an existing client.
 * Throws if the client does not exist or does not belong to the organization.
 */
export async function updateClient(
	clientId: string,
	orgId: mongoose.Types.ObjectId,
	data: UpdateClientInput
): Promise<IClient> {
	if (!mongoose.isValidObjectId(clientId)) {
		throw new Error('Client not found');
	}

	// Build the $set payload: regular fields go in directly, customFields are
	// spread as dotted paths so only the provided keys are updated (not a full replace).
	const { customFields, ...rest } = data;
	const setPayload: Record<string, unknown> = { ...rest };

	if (customFields) {
		for (const [key, value] of Object.entries(customFields)) {
			setPayload[`customFields.${key}`] = value;
		}
	}

	const client = await Client.findOneAndUpdate(
		{ _id: clientId, orgId },
		{ $set: setPayload },
		{ returnDocument: 'after' }
	).lean();

	if (!client) throw new Error('Client not found');

	return client;
}

/**
 * Delete a client.
 * Throws if the client does not exist, does not belong to the organization,
 * or has existing invoices.
 */
export async function deleteClient(
	clientId: string,
	orgId: mongoose.Types.ObjectId
): Promise<void> {
	if (!mongoose.isValidObjectId(clientId)) {
		throw new Error('Client not found');
	}

	const client = await Client.findOne({ _id: clientId, orgId });
	if (!client) throw new Error('Client not found');

	const invoiceCount = await Invoice.countDocuments({ clientId: client._id, orgId });
	if (invoiceCount > 0) {
		throw new Error('Cannot delete client with existing invoices');
	}

	await client.deleteOne();
}
