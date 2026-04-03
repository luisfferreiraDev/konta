/**
 * Membership model.
 *
 * Join table between Better Auth users and Organizations. A user may belong
 * to multiple organizations with different roles. The `userId` is a string
 * to match Better Auth's user `_id` type.
 */

import mongoose, { Schema, type Model } from 'mongoose';

export type MembershipRole = 'owner' | 'member';

export interface IMembership {
	_id: mongoose.Types.ObjectId;
	/** Better Auth user _id (string) */
	userId: string;
	orgId: mongoose.Types.ObjectId;
	role: MembershipRole;
	createdAt: Date;
	updatedAt: Date;
}

const membershipSchema = new Schema<IMembership>(
	{
		userId: { type: String, required: true, index: true },
		orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
		role: { type: String, enum: ['owner', 'member'], default: 'member' }
	},
	{ timestamps: true }
);

// A user can only have one role per organization
membershipSchema.index({ userId: 1, orgId: 1 }, { unique: true });

export const Membership: Model<IMembership> =
	(mongoose.models.Membership as Model<IMembership>) ||
	mongoose.model<IMembership>('Membership', membershipSchema);
