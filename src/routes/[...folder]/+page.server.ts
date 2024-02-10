import { R2_BUCKET_NAME } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';
import { formatFile, formatFolder } from '$lib/prefixes';
import { S3 } from '$lib/s3';
import { ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';

interface Folder {
	route: string;
	name: string;
}

interface File {
	route: string;
	name: string;
}

export const load: PageServerLoad = async ({ params }) => {
	const path = `${params.folder}/`;

	try {
		const command = await new ListObjectsV2Command({
			Bucket: R2_BUCKET_NAME,
			Prefix: path,
			Delimiter: '/'
		});
		const response = await S3.send(command);

		const folderResponse = response.CommonPrefixes;
		const filesResponse = response.Contents;

		let folders: Folder[] = [];
		let files: File[] = [];

		if (folderResponse) {
			folders = folderResponse.map((folder) => {
				const prefix = folder.Prefix!;
				const folderName = formatFolder(prefix);
				return { route: `/${prefix}`, name: folderName };
			});
		}

		if (filesResponse) {
			files = filesResponse
				.filter((files) => !files.Key?.endsWith('/'))
				.map((file) => {
					const key = file.Key!;
					const fileName = formatFile(key);
					return { route: `/${key}`, name: fileName };
				});
		}

		return { folders, files };
	} catch (error) {
		console.log(error);
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const folderName = formData.get('folder_name') as string;

		const fullPath = `${params.folder}/${folderName}/`;

		const command = await new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: fullPath,
			ContentLength: 0
		});
		const response = await S3.send(command);

		return { response };
	}
};
