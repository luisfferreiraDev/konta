import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Membership, Organization } from '$lib/server/models';
import { createOrganizationSchema } from '$lib/server/validation/organization.schema';
import { setActiveOrg } from '$lib/server/org-context';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const membershipCount = await Membership.countDocuments({ userId: locals.user.id });
	if (membershipCount > 0) redirect(302, '/dashboard');

	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const { request, locals } = event;
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();

		const raw = {
			name: data.get('name') as string,
			taxId: (data.get('taxId') as string) || undefined,
			country: (data.get('country') as string) || undefined,
			currency: (data.get('currency') as string) || 'EUR'
		};

		const parsed = createOrganizationSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, values: raw });
		}

		const org = await Organization.create(parsed.data);
		await Membership.create({ userId: locals.user.id, orgId: org._id, role: 'owner' });
		await setActiveOrg(event, org._id.toString());

		redirect(302, '/dashboard');
	}
};
