/**
 * Organization model.
 *
 * Represents a business that issues invoices. A single deployment of Konta
 * can host multiple organizations, each with its own clients, invoices, and
 * branding settings. Users are linked to organizations via the Membership
 * model.
 */

import mongoose, { Schema, type Model } from 'mongoose';

export interface ICustomFieldDef {
	key: string;
	label: string;
	type: 'text' | 'textarea' | 'number' | 'date';
}

export interface ICustomFieldDefs {
	invoice: ICustomFieldDef[];
	client: ICustomFieldDef[];
}

export type InvoiceLayout = 'default' | 'minimal' | 'boxed';

export interface ITemplateSettings {
	accentColor: string;
	showQrCode: boolean;
	font: string;
	layout: InvoiceLayout;
}

export interface IOrganization {
	_id: mongoose.Types.ObjectId;
	name: string;
	taxId?: string;
	address?: string;
	country?: string;
	/** URL or local path to the organization's logo */
	logo?: string;
	currency: string;
	defaultTaxRate: number;
	customFieldDefs: ICustomFieldDefs;
	templateSettings: ITemplateSettings;
	createdAt: Date;
	updatedAt: Date;
}

const customFieldDefSchema = new Schema<ICustomFieldDef>(
	{
		key: { type: String, required: true },
		label: { type: String, required: true },
		type: { type: String, enum: ['text', 'textarea', 'number', 'date'], required: true }
	},
	{ _id: false }
);

const organizationSchema = new Schema<IOrganization>(
	{
		name: { type: String, required: true },
		taxId: { type: String },
		address: { type: String },
		country: { type: String },
		logo: { type: String },
		currency: { type: String, default: 'EUR' },
		defaultTaxRate: { type: Number, default: 0 },
		customFieldDefs: {
			invoice: { type: [customFieldDefSchema], default: [] },
			client: { type: [customFieldDefSchema], default: [] }
		},
		templateSettings: {
			accentColor: { type: String, default: '#2563eb' },
			showQrCode: { type: Boolean, default: false },
			font: { type: String, default: 'inter' },
			layout: { type: String, default: 'default' }
		}
	},
	{ timestamps: true }
);

export const Organization: Model<IOrganization> =
	(mongoose.models.Organization as Model<IOrganization>) ||
	mongoose.model<IOrganization>('Organization', organizationSchema);
