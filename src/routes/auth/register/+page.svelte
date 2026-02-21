<script lang="ts">
	let orgName = $state('');
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let writeKey = $state('');
	let registered = $state(false);
	let copied = $state(false);

	async function handleRegister(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/v1/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					org_name: orgName,
					name,
					email,
					password
				})
			});

			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				error = data.error || `Registration failed [${res.status}]`;
				return;
			}

			writeKey = data.write_key || data.writeKey || '';
			registered = true;
		} catch (err) {
			error = 'Connection failed. Check network status.';
		} finally {
			loading = false;
		}
	}

	function copyKey() {
		navigator.clipboard.writeText(writeKey);
		copied = true;
		setTimeout(() => { copied = false; }, 2000);
	}
</script>

<svelte:head>
	<title>Initialize Pipeline — CONDUIT</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-container">
		<a href="/" class="auth-logo glow-text">◈ CONDUIT</a>

		{#if registered}
			<div class="success-state">
				<h1 class="auth-title">Pipeline Initialized</h1>
				<p class="auth-desc">Your write key has been generated. Store it securely.</p>

				<div class="key-display">
					<label for="write-key-display">WRITE KEY</label>
					<div class="key-row">
						<code id="write-key-display" class="key-value">{writeKey}</code>
						<button class="btn-secondary" onclick={copyKey}>
							{copied ? 'COPIED' : 'COPY'}
						</button>
					</div>
				</div>

				<a href="/dashboard" class="btn-primary auth-btn">Enter Dashboard</a>
			</div>
		{:else}
			<h1 class="auth-title">Initialize Pipeline</h1>
			<p class="auth-desc">Create your EU-sovereign data pipeline</p>

			{#if error}
				<div class="auth-error">
					<span>⚠</span> {error}
				</div>
			{/if}

			<form onsubmit={handleRegister} class="auth-form">
				<div class="form-group">
					<label for="org">ORGANIZATION</label>
					<input
						id="org"
						type="text"
						bind:value={orgName}
						placeholder="Acme GmbH"
						required
					/>
				</div>

				<div class="form-group">
					<label for="name">YOUR NAME</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						placeholder="Max Mustermann"
						required
					/>
				</div>

				<div class="form-group">
					<label for="email">EMAIL</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="max@acme.eu"
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
						placeholder="min. 8 characters"
						required
						minlength="8"
						autocomplete="new-password"
					/>
				</div>

				<button type="submit" class="btn-primary auth-btn" disabled={loading}>
					{loading ? 'INITIALIZING...' : 'INITIALIZE PIPELINE'}
				</button>
			</form>

			<p class="auth-footer">
				Already initialized? <a href="/auth/login">Access Terminal</a>
			</p>
		{/if}
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
		display: inline-block;
		text-align: center;
		text-decoration: none;
	}
	.auth-footer {
		margin-top: 1.5rem;
		font-size: 0.72rem;
		color: var(--color-text-dim);
	}
	.success-state {
		text-align: center;
	}
	.key-display {
		margin: 1.5rem 0;
		text-align: left;
	}
	.key-display label {
		display: block;
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--color-text-dim);
		margin-bottom: 0.35rem;
	}
	.key-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.key-value {
		flex: 1;
		background: var(--color-bg);
		border: 1px solid var(--color-primary);
		padding: 0.6rem 0.75rem;
		border-radius: 2px;
		font-size: 0.72rem;
		color: var(--color-primary);
		word-break: break-all;
	}
</style>
