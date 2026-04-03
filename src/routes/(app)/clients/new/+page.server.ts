import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { createClientSchema } from '$lib/server/validation';
import { createClient } from '$lib/server/services/client.service';

export const actions: Actions = {
	default: async (event) => {
		const { org } = await requireOrg(event);
		const formData = await event.request.formData();

		const customFields: Record<string, unknown> = {};
		for (const [key, value] of formData.entries()) {
			if (key.startsWith('customField_') && value) {
				customFields[key.slice('customField_'.length)] = value;
			}
		}

		const parsed = createClientSchema.safeParse({
			name: formData.get('name') as string,
			taxId: (formData.get('taxId') as string) || undefined,
			email: (formData.get('email') as string) || undefined,
			address: (formData.get('address') as string) || undefined,
			country: (formData.get('country') as string) || undefined,
			phone: (formData.get('phone') as string) || undefined,
			customFields
		});

		if (!parsed.success) {
			return fail(422, {
				errors: parsed.error.flatten().fieldErrors,
				values: Object.fromEntries(formData)
			});
		}

		try {
			await createClient(org._id, parsed.data);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to create client';
			return fail(400, { errors: { _form: [message] }, values: Object.fromEntries(formData) });
		}

		redirect(303, '/clients');
	}
};
