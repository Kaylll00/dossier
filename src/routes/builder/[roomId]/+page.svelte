<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getRoom, updateRoom } from '$lib/appwrite/rooms';
	import { listObjects, createObject, updateObject, deleteObject } from '$lib/appwrite/objects';
	import { BACKGROUND_PRESETS } from '$lib/theme/backgrounds';
	import type { Room, RoomObject, ContentType, DepthLayer } from '$lib/types';
	import { Canvas, FabricImage, Point, Rect } from 'fabric';
	import { storage } from '$lib/appwrite';
	import { PUBLIC_APPWRITE_BUCKET_ID, PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT_ID } from '$env/static/public';

	let { params } = $props();
	let roomId = $derived(params.roomId);

	let room = $state<Room | null>(null);
	let objects = $state<RoomObject[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let saved = $state(false);
	let selectedObjectId = $state<string | null>(null);

	let canvasEl = $state<HTMLCanvasElement>();
	let canvas: Canvas | null = null;
	let canvasContainer = $state<HTMLDivElement>();

	let fabricObjects = $state<Map<string, FabricImage>>(new Map());
	let previewMode = $state(false);

	const backgroundPresets = BACKGROUND_PRESETS;

	const selectedObject = $derived(
		selectedObjectId ? objects.find((o) => o.$id === selectedObjectId) ?? null : null
	);

	// Edit form state
	let editLabel = $state('');
	let editContentType: ContentType = $state('memory');
	let editContent = $state('');
	let editDepth: DepthLayer = $state('midground');
	let editScale = $state(1);

	$effect(() => {
		if (selectedObject) {
			editLabel = selectedObject.label;
			editContentType = selectedObject.contentType;
			editContent = selectedObject.content;
			editDepth = selectedObject.depth;
			editScale = selectedObject.scale;
		}
	});

	onMount(async () => {
		try {
			room = await getRoom(roomId);
			objects = await listObjects(roomId);

			if (canvasEl) {
				initCanvas();
			}
		} catch (e) {
			console.error('Failed to load room', e);
		} finally {
			loading = false;
		}
	});

	onDestroy(() => {
		canvas?.dispose();
	});

	$effect(() => {
		if (canvasEl && !canvas && !loading) {
			initCanvas();
		}
	});

	function initCanvas() {
		if (!canvasEl || !canvasContainer) return;

		const rect = canvasContainer.getBoundingClientRect();
		canvas = new Canvas(canvasEl, {
			width: rect.width,
			height: rect.height,
			backgroundColor: 'transparent',
			selection: false,
			preserveObjectStacking: true
		});

		canvas.on('selection:created', (e) => {
			const obj = e.selected?.[0];
			if (obj) {
				const fabricId = (obj as any).fabricId as string;
				if (fabricId) {
					selectedObjectId = fabricId;
					syncPositionFromCanvas(fabricId, obj);
				}
			}
		});

		canvas.on('selection:updated', (e) => {
			const obj = e.selected?.[0];
			if (obj) {
				const fabricId = (obj as any).fabricId as string;
				if (fabricId) {
					selectedObjectId = fabricId;
					syncPositionFromCanvas(fabricId, obj);
				}
			}
		});

		canvas.on('selection:cleared', () => {
			selectedObjectId = null;
		});

		canvas.on('object:modified', (e) => {
			const obj = e.target;
			if (obj) {
				const fabricId = (obj as any).fabricId as string;
				if (fabricId) {
					syncPositionFromCanvas(fabricId, obj);
				}
			}
		});

		renderObjectsOnCanvas();

		window.addEventListener('resize', handleResize);
	}

	function handleResize() {
		if (!canvas || !canvasContainer) return;
		const rect = canvasContainer.getBoundingClientRect();
		canvas.setDimensions({ width: rect.width, height: rect.height });
		canvas.renderAll();
	}

	function canvasWidth(): number {
		return canvas?.width ?? 800;
	}

	function canvasHeight(): number {
		return canvas?.height ?? 600;
	}

	function syncPositionFromCanvas(fabricId: string, fabricObj: any) {
		const objData = objects.find((o) => o.$id === fabricId);
		if (!objData) return;

		const w = canvasWidth();
		const h = canvasHeight();
		const newX = Math.round((fabricObj.left / w) * 10000) / 100;
		const newY = Math.round((fabricObj.top / h) * 10000) / 100;

		objects = objects.map((o) =>
			o.$id === fabricId ? { ...o, positionX: newX, positionY: newY } : o
		);
	}

	async function renderObjectsOnCanvas() {
		if (!canvas) return;

		for (const objData of objects) {
			await addFabricObject(objData);
		}
	}

	async function addFabricObject(objData: RoomObject) {
		if (!canvas) return;

		const w = canvasWidth();
		const h = canvasHeight();

		const left = (objData.positionX / 100) * w;
		const top = (objData.positionY / 100) * h;

		let fabricImg: FabricImage;

		if (objData.imageUrl) {
			try {
				fabricImg = await FabricImage.fromURL(objData.imageUrl, {
					crossOrigin: 'anonymous'
				});
			} catch {
				fabricImg = await createPlaceholderFabricObject();
			}
		} else {
			fabricImg = await createPlaceholderFabricObject();
		}

		const scale = (objData.scale ?? 1) * 0.3;
		fabricImg.set({
			left,
			top,
			scaleX: scale,
			scaleY: scale,
			originX: 'center',
			originY: 'center'
		});
		(fabricImg as any).fabricId = objData.$id;

		canvas.add(fabricImg);
		canvas.renderAll();
		fabricObjects.set(objData.$id, fabricImg);
	}

	async function createPlaceholderFabricObject(): Promise<FabricImage> {
		const size = 80;
		const rect = new Rect({
			width: size,
			height: size,
			fill: 'rgba(243, 237, 227, 0.08)',
			rx: 8,
			ry: 8
		});
		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = size;
		tempCanvas.height = size;
		const tempFabric = new Canvas(tempCanvas, { width: size, height: size });
		tempFabric.add(rect);
		tempFabric.renderAll();
		const dataUrl = tempCanvas.toDataURL();
		tempFabric.dispose();
		return await FabricImage.fromURL(dataUrl);
	}

	async function handleAddObject() {
		try {
			const newObj = await createObject({
				roomId,
				imageUrl: '',
				label: 'New object',
				contentType: 'memory',
				content: '',
				positionX: 50,
				positionY: 50,
				depth: 'midground',
				scale: 1
			});
			objects = [...objects, newObj];
			await addFabricObject(newObj);
			selectedObjectId = newObj.$id;
		} catch (e) {
			console.error('Failed to create object', e);
		}
	}

	async function handleImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !selectedObjectId) return;

		try {
			const uploadRes = await storage.createFile(
				PUBLIC_APPWRITE_BUCKET_ID,
				'unique()',
				file
			);

			const imageUrl = `${PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${PUBLIC_APPWRITE_BUCKET_ID}/files/${uploadRes.$id}/view?project=${PUBLIC_APPWRITE_PROJECT_ID}`;

			objects = objects.map((o) =>
				o.$id === selectedObjectId ? { ...o, imageUrl } : o
			);

			const existing = fabricObjects.get(selectedObjectId);
			if (existing && canvas) {
				canvas.remove(existing);
				fabricObjects.delete(selectedObjectId);
			}
			const objData = objects.find((o) => o.$id === selectedObjectId);
			if (objData) {
				await addFabricObject(objData);
			}
		} catch (e) {
			console.error('Failed to upload image', e);
		}
	}

	async function handleSave() {
		if (!room) return;
		saving = true;
		saved = false;
		try {
			await updateRoom(room.$id, { name: room.name, background: room.background });
			for (const obj of objects) {
				await updateObject(obj.$id, {
					label: obj.label,
					contentType: obj.contentType,
					content: obj.content,
					positionX: obj.positionX,
					positionY: obj.positionY,
					depth: obj.depth,
					scale: obj.scale
				});
			}
			saved = true;
			setTimeout(() => {
				saved = false;
			}, 2000);
		} catch (e) {
			console.error('Failed to save', e);
		} finally {
			saving = false;
		}
	}

	function handleSelectObject(id: string) {
		selectedObjectId = id;
		if (canvas) {
			const fabricObj = fabricObjects.get(id);
			if (fabricObj) {
				canvas.setActiveObject(fabricObj);
				canvas.renderAll();
			}
		}
	}

	async function handleDeleteObject() {
		if (!selectedObjectId) return;
		try {
			await deleteObject(selectedObjectId);
			const fabricObj = fabricObjects.get(selectedObjectId);
			if (fabricObj && canvas) {
				canvas.remove(fabricObj);
				fabricObjects.delete(selectedObjectId);
				canvas.renderAll();
			}
			objects = objects.filter((o) => o.$id !== selectedObjectId);
			selectedObjectId = null;
		} catch (e) {
			console.error('Failed to delete object', e);
		}
	}

	function updateSelectedField(field: string, value: string | number) {
		if (!selectedObjectId) return;
		objects = objects.map((o) =>
			o.$id === selectedObjectId ? { ...o, [field]: value } : o
		);
	}

	function handleBackgroundChange(presetId: string) {
		if (!room) return;
		room = { ...room, background: presetId };
	}

	function togglePreview() {
		previewMode = !previewMode;
		if (previewMode && canvas) {
			canvas.discardActiveObject();
			canvas.renderAll();
		}
	}
