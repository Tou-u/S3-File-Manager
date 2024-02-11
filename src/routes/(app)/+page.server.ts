import { R2_BUCKET_NAME } from '$env/static/private';
import { ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '$lib/s3';
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

interface Folder {
	route: string;
	name: string;
}

interface File {
	route: string;
	name: string;
}

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) return redirect(302, '/login');

	const command = await new ListObjectsV2Command({
		Bucket: R2_BUCKET_NAME,
		Prefix: `${user.id}/`,
		Delimiter: `/`
	});
	const response = await S3.send(command);

	const folderResponse = response.CommonPrefixes;
	const filesResponse = response.Contents;

	let folders: Folder[] = [];
	let files: File[] = [];

	if (folderResponse) {
		folders = folderResponse.map((folder) => {
			const prefix = folder.Prefix!.replace(`${user.id}/`, '');
			return { route: prefix, name: prefix.slice(0, -1) };
		});
	}

	if (filesResponse) {
		files = filesResponse.map((file) => {
			const prefix = file.Key!.replace(`${user.id}/`, '');
			return { route: `/${file.Key!}`, name: prefix };
		});
	}

	return { folders, files, user: locals.user };
};

export const actions: Actions = {
	createFolder: async ({ request, locals }) => {
		const userId = locals.user?.id;

		const formData = await request.formData();
		const folderName = formData.get('folder_name') as string;

		const command = await new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: `${userId}/${folderName}/`,
			Body: '',
			ContentLength: 0
		});
		const response = await S3.send(command);

		return response;
	},
	logout: async ({ locals, cookies }) => {
		if (!locals.session) {
			return fail(401);
		}
		const lucia = locals.lucia;
		await lucia.invalidateSession(locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		return redirect(302, '/login');
	}
};
