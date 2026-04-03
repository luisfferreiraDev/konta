import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { Invoice } from '$lib/server/models';
import type { IClient } from '$lib/server/models';
import { updateInvoiceStatus, deleteInvoice } from '$lib/server/services/invoice.service';
import mongoose from 'mongoose';
import type { IInvoice } from '$lib/server/models/invoice.model';

type PopulatedInvoice = Omit<IInvoice, 'clientId'> & {
	clientId: IClient | mongoose.Types.ObjectId;
};

export const load: PageServerLoad = async (event) => {
	const { org } = await requireOrg(event);
	const { invoiceId } = event.params;

	if (!mongoose.isValidObjectId(invoiceId)) {
		error(400, 'Invalid invoice ID');
	}

	const invoice = (await Invoice.findOne({ _id: invoiceId, orgId: org._id })
		.populate('clientId')
		.lean()) as PopulatedInvoice | null;

	if (!invoice) {
		error(404, 'Invoice not found');
	}

	const client =
		invoice.clientId && typeof invoice.clientId === 'object' && 'name' in invoice.clientId
			? (invoice.clientId as IClient)
			: null;

	return {
		invoice: {
			_id: String(invoice._id),
			number: invoice.number,
			status: invoice.status,
			issueDate: invoice.issueDate.toISOString(),
			dueDate: invoice.dueDate.toISOString(),
			currency: invoice.currency,
			taxRate: invoice.taxRate,
			lineItems: invoice.lineItems.map(
				(item: {
					description: string;
					qty: number;
					unitPrice: number;
					taxRate?: number;
					total?: number;
				}) => ({
					description: item.description,
					qty: item.qty,
					unitPrice: item.unitPrice,
					taxRate: item.taxRate,
					total: item.total
				})
			),
			subtotal: invoice.subtotal,
			taxAmount: invoice.taxAmount,
			totalAmount: invoice.totalAmount,
			customFields: invoice.customFields || {},
			sentDate: invoice.sentDate?.toISOString() || null,
			paidAt: invoice.paidAt?.toISOString() || null,
			paymentMethod: invoice.paymentMethod || null
		},
		client: client
			? {
					_id: String(client._id),
					name: client.name,
					email: client.email || null,
					taxId: client.taxId || null,
					address: client.address || null,
					country: client.country || null
				}
			: null
	};
};

export const actions: Actions = {
	updateStatus: async (event) => {
		const { org } = await requireOrg(event);
		const { invoiceId } = event.params;
		const formData = await event.request.formData();
		const newStatus = formData.get('status') as string;

		try {
			await updateInvoiceStatus(invoiceId, org._id, newStatus);
			return { success: true };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to update status';
			return { error: message };
		}
	},

	delete: async (event) => {
		const { org } = await requireOrg(event);
		const { invoiceId } = event.params;

		try {
			await deleteInvoice(invoiceId, org._id);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to delete invoice';
			return { error: message };
		}

		redirect(303, '/invoices');
	}
};
