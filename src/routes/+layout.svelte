<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from '$lib/appwrite';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	onMount(() => {
		client.ping().catch((error) => {
			console.error('Appwrite ping failed', error);
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
