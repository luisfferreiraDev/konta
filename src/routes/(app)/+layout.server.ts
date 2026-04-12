import type { LayoutServerLoad } from './$types';
import { requireOrg } from '$lib/server/auth-guard';

export const load: LayoutServerLoad = async (event) => {
	const { user, org, membership } = await requireOrg(event);

	// Serialize to plain JSON-compatible values (devalue can't handle ObjectId)
	return {
		user,
		org: {
			_id: String(org._id),
			name: org.name,
			taxId: org.taxId ?? null,
			address: org.address ?? null,
			country: org.country ?? null,
			logo: org.logo ?? null,
			currency: org.currency,
			defaultTaxRate: org.defaultTaxRate,
			customFieldDefs: org.customFieldDefs,
			templateSettings: {
				...org.templateSettings,
				layout: org.templateSettings?.layout ?? 'default'
			}
		},
		membership: {
			role: membership.role
		}
	};
};
