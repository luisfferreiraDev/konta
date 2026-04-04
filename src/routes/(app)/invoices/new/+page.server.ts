import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { Client } from '$lib/server/models';
import { createInvoiceSchema } from '$lib/server/validation/invoice.schema';
import { createInvoice } from '$lib/server/services/invoice.service';
import { parseLineItems, parseCustomFields, parseTaxRateField, getErrorMessage } from '$lib/server/utils/form-utils';

export const load: PageServerLoad = async (event) => {
	const { org } = await requireOrg(event);

	const clients = await Client.find({ orgId: org._id }).sort({ name: 1 }).lean();

	return {
		clients: clients.map((c) => ({
			_id: String(c._id),
			name: c.name
		})),
		org: {
			currency: org.currency,
			defaultTaxRate: org.defaultTaxRate,
			customFieldDefs: org.customFieldDefs?.invoice || []
		}
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { org } = await requireOrg(event);
		const formData = await event.request.formData();

		const lineItems = parseLineItems(formData);
		const customFields = parseCustomFields(formData);

		const raw = {
			clientId: formData.get('clientId') as string,
			issueDate: formData.get('issueDate') as string,
			dueDate: formData.get('dueDate') as string,
			currency: (formData.get('currency') as string) || org.currency,
			taxRate: parseTaxRateField(formData.get('taxRate')),
			lineItems,
			customFields
		};

		const parsed = createInvoiceSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(422, { errors: parsed.error.flatten().fieldErrors, values: raw });
		}

		try {
			await createInvoice(org._id, parsed.data, {
				currency: org.currency,
				defaultTaxRate: org.defaultTaxRate
			});
		} catch (err) {
			return fail(400, {
				errors: { _form: [getErrorMessage(err, 'Failed to create invoice')] },
				values: raw
			});
		}

		redirect(303, '/invoices');
	}
};
