import type { RequestHandler } from './$types';
import { requireOrg } from '$lib/server/auth-guard';
import { renderInvoiceHTML } from '$lib/server/pdf/invoice-template';
import { INVOICE_LAYOUTS } from '$lib/server/validation/organization.schema';
import type { InvoiceLayout } from '$lib/server/models/organization.model';
import type { IInvoice } from '$lib/server/models/invoice.model';
import type { IClient } from '$lib/server/models/client.model';
import type { IOrganization } from '$lib/server/models/organization.model';
import mongoose from 'mongoose';

const MOCK_CLIENT: IClient = {
	_id: new mongoose.Types.ObjectId(),
	orgId: new mongoose.Types.ObjectId(),
	name: 'Acme Corporation',
	taxId: 'EU123456789',
	email: 'billing@acme.example',
	address: '742 Evergreen Terrace, Springfield',
	country: 'United States',
	phone: '+1 555 000 1234',
	customFields: new Map(),
	createdAt: new Date(),
	updatedAt: new Date()
};

function buildMockInvoice(orgId: mongoose.Types.ObjectId, currency: string): IInvoice & { clientId: IClient } {
	const now = new Date();
	const issueDate = new Date(now.getFullYear(), now.getMonth(), 1);
	const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

	const lineItems = [
		{ description: 'Product Design — Monthly Retainer', qty: 1, unitPrice: 4800, taxRate: 0.2, total: 4800 },
		{ description: 'Frontend Development (40 hrs)', qty: 40, unitPrice: 95, taxRate: 0.2, total: 3800 },
		{ description: 'Hosting & Infrastructure', qty: 1, unitPrice: 120, taxRate: 0.2, total: 120 }
	];
	const subtotal = lineItems.reduce((s, i) => s + i.total, 0);
	const taxAmount = subtotal * 0.2;
	const totalAmount = subtotal + taxAmount;

	const base: Omit<IInvoice, 'clientId'> & { clientId: IClient } = {
		_id: new mongoose.Types.ObjectId(),
		orgId,
		clientId: MOCK_CLIENT,
		number: 'INV-2024-042',
		status: 'sent',
		issueDate,
		dueDate,
		scheduledSendDate: null,
		sentDate: issueDate,
		currency,
		taxRate: 0.2,
		lineItems,
		subtotal,
		taxAmount,
		totalAmount,
		paymentMethod: 'Bank Transfer — IBAN DE89 3704 0044 0532 0130 00',
		paymentUrl: undefined,
		paidAt: null,
		lastReminderSent: null,
		reminderHistory: [],
		customFields: new Map(),
		createdAt: now,
		updatedAt: now
	};

	return base as IInvoice & { clientId: IClient };
}

export const GET: RequestHandler = async (event) => {
	const { org } = await requireOrg(event);

	const params = event.url.searchParams;
	const rawLayout = params.get('layout') ?? 'default';
	const layout: InvoiceLayout = (INVOICE_LAYOUTS as readonly string[]).includes(rawLayout)
		? (rawLayout as InvoiceLayout)
		: 'default';
	const accentColor = /^#[0-9a-fA-F]{6}$/.test(params.get('accentColor') ?? '')
		? (params.get('accentColor') as string)
		: (org.templateSettings?.accentColor ?? '#2563eb');
	const font = params.get('font') || org.templateSettings?.font || 'inter';

	// Merge preview settings into the real org so name/logo/address render correctly
	const previewOrg: IOrganization = {
		...org,
		templateSettings: { ...org.templateSettings, accentColor, font, layout }
	};

	const invoice = buildMockInvoice(org._id, org.currency ?? 'EUR');

	const html = renderInvoiceHTML({ invoice, organization: previewOrg, preview: true });

	return new Response(html, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' }
	});
};