</script>

<svelte:head>
	<title>{room?.name ?? 'Builder'} — The Impossible Room</title>
</svelte:head>

{#if loading}
	<div class="grain h-screen flex items-center justify-center bg-ink">
		<p class="font-sans text-sm text-cream/35">Loading builder...</p>
	</div>
{:else if room}
	<div class="builder-layout {previewMode ? 'preview-mode' : ''}">
		<!-- Header -->
		<header class="header">
			<div class="header-left">
				<a href="/" class="back-link" aria-label="Back to rooms">Rooms</a>
				<span class="header-separator">/</span>
				<input
					type="text"
					class="room-name-input"
					bind:value={room.name}
					aria-label="Room name"
				/>
			</div>
			<div class="header-right">
				<button type="button" class="btn btn-ghost" onclick={togglePreview}>
					{previewMode ? 'Edit' : 'Preview'}
				</button>
				<button
					type="button"
					class="btn btn-primary"
					onclick={handleSave}
					disabled={saving}
				>
					{saved ? 'Saved ✓' : saving ? 'Saving...' : 'Save room'}
				</button>
			</div>
		</header>

		<!-- Main content -->
		<div class="main">
			<!-- Left rail: object list -->
			{#if !previewMode}
				<aside class="rail">
					<div class="rail-header">
						<h2 class="rail-title">Objects</h2>
						<span class="rail-count">{objects.length}</span>
					</div>
					<div class="rail-list">
						{#each objects as obj, i (obj.$id)}
							<button
								type="button"
								class="rail-item"
								class:selected={obj.$id === selectedObjectId}
								onclick={() => handleSelectObject(obj.$id)}
							>
								<span class="rail-item-index">{String(i + 1).padStart(2, '0')}</span>
								<span class="rail-item-label">{obj.label || 'Untitled'}</span>
							</button>
						{/each}
					</div>
					<button type="button" class="btn btn-add" onclick={handleAddObject}>
						+ Add object
					</button>
				</aside>
			{/if}

			<!-- Canvas area -->
			<div class="canvas-area {previewMode ? 'preview-mode' : ''}">
				<div class="canvas-header">
					<div class="bg-swatches">
						{#each backgroundPresets as preset}
							<button
								type="button"
								class="swatch"
								class:active={room.background === preset.id}
								style="background: {preset.css}"
								aria-label={preset.label}
								title={preset.label}
								onclick={() => handleBackgroundChange(preset.id)}
							></button>
						{/each}
					</div>
				</div>

				<div
					class="canvas-container"
					bind:this={canvasContainer}
					style="background: {backgroundPresets.find((p) => p.id === (room?.background ?? backgroundPresets[0].id))?.css ?? backgroundPresets[0].css}"
				>
					{#if !previewMode}
						<div class="grid-overlay"></div>
					{/if}
					<canvas bind:this={canvasEl}></canvas>
					{#if objects.length === 0}
						<p class="empty-hint">Add an object to begin building your room.</p>
					{/if}
				</div>
			</div>

			<!-- Right inspector -->
			{#if !previewMode}
				<aside class="inspector">
					{#if selectedObject}
						<div class="inspector-content">
							<h3 class="inspector-title">Object</h3>

							<div class="field">
								<label class="field-label" for="obj-image">Image</label>
								<input
									id="obj-image"
									type="file"
									accept="image/png,image/jpeg,image/webp"
									class="file-input"
									onchange={handleImageUpload}
								/>
								{#if selectedObject.imageUrl}
									<img src={selectedObject.imageUrl} alt="Preview" class="image-preview" />
								{/if}
							</div>

							<div class="field">
								<label class="field-label" for="obj-label">Label</label>
								<input
									id="obj-label"
									type="text"
									class="text-input"
									value={editLabel}
									oninput={(e) => { const v = (e.target as HTMLInputElement).value; editLabel = v; updateSelectedField('label', v); }}
								/>
							</div>

							<div class="field">
								<span class="field-label" id="type-label">Type</span>
								<div class="segmented-control" role="radiogroup" aria-labelledby="type-label">
									{#each ['memory', 'poem', 'fact'] as type}
										<button
											type="button"
											class="segmented-option"
											class:active={editContentType === type}
											onclick={() => { editContentType = type as ContentType; updateSelectedField('contentType', type); }}
										>
											{type}
										</button>
									{/each}
								</div>
							</div>

							<div class="field">
								<label class="field-label" for="obj-content">Content</label>
								<textarea
									id="obj-content"
									class="text-input textarea"
									rows="4"
									value={editContent}
									oninput={(e) => { const v = (e.target as HTMLTextAreaElement).value; editContent = v; updateSelectedField('content', v); }}
								></textarea>
							</div>

							<div class="field">
								<span class="field-label" id="depth-label">Depth</span>
								<div class="segmented-control" role="radiogroup" aria-labelledby="depth-label">
									{#each ['background', 'midground', 'foreground'] as depth}
										<button
											type="button"
											class="segmented-option"
											class:active={editDepth === depth}
											onclick={() => { editDepth = depth as DepthLayer; updateSelectedField('depth', depth); }}
										>
											{depth}
										</button>
									{/each}
								</div>
							</div>

							<div class="field">
								<label class="field-label" for="obj-scale">
									Scale
									<span class="field-value">{editScale.toFixed(2)}</span>
								</label>
								<input
									id="obj-scale"
									type="range"
									min="0.3"
									max="3"
									step="0.01"
									class="range-input"
									value={editScale}
									oninput={(e) => { const v = parseFloat((e.target as HTMLInputElement).value); editScale = v; updateSelectedField('scale', v); }}
								/>
							</div>

							<button type="button" class="btn btn-destructive" onclick={handleDeleteObject}>
								Remove
							</button>
						</div>
					{:else}
						<p class="inspector-empty">Select an object to edit</p>
					{/if}
				</aside>
			{/if}
		</div>
	</div>
{/if}

<style>
	.builder-layout {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #0e0d16;
		overflow: hidden;
	}

	/* Header */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1.5rem;
		border-bottom: 1px solid rgba(243, 237, 227, 0.08);
		background: #17151f;
		z-index: 20;
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.back-link {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.8125rem;
		color: rgba(243, 237, 227, 0.5);
		text-decoration: none;
	}
	.back-link:hover {
		color: #f3ede3;
	}

	.header-separator {
		color: rgba(243, 237, 227, 0.15);
	}

	.room-name-input {
		background: transparent;
		border: none;
		color: #f3ede3;
		font-family: 'Fraunces Variable', serif;
		font-size: 1.125rem;
		font-weight: 300;
		outline: none;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		transition: background 0.2s;
		min-width: 120px;
	}
	.room-name-input:hover,
	.room-name-input:focus {
		background: rgba(243, 237, 227, 0.05);
	}

	/* Buttons */
	.btn {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.8125rem;
		font-weight: 500;
		border-radius: 9999px;
		padding: 0.5rem 1rem;
		border: none;
		cursor: pointer;
		transition: background 0.2s, color 0.2s;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}
	.btn:disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	.btn-primary {
		background: #d9a35b;
		color: #0e0d16;
	}
	.btn-primary:hover {
		background: #e4b473;
	}

	.btn-ghost {
		background: transparent;
		color: rgba(243, 237, 227, 0.7);
	}
	.btn-ghost:hover {
		background: rgba(243, 237, 227, 0.05);
	}

	.btn-add {
		background: transparent;
		border: 1px dashed rgba(217, 163, 91, 0.4);
		color: #d9a35b;
		width: calc(100% - 1.5rem);
		margin: 0.75rem;
		justify-content: center;
		padding: 0.625rem;
		font-size: 0.8125rem;
	}
	.btn-add:hover {
		background: rgba(217, 163, 91, 0.08);
	}

	.btn-destructive {
		background: transparent;
		color: #c98a86;
		padding: 0.5rem 0;
		width: 100%;
		text-align: left;
		border-radius: 0;
		font-size: 0.8125rem;
	}
	.btn-destructive:hover {
		background: rgba(201, 138, 134, 0.08);
	}

	/* Main layout */
	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* Left rail */
	.rail {
		width: 14rem;
		flex-shrink: 0;
		border-right: 1px solid rgba(243, 237, 227, 0.08);
		display: flex;
		flex-direction: column;
		background: #17151f;
	}

	.rail-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 0.75rem 0.5rem;
		border-bottom: 1px solid rgba(243, 237, 227, 0.06);
	}

	.rail-title {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: rgba(243, 237, 227, 0.35);
		margin: 0;
	}

	.rail-count {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.75rem;
		color: rgba(243, 237, 227, 0.25);
	}

	.rail-list {
		flex: 1;
		overflow-y: auto;
		padding: 0.25rem 0;
	}

	.rail-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: none;
		border: none;
		color: rgba(243, 237, 227, 0.6);
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.8125rem;
		cursor: pointer;
		text-align: left;
		transition: background 0.15s, color 0.15s;
	}
	.rail-item:hover {
		background: rgba(243, 237, 227, 0.03);
	}
	.rail-item.selected {
		background: rgba(217, 163, 91, 0.08);
		color: #f3ede3;
	}

	.rail-item-index {
		font-size: 0.6875rem;
		color: rgba(243, 237, 227, 0.25);
		min-width: 1.5rem;
	}

	.rail-item-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Canvas area */
	.canvas-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.canvas-area.preview-mode {
		position: fixed;
		inset: 0;
		z-index: 30;
	}

	.canvas-header {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.bg-swatches {
		display: flex;
		gap: 0.5rem;
	}

	.swatch {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		transition: border-color 0.2s, transform 0.2s;
		outline: none;
	}
	.swatch:hover {
		transform: scale(1.1);
	}
	.swatch.active {
		border-color: #d9a35b;
	}

	.canvas-container {
		flex: 1;
		position: relative;
		overflow: hidden;
		margin: 0 0.75rem 0.75rem;
		border-radius: 1rem;
		border: 1px solid rgba(243, 237, 227, 0.08);
	}

	.grid-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
		background-image:
			linear-gradient(rgba(243, 237, 227, 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgba(243, 237, 227, 0.04) 1px, transparent 1px);
		background-size: 40px 40px;
	}

	.canvas-container canvas {
		position: absolute;
		inset: 0;
		width: 100% !important;
		height: 100% !important;
	}

	.empty-hint {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.8125rem;
		color: rgba(243, 237, 227, 0.2);
		z-index: 2;
	}

	/* Inspector */
	.inspector {
		width: 20rem;
		flex-shrink: 0;
		border-left: 1px solid rgba(243, 237, 227, 0.08);
		background: #17151f;
		overflow-y: auto;
	}

	.inspector-content {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.inspector-title {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: rgba(243, 237, 227, 0.35);
		margin: 0;
	}

	.inspector-empty {
		padding: 2rem 1.25rem;
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.8125rem;
		color: rgba(243, 237, 227, 0.2);
		text-align: center;
		font-style: italic;
	}

	/* Form fields */
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.field-label {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.75rem;
		color: rgba(243, 237, 227, 0.5);
		display: flex;
		justify-content: space-between;
	}

	.field-value {
		color: rgba(243, 237, 227, 0.3);
		font-size: 0.6875rem;
	}

	.text-input {
		background: rgba(243, 237, 227, 0.03);
		border: 1px solid rgba(243, 237, 227, 0.1);
		border-radius: 0.75rem;
		padding: 0.5rem 0.75rem;
		color: #f3ede3;
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.8125rem;
		outline: none;
		transition: border-color 0.2s;
	}
	.text-input:focus {
		border-color: rgba(217, 163, 91, 0.6);
	}

	.textarea {
		resize: vertical;
		min-height: 80px;
		font-size: 0.8125rem;
		line-height: 1.5;
	}

	.file-input {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.75rem;
		color: rgba(243, 237, 227, 0.5);
	}
	.file-input::file-selector-button {
		background: rgba(243, 237, 227, 0.05);
		border: 1px solid rgba(243, 237, 227, 0.1);
		border-radius: 0.5rem;
		padding: 0.25rem 0.625rem;
		color: rgba(243, 237, 227, 0.7);
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.75rem;
		cursor: pointer;
		margin-right: 0.5rem;
	}

	.image-preview {
		width: 100%;
		max-height: 120px;
		object-fit: contain;
		border-radius: 0.5rem;
		margin-top: 0.375rem;
		background: rgba(14, 13, 22, 0.5);
	}

	.segmented-control {
		display: flex;
		border: 1px solid rgba(243, 237, 227, 0.1);
		border-radius: 0.75rem;
		overflow: hidden;
	}

	.segmented-option {
		flex: 1;
		padding: 0.375rem 0.5rem;
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.6875rem;
		font-weight: 500;
		text-transform: capitalize;
		color: rgba(243, 237, 227, 0.4);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.15s;
	}
	.segmented-option:hover {
		color: rgba(243, 237, 227, 0.6);
	}
	.segmented-option.active {
		background: rgba(217, 163, 91, 0.1);
		color: #d9a35b;
		border-color: rgba(217, 163, 91, 0.3);
	}

	.range-input {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 4px;
		border-radius: 2px;
		background: rgba(243, 237, 227, 0.1);
		outline: none;
	}
	.range-input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #d9a35b;
		cursor: pointer;
	}
</style>
