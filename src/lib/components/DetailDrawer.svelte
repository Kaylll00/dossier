<script lang="ts">
	import type { RoomObject } from '$lib/types';

	let {
		object,
		open,
		onclose
	}: {
		object: RoomObject | null;
		open: boolean;
		onclose: () => void;
	} = $props();
</script>

{#if open && object}
	<div
		class="scrim"
		role="presentation"
		onclick={onclose}
		onkeydown={(e) => e.key === 'Escape' && onclose()}
	>
		<div
			class="drawer"
			role="dialog"
			aria-label={object.label}
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.key === 'Escape' && onclose()}
		>
			<div class="drawer-inner">
				<button type="button" class="close-btn" aria-label="Close" onclick={onclose}>
					&times;
				</button>

				{#if object.imageUrl}
					<img src={object.imageUrl} alt={object.label} class="object-image" />
				{/if}

				<span class="content-type">{object.contentType}</span>
				<h2 class="object-title">{object.label}</h2>

				{#if object.content}
					<div class="story-body">
						{object.content}
					</div>
				{:else}
					<p class="empty-hint">No content added yet.</p>
				{/if}

				<p class="keyboard-hint">press <kbd>Esc</kbd> to close</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: rgba(14, 13, 22, 0.6);
		backdrop-filter: blur(4px);
		display: flex;
		justify-content: flex-end;
	}

	.drawer {
		width: 100%;
		max-width: 28rem;
		height: 100%;
		background: rgba(23, 21, 31, 0.95);
		backdrop-filter: blur(24px);
		border-left: 1px solid rgba(243, 237, 227, 0.1);
		padding: 2rem;
		overflow-y: auto;
		animation: slide-in 0.3s ease-out;
	}

	@keyframes slide-in {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.drawer-inner {
		position: relative;
	}

	.close-btn {
		position: absolute;
		top: 0;
		right: 0;
		background: none;
		border: none;
		color: rgba(243, 237, 227, 0.5);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
	}
	.close-btn:hover {
		color: #f3ede3;
	}

	.object-image {
		width: 100%;
		border-radius: 0.75rem;
		margin-bottom: 1.5rem;
		display: block;
	}

	.content-type {
		display: inline-block;
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #d9a35b;
		margin-bottom: 0.75rem;
	}

	.object-title {
		font-family: 'Fraunces Variable', serif;
		font-size: 1.875rem;
		font-weight: 300;
		color: #f3ede3;
		margin: 0 0 1.25rem;
		line-height: 1.1;
	}

	.story-body {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.9375rem;
		color: rgba(243, 237, 227, 0.8);
		line-height: 1.7;
		white-space: pre-wrap;
	}

	.empty-hint {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.875rem;
		color: rgba(243, 237, 227, 0.35);
		font-style: italic;
	}

	.keyboard-hint {
		margin-top: 2rem;
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.75rem;
		color: rgba(243, 237, 227, 0.25);
	}

	kbd {
		font-family: 'Inter Variable', sans-serif;
		padding: 0.125rem 0.375rem;
		border: 1px solid rgba(243, 237, 227, 0.15);
		border-radius: 0.25rem;
		font-size: 0.6875rem;
	}
</style>
