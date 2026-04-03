import { redirect, fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { Client, Invoice } from '$lib/server/models';
import { updateInvoiceSchema } from '$lib/server/validation/invoice.schema';
import { updateInvoice } from '$lib/server/services/invoice.service';
import mongoose from 'mongoose';

export const load: PageServerLoad = async (event) => {
	const { org } = await requireOrg(event);
	const { invoiceId } = event.params;

	if (!mongoose.isValidObjectId(invoiceId)) {
		error(400, 'Invalid invoice ID');
	}

	const [invoice, clients] = await Promise.all([
		Invoice.findOne({ _id: invoiceId, orgId: org._id }).lean(),
		Client.find({ orgId: org._id }).sort({ name: 1 }).lean()
	]);

	if (!invoice) {
		error(404, 'Invoice not found');
	}

	// Only allow editing draft or scheduled invoices
	if (invoice.status !== 'draft' && invoice.status !== 'scheduled') {
		redirect(303, `/invoices/${invoiceId}`);
	}

	return {
		invoice: {
			_id: String(invoice._id),
			clientId: String(invoice.clientId),
			issueDate: invoice.issueDate.toISOString().split('T')[0],
			dueDate: invoice.dueDate.toISOString().split('T')[0],
			currency: invoice.currency,
			taxRate: invoice.taxRate * 100, // Convert to percentage
			lineItems: invoice.lineItems.map((item: any) => ({
				description: item.description,
				qty: item.qty,
				unitPrice: item.unitPrice,
				taxRate: item.taxRate !== undefined ? item.taxRate * 100 : null // Convert to percentage
			})),
			customFields: invoice.customFields || {}
		},
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
		const { invoiceId } = event.params;

		if (!mongoose.isValidObjectId(invoiceId)) {
			error(400, 'Invalid invoice ID');
		}

		const invoice = await Invoice.findOne({ _id: invoiceId, orgId: org._id });
		if (!invoice) {
			error(404, 'Invoice not found');
		}

		// Only allow editing draft or scheduled invoices
		if (invoice.status !== 'draft' && invoice.status !== 'scheduled') {
			return fail(400, { error: 'Cannot edit a sent/paid/overdue/cancelled invoice' });
		}

		const formData = await event.request.formData();

		// Parse line items from form data
		const lineItems = [];
		let lineIndex = 0;
		while (formData.has(`lineItems[${lineIndex}][description]`)) {
			const description = formData.get(`lineItems[${lineIndex}][description]`) as string;
			const qty = parseFloat(formData.get(`lineItems[${lineIndex}][qty]`) as string);
			const unitPrice = parseFloat(formData.get(`lineItems[${lineIndex}][unitPrice]`) as string);
			const taxRateValue = formData.get(`lineItems[${lineIndex}][taxRate]`);

			const lineItem: any = {
				description,
				qty,
				unitPrice,
				taxRate:
					taxRateValue && typeof taxRateValue === 'string' && taxRateValue.trim() !== ''
						? parseFloat(taxRateValue) / 100
						: 0 // Default to 0 if empty
			};

			lineItems.push(lineItem);
			lineIndex++;
		}

		// Parse custom fields
		const customFields: Record<string, any> = {};
		const customFieldDefs = org.customFieldDefs?.invoice || [];
		for (const fieldDef of customFieldDefs) {
			const value = formData.get(`customFields[${fieldDef.key}]`);
			if (value) {
				customFields[fieldDef.key] = value;
			}
		}

		const raw = {
			clientId: formData.get('clientId') as string,
			issueDate: formData.get('issueDate') as string,
			dueDate: formData.get('dueDate') as string,
			currency: formData.get('currency') as string,
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

		const parsed = updateInvoiceSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, values: raw });
		}

		try {
			await updateInvoice(invoiceId, org._id, {
				...parsed.data,
				customFields
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to update invoice';
			return fail(400, { errors: { _form: [message] }, values: raw });
		}

		redirect(303, `/invoices/${invoiceId}`);
	}
};
