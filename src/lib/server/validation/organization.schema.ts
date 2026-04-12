import { z } from 'zod';

export const customFieldDefSchema = z.object({
	key: z
		.string()
		.min(1)
		.regex(/^[a-z_][a-z0-9_]*$/, 'Key must be snake_case (lowercase letters, digits, underscores)'),
	label: z.string().min(1).max(100),
	type: z.enum(['text', 'textarea', 'number', 'date'])
});

export const createOrganizationSchema = z.object({
	name: z.string().min(1).max(200),
	taxId: z.string().max(100).optional(),
	address: z.string().max(500).optional(),
	country: z.string().max(100).optional(),
	logo: z.string().url().optional(),
	currency: z.string().length(3).default('EUR'),
	defaultTaxRate: z.number().min(0).max(100).default(0)
});

export const updateOrganizationSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	taxId: z.string().max(100).optional(),
	address: z.string().max(500).optional(),
	country: z.string().max(100).optional(),
	logo: z.string().url().optional(),
	currency: z.string().length(3).optional(),
	defaultTaxRate: z.number().min(0).max(100).optional()
});

export const INVOICE_LAYOUTS = ['default', 'minimal', 'boxed'] as const;
export type InvoiceLayout = (typeof INVOICE_LAYOUTS)[number];

export const templateSettingsSchema = z.object({
	accentColor: z
		.string()
		.regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
		.default('#2563eb'),
	showQrCode: z.boolean().default(false),
	font: z.string().min(1).default('inter'),
	layout: z.enum(INVOICE_LAYOUTS).default('default')
});

export const updateTemplateSettingsSchema = z.object({
	accentColor: z
		.string()
		.regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
		.optional(),
	showQrCode: z.boolean().optional(),
	font: z.string().min(1).optional(),
	layout: z.enum(INVOICE_LAYOUTS).optional()
});

export const customFieldDefsSchema = z.object({
	invoice: z.array(customFieldDefSchema).default([]),
	client: z.array(customFieldDefSchema).default([])
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type TemplateSettingsInput = z.infer<typeof templateSettingsSchema>;
export type UpdateTemplateSettingsInput = z.infer<typeof updateTemplateSettingsSchema>;
export type CustomFieldDefsInput = z.infer<typeof customFieldDefsSchema>;
export type CustomFieldDefInput = z.infer<typeof customFieldDefSchema>;
