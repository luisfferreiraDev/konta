import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}
	return { user: locals.user };
};

export const actions: Actions = {
	logout: async ({ request }) => {
		await auth.api.signOut({ headers: request.headers });
		redirect(302, '/login');
	}
};
