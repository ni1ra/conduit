<script lang="ts">
	let { data } = $props();
	let settings = data.settings;

	let exportLoading = $state(false);
	let exportDone = $state(false);
	let deleteUserId = $state('');
	let deleteLoading = $state(false);
	let deleteResult = $state('');
	let deleteError = $state('');

	async function handleExport() {
		exportLoading = true;
		exportDone = false;

		try {
			const res = await fetch('/api/v1/compliance/gdpr/export', { method: 'POST' });
			if (res.ok) {
				const blob = await res.blob();
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `conduit-data-export-${Date.now()}.json`;
				a.click();
				URL.revokeObjectURL(url);
				exportDone = true;
			}
		} catch {
			// silent
		} finally {
			exportLoading = false;
		}
	}

	async function handleDeletion() {
		if (!deleteUserId.trim()) return;
		deleteLoading = true;
		deleteResult = '';
		deleteError = '';

		try {
			const res = await fetch('/api/v1/compliance/gdpr/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: deleteUserId.trim() })
			});

			if (res.ok) {
				deleteResult = `Deletion request for "${deleteUserId}" has been queued. All associated data will be purged within 72 hours per GDPR Art. 17.`;
				deleteUserId = '';
			} else {
				const d = await res.json().catch(() => ({}));
				deleteError = d.error || `Deletion failed [${res.status}]`;
			}
		} catch {
			deleteError = 'Connection failed';
		} finally {
			deleteLoading = false;
		}
	}
</script>

<div class="settings-page">
	<h1 class="page-title">Pipeline <span class="glow-text">Settings</span></h1>

	{#if data.error}
		<div class="alert-error">{data.error}</div>
	{/if}

	<!-- ORG INFO -->
	<div class="card section-card">
		<h2 class="section-heading">Organization</h2>
		<div class="info-grid">
			<div class="info-item">
				<span class="info-label">NAME</span>
				<span class="info-value">{settings?.org_name || settings?.tenant_name || '—'}</span>
			</div>
			<div class="info-item">
				<span class="info-label">SLUG</span>
				<span class="info-value">{settings?.slug || '—'}</span>
			</div>
			<div class="info-item">
				<span class="info-label">PLAN</span>
				<span class="badge badge-primary">{settings?.plan || 'Free'}</span>
			</div>
		</div>
	</div>

	<!-- GDPR -->
	<div class="card section-card gdpr-card">
		<div class="gdpr-header">
			<h2 class="section-heading">
				<span class="eu-flag">&#127466;&#127482;</span> GDPR Compliance
			</h2>
			<span class="badge badge-success">COMPLIANT</span>
		</div>

		<div class="gdpr-section">
			<h3 class="gdpr-article">Art. 15 — Right of Access (Data Export)</h3>
			<p class="gdpr-desc">
				Export all personal data collected by your pipeline. Generates a machine-readable JSON file
				containing all events, profiles, and traits associated with your tenant.
			</p>
			<button class="btn-secondary" onclick={handleExport} disabled={exportLoading}>
				{#if exportLoading}
					EXPORTING...
				{:else if exportDone}
					EXPORT COMPLETE
				{:else}
					EXPORT ALL DATA
				{/if}
			</button>
		</div>

		<div class="gdpr-divider"></div>

		<div class="gdpr-section">
			<h3 class="gdpr-article">Art. 17 — Right to Erasure (Data Deletion)</h3>
			<p class="gdpr-desc">
				Request deletion of all personal data for a specific user. This is irreversible.
				All events, profile data, and traits for the specified user_id will be permanently purged.
			</p>

			{#if deleteResult}
				<div class="alert-success">{deleteResult}</div>
			{/if}
			{#if deleteError}
				<div class="alert-error">{deleteError}</div>
			{/if}

			<div class="delete-row">
				<div class="form-group">
					<label for="delete-uid">USER ID TO DELETE</label>
					<input
						id="delete-uid"
						type="text"
						bind:value={deleteUserId}
						placeholder="user_abc123"
					/>
				</div>
				<button
					class="btn-danger"
					onclick={handleDeletion}
					disabled={deleteLoading || !deleteUserId.trim()}
				>
					{deleteLoading ? 'PROCESSING...' : 'REQUEST DELETION'}
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.settings-page { max-width: 800px; }
	.page-title {
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-bright);
		margin-bottom: 1.5rem;
	}
	.alert-error {
		background: rgba(255, 68, 68, 0.1);
		border: 1px solid rgba(255, 68, 68, 0.3);
		color: var(--color-error);
		padding: 0.6rem 0.8rem;
		border-radius: 2px;
		font-size: 0.72rem;
		margin-bottom: 0.75rem;
	}
	.alert-success {
		background: rgba(0, 204, 136, 0.1);
		border: 1px solid rgba(0, 204, 136, 0.3);
		color: var(--color-success);
		padding: 0.6rem 0.8rem;
		border-radius: 2px;
		font-size: 0.72rem;
		margin-bottom: 0.75rem;
	}
	.section-card { margin-bottom: 1.25rem; }
	.section-heading {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-dim);
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.eu-flag { font-size: 1.1rem; }

	/* ORG INFO */
	.info-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.info-label {
		font-size: 0.58rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--color-text-dim);
		text-transform: uppercase;
	}
	.info-value {
		font-size: 0.82rem;
		color: var(--color-text-bright);
		font-weight: 500;
	}

	/* GDPR */
	.gdpr-card {
		border-color: rgba(0, 204, 136, 0.3);
	}
	.gdpr-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.gdpr-header .section-heading { margin-bottom: 0; }
	.gdpr-section { margin-top: 1.25rem; }
	.gdpr-article {
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--color-text-bright);
		margin-bottom: 0.4rem;
	}
	.gdpr-desc {
		font-size: 0.7rem;
		color: var(--color-text-dim);
		line-height: 1.5;
		margin-bottom: 0.75rem;
	}
	.gdpr-divider {
		border-top: 1px solid var(--color-border);
		margin: 1.25rem 0 0;
	}

	/* DELETE */
	.delete-row {
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
	.btn-danger {
		background: var(--color-error);
		color: #000;
		border: none;
		padding: 0.5rem 1.25rem;
		font-family: inherit;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		cursor: pointer;
		border-radius: 2px;
		transition: all 0.2s;
		white-space: nowrap;
	}
	.btn-danger:hover { box-shadow: 0 0 20px rgba(255, 68, 68, 0.4); }
	.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

	@media (max-width: 600px) {
		.info-grid { grid-template-columns: 1fr; }
	}
</style>
