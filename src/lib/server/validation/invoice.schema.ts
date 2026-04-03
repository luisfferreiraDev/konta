import { z } from 'zod';

export const lineItemSchema = z.object({
	description: z.string().min(1).max(500),
	qty: z.number().positive(),
	unitPrice: z.number().min(0),
	taxRate: z.number().min(0).max(100),
	total: z.number().min(0)
});

const invoiceStatusSchema = z.enum(['draft', 'scheduled', 'sent', 'paid', 'overdue', 'cancelled']);

export const createInvoiceSchema = z
	.object({
		clientId: z.string().min(1),
		number: z.string().min(1).max(100),
		status: invoiceStatusSchema.default('draft'),
		issueDate: z.coerce.date(),
		dueDate: z.coerce.date(),
		scheduledSendDate: z.coerce.date().nullable().optional(),
		currency: z.string().length(3).default('EUR'),
		taxRate: z.number().min(0).max(100).default(0),
		lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
		paymentUrl: z.string().url().optional().or(z.literal('')),
		customFields: z.record(z.string(), z.unknown()).default({})
	})
	.refine((data) => data.dueDate >= data.issueDate, {
		message: 'Due date must be on or after the issue date',
		path: ['dueDate']
	});

export const updateInvoiceSchema = createInvoiceSchema.partial().omit({ lineItems: true }).extend({
	lineItems: z.array(lineItemSchema).min(1).optional()
});

export const markPaidSchema = z.object({
	paidAt: z.coerce.date().default(() => new Date()),
	paymentMethod: z.string().max(100).optional()
});

export type LineItemInput = z.infer<typeof lineItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type MarkPaidInput = z.infer<typeof markPaidSchema>;
