/**
 * Client model.
 *
 * Represents a customer that an organization invoices. Clients are scoped to
 * a single organization and cannot be shared across organizations.
 * `customFields` stores values for any fields defined in the organization's
 * `customFieldDefs.client` array.
 */

import mongoose, { Schema, type Model } from 'mongoose';

export interface IClient {
	_id: mongoose.Types.ObjectId;
	orgId: mongoose.Types.ObjectId;
	name: string;
	taxId?: string;
	email?: string;
	address?: string;
	country?: string;
	phone?: string;
	customFields: Map<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
	{
		orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
		name: { type: String, required: true },
		taxId: { type: String },
		email: { type: String },
		address: { type: String },
		country: { type: String },
		phone: { type: String },
		customFields: { type: Map, of: Schema.Types.Mixed, default: {} }
	},
	{ timestamps: true }
);

// Optimizes the sorted list query (filter by org, sort by name)
clientSchema.index({ orgId: 1, name: 1 });

export const Client: Model<IClient> =
	(mongoose.models.Client as Model<IClient>) ||
	mongoose.model<IClient>('Client', clientSchema);
