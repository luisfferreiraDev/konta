import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { auth } from '$lib/server/auth';
import { Membership, Organization } from '$lib/server/models';
import { setActiveOrg } from '$lib/server/org-context';

export const load: PageServerLoad = async (event) => {
	const { locals } = event;
	if (!locals.user) redirect(302, '/login');

	const memberships = await Membership.find({ userId: locals.user.id });
	if (memberships.length === 0) redirect(302, '/onboarding');

	let activeOrg = locals.activeOrg;

	// No active org cookie or cookie pointed to an invalid org — pick the first membership
	if (!activeOrg) {
		const firstOrgId = memberships[0].orgId.toString();
		await setActiveOrg(event, firstOrgId);
		const org = await Organization.findById(firstOrgId);
		if (org) {
			activeOrg = { org, role: memberships[0].role };
			locals.activeOrg = activeOrg;
		}
	}

	const orgIds = memberships.map((m) => m.orgId);
	const orgs = await Organization.find({ _id: { $in: orgIds } });
	const roleByOrgId = new Map(memberships.map((m) => [m.orgId.toString(), m.role]));

	return {
		user: locals.user,
		activeOrg: activeOrg
			? {
					_id: activeOrg.org._id.toString(),
					name: activeOrg.org.name,
					currency: activeOrg.org.currency,
					role: activeOrg.role
				}
			: null,
		orgs: orgs.map((org) => ({
			_id: org._id.toString(),
			name: org.name,
			currency: org.currency,
			role: roleByOrgId.get(org._id.toString())
		}))
	};
};

export const actions: Actions = {
	logout: async ({ request }) => {
		await auth.api.signOut({ headers: request.headers });
		redirect(302, '/login');
	}
};
