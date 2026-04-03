import { z } from 'zod';

export const createClientSchema = z.object({
	name: z.string().min(1).max(200),
	taxId: z.string().max(100).optional(),
	email: z.string().email().optional().or(z.literal('')),
	address: z.string().max(500).optional(),
	country: z.string().max(100).optional(),
	phone: z.string().max(50).optional(),
	customFields: z.record(z.string(), z.unknown()).default({})
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
