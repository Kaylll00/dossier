<script lang="ts">
	import { onMount } from 'svelte';
	import { getRoom } from '$lib/appwrite/rooms';
	import { listObjects } from '$lib/appwrite/objects';
	import { BACKGROUND_PRESETS } from '$lib/theme/backgrounds';
	import type { Room, RoomObject } from '$lib/types';
	import StepIndicator from '$lib/components/StepIndicator.svelte';
	import DetailDrawer from '$lib/components/DetailDrawer.svelte';

	let { params } = $props();
	let roomId = $derived(params.roomId);

	let room = $state<Room | null>(null);
	let objects = $state<RoomObject[]>([]);
	let loading = $state(true);
	let currentIndex = $state(0);
	let cooldown = $state(false);
	let drawerOpen = $state(false);
	let transitioning = $state(false);

	let stageEl = $state<HTMLDivElement>();

	const backgroundId = $derived(room?.background);
	const backgroundCss = $derived(
		backgroundId
			? BACKGROUND_PRESETS.find((p) => p.id === backgroundId)?.css ?? BACKGROUND_PRESETS[0].css
			: ''
	);

	const currentObject = $derived(objects[currentIndex] ?? null);

	onMount(async () => {
		try {
			room = await getRoom(roomId);
			objects = await listObjects(roomId);
		} catch (e) {
			console.error('Failed to load room', e);
		} finally {
			loading = false;
		}
	});

	function step(direction: 1 | -1) {
		if (cooldown || transitioning || objects.length === 0) return;
		const next = currentIndex + direction;
		if (next < 0 || next >= objects.length) return;
		triggerCooldown();
		transitioning = true;
		currentIndex = next;
		setTimeout(() => {
			transitioning = false;
		}, 800);
	}

	function triggerCooldown() {
		cooldown = true;
		setTimeout(() => {
			cooldown = false;
		}, 1000);
	}

	function goTo(index: number) {
		if (cooldown || transitioning || index === currentIndex) return;
		triggerCooldown();
		transitioning = true;
		currentIndex = index;
		setTimeout(() => {
			transitioning = false;
		}, 800);
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		if (e.deltaY > 0) step(1);
		else if (e.deltaY < 0) step(-1);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (drawerOpen) {
			if (e.key === 'Escape') drawerOpen = false;
			return;
		}
		if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
			e.preventDefault();
			step(1);
		} else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
			e.preventDefault();
			step(-1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (currentObject) drawerOpen = true;
		} else if (e.key === 'Escape') {
			drawerOpen = false;
		}
	}

	let touchStartY = $state(0);

	function handleTouchStart(e: TouchEvent) {
		touchStartY = e.touches[0].clientY;
	}

	function handleTouchEnd(e: TouchEvent) {
		const deltaY = touchStartY - e.changedTouches[0].clientY;
		if (Math.abs(deltaY) > 40) {
			if (deltaY > 0) step(1);
			else step(-1);
		}
	}

	const depthStyles = (obj: RoomObject, index: number): string => {
		const isActive = index === currentIndex;
		const distance = Math.abs(index - currentIndex);

		let opacity: number;
		let blur: string;
		let scale: number;
		let zIndex: number;

		if (obj.depth === 'background') {
			opacity = 0.72;
			blur = distance <= 1 && isActive ? '0px' : '2px';
			scale = 0.85;
			zIndex = 1;
		} else if (obj.depth === 'midground') {
			opacity = 0.92;
			blur = distance <= 1 && isActive ? '0px' : '1px';
			scale = 1;
			zIndex = 2;
		} else {
			opacity = 1;
			blur = '0px';
			scale = 1.08;
			zIndex = 3;
		}

		const activeScale = isActive ? 1.06 : 1;

		return [
			`opacity: ${opacity}`,
			`filter: blur(${blur})`,
			`transform: translate(-50%, -50%) scale(${scale * activeScale})`,
			`left: ${obj.positionX}%`,
			`top: ${obj.positionY}%`,
			`z-index: ${zIndex}`,
			'transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease'
		].join('; ');
	};
</script>

<svelte:head>
	<title>{room?.name ?? 'Room'} — The Impossible Room</title>
</svelte:head>

