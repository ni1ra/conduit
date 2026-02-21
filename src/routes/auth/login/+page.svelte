<script lang="ts">
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/v1/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				error = data.error || `Authentication failed [${res.status}]`;
				return;
			}

			window.location.href = '/dashboard';
		} catch (err) {
			error = 'Connection failed. Check network status.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Access Terminal — CONDUIT</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-container">
		<a href="/" class="auth-logo glow-text">◈ CONDUIT</a>
		<h1 class="auth-title">Access Terminal</h1>
		<p class="auth-desc">Authenticate to access your data pipeline</p>

		{#if error}
			<div class="auth-error">
				<span>⚠</span> {error}
			</div>
		{/if}

		<form onsubmit={handleLogin} class="auth-form">
			<div class="form-group">
				<label for="email">EMAIL</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="operator@example.eu"
					required
					autocomplete="email"
				/>
			</div>

			<div class="form-group">
				<label for="password">PASSWORD</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="••••••••"
					required
					autocomplete="current-password"
				/>
			</div>

			<button type="submit" class="btn-primary auth-btn" disabled={loading}>
				{loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
			</button>
		</form>

		<p class="auth-footer">
			No pipeline initialized? <a href="/auth/register">Register here</a>
		</p>
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}
	.auth-container {
		width: 100%;
		max-width: 380px;
		text-align: center;
	}
	.auth-logo {
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: 0.2em;
		color: var(--color-primary);
		text-decoration: none;
		display: block;
		margin-bottom: 2rem;
	}
	.auth-title {
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--color-text-bright);
		margin-bottom: 0.4rem;
	}
	.auth-desc {
		font-size: 0.72rem;
		color: var(--color-text-dim);
		margin-bottom: 1.5rem;
	}
	.auth-error {
		background: rgba(255, 68, 68, 0.1);
		border: 1px solid rgba(255, 68, 68, 0.3);
		color: var(--color-error);
		padding: 0.6rem 0.8rem;
		border-radius: 2px;
		font-size: 0.72rem;
		margin-bottom: 1rem;
		text-align: left;
	}
	.auth-form {
		text-align: left;
	}
	.form-group {
		margin-bottom: 1rem;
	}
	.form-group label {
		display: block;
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--color-text-dim);
		margin-bottom: 0.35rem;
		text-transform: uppercase;
	}
	.auth-btn {
		width: 100%;
		margin-top: 0.5rem;
		padding: 0.65rem;
	}
	.auth-footer {
		margin-top: 1.5rem;
		font-size: 0.72rem;
		color: var(--color-text-dim);
	}
</style>
