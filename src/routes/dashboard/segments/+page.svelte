<script lang="ts">
	let { data } = $props();
	let segments = data.segments;

	let showCreate = $state(false);
	let newName = $state('');
	let newDesc = $state('');
	let newRules = $state('{\n  "conditions": []\n}');
	let createError = $state('');
	let creating = $state(false);

	async function createSegment() {
		createError = '';
		creating = true;

		try {
			JSON.parse(newRules);
		} catch {
			createError = 'Invalid JSON in rules';
			creating = false;
			return;
		}

		try {
			const res = await fetch('/api/v1/segments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: newName,
					description: newDesc,
					rules: JSON.parse(newRules)
				})
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
</script>

<div class="segments-page">
	<div class="page-header">
		<h1 class="page-title">Audience <span class="glow-text">Segments</span></h1>
		<button class="btn-primary" onclick={() => showCreate = !showCreate}>
			{showCreate ? 'CANCEL' : '+ NEW SEGMENT'}
		</button>
	</div>

	{#if data.error}
		<div class="alert-error">{data.error}</div>
	{/if}

	<!-- CREATE FORM -->
	{#if showCreate}
		<div class="card create-form">
			<h2 class="form-heading">Define Segment</h2>

			{#if createError}
				<div class="alert-error">{createError}</div>
			{/if}

			<div class="form-group">
				<label for="seg-name">SEGMENT NAME</label>
				<input id="seg-name" type="text" bind:value={newName} placeholder="e.g. High-Value EU Users" required />
			</div>

			<div class="form-group">
				<label for="seg-desc">DESCRIPTION</label>
				<input id="seg-desc" type="text" bind:value={newDesc} placeholder="Users with >3 purchases in last 30d" />
			</div>

			<div class="form-group">
				<label for="seg-rules">RULES (JSON)</label>
				<textarea id="seg-rules" rows="6" bind:value={newRules}></textarea>
			</div>

			<button class="btn-primary" onclick={createSegment} disabled={creating || !newName}>
				{creating ? 'CREATING...' : 'CREATE SEGMENT'}
			</button>
		</div>
	{/if}

	<!-- SEGMENTS LIST -->
	<div class="card">
		{#if segments.length > 0}
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Description</th>
						<th style="text-align:right">Profiles</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{#each segments as seg}
						<tr>
							<td class="cell-name">{seg.name}</td>
							<td class="cell-desc">{seg.description || '—'}</td>
							<td style="text-align:right">{seg.profile_count?.toLocaleString() ?? '—'}</td>
							<td>
								{#if seg.active !== false}
									<span class="badge badge-success">ACTIVE</span>
								{:else}
									<span class="badge badge-error">INACTIVE</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<p class="empty-state">No segments defined. Create one to start building audiences.</p>
		{/if}
	</div>
</div>

<style>
	.segments-page { max-width: 1000px; }
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
	.create-form {
		margin-bottom: 1rem;
	}
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
	.form-group textarea {
		font-size: 0.72rem;
		resize: vertical;
	}
	.cell-name { color: var(--color-text-bright); font-weight: 500; }
	.cell-desc { font-size: 0.7rem; color: var(--color-text-dim); max-width: 250px; }
	.empty-state {
		font-size: 0.75rem;
		color: var(--color-text-dim);
		text-align: center;
		padding: 2.5rem 0;
	}
</style>
