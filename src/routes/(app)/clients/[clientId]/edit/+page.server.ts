import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { Client } from '$lib/server/models';
import { updateClientSchema } from '$lib/server/validation';
import mongoose from 'mongoose';

export const load: PageServerLoad = async (event) => {
	const { org } = await requireOrg(event);
	const { clientId } = event.params;

	if (!mongoose.isValidObjectId(clientId)) error(404, 'Client not found');

	const client = await Client.findOne({ _id: clientId, orgId: org._id }).lean();
	if (!client) error(404, 'Client not found');

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

		if (!mongoose.isValidObjectId(clientId)) error(404, 'Client not found');

		const formData = await event.request.formData();

		const customFields: Record<string, unknown> = {};
		for (const [key, value] of formData.entries()) {
			if (key.startsWith('customField_') && value) {
				customFields[key.slice('customField_'.length)] = value;
			}
		}

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

		const updated = await Client.findOneAndUpdate(
			{ _id: clientId, orgId: org._id },
			{ $set: parsed.data },
			{ returnDocument: 'after' }
		);

		if (!updated) error(404, 'Client not found');

		redirect(303, '/clients');
	}
};
