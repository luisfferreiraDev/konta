import { z } from 'zod';

const customFieldDefSchema = z.object({
	key: z.string().min(1).regex(/^[a-z_][a-z0-9_]*$/, 'Key must be snake_case'),
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

export const templateSettingsSchema = z.object({
	accentColor: z
		.string()
		.regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
		.default('#2563eb'),
	showQrCode: z.boolean().default(false),
	font: z.string().min(1).default('inter')
});

export const customFieldDefsSchema = z.object({
	invoice: z.array(customFieldDefSchema).default([]),
	client: z.array(customFieldDefSchema).default([])
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type TemplateSettingsInput = z.infer<typeof templateSettingsSchema>;
export type CustomFieldDefsInput = z.infer<typeof customFieldDefsSchema>;
