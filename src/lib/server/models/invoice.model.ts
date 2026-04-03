/**
 * Invoice model.
 *
 * Core financial document. Totals (subtotal, taxAmount, totalAmount) should
 * be computed from lineItems before saving — they are stored denormalized for
 * fast reporting queries. `customFields` stores values for fields defined in
 * the organization's `customFieldDefs.invoice` array.
 */

import mongoose, { Schema, type Model } from 'mongoose';

export type InvoiceStatus = 'draft' | 'scheduled' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface ILineItem {
	description: string;
	qty: number;
	unitPrice: number;
	taxRate: number;
	total: number;
}

export interface IReminderHistoryEntry {
	date: Date;
	type: string;
	email: string;
}

export interface IInvoice {
	_id: mongoose.Types.ObjectId;
	orgId: mongoose.Types.ObjectId;
	clientId: mongoose.Types.ObjectId;
	number: string;
	status: InvoiceStatus;
	issueDate: Date;
	dueDate: Date;
	scheduledSendDate?: Date | null;
	currency: string;
	taxRate: number;
	lineItems: ILineItem[];
	subtotal: number;
	taxAmount: number;
	totalAmount: number;
	paymentUrl?: string;
	paidAt?: Date | null;
	paymentMethod?: string;
	lastReminderSent?: Date | null;
	reminderHistory: IReminderHistoryEntry[];
	customFields: Map<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}

const lineItemSchema = new Schema<ILineItem>(
	{
		description: { type: String, required: true },
		qty: { type: Number, required: true },
		unitPrice: { type: Number, required: true },
		taxRate: { type: Number, required: true },
		total: { type: Number, required: true }
	},
	{ _id: false }
);

const reminderHistorySchema = new Schema<IReminderHistoryEntry>(
	{
		date: { type: Date, required: true },
		type: { type: String, required: true },
		email: { type: String, required: true }
	},
	{ _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
	{
		orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
		clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
		number: { type: String, required: true },
		status: {
			type: String,
			enum: ['draft', 'scheduled', 'sent', 'paid', 'overdue', 'cancelled'],
			default: 'draft'
		},
		issueDate: { type: Date, required: true },
		dueDate: { type: Date, required: true },
		scheduledSendDate: { type: Date, default: null },
		currency: { type: String, default: 'EUR' },
		taxRate: { type: Number, default: 0 },
		lineItems: { type: [lineItemSchema], default: [] },
		subtotal: { type: Number, required: true },
		taxAmount: { type: Number, required: true },
		totalAmount: { type: Number, required: true },
		paymentUrl: { type: String },
		paidAt: { type: Date, default: null },
		paymentMethod: { type: String },
		lastReminderSent: { type: Date, default: null },
		reminderHistory: { type: [reminderHistorySchema], default: [] },
		customFields: { type: Map, of: Schema.Types.Mixed, default: {} }
	},
	{ timestamps: true }
);

// Optimizes queries that filter by org + status and sort by date (dashboard, reports)
invoiceSchema.index({ orgId: 1, status: 1, issueDate: 1 });

export const Invoice: Model<IInvoice> =
	(mongoose.models.Invoice as Model<IInvoice>) ||
	mongoose.model<IInvoice>('Invoice', invoiceSchema);
