<script lang="ts">
	let { data } = $props();
	let admin = data.admin;

	let tenants: Array<{
		id: string;
		name: string;
		slug: string;
		plan: string;
		user_count: number;
		event_count: number;
		created_at: string;
	}> = admin?.tenants ?? [];

	let users: Array<{
		id: string;
		email: string;
		name: string;
		role: string;
		tenant_name: string;
		last_login: string;
	}> = admin?.users ?? [];

	let stats = admin?.stats ?? {
		total_tenants: 0,
		total_users: 0,
		total_events: 0,
		total_sources: 0,
		total_destinations: 0
	};

	function formatDate(ts: string | null): string {
		if (!ts) return '--';
		try {
			return new Date(ts).toLocaleDateString();
		} catch {
			return ts;
		}
	}
</script>

<svelte:head>
	<title>Admin Panel -- CONDUIT</title>
</svelte:head>

<div class="admin-layout">
	<nav class="admin-nav">
		<a href="/dashboard" class="admin-logo glow-text">&#9672; CONDUIT</a>
		<span class="badge badge-warning">SUPERUSER</span>
	</nav>

	<div class="admin-content">
		<h1 class="page-title">System <span class="glow-text">Administration</span></h1>

		{#if data.error}
			<div class="alert-error">{data.error}</div>
		{/if}

		<!-- CROSS-TENANT STATS -->
		<div class="stats-grid">
			<div class="card stat-card">
				<div class="stat-value">{stats.total_tenants}</div>
				<div class="stat-label">Tenants</div>
			</div>
			<div class="card stat-card">
				<div class="stat-value">{stats.total_users}</div>
				<div class="stat-label">Users</div>
			</div>
			<div class="card stat-card">
				<div class="stat-value">{stats.total_events?.toLocaleString()}</div>
				<div class="stat-label">Total Events</div>
			</div>
			<div class="card stat-card">
				<div class="stat-value">{stats.total_sources}</div>
				<div class="stat-label">Sources</div>
			</div>
			<div class="card stat-card">
				<div class="stat-value">{stats.total_destinations}</div>
				<div class="stat-label">Destinations</div>
			</div>
		</div>

		<!-- TENANTS -->
		<div class="card section-card">
			<h2 class="section-heading">Tenants</h2>
			{#if tenants.length > 0}
				<div class="table-scroll">
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Slug</th>
								<th>Plan</th>
								<th style="text-align:right">Users</th>
								<th style="text-align:right">Events</th>
								<th>Created</th>
							</tr>
						</thead>
						<tbody>
							{#each tenants as tenant}
								<tr>
									<td class="cell-name">{tenant.name}</td>
									<td class="cell-slug">{tenant.slug}</td>
									<td><span class="badge badge-primary">{tenant.plan || 'Free'}</span></td>
									<td style="text-align:right">{tenant.user_count}</td>
									<td style="text-align:right">{tenant.event_count?.toLocaleString()}</td>
									<td class="cell-date">{formatDate(tenant.created_at)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="empty-state">No tenants found.</p>
			{/if}
		</div>

		<!-- USERS -->
		<div class="card section-card">
			<h2 class="section-heading">Users</h2>
			{#if users.length > 0}
				<div class="table-scroll">
					<table>
						<thead>
							<tr>
								<th>Email</th>
								<th>Name</th>
								<th>Role</th>
								<th>Tenant</th>
								<th>Last Login</th>
							</tr>
						</thead>
						<tbody>
							{#each users as user}
								<tr>
									<td class="cell-email">{user.email}</td>
									<td>{user.name || '--'}</td>
									<td>
										{#if user.role === 'superuser' || user.role === 'superadmin'}
											<span class="badge badge-warning">{user.role}</span>
										{:else if user.role === 'admin'}
											<span class="badge badge-primary">{user.role}</span>
										{:else}
											<span class="badge badge-success">{user.role || 'user'}</span>
										{/if}
									</td>
									<td>{user.tenant_name || '--'}</td>
									<td class="cell-date">{formatDate(user.last_login)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="empty-state">No users found.</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.admin-layout {
		min-height: 100vh;
	}
	.admin-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.5rem;
		border-bottom: 1px solid var(--color-border);
		background: rgba(10, 10, 15, 0.9);
		backdrop-filter: blur(12px);
	}
	.admin-logo {
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: var(--color-primary);
		text-decoration: none;
	}
	.admin-content {
		max-width: 1100px;
		margin: 0 auto;
		padding: 1.5rem;
	}
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

	/* STATS */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}
	.stat-card {
		text-align: center;
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
	.table-scroll { overflow-x: auto; }
	.cell-name { color: var(--color-text-bright); font-weight: 500; }
	.cell-slug { font-size: 0.68rem; color: var(--color-text-dim); }
	.cell-email { color: var(--color-text-bright); font-weight: 500; font-size: 0.72rem; }
	.cell-date { font-size: 0.68rem; color: var(--color-text-dim); white-space: nowrap; }
	.empty-state {
		font-size: 0.75rem;
		color: var(--color-text-dim);
		text-align: center;
		padding: 2rem 0;
	}

	@media (max-width: 768px) {
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
	}
</style>
