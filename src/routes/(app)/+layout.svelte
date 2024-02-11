<script lang="ts">
	import '../../app.pcss';
	import type { LayoutData } from './$types';
	import { enhance } from '$app/forms';
	import { Sun, Moon, FolderPlus, Upload } from 'lucide-svelte';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';

	export let data: LayoutData;
	$: user = data.user;
</script>

<ModeWatcher />
<header class="sticky top-0 backdrop-blur-sm">
	<section class="mx-auto flex max-w-screen-2xl items-center justify-between p-2">
		<Button on:click={toggleMode} variant="outline" size="icon" class="size-9">
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
		<div class="flex items-center gap-2">
			<p>Hola {user?.username} 🖐</p>
			<form method="post" action="/?/logout" use:enhance>
				<Button size="sm" variant="outline" type="submit">Cerrar Sesión</Button>
			</form>
		</div>
	</section>
	<section class="mx-auto flex max-w-screen-2xl justify-end gap-2 px-2 pb-2">
		<Button size="icon">
			<FolderPlus />
		</Button>

		<!-- <form method="post" action="/?/createFolder" use:enhance class="grid items-start gap-4 px-4">
			<div class="grid gap-2">
				<Label for="folder_name">Nuevo directorio</Label>
				<Input id="folder_name" name="folder_name" placeholder="Ingresa el nombre" />
			</div>

			<Button type="submit" class="w-full">Crear directorio</Button>
		</form> -->

		<Button size="icon">
			<Upload />
		</Button>
	</section>
	<hr />
</header>
<main class="mx-auto max-w-screen-2xl p-2">
	<section>
		<slot />
	</section>
</main>
