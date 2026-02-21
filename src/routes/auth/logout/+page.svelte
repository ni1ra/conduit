<script lang="ts">
	import { onMount } from 'svelte';

	onMount(async () => {
		try {
			await fetch('/api/v1/auth/logout', { method: 'POST' });
		} catch (_) {
			// Ignore errors, redirect anyway
		}
		window.location.href = '/';
	});
</script>

<svelte:head>
	<title>Disconnecting — CONDUIT</title>
</svelte:head>

<div class="logout-page">
	<p class="glow-text">DISCONNECTING...</p>
</div>

<style>
	.logout-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.logout-page p {
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.2em;
		color: var(--color-primary);
	}
</style>
