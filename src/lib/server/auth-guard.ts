import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { MembershipRole } from '$lib/server/models';
import type { ActiveOrgContext } from '$lib/server/org-context';

const ROLE_WEIGHT: Record<MembershipRole, number> = { owner: 2, member: 1 };

/**
 * Requires an authenticated session.
 * Throws a redirect to /login if the user is not logged in.
 */
export function requireAuth(event: RequestEvent) {
	const user = event.locals.user;
	if (!user) redirect(302, '/login');
	return user;
}

/**
 * Requires an authenticated user with an active organization.
 * Throws a redirect to /onboarding if no active org is set.
 */
export function requireOrg(event: RequestEvent): { user: NonNullable<App.Locals['user']>; org: ActiveOrgContext } {
	const user = requireAuth(event);
	const activeOrg = event.locals.activeOrg;
	if (!activeOrg) redirect(302, '/onboarding');
	return { user, org: activeOrg };
}

/**
 * Requires the user to have at least the specified role in the active org.
 * Throws 403 if the user's role is insufficient.
 */
export function requireOrgRole(
	event: RequestEvent,
	role: MembershipRole
): { user: NonNullable<App.Locals['user']>; org: ActiveOrgContext } {
	const result = requireOrg(event);
	const userWeight = ROLE_WEIGHT[result.org.role] ?? 0;
	const requiredWeight = ROLE_WEIGHT[role] ?? 0;
	if (userWeight < requiredWeight) {
		error(403, 'Insufficient permissions');
	}
	return result;
}
