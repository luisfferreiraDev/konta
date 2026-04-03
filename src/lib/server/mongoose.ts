/**
 * Mongoose connection management.
 *
 * Uses a global cache to survive SvelteKit HMR reloads in development
 * without opening duplicate connections. In production, the module is
 * loaded once and the connection is maintained for the process lifetime.
 */

import mongoose from 'mongoose';
import { MONGODB_URI } from '$env/static/private';

// Preserve connection state across HMR re-evaluations in development.
const g = globalThis as typeof globalThis & {
	_mongoose?: {
		conn: typeof mongoose | null;
		promise: Promise<typeof mongoose> | null;
	};
};

if (!g._mongoose) {
	g._mongoose = { conn: null, promise: null };
}

const cache = g._mongoose;

export async function connectMongoose(): Promise<typeof mongoose> {
	if (cache.conn) return cache.conn;

	if (!cache.promise) {
		cache.promise = mongoose
			.connect(MONGODB_URI, {
				// Buffers commands while connecting — avoids race conditions
				// when a query runs before the connection is ready.
				bufferCommands: true
			})
			.then((m) => {
				cache.conn = m;
				return m;
			});
	}

	return cache.promise;
}
