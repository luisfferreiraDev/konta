import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { Client } from '$lib/server/models';
import { createInvoiceSchema } from '$lib/server/validation/invoice.schema';
import { createInvoice } from '$lib/server/services/invoice.service';

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

		// Parse line items from form data
		const lineItems = [];
		let lineIndex = 0;
		while (formData.has(`lineItems[${lineIndex}][description]`)) {
			const description = formData.get(`lineItems[${lineIndex}][description]`) as string;
			const qty = parseFloat(formData.get(`lineItems[${lineIndex}][qty]`) as string);
			const unitPrice = parseFloat(formData.get(`lineItems[${lineIndex}][unitPrice]`) as string);
			const taxRateValue = formData.get(`lineItems[${lineIndex}][taxRate]`);

			const lineItem: { description: string; qty: number; unitPrice: number; taxRate: number } = {
				description,
				qty,
				unitPrice,
				taxRate:
					taxRateValue && typeof taxRateValue === 'string' && taxRateValue.trim() !== ''
						? parseFloat(taxRateValue) / 100
						: 0
			};

			lineItems.push(lineItem);
			lineIndex++;
		}

		// Parse custom fields
		const customFields: Record<string, string | number> = {};
		const customFieldDefs = org.customFieldDefs?.invoice || [];
		for (const fieldDef of customFieldDefs) {
			const value = formData.get(`customFields[${fieldDef.key}]`);
			if (value && typeof value === 'string') {
				customFields[fieldDef.key] = value;
			}
		}

		const raw = {
			clientId: formData.get('clientId') as string,
			issueDate: formData.get('issueDate') as string,
			dueDate: formData.get('dueDate') as string,
			currency: (formData.get('currency') as string) || org.currency,
			taxRate: (() => {
				const value = formData.get('taxRate');
				if (value && typeof value === 'string' && value.trim() !== '') {
					return parseFloat(value) / 100;
				}
				return 0;
			})(),
			lineItems,
			customFields
		};

		const parsed = createInvoiceSchema.safeParse(raw);
		if (!parsed.success) {
			console.error('Validation failed:', parsed.error.flatten());
			return fail(400, { errors: parsed.error.flatten().fieldErrors, values: raw });
		}

		try {
			await createInvoice(org._id, parsed.data, {
				currency: org.currency,
				defaultTaxRate: org.defaultTaxRate
			});
		} catch (err) {
			console.error('Create invoice error:', err);
			const message = err instanceof Error ? err.message : 'Failed to create invoice';
			return fail(400, { errors: { _form: [message] }, values: raw });
		}

		redirect(303, '/invoices');
	}
};
