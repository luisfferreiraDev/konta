import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { Membership, Organization } from './models/index.js';
import type { IOrganization } from './models/index.js';
import type { IMembership, MembershipRole } from './models/membership.model.js';
import { db } from './db.js';

export async function requireAuth(event: RequestEvent) {
	const { user } = event.locals;
	if (!user) {
		const count = await db.collection('user').countDocuments();
		redirect(302, count === 0 ? '/setup' : '/login');
	}
	return user;
}

export async function requireOrg(event: RequestEvent) {
	const user = await requireAuth(event);

	const activeOrgId = event.cookies.get('active_org_id');
	if (!activeOrgId) redirect(302, '/onboarding');

	const membership = await Membership.findOne({ userId: user.id, orgId: activeOrgId });
	if (!membership) redirect(302, '/onboarding');

	const org = await Organization.findById(activeOrgId).lean<IOrganization>();
	if (!org) redirect(302, '/onboarding');

	return { user, org, membership: membership as IMembership };
}

export async function requireOrgRole(event: RequestEvent, role: MembershipRole) {
	const result = await requireOrg(event);
	if (role === 'owner' && result.membership.role !== 'owner') {
		error(403, 'Forbidden');
	}
	return result;
}
