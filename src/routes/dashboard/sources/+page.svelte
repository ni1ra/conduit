<script lang="ts">
	let { data } = $props();
	let sources = data.sources;

	let showCreate = $state(false);
	let newName = $state('');
	let createError = $state('');
	let creating = $state(false);
	let expandedSource: string | null = $state(null);

	async function createSource() {
		createError = '';
		creating = true;

		try {
			const res = await fetch('/api/v1/sources', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newName })
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

	function toggleSnippet(id: string) {
		expandedSource = expandedSource === id ? null : id;
	}

	function getSnippet(writeKey: string): string {
		return `<script>
  !function(){var c=window.conduit=window.conduit||[];
  c.methods=["track","identify","page","group"];
  c.factory=function(m){return function(){
    var a=Array.prototype.slice.call(arguments);
    a.unshift(m);c.push(a);return c;
  }};for(var i=0;i<c.methods.length;i++){
    var m=c.methods[i];c[m]=c.factory(m);
  }c.writeKey="${writeKey}";
  c.host="YOUR_CONDUIT_HOST";
  var s=document.createElement("script");
  s.type="text/javascript";s.async=!0;
  s.src=c.host+"/sdk/conduit.min.js";
  var x=document.getElementsByTagName("script")[0];
  x.parentNode.insertBefore(s,x);
}();
<\/script>`;
	}
</script>

<div class="sources-page">
	<div class="page-header">
		<h1 class="page-title">Data <span class="glow-text">Sources</span></h1>
		<button class="btn-primary" onclick={() => showCreate = !showCreate}>
			{showCreate ? 'CANCEL' : '+ NEW SOURCE'}
		</button>
	</div>

	{#if data.error}
		<div class="alert-error">{data.error}</div>
	{/if}

	<!-- CREATE FORM -->
	{#if showCreate}
		<div class="card create-form">
			<h2 class="form-heading">Create Source</h2>

			{#if createError}
				<div class="alert-error">{createError}</div>
			{/if}

			<div class="form-row">
				<div class="form-group">
					<label for="src-name">SOURCE NAME</label>
					<input id="src-name" type="text" bind:value={newName} placeholder="e.g. Marketing Website" required />
				</div>
				<button class="btn-primary" onclick={createSource} disabled={creating || !newName}>
					{creating ? 'CREATING...' : 'CREATE'}
				</button>
			</div>
		</div>
	{/if}

	<!-- SOURCES LIST -->
	<div class="card">
		{#if sources.length > 0}
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>Write Key</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each sources as src}
						<tr>
							<td class="cell-name">{src.name}</td>
							<td><span class="badge badge-primary">{src.type || 'javascript'}</span></td>
							<td class="cell-key">{src.write_key || '—'}</td>
							<td>
								{#if src.active !== false}
									<span class="badge badge-success">ACTIVE</span>
								{:else}
									<span class="badge badge-error">INACTIVE</span>
								{/if}
							</td>
							<td>
								<button
									class="btn-secondary btn-sm"
									onclick={() => toggleSnippet(src.id)}
								>
									{expandedSource === src.id ? 'HIDE' : 'SNIPPET'}
								</button>
							</td>
						</tr>
						{#if expandedSource === src.id}
							<tr>
								<td colspan="5" class="snippet-cell">
									<div class="snippet-container">
										<div class="snippet-label">JS SDK INTEGRATION</div>
										<pre class="snippet-code">{@html getSnippet(src.write_key || 'YOUR_WRITE_KEY')}</pre>
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		{:else}
			<p class="empty-state">No sources configured. Create one to start collecting events.</p>
		{/if}
	</div>
</div>

<style>
	.sources-page { max-width: 1100px; }
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
		margin-bottom: 0.75rem;
	}
	.form-row {
		display: flex;
		gap: 0.75rem;
		align-items: flex-end;
	}
	.form-group {
		flex: 1;
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
	.cell-key {
		font-size: 0.65rem;
		color: var(--color-text-dim);
		max-width: 180px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.btn-sm {
		padding: 0.3rem 0.6rem;
		font-size: 0.6rem;
	}
	.snippet-cell {
		background: rgba(255, 140, 0, 0.03) !important;
		padding: 0 !important;
	}
	.snippet-container {
		padding: 1rem;
	}
	.snippet-label {
		font-size: 0.58rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--color-text-dim);
		margin-bottom: 0.5rem;
		text-transform: uppercase;
	}
	.snippet-code {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 2px;
		padding: 0.75rem;
		font-size: 0.65rem;
		line-height: 1.5;
		overflow-x: auto;
		color: var(--color-text);
	}
	.empty-state {
		font-size: 0.75rem;
		color: var(--color-text-dim);
		text-align: center;
		padding: 2.5rem 0;
	}
</style>
