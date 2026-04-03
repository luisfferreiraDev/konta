import { z } from 'zod';

// Line item schema - total is calculated server-side, not provided by client
export const lineItemSchema = z.object({
	description: z.string().min(1, 'Description is required').max(500),
	qty: z.number().min(1, 'Quantity must be at least 1'),
	unitPrice: z.number().min(0, 'Unit price must be non-negative'),
	taxRate: z.number().min(0).max(1).default(0) // Decimal format (0.21 for 21%), defaults to 0
});

const invoiceStatusSchema = z.enum(['draft', 'scheduled', 'sent', 'paid', 'overdue', 'cancelled']);

// Create invoice schema - number is auto-generated server-side
export const createInvoiceSchema = z
	.object({
		clientId: z.string().min(1, 'Client is required'),
		issueDate: z.coerce.date(),
		dueDate: z.coerce.date(),
		lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
		taxRate: z.number().min(0).max(1).optional(), // Decimal format (0.21 for 21%)
		currency: z.string().length(3).optional(),
		status: invoiceStatusSchema.optional(),
		scheduledSendDate: z.coerce.date().nullable().optional(),
		paymentUrl: z.string().url().optional().or(z.literal('')),
		customFields: z.record(z.string(), z.unknown()).optional()
	})
	.refine((data) => data.dueDate >= data.issueDate, {
		message: 'Due date must be on or after the issue date',
		path: ['dueDate']
	});

// Update invoice schema - all fields optional for partial updates
export const updateInvoiceSchema = z.object({
	clientId: z.string().min(1).optional(),
	issueDate: z.coerce.date().optional(),
	dueDate: z.coerce.date().optional(),
	scheduledSendDate: z.coerce.date().nullable().optional(),
	currency: z.string().length(3).optional(),
	taxRate: z.number().min(0).max(1).optional(),
	lineItems: z.array(lineItemSchema).min(1).optional(),
	paymentUrl: z.string().url().optional().or(z.literal('')),
	customFields: z.record(z.string(), z.unknown()).optional()
});

// Status update schema
export const updateStatusSchema = z.object({
	status: invoiceStatusSchema
});

export const markPaidSchema = z.object({
	paidAt: z.coerce.date().default(() => new Date()),
	paymentMethod: z.string().max(100).optional()
});

export type LineItemInput = z.infer<typeof lineItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type MarkPaidInput = z.infer<typeof markPaidSchema>;
