import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth-guard';
import { setActiveOrg } from '$lib/server/org-context';
import mongoose from 'mongoose';

export const POST: RequestHandler = async (event) => {
	await requireAuth(event);
	const { orgId } = event.params;

	if (!mongoose.isValidObjectId(orgId)) error(404, 'Organization not found');

	const switched = await setActiveOrg(event, orgId);
	if (!switched) error(404, 'Organization not found');

	return json({ success: true });
};
