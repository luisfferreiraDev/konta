import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Organization, Membership } from '$lib/server/models';
import { requireAuth } from '$lib/server/auth-guard';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

const ALLOWED_TYPES: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/svg+xml': 'svg',
	'image/webp': 'webp'
};
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const LOGOS_DIR = path.join(process.cwd(), 'static', 'uploads', 'logos');

async function ensureLogosDir() {
	if (!existsSync(LOGOS_DIR)) {
		await mkdir(LOGOS_DIR, { recursive: true });
	}
}

async function resolveOwner(event: Parameters<RequestHandler>[0]) {
	const user = await requireAuth(event);
	const { orgId } = event.params;

	if (!mongoose.isValidObjectId(orgId)) error(404, 'Organization not found');

	const membership = await Membership.findOne({ userId: user.id, orgId });
	if (!membership) error(404, 'Organization not found');
	if (membership.role !== 'owner') error(403, 'Forbidden');

	return { user, orgId };
}

export const POST: RequestHandler = async (event) => {
	const { orgId } = await resolveOwner(event);

	let formData: FormData;
	try {
		formData = await event.request.formData();
	} catch {
		error(400, 'Invalid form data');
	}

	const file = formData.get('logo');
	if (!file || !(file instanceof File)) {
		error(400, 'No file provided');
	}

	if (!ALLOWED_TYPES[file.type]) {
		error(400, 'Invalid file type. Allowed: PNG, JPG, SVG, WebP');
	}

	if (file.size > MAX_SIZE_BYTES) {
		error(400, 'File too large. Maximum size is 2MB');
	}

	const ext = ALLOWED_TYPES[file.type];
	const filename = `${orgId}.${ext}`;
	const filePath = path.join(LOGOS_DIR, filename);
	const publicPath = `/uploads/logos/${filename}`;

	await ensureLogosDir();
	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(filePath, buffer);

	const org = await Organization.findByIdAndUpdate(
		orgId,
		{ $set: { logo: publicPath } },
		{ new: true }
	);
	if (!org) error(404, 'Organization not found');

	return json(org.toObject());
};

export const DELETE: RequestHandler = async (event) => {
	const { orgId } = await resolveOwner(event);

	const org = await Organization.findById(orgId);
	if (!org) error(404, 'Organization not found');

	// Delete file from disk if it exists
	if (org.logo) {
		const filename = path.basename(org.logo);
		const filePath = path.join(LOGOS_DIR, filename);
		if (existsSync(filePath)) {
			await unlink(filePath).catch(() => {
				// Ignore errors if file is already gone
			});
		}
	}

	const updated = await Organization.findByIdAndUpdate(
		orgId,
		{ $unset: { logo: '' } },
		{ new: true }
	);
	if (!updated) error(404, 'Organization not found');

	return json(updated.toObject());
};
