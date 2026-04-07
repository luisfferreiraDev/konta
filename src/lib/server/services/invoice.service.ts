/**
 * Invoice Service Layer
 *
 * Centralized business logic for invoice operations.
 * Used by both API routes and form actions to ensure consistency.
 */

import mongoose from 'mongoose';
import { Invoice, Client } from '$lib/server/models';
import type { IInvoice, InvoiceStatus, ILineItem } from '$lib/server/models/invoice.model';
import { generateInvoiceNumber } from '$lib/server/utils/invoice-number';
import { calculateInvoiceTotals } from '$lib/server/utils/invoice-calculations';

export interface CreateInvoiceData {
	clientId: string;
	issueDate: Date;
	dueDate: Date;
	scheduledSendDate?: Date | null;
	currency?: string;
	taxRate?: number;
	lineItems: Array<{
		description: string;
		qty: number;
		unitPrice: number;
		taxRate?: number;
	}>;
	paymentUrl?: string;
	customFields?: Record<string, unknown>;
	status?: string;
}

export interface UpdateInvoiceData {
	clientId?: string;
	issueDate?: Date;
	dueDate?: Date;
	scheduledSendDate?: Date | null;
	currency?: string;
	taxRate?: number;
	lineItems?: Array<{
		description: string;
		qty: number;
		unitPrice: number;
		taxRate?: number;
	}>;
	paymentUrl?: string;
	customFields?: Record<string, unknown>;
}

/**
 * Create a new invoice
 */
export async function createInvoice(
	orgId: mongoose.Types.ObjectId,
	data: CreateInvoiceData,
	orgDefaults: { currency: string; defaultTaxRate: number }
): Promise<IInvoice> {
	// Verify the client belongs to this org
	if (!mongoose.isValidObjectId(data.clientId)) {
		throw new Error('Invalid client ID');
	}

	const client = await Client.findOne({ _id: data.clientId, orgId });
	if (!client) {
		throw new Error('Client not found or does not belong to your organization');
	}

	// Generate invoice number
	const invoiceNumber = await generateInvoiceNumber(orgId);

	// Use org defaults if not provided
	const currency = data.currency || orgDefaults.currency;
	const taxRate = data.taxRate ?? orgDefaults.defaultTaxRate;

	// Calculate totals server-side
	const calculated = calculateInvoiceTotals(data.lineItems, taxRate);

	// Create invoice
	const invoice = await Invoice.create({
		orgId,
		clientId: data.clientId,
		number: invoiceNumber,
		status: data.status || 'draft',
		issueDate: data.issueDate,
		dueDate: data.dueDate,
		scheduledSendDate: data.scheduledSendDate,
		currency,
		taxRate,
		lineItems: calculated.lineItems,
		subtotal: calculated.subtotal,
		taxAmount: calculated.taxAmount,
		totalAmount: calculated.totalAmount,
		paymentUrl: data.paymentUrl,
		customFields: data.customFields || {}
	});

	return invoice;
}

/**
 * Update an existing invoice (only draft or scheduled)
 */
export async function updateInvoice(
	invoiceId: string,
	orgId: mongoose.Types.ObjectId,
	data: UpdateInvoiceData
): Promise<IInvoice> {
	if (!mongoose.isValidObjectId(invoiceId)) {
		throw new Error('Invalid invoice ID');
	}

	// Find the invoice
	const invoice = await Invoice.findOne({ _id: invoiceId, orgId });
	if (!invoice) {
		throw new Error('Invoice not found');
	}

	// Only allow editing draft or scheduled invoices
	if (invoice.status !== 'draft' && invoice.status !== 'scheduled') {
		throw new Error('Cannot edit a sent/paid/overdue/cancelled invoice');
	}

	// If clientId is being changed, verify the new client belongs to this org
	if (data.clientId) {
		if (!mongoose.isValidObjectId(data.clientId)) {
			throw new Error('Invalid client ID');
		}

		const client = await Client.findOne({ _id: data.clientId, orgId });
		if (!client) {
			throw new Error('Client not found or does not belong to your organization');
		}

		invoice.clientId = new mongoose.Types.ObjectId(data.clientId);
	}

	// Validate due date vs issue date after applying potential changes
	const effectiveIssueDate = data.issueDate ?? invoice.issueDate;
	const effectiveDueDate = data.dueDate ?? invoice.dueDate;
	if (effectiveDueDate < effectiveIssueDate) {
		throw new Error('Due date must be on or after the issue date');
	}

	// Update basic fields
	if (data.issueDate) invoice.issueDate = data.issueDate;
	if (data.dueDate) invoice.dueDate = data.dueDate;
	if (data.scheduledSendDate !== undefined) invoice.scheduledSendDate = data.scheduledSendDate;
	if (data.currency) invoice.currency = data.currency;
	if (data.paymentUrl !== undefined) invoice.paymentUrl = data.paymentUrl;
	if (data.customFields !== undefined) {
		invoice.customFields = new Map(Object.entries(data.customFields));
	}

	// If lineItems or taxRate are updated, recalculate totals
	if (data.lineItems || data.taxRate !== undefined) {
		const lineItems = data.lineItems || invoice.lineItems;
		const taxRate = data.taxRate ?? invoice.taxRate;

		const calculated = calculateInvoiceTotals(lineItems, taxRate);

		// Ensure all line items have taxRate set
		invoice.lineItems = calculated.lineItems.map((item) => ({
			...item,
			taxRate: item.taxRate ?? taxRate
		})) as ILineItem[];
		invoice.taxRate = taxRate;
		invoice.subtotal = calculated.subtotal;
		invoice.taxAmount = calculated.taxAmount;
		invoice.totalAmount = calculated.totalAmount;
	}

	await invoice.save();

	return invoice;
}

