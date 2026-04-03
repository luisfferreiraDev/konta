import mongoose, { Schema, type Document } from 'mongoose';

export interface ICounter extends Document {
	_id: string;
	seq: number;
}

const CounterSchema = new Schema<ICounter>({
	_id: { type: String, required: true },
	seq: { type: Number, default: 0 }
});

export const Counter =
	(mongoose.models.Counter as mongoose.Model<ICounter>) ||
	mongoose.model<ICounter>('Counter', CounterSchema);
