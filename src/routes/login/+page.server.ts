import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.trim();
		const password = data.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		try {
			await auth.api.signInEmail({ body: { email, password } });
		} catch {
			return fail(401, { error: 'Invalid email or password.' });
		}

		redirect(302, '/dashboard');
	}
};
