import type { RequestEvent } from '@sveltejs/kit';
import { Membership, Organization } from '$lib/server/models';
import type { IOrganization, MembershipRole } from '$lib/server/models';
import mongoose from 'mongoose';

const COOKIE_NAME = 'activeOrgId';

export interface ActiveOrgContext {
	org: IOrganization;
	role: MembershipRole;
}

/**
 * Resolves the active organization for the current user.
 * Reads the activeOrgId cookie, verifies membership, and returns org + role.
 * Returns null if no valid active org can be determined.
 */
export async function getActiveOrg(event: RequestEvent): Promise<ActiveOrgContext | null> {
	const userId = event.locals.user?.id;
	if (!userId) return null;

	const cookieOrgId = event.cookies.get(COOKIE_NAME);
	if (!cookieOrgId || !mongoose.isValidObjectId(cookieOrgId)) return null;

	const membership = await Membership.findOne({ userId, orgId: cookieOrgId });
	if (!membership) return null;

	const org = await Organization.findById(cookieOrgId);
	if (!org) return null;

	return { org, role: membership.role };
}

/**
 * Sets the active organization cookie after verifying the user is a member.
 * Returns false if the user is not a member of the target org.
 */
export async function setActiveOrg(event: RequestEvent, orgId: string): Promise<boolean> {
	const userId = event.locals.user?.id;
	if (!userId) return false;

	if (!mongoose.isValidObjectId(orgId)) return false;

	const membership = await Membership.findOne({ userId, orgId });
	if (!membership) return false;

	event.cookies.set(COOKIE_NAME, orgId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 365
	});

	return true;
}

/**
 * Clears the active organization cookie.
 */
export function clearActiveOrg(event: RequestEvent): void {
	event.cookies.delete(COOKIE_NAME, { path: '/' });
}