{#if loading}
	<div class="grain vignette-viewer h-screen flex items-center justify-center">
		<p class="font-sans text-sm text-cream/35">Loading room...</p>
	</div>
{:else if room}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="grain vignette-viewer viewer"
		style="background: {backgroundCss}"
		role="main"
		aria-label="Room viewer"
		onwheel={handleWheel}
		onkeydown={handleKeydown}
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
		bind:this={stageEl}
		tabindex="-1"
	>
		<!-- Header -->
		<header class="header">
			<a href="/" class="back-link" aria-label="Back to rooms">Rooms</a>
			<span class="room-name">{room.name}</span>
			<a href="/builder/{room.$id}" class="edit-link">
				<span class="edit-text">Edit room</span>
				<svg class="edit-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M11.5 1.5L14.5 4.5M2 14L4.5 5.5L10.5 11.5L2 14Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</a>
		</header>

		<!-- Objects stage -->
		<div class="stage">
			{#each objects as obj, i (obj.$id)}
				<div
					class="object"
					class:active={i === currentIndex}
					class:midground={obj.depth === 'midground'}
					class:foreground={obj.depth === 'foreground'}
					style={depthStyles(obj, i)}
				>
					{#if obj.imageUrl}
						<img
							src={obj.imageUrl}
							alt={obj.label}
							class="object-img"
							draggable="false"
						/>
					{:else}
						<div class="placeholder-img">
							<span>{obj.label[0] ?? '?'}</span>
						</div>
					{/if}
					<!-- Floor shadow -->
					<div class="floor-shadow"></div>
				</div>
			{/each}
		</div>

		<!-- Active object label and reveal -->
		{#if currentObject}
			<div class="active-info">
				<p class="active-label">{currentObject.label}</p>
				<button
					type="button"
					class="reveal-btn"
					onclick={() => (drawerOpen = true)}
				>
					Reveal its story
				</button>
			</div>
		{/if}

		<!-- Step indicator -->
		{#if objects.length > 0}
			<StepIndicator {objects} {currentIndex} onclick={goTo} />
		{/if}

		<!-- Scroll hint -->
		{#if objects.length > 0}
			<div class="scroll-hint" class:hidden={currentIndex > 0}>
				<svg width="16" height="24" viewBox="0 0 16 24" fill="none">
					<path d="M8 2V16M8 16L12 12M8 16L4 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
		{/if}

		<!-- Detail drawer -->
		<DetailDrawer object={currentObject} open={drawerOpen} onclose={() => (drawerOpen = false)} />
	</div>
{/if}

<style>
	.viewer {
		position: fixed;
		inset: 0;
		overflow: hidden;
		outline: none;
	}

	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 30;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.back-link {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.8125rem;
		color: rgba(243, 237, 227, 0.5);
		text-decoration: none;
		transition: color 0.2s;
	}
	.back-link:hover {
		color: #f3ede3;
	}

	.room-name {
		font-family: 'Fraunces Variable', serif;
		font-size: 1.125rem;
		font-weight: 300;
		color: #f3ede3;
		flex: 1;
	}

	.edit-link {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.8125rem;
		color: #d9a35b;
		text-decoration: none;
		transition: color 0.2s;
	}
	.edit-link:hover {
		color: #e4b473;
	}

	.edit-icon {
		flex-shrink: 0;
	}

	/* Stage */
	.stage {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	/* Object */
	.object {
		position: absolute;
		width: 220px;
		height: auto;
		will-change: transform, opacity;
	}

	.object-img {
		width: 100%;
		height: auto;
		display: block;
		-webkit-mask-image: radial-gradient(ellipse at center, black 65%, transparent 85%);
		mask-image: radial-gradient(ellipse at center, black 65%, transparent 85%);
		filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.4));
		user-select: none;
		-webkit-user-drag: none;
	}

	.placeholder-img {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: rgba(243, 237, 227, 0.05);
		border: 1px solid rgba(243, 237, 227, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Fraunces Variable', serif;
		font-size: 2rem;
		color: rgba(243, 237, 227, 0.2);
		margin: 0 auto;
	}

	.floor-shadow {
		position: absolute;
		bottom: -10%;
		left: 50%;
		transform: translateX(-50%);
		width: 80%;
		height: 20px;
		background: radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%);
		pointer-events: none;
	}

	.object.active .object-img {
		outline: 2px solid rgba(217, 163, 91, 0.5);
		outline-offset: 4px;
		border-radius: 4px;
	}

	/* Active info */
	.active-info {
		position: fixed;
		bottom: 2.5rem;
		left: 1.5rem;
		z-index: 30;
	}

	.active-label {
		font-family: 'Fraunces Variable', serif;
		font-size: 2.25rem;
		font-weight: 300;
		color: #f3ede3;
		margin: 0 0 0.75rem;
		line-height: 1.1;
	}

	.reveal-btn {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.875rem;
		font-weight: 500;
		color: #d9a35b;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: color 0.2s;
	}
	.reveal-btn:hover {
		color: #e4b473;
	}

	/* Scroll hint */
	.scroll-hint {
		position: fixed;
		bottom: 2.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 30;
		color: rgba(243, 237, 227, 0.25);
		animation: bounce 2s ease-in-out infinite;
		transition: opacity 0.5s;
	}
	.scroll-hint.hidden {
		opacity: 0;
		pointer-events: none;
	}

	@keyframes bounce {
		0%, 100% { transform: translateX(-50%) translateY(0); }
		50% { transform: translateX(-50%) translateY(6px); }
	}

	@media (max-width: 640px) {
		.edit-text {
			display: none;
		}
		.active-label {
			font-size: 1.5rem;
		}
		.active-info {
			bottom: 1.5rem;
			left: 1rem;
		}
		.object {
			width: 160px;
		}
	}
</style>
