import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Organization, Membership, Client, Invoice } from '$lib/server/models';
import { updateOrganizationSchema } from '$lib/server/validation/organization.schema';
import { requireAuth } from '$lib/server/auth-guard';
import { clearActiveOrg } from '$lib/server/org-context';
import mongoose from 'mongoose';

function resolveOrgId(params: Record<string, string>) {
	const { orgId } = params;
	if (!mongoose.isValidObjectId(orgId)) error(404, 'Organization not found');
	return orgId;
}

export const GET: RequestHandler = async (event) => {
	const user = requireAuth(event);
	const orgId = resolveOrgId(event.params);

	const membership = await Membership.findOne({ userId: user.id, orgId });
	if (!membership) error(404, 'Organization not found');

	const org = await Organization.findById(orgId);
	if (!org) error(404, 'Organization not found');

	return json({ ...org.toObject(), role: membership.role });
};

export const PATCH: RequestHandler = async (event) => {
	const user = requireAuth(event);
	const orgId = resolveOrgId(event.params);

	const membership = await Membership.findOne({ userId: user.id, orgId });
	if (!membership) error(404, 'Organization not found');
	if (membership.role !== 'owner') error(403, 'Insufficient permissions');

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	const parsed = updateOrganizationSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
	}

	const org = await Organization.findByIdAndUpdate(orgId, parsed.data, { new: true });
	if (!org) error(404, 'Organization not found');

	return json(org.toObject());
};

export const DELETE: RequestHandler = async (event) => {
	const user = requireAuth(event);
	const orgId = resolveOrgId(event.params);

	const membership = await Membership.findOne({ userId: user.id, orgId });
	if (!membership) error(404, 'Organization not found');
	if (membership.role !== 'owner') error(403, 'Insufficient permissions');

	try {
		await Promise.all([
			Organization.findByIdAndDelete(orgId),
			Membership.deleteMany({ orgId }),
			Client.deleteMany({ orgId }),
			Invoice.deleteMany({ orgId })
		]);
	} catch {
		error(500, 'Failed to delete organization. Some data may not have been removed.');
	}

	const activeCookieOrgId = event.cookies.get('activeOrgId');
	if (activeCookieOrgId === orgId) {
		clearActiveOrg(event);
	}

	return new Response(null, { status: 204 });
};
