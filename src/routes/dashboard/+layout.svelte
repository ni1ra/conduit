<script lang="ts">
	let { data, children } = $props();
	let session = data.session;
	let sidebarCollapsed = $state(false);

	const navItems = [
		{ href: '/dashboard', label: 'Overview', icon: '◈' },
		{ href: '/dashboard/events', label: 'Events', icon: '⚡' },
		{ href: '/dashboard/profiles', label: 'Profiles', icon: '👤' },
		{ href: '/dashboard/segments', label: 'Segments', icon: '◫' },
		{ href: '/dashboard/sources', label: 'Sources', icon: '↓' },
		{ href: '/dashboard/destinations', label: 'Destinations', icon: '↗' },
		{ href: '/dashboard/settings', label: 'Settings', icon: '⚙' }
	];
</script>

<svelte:head>
	<title>Dashboard — CONDUIT</title>
</svelte:head>

<div class="dashboard-layout">
	<!-- SIDEBAR -->
	<aside class="sidebar" class:collapsed={sidebarCollapsed}>
		<div class="sidebar-header">
			<a href="/dashboard" class="sidebar-logo glow-text">◈ CONDUIT</a>
			<button class="sidebar-toggle" onclick={() => sidebarCollapsed = !sidebarCollapsed}>
				{sidebarCollapsed ? '→' : '←'}
			</button>
		</div>

		<div class="sidebar-tenant">
			<span class="badge badge-primary">{session.tenant_name || 'TENANT'}</span>
		</div>

		<nav class="sidebar-nav">
			{#each navItems as item}
				<a href={item.href} class="nav-item">
					<span class="nav-icon">{item.icon}</span>
					{#if !sidebarCollapsed}
						<span class="nav-label">{item.label}</span>
					{/if}
				</a>
			{/each}
		</nav>

		<div class="sidebar-footer">
			<div class="user-info">
				{#if !sidebarCollapsed}
					<div class="user-email">{session.email || 'operator'}</div>
					<span class="badge badge-primary">{session.role || 'user'}</span>
				{/if}
			</div>
			<a href="/auth/logout" class="nav-item disconnect">
				<span class="nav-icon">⏻</span>
				{#if !sidebarCollapsed}
					<span class="nav-label">Disconnect</span>
				{/if}
			</a>
		</div>
	</aside>

	<!-- MAIN -->
	<main class="dashboard-main">
		<div class="topbar">
			<div class="topbar-left">
				<span class="topbar-breadcrumb">CONDUIT</span>
				<span class="topbar-sep">/</span>
				<span class="topbar-page">Dashboard</span>
			</div>
			<div class="topbar-right">
				<span class="badge badge-success">EU-ONLY</span>
			</div>
		</div>
		<div class="dashboard-content">
			{@render children()}
		</div>
	</main>
</div>

<style>
	.dashboard-layout {
		display: flex;
		min-height: 100vh;
	}

	/* SIDEBAR */
	.sidebar {
		width: 220px;
		background: var(--color-bg-sidebar);
		border-right: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		transition: width 0.2s;
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		z-index: 100;
	}
	.sidebar.collapsed { width: 56px; }
	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem;
		border-bottom: 1px solid var(--color-border);
	}
	.sidebar-logo {
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: var(--color-primary);
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
	}
	.sidebar.collapsed .sidebar-logo { font-size: 0; }
	.sidebar.collapsed .sidebar-logo::before { content: '◈'; font-size: 1rem; }
	.sidebar-toggle {
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-dim);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.7rem;
		padding: 0.2rem 0.4rem;
		border-radius: 2px;
	}
	.sidebar-toggle:hover { color: var(--color-primary); border-color: var(--color-primary); }
	.sidebar-tenant {
		padding: 0.75rem;
		border-bottom: 1px solid var(--color-border);
		text-align: center;
	}
	.sidebar.collapsed .sidebar-tenant { display: none; }

	/* NAV */
	.sidebar-nav {
		flex: 1;
		padding: 0.5rem 0;
		overflow-y: auto;
	}
	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.55rem 0.75rem;
		color: var(--color-text);
		text-decoration: none;
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		transition: all 0.15s;
		border-left: 2px solid transparent;
	}
	.nav-item:hover {
		color: var(--color-primary);
		background: var(--color-primary-dim);
		border-left-color: var(--color-primary);
	}
	.nav-icon {
		width: 20px;
		text-align: center;
		flex-shrink: 0;
	}
	.nav-label {
		white-space: nowrap;
		overflow: hidden;
	}

	/* SIDEBAR FOOTER */
	.sidebar-footer {
		border-top: 1px solid var(--color-border);
		padding: 0.5rem 0;
	}
	.user-info {
		padding: 0.5rem 0.75rem;
	}
	.user-email {
		font-size: 0.65rem;
		color: var(--color-text-dim);
		margin-bottom: 0.3rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.disconnect {
		color: var(--color-error) !important;
	}
	.disconnect:hover {
		background: rgba(255, 68, 68, 0.1) !important;
		border-left-color: var(--color-error) !important;
	}

	/* MAIN */
	.dashboard-main {
		flex: 1;
		margin-left: 220px;
		transition: margin-left 0.2s;
		min-height: 100vh;
	}
	.sidebar.collapsed ~ .dashboard-main { margin-left: 56px; }
	.topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.65rem 1.5rem;
		border-bottom: 1px solid var(--color-border);
		background: rgba(10, 10, 15, 0.8);
		backdrop-filter: blur(8px);
		position: sticky;
		top: 0;
		z-index: 50;
	}
	.topbar-left {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.7rem;
	}
	.topbar-breadcrumb { color: var(--color-text-dim); }
	.topbar-sep { color: var(--color-border-bright); }
	.topbar-page { color: var(--color-text-bright); font-weight: 600; }
	.dashboard-content {
		padding: 1.5rem;
	}
</style>
