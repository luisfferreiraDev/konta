import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { connectMongoose } from '$lib/server/mongoose';
import { getActiveOrg } from '$lib/server/org-context';
import type { Handle } from '@sveltejs/kit';

// Establish Mongoose connection on server startup (skipped during build)
if (!building) {
	connectMongoose().catch((err) => console.error('[mongoose] connection error:', err));
}

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
		event.locals.activeOrg = await getActiveOrg(event);
	} else {
		event.locals.activeOrg = null;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
