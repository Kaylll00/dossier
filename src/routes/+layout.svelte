<script lang="ts">
	import { onMount } from 'svelte';
	import { ensureSession } from '$lib/appwrite';
	import '@fontsource-variable/fraunces';
	import '@fontsource-variable/inter';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	onMount(() => {
		ensureSession();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>The Impossible Room</title>
</svelte:head>

{@render children()}
