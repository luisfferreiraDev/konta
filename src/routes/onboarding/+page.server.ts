import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAuth } from '$lib/server/auth-guard';
import { Organization, Membership } from '$lib/server/models';

export const load: PageServerLoad = async (event) => {
	const user = await requireAuth(event);

	// If user already has an active org, skip onboarding
	const activeOrgId = event.cookies.get('active_org_id');
	if (activeOrgId) {
		const membership = await Membership.findOne({ userId: user.id, orgId: activeOrgId });
		if (membership) redirect(302, '/clients');
	}

	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const user = await requireAuth(event);
		const formData = await event.request.formData();
		const name = (formData.get('name') as string)?.trim();

		if (!name) return fail(400, { error: 'Organization name is required.' });
		if (name.length > 200) return fail(400, { error: 'Name must be 200 characters or fewer.' });

		const org = await Organization.create({ name });
		await Membership.create({ userId: user.id, orgId: org._id, role: 'owner' });

		event.cookies.set('active_org_id', String(org._id), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 365
		});

		redirect(303, '/clients');
	}
};
