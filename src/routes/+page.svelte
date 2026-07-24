<script lang="ts">
	import { client } from '$lib/appwrite';

	let pingStatus = $state('Ready to ping Appwrite.');

	async function sendPing() {
		pingStatus = 'Pinging Appwrite...';

		try {
			await client.ping();
			pingStatus = 'Appwrite ping succeeded.';
		} catch (error) {
			console.error('Appwrite ping failed', error);
			pingStatus = 'Appwrite ping failed. Check the console for details.';
		}
	}
</script>

<main>
	<section>
		<p class="eyebrow">Dossier</p>
		<h1>Appwrite is configured</h1>
		<p class="summary">
			This SvelteKit app is connected to the dossier Appwrite project in the Singapore
			region.
		</p>
		<button type="button" onclick={sendPing}>Send a ping</button>
		<p class="status">{pingStatus}</p>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		color: #172018;
		background: #f6f4ef;
	}

	main {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 32px;
	}

	section {
		width: min(100%, 560px);
	}

	.eyebrow {
		margin: 0 0 10px;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0;
		text-transform: uppercase;
		color: #39745b;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 7vw, 4.5rem);
		line-height: 0.95;
		letter-spacing: 0;
	}

	.summary {
		margin: 20px 0 28px;
		font-size: 1.05rem;
		line-height: 1.6;
		color: #4f584f;
	}

	button {
		min-height: 44px;
		border: 0;
		border-radius: 8px;
		padding: 0 18px;
		font: inherit;
		font-weight: 700;
		color: #fff;
		background: #e14d2a;
		cursor: pointer;
	}

	button:hover {
		background: #c83f20;
	}

	.status {
		min-height: 24px;
		margin: 18px 0 0;
		color: #374137;
	}
</style>
