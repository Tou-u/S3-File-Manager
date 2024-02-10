import { R2_BUCKET_NAME } from '$env/static/private';
import { ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '$lib/s3';
import type { PageServerLoad, Actions } from './$types';

interface Folder {
	route: string;
	name: string;
}

interface File {
	route: string;
	name: string;
}

export const load: PageServerLoad = async () => {
	const command = await new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, Delimiter: '/' });
	const response = await S3.send(command);

	const folderResponse = response.CommonPrefixes;
	const filesResponse = response.Contents;

	let folders: Folder[] = [];
	let files: File[] = [];

	if (folderResponse) {
		folders = folderResponse.map((folder) => {
			return { route: folder.Prefix!, name: folder.Prefix!.slice(0, -1) };
		});
	}

	if (filesResponse) {
		files = filesResponse.map((file) => {
			return { route: `/${file.Key!}`, name: file.Key! };
		});
	}

	return { folders, files };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const folderName = formData.get('folder_name') as string;

		const command = await new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: `${folderName}/`,
			Body: '',
			ContentLength: 0
		});
		const response = await S3.send(command);

		return { response };
	}
};
