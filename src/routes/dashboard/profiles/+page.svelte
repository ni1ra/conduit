<script lang="ts">
	let { data } = $props();
	let profiles = data.profiles;
	let searchQuery = $state(data.search);

	function doSearch() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('user_id', searchQuery);
		window.location.href = `/dashboard/profiles?${params}`;
	}

	function truncateTraits(traits: Record<string, unknown> | null | undefined): string {
		if (!traits) return '—';
		const str = JSON.stringify(traits);
		return str.length > 60 ? str.slice(0, 60) + '...' : str;
	}

	function formatDate(ts: string | null): string {
		if (!ts) return '—';
		try {
			return new Date(ts).toLocaleDateString();
		} catch {
			return ts;
		}
	}
</script>

<div class="profiles-page">
	<h1 class="page-title">User <span class="glow-text">Profiles</span></h1>

	{#if data.error}
		<div class="alert-error">{data.error}</div>
	{/if}

	<!-- SEARCH -->
	<div class="card search-bar">
		<div class="search-row">
			<div class="search-group">
				<label for="search-uid">SEARCH BY USER ID</label>
				<input
					id="search-uid"
					type="text"
					bind:value={searchQuery}
					placeholder="user_abc123"
					onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && doSearch()}
				/>
			</div>
			<button class="btn-primary" onclick={doSearch}>SEARCH</button>
		</div>
	</div>

	<!-- PROFILES TABLE -->
	<div class="card">
		{#if profiles.length > 0}
			<div class="table-scroll">
				<table>
					<thead>
						<tr>
							<th>User ID</th>
							<th>Traits</th>
							<th style="text-align:right">Events</th>
							<th>First Seen</th>
							<th>Last Seen</th>
						</tr>
					</thead>
					<tbody>
						{#each profiles as profile}
							<tr>
								<td class="cell-uid">{profile.user_id || '—'}</td>
								<td class="cell-traits">{truncateTraits(profile.traits)}</td>
								<td style="text-align:right">{profile.event_count?.toLocaleString() ?? '—'}</td>
								<td class="cell-date">{formatDate(profile.first_seen)}</td>
								<td class="cell-date">{formatDate(profile.last_seen)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="empty-state">No profiles found. Profiles are created when events with user IDs are collected.</p>
		{/if}
	</div>
</div>

<style>
	.profiles-page { max-width: 1100px; }
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
		margin-bottom: 1rem;
	}
	.search-bar { margin-bottom: 1rem; }
	.search-row {
		display: flex;
		gap: 0.75rem;
		align-items: flex-end;
	}
	.search-group {
		flex: 1;
	}
	.search-group label {
		display: block;
		font-size: 0.58rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--color-text-dim);
		margin-bottom: 0.3rem;
		text-transform: uppercase;
	}
	.table-scroll { overflow-x: auto; }
	.cell-uid { color: var(--color-text-bright); font-weight: 500; }
	.cell-traits {
		font-size: 0.65rem;
		color: var(--color-text-dim);
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.cell-date { font-size: 0.68rem; color: var(--color-text-dim); white-space: nowrap; }
	.empty-state {
		font-size: 0.75rem;
		color: var(--color-text-dim);
		text-align: center;
		padding: 2.5rem 0;
	}
</style>
