<script lang="ts">
	let { data } = $props();
	let events = data.events;
	let filterType = $state(data.filters.type);
	let filterName = $state(data.filters.event_name);
	let filterUser = $state(data.filters.user_id);

	function applyFilters() {
		const params = new URLSearchParams();
		if (filterType) params.set('type', filterType);
		if (filterName) params.set('event_name', filterName);
		if (filterUser) params.set('user_id', filterUser);
		window.location.href = `/dashboard/events?${params}`;
	}

	function clearFilters() {
		window.location.href = '/dashboard/events';
	}

	function truncateProps(props: Record<string, unknown> | null | undefined): string {
		if (!props) return '—';
		const str = JSON.stringify(props);
		return str.length > 80 ? str.slice(0, 80) + '...' : str;
	}

	function formatTime(ts: string): string {
		try {
			return new Date(ts).toLocaleString();
		} catch {
			return ts;
		}
	}
</script>

<div class="events-page">
	<h1 class="page-title">Event <span class="glow-text">Explorer</span></h1>

	{#if data.error}
		<div class="alert-error">{data.error}</div>
	{/if}

	<!-- FILTERS -->
	<div class="card filter-bar">
		<div class="filter-row">
			<div class="filter-group">
				<label for="filter-type">TYPE</label>
				<select id="filter-type" bind:value={filterType}>
					<option value="">All</option>
					<option value="track">track</option>
					<option value="identify">identify</option>
					<option value="page">page</option>
					<option value="group">group</option>
				</select>
			</div>
			<div class="filter-group">
				<label for="filter-name">EVENT NAME</label>
				<input id="filter-name" type="text" bind:value={filterName} placeholder="e.g. Purchase" />
			</div>
			<div class="filter-group">
				<label for="filter-user">USER ID</label>
				<input id="filter-user" type="text" bind:value={filterUser} placeholder="user_abc123" />
			</div>
			<div class="filter-actions">
				<button class="btn-primary" onclick={applyFilters}>FILTER</button>
				<button class="btn-secondary" onclick={clearFilters}>CLEAR</button>
			</div>
		</div>
	</div>

	<!-- EVENTS TABLE -->
	<div class="card">
		{#if events.length > 0}
			<div class="table-scroll">
				<table>
					<thead>
						<tr>
							<th>Timestamp</th>
							<th>Type</th>
							<th>Event Name</th>
							<th>User ID</th>
							<th>Properties</th>
						</tr>
					</thead>
					<tbody>
						{#each events as evt}
							<tr>
								<td class="cell-time">{formatTime(evt.timestamp)}</td>
								<td>
									<span class="badge badge-primary">{evt.type || '—'}</span>
								</td>
								<td class="cell-name">{evt.event_name || evt.event || '—'}</td>
								<td class="cell-uid">{evt.user_id || evt.anonymous_id || '—'}</td>
								<td class="cell-props">{truncateProps(evt.properties)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="empty-state">No events found. Adjust filters or integrate the SDK to start collecting.</p>
		{/if}
	</div>
</div>

<style>
	.events-page { max-width: 1100px; }
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
	.filter-bar { margin-bottom: 1rem; }
	.filter-row {
		display: flex;
		gap: 0.75rem;
		align-items: flex-end;
		flex-wrap: wrap;
	}
	.filter-group {
		flex: 1;
		min-width: 150px;
	}
	.filter-group label {
		display: block;
		font-size: 0.58rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--color-text-dim);
		margin-bottom: 0.3rem;
		text-transform: uppercase;
	}
	.filter-group select, .filter-group input {
		font-size: 0.72rem;
	}
	.filter-actions {
		display: flex;
		gap: 0.4rem;
	}
	.table-scroll { overflow-x: auto; }
	.cell-time { font-size: 0.68rem; color: var(--color-text-dim); white-space: nowrap; }
	.cell-name { color: var(--color-text-bright); font-weight: 500; }
	.cell-uid { font-size: 0.68rem; }
	.cell-props {
		font-size: 0.65rem;
		color: var(--color-text-dim);
		max-width: 250px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.empty-state {
		font-size: 0.75rem;
		color: var(--color-text-dim);
		text-align: center;
		padding: 2.5rem 0;
	}
</style>
