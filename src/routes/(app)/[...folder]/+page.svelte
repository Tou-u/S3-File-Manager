<script lang="ts">
	import type { PageData } from './$types';
	import { PUBLIC_BUCKET_URL } from '$env/static/public';
	import { page } from '$app/stores';
	import { Folder, File, FolderOutput } from 'lucide-svelte';
	import { previousFolder } from '$lib/prefixes';

	export let data: PageData;
	$: folders = data.folders;
	$: files = data.files;
	$: previousPath = previousFolder($page.url.pathname);
</script>

<nav class="grid gap-1 px-2">
	<a
		href={previousPath}
		class="inline-flex h-9 items-center justify-start gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
	>
		<FolderOutput />
		...
	</a>
	<hr />
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
