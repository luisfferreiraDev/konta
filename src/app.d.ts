// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			session: import('better-auth').Session | undefined;
			user: import('better-auth').User | undefined;
			activeOrg: import('$lib/server/org-context').ActiveOrgContext | null;
		}
	}
}

export {};
