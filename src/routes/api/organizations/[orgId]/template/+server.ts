import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Organization, Membership } from '$lib/server/models';
import { updateTemplateSettingsSchema } from '$lib/server/validation/organization.schema';
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

	const parsed = updateTemplateSettingsSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
	}

	// Build $set paths for nested templateSettings fields
	const $set: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(parsed.data)) {
		$set[`templateSettings.${key}`] = value;
	}

	const org = await Organization.findByIdAndUpdate(orgId, { $set }, { returnDocument: 'after' });
	if (!org) error(404, 'Organization not found');

	return json(org.toObject());
};
