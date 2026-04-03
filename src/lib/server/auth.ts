import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from './db';

export const auth = betterAuth({
	database: mongodbAdapter(db),
	emailAndPassword: {
		enabled: true
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});
