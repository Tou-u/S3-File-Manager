<script lang="ts">
	import { PUBLIC_BUCKET_URL } from '$env/static/public';
	import { Folder, File } from 'lucide-svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: files = data.files;
	$: folders = data.folders;

	interface Image {
		name: string;
		type: string;
	}

	async function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files) return;

		const fileList = Array.from(target.files);
		let imageList: Image[] = [];

		fileList.forEach((file) => {
			imageList.push({ name: file.name, type: file.type });
		});

		const getPresignedUrlResponse = await fetch('/api/upload', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(imageList)
		});

		const res = (await getPresignedUrlResponse.json()) as Response[];

		const fetches = res.map(async (item, index) => {
			const file = fileList[index];
			await fetch(item.url, {
				method: 'PUT',
				headers: {
					'Content-Type': file.type
				},
				body: file
			});
		});

		await Promise.all(fetches);
	}
</script>

<nav class="grid gap-1 px-2">
	{#if folders}
		{#each folders as folder}
			<a
				class="inline-flex h-9 items-center justify-start gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				href={folder.route}
			>
				<Folder />
				<span>{folder.name}</span>
			</a>
			<hr />
		{/each}
	{/if}
	{#if files}
		{#each files as file}
			<a
				class="inline-flex h-9 items-center justify-start gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				href={`${PUBLIC_BUCKET_URL}${file.route}`}
			>
				<File />
				<span>{file.name}</span>
			</a>
			<hr />
		{/each}
	{/if}
</nav>
