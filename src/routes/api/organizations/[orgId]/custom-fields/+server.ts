import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Organization, Membership, Client, Invoice } from '$lib/server/models';
import { customFieldDefsSchema } from '$lib/server/validation/organization.schema';
import { requireAuth } from '$lib/server/auth-guard';
import mongoose from 'mongoose';

export const PATCH: RequestHandler = async (event) => {
	const user = await requireAuth(event);
	const { orgId } = event.params;

	if (!mongoose.isValidObjectId(orgId)) error(404, 'Organization not found');

	const membership = await Membership.findOne({ userId: user.id, orgId });
	if (!membership) error(404, 'Organization not found');
	if (membership.role !== 'owner') error(403, 'Forbidden');

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	const parsed = customFieldDefsSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
	}

	// Determine which keys are being removed vs existing
	const org = await Organization.findById(orgId).lean();
	if (!org) error(404, 'Organization not found');

	const newInvoiceKeys = new Set(parsed.data.invoice.map((f) => f.key));
	const newClientKeys = new Set(parsed.data.client.map((f) => f.key));

	const removedInvoiceKeys = org.customFieldDefs.invoice
		.map((f) => f.key)
		.filter((k) => !newInvoiceKeys.has(k));

	const removedClientKeys = org.customFieldDefs.client
		.map((f) => f.key)
		.filter((k) => !newClientKeys.has(k));

	// Check if any removed keys are in use
	const warnings: string[] = [];

	for (const key of removedInvoiceKeys) {
		const count = await Invoice.countDocuments({
			orgId,
			[`customFields.${key}`]: { $exists: true }
		});
		if (count > 0) {
			warnings.push(
				`Invoice custom field "${key}" is used in ${count} invoice${count === 1 ? '' : 's'}.`
			);
		}
	}

	for (const key of removedClientKeys) {
		const count = await Client.countDocuments({
			orgId,
			[`customFields.${key}`]: { $exists: true }
		});
		if (count > 0) {
			warnings.push(
				`Client custom field "${key}" is used in ${count} client${count === 1 ? '' : 's'}.`
			);
		}
	}

	const updated = await Organization.findByIdAndUpdate(
		orgId,
		{ $set: { customFieldDefs: parsed.data } },
		{ new: true }
	);
	if (!updated) error(404, 'Organization not found');

	return json({ org: updated.toObject(), warnings });
};
