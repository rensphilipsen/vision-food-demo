import { json, error } from '@sveltejs/kit';
import vision from '@google-cloud/vision';

// ✅ Ensure Node runtime on Vercel
export const config = {
	runtime: 'nodejs24.x'
};

function createVisionClient() {
	const raw = process.env.GCP_SA_JSON;
	if (!raw) throw new Error('Missing GCP_SA_JSON');

	const creds = JSON.parse(raw);

	// Fix escaped newlines (Vercel)
	creds.private_key = creds.private_key.replace(/\\n/g, '\n');

	return new vision.ImageAnnotatorClient({
		credentials: creds,
		projectId: creds.project_id
	});
}

export async function POST({ request }) {
	const client = createVisionClient();
	
	const form = await request.formData();
	const file = form.get('image');

	if (!(file instanceof File)) {
		throw error(400, 'Missing image file');
	}

	const buffer = Buffer.from(await file.arrayBuffer());

	const [result] = await client.labelDetection({
		image: { content: buffer }
	});

	const labels =
		result.labelAnnotations?.map((l) => ({
			name: l.description ?? '',
			score: l.score ?? 0
		})) ?? [];

	return json({
		items: labels
			.filter((l) => l.score >= 0.6)
			.sort((a, b) => b.score - a.score)
			.slice(0, 10)
	});
}
