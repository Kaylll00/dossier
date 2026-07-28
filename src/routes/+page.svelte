<script lang="ts">
	import { onMount } from 'svelte';
	import { listRooms, createRoom } from '$lib/appwrite/rooms';
	import { listObjects } from '$lib/appwrite/objects';
	import type { Room } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	import RoomCard from '$lib/components/RoomCard.svelte';

	let rooms = $state<Room[]>([]);
	let objectCounts = $state<Record<string, number>>({});
	let loading = $state(true);

	let showCreateModal = $state(false);
	let newRoomName = $state('');
	let creating = $state(false);

	onMount(async () => {
		await loadRooms();
	});

	async function loadRooms() {
		loading = true;
		try {
			const allRooms = await listRooms();
			rooms = allRooms;
			const counts: Record<string, number> = {};
			for (const room of allRooms) {
				try {
					const objs = await listObjects(room.$id);
					counts[room.$id] = objs.length;
				} catch {
					counts[room.$id] = 0;
				}
			}
			objectCounts = counts;
		} catch (e) {
			console.error('Failed to load rooms', e);
		} finally {
			loading = false;
		}
	}

	async function handleCreate() {
		if (!newRoomName.trim()) return;
		creating = true;
		try {
			const room = await createRoom(newRoomName.trim(), 'dusk');
			window.location.href = `/builder/${room.$id}`;
		} catch (e) {
			console.error('Failed to create room', e);
			creating = false;
		}
	}

	function closeModal() {
		showCreateModal = false;
		newRoomName = '';
	}
</script>

<svelte:head>
	<title>The Impossible Room</title>
</svelte:head>

<div class="grain vignette-landing min-h-screen">
	<header class="px-6 sm:px-10 py-8 flex justify-between items-center">
		<h1 class="font-display text-lg font-light text-cream">The Impossible Room</h1>
		<Button variant="primary" onclick={() => (showCreateModal = true)}>Create a room</Button>
	</header>

	<main class="px-6 sm:px-10 pb-20 sm:pb-28">
		<section class="max-w-2xl mt-20 sm:mt-28 mb-16">
			<p class="text-amber font-sans text-[11px] uppercase tracking-[0.2em] font-medium mb-4">
				A room that keeps growing.
			</p>
			<h2 class="font-display text-5xl sm:text-7xl font-light text-cream leading-[0.95]">
				A place for things<br />that don't fit<br />anywhere else.
			</h2>
			<p class="font-sans text-sm sm:text-[15px] text-cream/60 mt-6 max-w-lg leading-relaxed">
				Build a room. Fill it with objects and the stories they carry.
				Add more whenever you want. It's your impossible room.
			</p>
			<div class="flex gap-3 mt-8">
				<Button variant="primary" onclick={() => (showCreateModal = true)}>Create a room</Button>
				{#if rooms.length > 0}
					<Button variant="secondary" href="/room/{rooms[0].$id}">Enter the first room</Button>
				{/if}
			</div>
		</section>

		<section>
			{#if loading}
				<p class="text-cream/35 font-sans text-sm">Loading rooms...</p>
			{:else if rooms.length === 0}
				<div class="text-center py-20">
					<p class="text-cream/35 font-sans text-sm">No rooms yet. Create one to get started.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
					{#each rooms as room (room.$id)}
						<RoomCard {room} objectCount={objectCounts[room.$id] ?? 0} />
					{/each}
					<button
						type="button"
						class="add-room-card"
						onclick={() => (showCreateModal = true)}
					>
						<span class="plus-icon">+</span>
						<span class="add-label">New room</span>
					</button>
				</div>
			{/if}
		</section>
	</main>
</div>

<!-- Creation Modal -->
{#if showCreateModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm"
		role="dialog"
		aria-label="Create a new room"
	>
		<div
			class="bg-ink-soft border border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4"
		>
			<h2 class="font-display text-2xl font-light text-cream mb-6">Create a room</h2>
			<form onsubmit={(e) => { e.preventDefault(); handleCreate(); }}>
				<label for="room-name" class="font-sans text-sm text-cream/60 mb-2 block">
					What do you want to call this room?
				</label>
				<input
					id="room-name"
					type="text"
					placeholder='e.g. "The Night Shelf"'
					bind:value={newRoomName}
					class="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-cream font-sans text-sm outline-none focus:border-amber/60 transition-colors"
				/>
				<div class="flex justify-end gap-3 mt-6">
					<Button variant="secondary" onclick={closeModal}>Cancel</Button>
					<Button
						variant="primary"
						disabled={!newRoomName.trim() || creating}
						onclick={handleCreate}
					>
						{creating ? 'Creating...' : 'Create'}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.add-room-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		height: 100%;
		min-height: 260px;
		border-radius: 1rem;
		border: 1px dashed rgba(217, 163, 91, 0.4);
		background: transparent;
		cursor: pointer;
		transition: background 0.2s, border-color 0.2s;
	}
	.add-room-card:hover {
		background: rgba(217, 163, 91, 0.05);
		border-color: rgba(217, 163, 91, 0.6);
	}

	.plus-icon {
		font-size: 2rem;
		color: #d9a35b;
		line-height: 1;
	}

	.add-label {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.875rem;
		font-weight: 500;
		color: #d9a35b;
	}
</style>
