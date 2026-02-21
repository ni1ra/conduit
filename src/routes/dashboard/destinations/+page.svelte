<script lang="ts">
	let { data } = $props();
	let destinations = data.destinations;

	let showCreate = $state(false);
	let newName = $state('');
	let newType = $state('webhook');
	let newConfig = $state('');
	let createError = $state('');
	let creating = $state(false);

	async function createDestination() {
		createError = '';
		creating = true;

		try {
			const body: Record<string, unknown> = {
				name: newName,
				type: newType,
				config: {}
			};

			if (newType === 'webhook' && newConfig) {
				body.config = { url: newConfig };
			} else if (newType === 'postgres' && newConfig) {
				body.config = { connection_string: newConfig };
			} else if (newType === 's3' && newConfig) {
				body.config = { bucket: newConfig };
			}

			const res = await fetch('/api/v1/destinations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const d = await res.json().catch(() => ({}));
				createError = d.error || `Failed [${res.status}]`;
				return;
			}

			window.location.reload();
		} catch {
			createError = 'Connection failed';
		} finally {
			creating = false;
		}
	}

	function getConfigLabel(type: string): string {
		switch (type) {
			case 'webhook': return 'WEBHOOK URL';
			case 'postgres': return 'CONNECTION STRING';
			case 's3': return 'BUCKET NAME';
			default: return 'CONFIG';
		}
	}

	function getConfigPlaceholder(type: string): string {
		switch (type) {
			case 'webhook': return 'https://api.example.eu/events';
			case 'postgres': return 'postgresql://user:pass@host:5432/db';
			case 's3': return 'my-eu-bucket';
			default: return '';
		}
	}
</script>

<div class="destinations-page">
	<div class="page-header">
		<h1 class="page-title"><span class="glow-text">Destinations</span></h1>
		<button class="btn-primary" onclick={() => showCreate = !showCreate}>
			{showCreate ? 'CANCEL' : '+ NEW DESTINATION'}
		</button>
	</div>

	{#if data.error}
		<div class="alert-error">{data.error}</div>
	{/if}

	<!-- CREATE FORM -->
	{#if showCreate}
		<div class="card create-form">
			<h2 class="form-heading">Configure Destination</h2>

			{#if createError}
				<div class="alert-error">{createError}</div>
			{/if}

			<div class="form-group">
				<label for="dest-name">DESTINATION NAME</label>
				<input id="dest-name" type="text" bind:value={newName} placeholder="e.g. Analytics Warehouse" required />
			</div>

			<div class="form-group">
				<label for="dest-type">TYPE</label>
				<select id="dest-type" bind:value={newType}>
					<option value="webhook">Webhook</option>
					<option value="postgres">PostgreSQL</option>
					<option value="s3">S3-Compatible</option>
				</select>
			</div>

			<div class="form-group">
				<label for="dest-config">{getConfigLabel(newType)}</label>
				<input id="dest-config" type="text" bind:value={newConfig} placeholder={getConfigPlaceholder(newType)} />
			</div>

			<button class="btn-primary" onclick={createDestination} disabled={creating || !newName}>
				{creating ? 'CREATING...' : 'CREATE DESTINATION'}
			</button>
		</div>
	{/if}

	<!-- DESTINATIONS LIST -->
	<div class="card">
		{#if destinations.length > 0}
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>Status</th>
						<th style="text-align:right">Delivered</th>
						<th style="text-align:right">Failed</th>
						<th>Last Delivery</th>
					</tr>
				</thead>
				<tbody>
					{#each destinations as dest}
						<tr>
							<td class="cell-name">{dest.name}</td>
							<td><span class="badge badge-primary">{dest.type || 'webhook'}</span></td>
							<td>
								{#if dest.active !== false}
									<span class="badge badge-success">ACTIVE</span>
								{:else}
									<span class="badge badge-error">INACTIVE</span>
								{/if}
							</td>
							<td style="text-align:right" class="cell-stat">{dest.delivered?.toLocaleString() ?? '—'}</td>
							<td style="text-align:right" class="cell-stat-err">{dest.failed?.toLocaleString() ?? '0'}</td>
							<td class="cell-date">
								{#if dest.last_delivery}
									{new Date(dest.last_delivery).toLocaleString()}
								{:else}
									—
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<p class="empty-state">No destinations configured. Create one to start routing events.</p>
		{/if}
	</div>
</div>

<style>
	.destinations-page { max-width: 1100px; }
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	.page-title {
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-bright);
	}
	.alert-error {
		background: rgba(255, 68, 68, 0.1);
		border: 1px solid rgba(255, 68, 68, 0.3);
		color: var(--color-error);
		padding: 0.6rem 0.8rem;
		border-radius: 2px;
		font-size: 0.72rem;
		margin-bottom: 1rem;
	}
	.create-form { margin-bottom: 1rem; }
	.form-heading {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-dim);
		margin-bottom: 1rem;
	}
	.form-group {
		margin-bottom: 0.75rem;
	}
	.form-group label {
		display: block;
		font-size: 0.58rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--color-text-dim);
		margin-bottom: 0.3rem;
		text-transform: uppercase;
	}
	.cell-name { color: var(--color-text-bright); font-weight: 500; }
	.cell-stat { color: var(--color-success); }
	.cell-stat-err { color: var(--color-error); }
	.cell-date { font-size: 0.68rem; color: var(--color-text-dim); white-space: nowrap; }
	.empty-state {
		font-size: 0.75rem;
		color: var(--color-text-dim);
		text-align: center;
		padding: 2.5rem 0;
	}
</style>
