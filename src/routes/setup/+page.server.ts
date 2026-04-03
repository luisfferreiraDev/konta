import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
	const count = await db.collection('user').countDocuments();
	if (count > 0) {
		redirect(302, '/login');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const email = (data.get('email') as string)?.trim();
		const password = data.get('password') as string;
		const confirmPassword = data.get('confirmPassword') as string;

		if (!name || !email || !password || !confirmPassword) {
			return fail(400, { error: 'All fields are required.' });
		}
		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters.' });
		}
		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match.' });
		}

		// Guard against race condition
		const count = await db.collection('user').countDocuments();
		if (count > 0) {
			redirect(302, '/login');
		}

		try {
			await auth.api.signUpEmail({ body: { name, email, password } });
		} catch {
			return fail(500, { error: 'Failed to create account. Please try again.' });
		}

		redirect(302, '/login');
	}
};
