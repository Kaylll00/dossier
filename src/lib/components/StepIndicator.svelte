<script lang="ts">
	import type { RoomObject } from '$lib/types';

	let {
		objects,
		currentIndex,
		onclick
	}: {
		objects: RoomObject[];
		currentIndex: number;
		onclick: (index: number) => void;
	} = $props();
</script>

<nav aria-label="Object steps" class="indicator">
	<div class="counter">
		<span class="current">{String(currentIndex + 1).padStart(2, '0')}</span>
		<span class="separator">/</span>
		<span class="total">{String(objects.length).padStart(2, '0')}</span>
	</div>
	<div class="dots">
		{#each objects as obj, i}
			<button
				type="button"
				class="dot"
				class:active={i === currentIndex}
				aria-current={i === currentIndex ? 'step' : undefined}
				aria-label={obj.label}
				onclick={() => onclick(i)}
			>
				<span class="dot-inner"></span>
				<span class="dot-label">{obj.label}</span>
			</button>
		{/each}
	</div>
</nav>

<style>
	.indicator {
		position: fixed;
		right: 1.5rem;
		top: 50%;
		transform: translateY(-50%);
		z-index: 30;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.counter {
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.8125rem;
		color: rgba(243, 237, 227, 0.5);
		letter-spacing: 0.1em;
	}

	.current {
		color: #f3ede3;
	}

	.dots {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.625rem;
	}

	.dot {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		position: relative;
	}

	.dot-inner {
		display: block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(243, 237, 227, 0.35);
		transition: all 0.3s ease;
	}

	.dot:hover .dot-inner {
		background: rgba(243, 237, 227, 0.6);
	}

	.dot.active .dot-inner {
		width: 24px;
		height: 6px;
		border-radius: 3px;
		background: #d9a35b;
	}

	.dot-label {
		position: absolute;
		right: calc(100% + 0.75rem);
		white-space: nowrap;
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.75rem;
		color: rgba(243, 237, 227, 0);
		transition: color 0.2s;
		pointer-events: none;
	}

	.dot:hover .dot-label,
	.dot.active .dot-label {
		color: rgba(243, 237, 227, 0.7);
	}

	.dot.active .dot-label {
		color: #f3ede3;
	}
</style>
