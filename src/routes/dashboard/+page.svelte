<script lang="ts">
	let { data } = $props();
	let stats = data.stats;

	const statCards = [
		{
			label: 'Events (24h)',
			value: stats?.events_24h?.toLocaleString() ?? '—',
			icon: '⚡',
			trend: stats?.events_trend ?? null
		},
		{
			label: 'Active Profiles',
			value: stats?.active_profiles?.toLocaleString() ?? '—',
			icon: '👤',
			trend: null
		},
		{
			label: 'Sources',
			value: stats?.source_count?.toString() ?? '—',
			icon: '↓',
			trend: null
		},
		{
			label: 'Destinations',
			value: stats?.destination_count?.toString() ?? '—',
			icon: '↗',
			trend: null
		},
		{
			label: 'Segments',
			value: stats?.segment_count?.toString() ?? '—',
			icon: '◫',
			trend: null
		}
	];

	let topEvents: Array<{ event_name: string; count: number }> = stats?.top_events ?? [];
	let dailyTrend: Array<{ date: string; count: number }> = stats?.daily_trend ?? [];
	let maxTrendCount = Math.max(...dailyTrend.map(d => d.count), 1);
</script>

<div class="overview">
	<h1 class="page-title">Pipeline <span class="glow-text">Overview</span></h1>

	{#if data.error}
		<div class="alert-error">{data.error}</div>
	{/if}

	<!-- STAT CARDS -->
	<div class="stats-grid">
		{#each statCards as card}
			<div class="card stat-card">
				<div class="stat-icon">{card.icon}</div>
				<div class="stat-value">{card.value}</div>
				<div class="stat-label">{card.label}</div>
				{#if card.trend !== null}
					<div class="stat-trend" class:positive={card.trend >= 0} class:negative={card.trend < 0}>
						{card.trend >= 0 ? '+' : ''}{card.trend}%
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- TOP EVENT TYPES -->
	<div class="card section-card">
		<h2 class="section-heading">Top Event Types</h2>
		{#if topEvents.length > 0}
			<table>
				<thead>
					<tr>
						<th>Event Name</th>
						<th style="text-align:right">Count (24h)</th>
						<th style="text-align:right">Share</th>
					</tr>
				</thead>
				<tbody>
					{#each topEvents as evt}
						{@const total = topEvents.reduce((s, e) => s + e.count, 0)}
						<tr>
							<td>
								<span class="badge badge-primary">{evt.event_name}</span>
							</td>
							<td style="text-align:right">{evt.count.toLocaleString()}</td>
							<td style="text-align:right">{total > 0 ? ((evt.count / total) * 100).toFixed(1) : '0'}%</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<p class="empty-state">No events recorded yet. Integrate the SDK to start collecting.</p>
		{/if}
	</div>

	<!-- DAILY TREND -->
	<div class="card section-card">
		<h2 class="section-heading">Daily Event Trend</h2>
		{#if dailyTrend.length > 0}
			<div class="trend-chart">
				{#each dailyTrend as day}
					<div class="trend-bar-wrapper">
						<div
							class="trend-bar"
							style="height: {(day.count / maxTrendCount) * 100}%"
							title="{day.date}: {day.count.toLocaleString()} events"
						></div>
						<div class="trend-label">{day.date.slice(5)}</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="empty-state">Trend data will appear after 24 hours of event collection.</p>
		{/if}
	</div>
</div>

<style>
	.overview { max-width: 1000px; }
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
		margin-bottom: 1.5rem;
	}

	/* STAT CARDS */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}
	.stat-card {
		text-align: center;
		position: relative;
	}
	.stat-icon {
		font-size: 1.2rem;
		margin-bottom: 0.4rem;
	}
	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-bright);
		margin-bottom: 0.15rem;
	}
	.stat-label {
		font-size: 0.6rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-dim);
	}
	.stat-trend {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		font-size: 0.6rem;
		font-weight: 700;
	}
	.stat-trend.positive { color: var(--color-success); }
	.stat-trend.negative { color: var(--color-error); }

	/* SECTIONS */
	.section-card { margin-bottom: 1.25rem; }
	.section-heading {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-dim);
		margin-bottom: 1rem;
	}
	.empty-state {
		font-size: 0.75rem;
		color: var(--color-text-dim);
		text-align: center;
		padding: 2rem 0;
	}

	/* TREND CHART */
	.trend-chart {
		display: flex;
		align-items: flex-end;
		gap: 4px;
		height: 150px;
		padding-top: 1rem;
	}
	.trend-bar-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		justify-content: flex-end;
	}
	.trend-bar {
		width: 100%;
		background: var(--color-primary);
		opacity: 0.7;
		border-radius: 2px 2px 0 0;
		min-height: 2px;
		transition: opacity 0.15s;
	}
	.trend-bar:hover { opacity: 1; }
	.trend-label {
		font-size: 0.55rem;
		color: var(--color-text-dim);
		margin-top: 0.3rem;
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
	}
</style>