/**
 * Delete an invoice (only draft or cancelled)
 */
export async function deleteInvoice(
	invoiceId: string,
	orgId: mongoose.Types.ObjectId
): Promise<void> {
	if (!mongoose.isValidObjectId(invoiceId)) {
		throw new Error('Invalid invoice ID');
	}

	const invoice = await Invoice.findOne({ _id: invoiceId, orgId });
	if (!invoice) {
		throw new Error('Invoice not found');
	}

	// Only allow deleting draft or cancelled invoices
	if (invoice.status !== 'draft' && invoice.status !== 'cancelled') {
		throw new Error('Can only delete draft or cancelled invoices');
	}

	await invoice.deleteOne();
}

/**
 * Valid status transitions map
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
	draft: ['scheduled', 'sent', 'cancelled'],
	scheduled: ['sent', 'draft', 'cancelled'],
	sent: ['paid', 'overdue', 'cancelled'],
	overdue: ['paid', 'cancelled'],
	paid: [], // Terminal state
	cancelled: [] // Terminal state
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardSummary {
	total: number;
	draft: number;
	/** Invoices awaiting payment (sent + overdue) */
	open: number;
	overdue: number;
}

export interface DashboardInvoiceRow {
	_id: string;
	number: string;
	clientName: string;
	totalAmount: number;
	currency: string;
	status: InvoiceStatus;
	dueDate: string;
	issueDate: string;
}

/**
 * Fetch summary stats and invoice lists for the dashboard.
 * All queries are scoped to the given org and run in parallel.
 */
export async function getDashboardStats(orgId: mongoose.Types.ObjectId): Promise<{
	summary: DashboardSummary;
	recentInvoices: DashboardInvoiceRow[];
	overdueInvoices: DashboardInvoiceRow[];
}> {
	type ClientRef = { _id: mongoose.Types.ObjectId; name: string };

	const [statusCounts, recentDocs, overdueDocs] = await Promise.all([
		Invoice.aggregate<{ _id: string; count: number }>([
			{ $match: { orgId } },
			{ $group: { _id: '$status', count: { $sum: 1 } } }
		]),
		Invoice.find({ orgId })
			.sort({ createdAt: -1 })
			.limit(5)
			.populate('clientId', 'name')
			.lean(),
		Invoice.find({ orgId, status: 'overdue' })
			.sort({ dueDate: 1 })
			.populate('clientId', 'name')
			.lean()
	]);

	const countMap: Record<string, number> = {};
	for (const { _id, count } of statusCounts) countMap[_id] = count;

	const summary: DashboardSummary = {
		total: Object.values(countMap).reduce((a, b) => a + b, 0),
		draft: countMap['draft'] ?? 0,
		open: (countMap['sent'] ?? 0) + (countMap['overdue'] ?? 0),
		overdue: countMap['overdue'] ?? 0
	};

	function toRow(doc: (typeof recentDocs)[number]): DashboardInvoiceRow {
		const client = doc.clientId as unknown as ClientRef | null;
		return {
			_id: String(doc._id),
			number: doc.number,
			clientName: client?.name ?? 'Unknown',
			totalAmount: doc.totalAmount,
			currency: doc.currency,
			status: doc.status,
			dueDate: doc.dueDate.toISOString(),
			issueDate: doc.issueDate.toISOString()
		};
	}

	return {
		summary,
		recentInvoices: recentDocs.map(toRow),
		overdueInvoices: overdueDocs.map(toRow)
	};
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update invoice status with automatic date tracking
 */
export async function updateInvoiceStatus(
	invoiceId: string,
	orgId: mongoose.Types.ObjectId,
	newStatus: string
): Promise<IInvoice> {
	if (!mongoose.isValidObjectId(invoiceId)) {
		throw new Error('Invalid invoice ID');
	}

	const invoice = await Invoice.findOne({ _id: invoiceId, orgId });
	if (!invoice) {
		throw new Error('Invoice not found');
	}

	const currentStatus = invoice.status;

	// Validate status transition
	const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
	if (!allowedTransitions.includes(newStatus)) {
		throw new Error(`Invalid status transition from "${currentStatus}" to "${newStatus}"`);
	}

	// Update status
	invoice.status = newStatus as InvoiceStatus;

	// Automatically set date fields based on status
	if (newStatus === 'paid' && !invoice.paidAt) {
		invoice.paidAt = new Date();
	}

	if (newStatus === 'sent' && !invoice.sentDate) {
		invoice.sentDate = new Date();
	}

	await invoice.save();

	return invoice;
}
