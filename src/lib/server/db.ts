import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

const client = new MongoClient(MONGODB_URI);

export const db = client.db();
export { client };
