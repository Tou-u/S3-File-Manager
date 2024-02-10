<script lang="ts">
	import 'filepond/dist/filepond.min.css';
	import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
	import {
		registerPlugin,
		create,
		type FilePond,
		type FilePondErrorDescription,
		type FilePondFile
	} from 'filepond';
	import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
	import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
	import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
	import { onMount } from 'svelte';

	interface Image {
		name: string;
		type: string;
	}

	interface Response {
		name: string;
		url: string;
	}

	interface R2 {
		name: string;
	}

	let pond: FilePond;
	let toDeleteFromR2: R2[] = [];

	onMount(() => {
		registerPlugin(
			FilePondPluginImageExifOrientation,
			FilePondPluginImagePreview,
			FilePondPluginFileValidateType
		);
		const inputElement = document.querySelector('input[type="file"]');

		if (inputElement) {
			pond = create(inputElement, { credits: false, acceptedFileTypes: ['image/*'] });
			pond.setOptions({
				server: {
					load: (source, load) => {
						const myRequest = new Request(source);
						fetch(myRequest).then(function (response) {
							response.blob().then(function (myBlob) {
								load(myBlob);
							});
						});
					}
				},
				files: [
					{
						source:
							'https://pub-0a2a08ef42ff4b9e9967a7a66dbf2a74.r2.dev/products%2Fasustufb460plus.webp',
						options: {
							type: 'local'
						}
					}
				],
				allowMultiple: true,
				allowReorder: true,
				onremovefile: removeImage
			});
		}
	});

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

	function removeImage(error: FilePondErrorDescription | null, file: FilePondFile) {
		console.log(file.serverId);
		if (file.serverId !== null) {
			toDeleteFromR2.push({ name: file.filename });
		}
	}

	function getItems() {
		const files = Array.from(pond.getFiles());

		const newFiles = files.filter((file) => file.serverId === null);
	}
</script>

<main>
	<h1>image uploader</h1>
	<div style="width: 300px;">
		<input type="file" />
	</div>
	<hr />
	<button on:click={getItems}>Upload Images</button>
</main>
