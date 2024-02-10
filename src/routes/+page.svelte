<script lang="ts">
	import { PUBLIC_BUCKET_URL } from '$env/static/public';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Folder, File, PlusSquare } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { Input } from '$lib/components/ui/input';

	export let data: PageData;

	$: files = data.files;
	$: folders = data.folders;
</script>

<main class="mx-auto flex max-w-96 flex-col gap-5">
	<form method="post" use:enhance class="flex flex-col justify-center gap-2">
		<Input name="folder_name" placeholder="Nombre de la carpeta" />
		<Button type="submit" class="mx-auto w-2/3">
			<PlusSquare class="mr-2 size-4" />
			Crear directorio
		</Button>
	</form>
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
</main>
