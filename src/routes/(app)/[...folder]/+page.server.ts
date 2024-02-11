import { R2_BUCKET_NAME } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';
import { formatFile, formatFolder } from '$lib/prefixes';
import { S3 } from '$lib/s3';
import { ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { redirect } from '@sveltejs/kit';

interface Folder {
	route: string;
	name: string;
}

interface File {
	route: string;
	name: string;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) return redirect(302, '/login');

	const path = `${user.id}/${params.folder}/`;

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
				const folderName = formatFolder(folder.Prefix!);
				const prefix = folder.Prefix!.replace(`${user.id}/`, '');
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
	default: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const folderName = formData.get('folder_name') as string;

		const userId = locals.user?.id;

		const fullPath = `${userId}/${params.folder}/${folderName}/`;

		const command = await new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: fullPath,
			ContentLength: 0
		});
		const response = await S3.send(command);

		return { response };
	}
};
