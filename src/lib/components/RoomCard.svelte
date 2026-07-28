<script lang="ts">
	import type { Room } from '$lib/types';
	import { BACKGROUND_PRESETS } from '$lib/theme/backgrounds';

	let {
		room,
		objectCount
	}: {
		room: Room;
		objectCount: number;
	} = $props();

	const preset = $derived(BACKGROUND_PRESETS.find((p) => p.id === room.background));
</script>

<div class="room-card grain">
	<div
		class="preview"
		style="background: {preset?.css ?? BACKGROUND_PRESETS[0].css}"
	>
		<span class="object-count">{objectCount} object{objectCount !== 1 ? 's' : ''}</span>
	</div>
	<div class="info">
		<h3 class="name">{room.name}</h3>
		<div class="actions">
			<a href="/room/{room.$id}" class="enter-link">Enter</a>
			<a href="/builder/{room.$id}" class="edit-link">Edit</a>
		</div>
	</div>
</div>

<style>
	.room-card {
		border-radius: 1rem;
		overflow: hidden;
		background: #17151f;
		border: 1px solid rgba(243, 237, 227, 0.1);
		transition: border-color 0.2s;
	}
	.room-card:hover {
		border-color: rgba(243, 237, 227, 0.2);
	}

	.preview {
		height: 180px;
		display: flex;
		align-items: flex-end;
		padding: 0.75rem;
		position: relative;
	}

	.object-count {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: rgba(243, 237, 227, 0.5);
		background: rgba(14, 13, 22, 0.6);
		padding: 0.25rem 0.625rem;
		border-radius: 0.375rem;
	}

	.info {
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.name {
		font-family: 'Fraunces Variable', serif;
		font-size: 1.125rem;
		font-weight: 300;
		color: #f3ede3;
		margin: 0;
	}

	.actions {
		display: flex;
		gap: 1rem;
	}

	.enter-link,
	.edit-link {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.8125rem;
		font-weight: 500;
		text-decoration: none;
		transition: color 0.2s;
	}

	.enter-link {
		color: #d9a35b;
	}
	.enter-link:hover {
		color: #e4b473;
	}

	.edit-link {
		color: rgba(243, 237, 227, 0.5);
	}
	.edit-link:hover {
		color: rgba(243, 237, 227, 0.8);
	}
</style>
