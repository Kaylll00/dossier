<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary' | 'amber-outline' | 'add' | 'destructive' | 'icon';
		href?: string;
		disabled?: boolean;
		onclick?: () => void;
		children: import('svelte').Snippet;
	}

	let { variant = 'primary', href, disabled, onclick, children }: Props = $props();
</script>

{#if href}
	<a href={href} class="btn btn-{variant}">
		{@render children()}
	</a>
{:else}
	<button type="button" class="btn btn-{variant}" {disabled} {onclick}>
		{@render children()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'Inter Variable', sans-serif;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 9999px;
		padding: 0.625rem 1.25rem;
		text-decoration: none;
		cursor: pointer;
		transition: background 0.2s, border-color 0.2s, color 0.2s;
		border: none;
		line-height: 1;
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

	.btn-secondary {
		background: transparent;
		border: 1px solid rgba(243, 237, 227, 0.15);
		color: rgba(243, 237, 227, 0.8);
	}
	.btn-secondary:hover {
		background: rgba(243, 237, 227, 0.05);
	}

	.btn-amber-outline {
		background: transparent;
		border: 1px solid rgba(217, 163, 91, 0.3);
		color: #d9a35b;
	}
	.btn-amber-outline:hover {
		background: rgba(217, 163, 91, 0.1);
	}

	.btn-add {
		background: transparent;
		border: 1px dashed rgba(217, 163, 91, 0.4);
		color: #d9a35b;
	}
	.btn-add:hover {
		background: rgba(217, 163, 91, 0.1);
	}

	.btn-destructive {
		background: transparent;
		color: #c98a86;
	}
	.btn-destructive:hover {
		background: rgba(201, 138, 134, 0.1);
	}

	.btn-icon {
		padding: 0.5rem;
		background: transparent;
		color: rgba(243, 237, 227, 0.8);
	}
	.btn-icon:hover {
		background: rgba(243, 237, 227, 0.05);
	}
</style>
