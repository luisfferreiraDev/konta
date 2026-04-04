import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireOrgRole } from '$lib/server/auth-guard';
import { Organization, Client, Invoice } from '$lib/server/models';
import {
	updateOrganizationSchema,
	updateTemplateSettingsSchema,
	customFieldDefsSchema
} from '$lib/server/validation/organization.schema';
import { getErrorMessage } from '$lib/server/utils/form-utils';

export const load: PageServerLoad = async (event) => {
	await requireOrgRole(event, 'owner');
	return {};
};

export const actions: Actions = {
	updateGeneral: async (event) => {
		const { org } = await requireOrgRole(event, 'owner');
		const formData = await event.request.formData();

		const defaultTaxRateRaw = formData.get('defaultTaxRate') as string;
		const defaultTaxRate = defaultTaxRateRaw !== '' ? parseFloat(defaultTaxRateRaw) : undefined;

		const parsed = updateOrganizationSchema.safeParse({
			name: (formData.get('name') as string) || undefined,
			taxId: (formData.get('taxId') as string) || undefined,
			address: (formData.get('address') as string) || undefined,
			country: (formData.get('country') as string) || undefined,
			currency: (formData.get('currency') as string) || undefined,
			defaultTaxRate: isNaN(defaultTaxRate as number) ? undefined : defaultTaxRate
		});

		if (!parsed.success) {
			return fail(422, {
				action: 'updateGeneral',
				errors: parsed.error.flatten().fieldErrors,
				values: Object.fromEntries(formData)
			});
		}

		try {
			await Organization.findByIdAndUpdate(org._id, { $set: parsed.data });
		} catch (err) {
			return fail(500, {
				action: 'updateGeneral',
				errors: { _form: [getErrorMessage(err, 'Failed to save settings')] },
				values: Object.fromEntries(formData)
			});
		}

		return { action: 'updateGeneral', success: true };
	},

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
	},

	updateCustomFields: async (event) => {
		const { org } = await requireOrgRole(event, 'owner');
		const formData = await event.request.formData();

		const defsJson = formData.get('customFieldDefsJson') as string;
		let rawDefs: unknown;
		try {
			rawDefs = JSON.parse(defsJson);
		} catch {
			return fail(400, {
				action: 'updateCustomFields',
				errors: { _form: ['Invalid custom field data'] },
				values: {}
			});
		}

		const parsed = customFieldDefsSchema.safeParse(rawDefs);
		if (!parsed.success) {
			return fail(422, {
				action: 'updateCustomFields',
				errors: parsed.error.flatten().fieldErrors,
				values: {}
			});
		}

		// Check for removed keys in use
		const newInvoiceKeys = new Set(parsed.data.invoice.map((f) => f.key));
		const newClientKeys = new Set(parsed.data.client.map((f) => f.key));

		const removedInvoiceKeys = org.customFieldDefs.invoice
			.map((f) => f.key)
			.filter((k) => !newInvoiceKeys.has(k));

		const removedClientKeys = org.customFieldDefs.client
			.map((f) => f.key)
			.filter((k) => !newClientKeys.has(k));

		const warnings: string[] = [];

		for (const key of removedInvoiceKeys) {
			const count = await Invoice.countDocuments({
				orgId: org._id,
				[`customFields.${key}`]: { $exists: true }
			});
			if (count > 0) {
				warnings.push(
					`Invoice custom field "${key}" is used in ${count} invoice${count === 1 ? '' : 's'}.`
				);
			}
		}

		for (const key of removedClientKeys) {
			const count = await Client.countDocuments({
				orgId: org._id,
				[`customFields.${key}`]: { $exists: true }
			});
			if (count > 0) {
				warnings.push(
					`Client custom field "${key}" is used in ${count} client${count === 1 ? '' : 's'}.`
				);
			}
		}

		try {
			await Organization.findByIdAndUpdate(
				org._id,
				{ $set: { customFieldDefs: parsed.data } }
			);
		} catch (err) {
			return fail(500, {
				action: 'updateCustomFields',
				errors: { _form: [getErrorMessage(err, 'Failed to save custom fields')] },
				values: {}
			});
		}

		return { action: 'updateCustomFields', success: true, warnings };
	}
};
