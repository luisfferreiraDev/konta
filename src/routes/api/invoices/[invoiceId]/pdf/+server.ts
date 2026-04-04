import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { Invoice } from '$lib/server/models';
import { Organization } from '$lib/server/models';
import { renderInvoiceHTML } from '$lib/server/pdf/invoice-template';
import { generateInvoicePDF } from '$lib/server/pdf/pdf-service';
import mongoose from 'mongoose';
import type { IClient } from '$lib/server/models/client.model';
import type { IInvoice } from '$lib/server/models/invoice.model';

export const GET: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);
	const { invoiceId } = event.params;

	if (!mongoose.isValidObjectId(invoiceId)) {
		error(400, 'Invalid invoice ID');
	}

	const invoice = await Invoice.findOne({ _id: invoiceId, orgId: org._id })
		.populate('clientId')
		.lean<IInvoice & { clientId: IClient }>();

	if (!invoice) {
		error(404, 'Invoice not found');
	}

	const organization = await Organization.findById(org._id).lean();
	if (!organization) {
		error(404, 'Organization not found');
	}

	let pdf: Buffer;
	try {
		const html = renderInvoiceHTML({ invoice, organization });
		pdf = await generateInvoicePDF(html, invoice.number);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'PDF generation failed';
		error(500, message);
	}

	const filename = `${invoice.number.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`;

	return new Response(pdf, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="${filename}"`,
			'Content-Length': String(pdf.length)
		}
	});
};
