/**
 * EmailLog model.
 *
 * Immutable record of every email sent by the system. Used for audit trails,
 * debugging delivery failures, and preventing duplicate sends. Records are
 * never updated — a failed send followed by a retry produces two entries.
 */

import mongoose, { Schema, type Model } from 'mongoose';

export type EmailType = 'invoice' | 'reminder' | 'receipt';
export type EmailStatus = 'sent' | 'failed';

export interface IEmailLog {
	_id: mongoose.Types.ObjectId;
	orgId: mongoose.Types.ObjectId;
	invoiceId: mongoose.Types.ObjectId;
	type: EmailType;
	to: string;
	subject: string;
	sentAt: Date;
	status: EmailStatus;
	error?: string;
}

const emailLogSchema = new Schema<IEmailLog>(
	{
		orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
		invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
		type: { type: String, enum: ['invoice', 'reminder', 'receipt'], required: true },
		to: { type: String, required: true },
		subject: { type: String, required: true },
		sentAt: { type: Date, required: true },
		status: { type: String, enum: ['sent', 'failed'], required: true },
		error: { type: String }
	},
	{
		// No timestamps — sentAt is the canonical timestamp
		timestamps: false
	}
);

export const EmailLog: Model<IEmailLog> =
	(mongoose.models.EmailLog as Model<IEmailLog>) ||
	mongoose.model<IEmailLog>('EmailLog', emailLogSchema);
