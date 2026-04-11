import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { requireOrgRole } from '$lib/server/auth-guard';
import { Organization } from '$lib/server/models';
import { updateTemplateSettingsSchema } from '$lib/server/validation/organization.schema';
import { getErrorMessage } from '$lib/server/utils/form-utils';

export const actions: Actions = {
	updateTemplate: async (event) => {
		const { org } = await requireOrgRole(event, 'owner');
		const formData = await event.request.formData();

		const showQrCodeRaw = formData.get('showQrCode');

		const parsed = updateTemplateSettingsSchema.safeParse({
			accentColor: (formData.get('accentColor') as string) || undefined,
			showQrCode:
				showQrCodeRaw !== null ? showQrCodeRaw === 'true' || showQrCodeRaw === 'on' : undefined,
			font: (formData.get('font') as string) || undefined
		});

		if (!parsed.success) {
			return fail(422, {
				action: 'updateTemplate',
				errors: parsed.error.flatten().fieldErrors,
				values: Object.fromEntries(formData)
			});
		}

		const $set: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(parsed.data)) {
			$set[`templateSettings.${key}`] = value;
		}

		try {
			await Organization.findByIdAndUpdate(org._id, { $set });
		} catch (err) {
			return fail(500, {
				action: 'updateTemplate',
				errors: { _form: [getErrorMessage(err, 'Failed to save template settings')] },
				values: Object.fromEntries(formData)
			});
		}

		return { action: 'updateTemplate', success: true };
	}
};
