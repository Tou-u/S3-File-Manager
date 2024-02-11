import { R2_BUCKET_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3 } from '$lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

interface Image {
	name: string;
	type: string;
}

export const POST: RequestHandler = async ({ request }) => {
	const imageList = (await request.json()) as Image[];

	const presignedUrls = await Promise.all(
		imageList.map(async (image) => {
			const { name, type } = image;
			const url = await getSignedUrl(
				S3,
				new PutObjectCommand({
					Bucket: R2_BUCKET_NAME,
					Key: `products/${name}`,
					ContentType: type,
					ACL: 'public-read'
				}),
				{
					expiresIn: 60 * 5 // 5 minutes
				}
			);

			return { url, name };
		})
	);

	return json(presignedUrls);
};
