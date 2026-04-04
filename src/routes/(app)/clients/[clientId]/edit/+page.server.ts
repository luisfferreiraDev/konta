import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { updateClientSchema } from '$lib/server/validation';
import { getClient, updateClient } from '$lib/server/services/client.service';
import { parseCustomFields, getErrorMessage } from '$lib/server/utils/form-utils';

export const load: PageServerLoad = async (event) => {
	const { org } = await requireOrg(event);
	const { clientId } = event.params;

	let client;
	try {
		client = await getClient(clientId, org._id);
	} catch {
		error(404, 'Client not found');
	}

	// Convert Map to plain object for devalue serialization
	const customFields: Record<string, string> = {};
	if (client.customFields) {
		const cf = client.customFields as unknown;
		if (cf instanceof Map) {
			for (const [k, v] of (cf as Map<string, unknown>).entries()) {
				customFields[k] = String(v ?? '');
			}
		} else if (typeof cf === 'object' && cf !== null) {
			for (const [k, v] of Object.entries(cf as Record<string, unknown>)) {
				customFields[k] = String(v ?? '');
			}
		}
	}

	return {
		client: {
			_id: String(client._id),
			name: client.name,
			taxId: client.taxId ?? '',
			email: client.email ?? '',
			address: client.address ?? '',
			country: client.country ?? '',
			phone: client.phone ?? '',
			customFields
		}
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { org } = await requireOrg(event);
		const { clientId } = event.params;

		const formData = await event.request.formData();

		const customFields = parseCustomFields(formData);

		const parsed = updateClientSchema.safeParse({
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
			await updateClient(clientId, org._id, parsed.data);
		} catch (err) {
			const message = getErrorMessage(err, 'Failed to update client');
			return fail(400, { errors: { _form: [message] }, values: Object.fromEntries(formData) });
		}

		redirect(303, '/clients');
	}
};
