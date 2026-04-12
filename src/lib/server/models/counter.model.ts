import mongoose, { Schema } from 'mongoose';

export interface ICounter {
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
