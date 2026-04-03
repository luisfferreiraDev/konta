/**
 * AuditLog model.
 *
 * Immutable log of every user-initiated mutation in the system. Actions
 * follow a "resource.verb" convention (e.g. "invoice.created",
 * "client.updated"). `changes` stores a before/after diff or the full
 * payload depending on the action type. Records are never deleted.
 */

import mongoose, { Schema, type Model } from 'mongoose';

export interface IAuditLog {
	_id: mongoose.Types.ObjectId;
	orgId: mongoose.Types.ObjectId;
	/** Better Auth user _id (string) */
	userId: string;
	/** Dot-namespaced action identifier, e.g. "invoice.created" */
	action: string;
	entityType: string;
	entityId: mongoose.Types.ObjectId;
	changes: unknown;
	timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
	{
		orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
		userId: { type: String, required: true, index: true },
		action: { type: String, required: true },
		entityType: { type: String, required: true },
		entityId: { type: Schema.Types.ObjectId, required: true },
		changes: { type: Schema.Types.Mixed, default: {} },
		timestamp: { type: Date, default: Date.now }
	},
	{
		// No automatic timestamps — timestamp field serves that purpose
		timestamps: false
	}
);

export const AuditLog: Model<IAuditLog> =
	(mongoose.models.AuditLog as Model<IAuditLog>) ||
	mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
