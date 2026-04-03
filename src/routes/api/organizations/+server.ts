import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Organization, Membership } from '$lib/server/models';
import { createOrganizationSchema } from '$lib/server/validation/organization.schema';
import { requireAuth } from '$lib/server/auth-guard';
import { setActiveOrg } from '$lib/server/org-context';

export const POST: RequestHandler = async (event) => {
	const user = requireAuth(event);

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	const parsed = createOrganizationSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
	}

	const org = await Organization.create(parsed.data);
	await Membership.create({ userId: user.id, orgId: org._id, role: 'owner' });
	await setActiveOrg(event, org._id.toString());

	return json(org.toObject(), { status: 201 });
};

export const GET: RequestHandler = async (event) => {
	const user = requireAuth(event);

	const memberships = await Membership.find({ userId: user.id });
	const orgIds = memberships.map((m) => m.orgId);
	const orgs = await Organization.find({ _id: { $in: orgIds } });

	const roleByOrgId = new Map(memberships.map((m) => [m.orgId.toString(), m.role]));

	const result = orgs.map((org) => ({
		...org.toObject(),
		role: roleByOrgId.get(org._id.toString())
	}));

	return json(result);
};
