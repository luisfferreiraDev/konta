import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { auth } from '$lib/server/auth';
import { Membership, Organization } from '$lib/server/models';
import { setActiveOrg } from '$lib/server/org-context';
import { db } from '$lib/server/db';
import { routes } from '$lib/routes';
import { getDashboardStats } from '$lib/server/services/invoice.service';

export const load: PageServerLoad = async (event) => {
	const { locals } = event;
	if (!locals.user) {
		const count = await db.collection('user').countDocuments();
		redirect(302, count === 0 ? routes.auth.setup() : routes.auth.login());
	}

	const memberships = await Membership.find({ userId: locals.user.id });
	if (memberships.length === 0) redirect(302, routes.auth.onboarding());

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

	const dashboard = activeOrg ? await getDashboardStats(activeOrg.org._id) : null;

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
		})),
		summary: dashboard?.summary ?? { total: 0, draft: 0, open: 0, overdue: 0 },
		recentInvoices: dashboard?.recentInvoices ?? [],
		overdueInvoices: dashboard?.overdueInvoices ?? []
	};
};

export const actions: Actions = {
	logout: async ({ request }) => {
		await auth.api.signOut({ headers: request.headers });
		redirect(302, routes.auth.login());
	}
};
