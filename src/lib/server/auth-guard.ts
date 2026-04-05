import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { Membership, Organization } from './models/index.js';
import type { IOrganization } from './models/index.js';
import type { IMembership, MembershipRole } from './models/membership.model.js';
import { db } from './db.js';
import { routes } from '$lib/routes.js';

export async function requireAuth(event: RequestEvent) {
	const { user } = event.locals;
	if (!user) {
		const count = await db.collection('user').countDocuments();
		redirect(302, count === 0 ? routes.auth.setup() : routes.auth.login());
	}
	return user;
}

export async function requireOrg(event: RequestEvent) {
	const user = await requireAuth(event);

	const activeOrgId = event.cookies.get('activeOrgId');
	if (!activeOrgId) redirect(302, routes.auth.onboarding());

	const membership = await Membership.findOne({ userId: user.id, orgId: activeOrgId });
	if (!membership) redirect(302, routes.auth.onboarding());

	const org = await Organization.findById(activeOrgId).lean<IOrganization>();
	if (!org) redirect(302, routes.auth.onboarding());

	return { user, org, membership: membership as IMembership };
}

export async function requireOrgRole(event: RequestEvent, role: MembershipRole) {
	const result = await requireOrg(event);
	if (role === 'owner' && result.membership.role !== 'owner') {
		error(403, 'Forbidden');
	}
	return result;
}
