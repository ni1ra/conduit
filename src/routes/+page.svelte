<script lang="ts">
	let currentYear = new Date().getFullYear();
</script>

<svelte:head>
	<title>CONDUIT — EU-Sovereign Customer Data Platform</title>
	<meta name="description" content="Drop-in Segment replacement. GDPR-native. Your data never leaves the EU." />
</svelte:head>

<!-- FIXED NAV -->
<nav class="landing-nav">
	<div class="nav-inner">
		<a href="/" class="nav-logo glow-text">◈ CONDUIT</a>
		<div class="nav-links">
			<a href="#features">Features</a>
			<a href="#pricing">Pricing</a>
			<a href="/auth/login">Login</a>
			<a href="/auth/register" class="btn-primary">Get Started</a>
		</div>
	</div>
</nav>

<!-- HERO -->
<section class="hero">
	<div class="hero-inner">
		<div class="hero-badge badge badge-primary">EU-SOVEREIGN CDP</div>
		<h1 class="hero-title glow-text">CONDUIT</h1>
		<p class="hero-subtitle">EU-Sovereign Customer Data Platform</p>
		<p class="hero-desc">
			Drop-in Segment replacement. GDPR-native by architecture, not afterthought.
			Your data never leaves the EU. Period.
		</p>
		<div class="hero-actions">
			<a href="/auth/register" class="btn-primary">Initialize Pipeline</a>
			<a href="#features" class="btn-secondary">View Architecture</a>
		</div>

		<!-- CODE SNIPPET -->
		<div class="code-block">
			<div class="code-header">
				<span class="code-dot red"></span>
				<span class="code-dot yellow"></span>
				<span class="code-dot green"></span>
				<span class="code-title">conduit-sdk.js</span>
			</div>
			<pre><code>{@html `<span class="code-comment">// Initialize CONDUIT SDK</span>
<span class="code-keyword">const</span> conduit = <span class="code-keyword">new</span> <span class="code-fn">Conduit</span>(<span class="code-string">"your-write-key"</span>);

<span class="code-comment">// Track events — data stays in EU</span>
conduit.<span class="code-fn">track</span>(<span class="code-string">"Purchase"</span>, {
  <span class="code-prop">product</span>: <span class="code-string">"EU Cloud Pro"</span>,
  <span class="code-prop">revenue</span>: <span class="code-num">99.00</span>,
  <span class="code-prop">currency</span>: <span class="code-string">"EUR"</span>
});`}</code></pre>
		</div>
	</div>
</section>

<!-- FEATURES -->
<section class="features-section" id="features">
	<div class="section-inner">
		<h2 class="section-title">Architecture <span class="glow-text">Modules</span></h2>
		<p class="section-desc">Six core subsystems. Zero US data transfers.</p>
		<div class="features-grid">
			<div class="card feature-card">
				<div class="feature-icon">⚡</div>
				<h3>Event Collection</h3>
				<p>High-throughput ingestion via JS SDK, HTTP API, and server-side libraries. Sub-10ms latency within EU regions.</p>
			</div>
			<div class="card feature-card">
				<div class="feature-icon">🔗</div>
				<h3>Identity Resolution</h3>
				<p>Deterministic identity stitching across anonymous and authenticated sessions. GDPR Art. 17 compliant erasure.</p>
			</div>
			<div class="card feature-card">
				<div class="feature-icon">👥</div>
				<h3>Audience Segments</h3>
				<p>Real-time behavioral segments with rule-based and ML-powered audience building. No PII leaks to third parties.</p>
			</div>
			<div class="card feature-card">
				<div class="feature-icon">🔀</div>
				<h3>Destination Routing</h3>
				<p>Fan-out to webhooks, databases, and object storage. Each destination runs isolated — one failure never blocks others.</p>
			</div>
			<div class="card feature-card">
				<div class="feature-icon">🛡️</div>
				<h3>Consent Management</h3>
				<p>Built-in consent tracking per GDPR purpose. Events are tagged at collection time. No retroactive consent patching.</p>
			</div>
			<div class="card feature-card">
				<div class="feature-icon">🇪🇺</div>
				<h3>EU Sovereignty</h3>
				<p>All infrastructure in EU jurisdictions. No US Cloud Act exposure. No transatlantic data flows. Full Schrems II compliance.</p>
			</div>
		</div>
	</div>
</section>

<!-- HOW IT WORKS -->
<section class="how-section">
	<div class="section-inner">
		<h2 class="section-title">How It <span class="glow-text">Works</span></h2>
		<div class="steps-grid">
			<div class="step-card">
				<div class="step-number glow-text">01</div>
				<h3>Install SDK</h3>
				<p>Add the CONDUIT snippet to your site or use our server-side libraries. One write key, instant setup.</p>
			</div>
			<div class="step-card">
				<div class="step-number glow-text">02</div>
				<h3>Track Events</h3>
				<p>Send track, identify, and page events. Schema is auto-detected. All data encrypted in transit and at rest.</p>
			</div>
			<div class="step-card">
				<div class="step-number glow-text">03</div>
				<h3>Connect Destinations</h3>
				<p>Route events to webhooks, PostgreSQL, S3-compatible storage, or any EU-hosted service. Configure in seconds.</p>
			</div>
			<div class="step-card">
				<div class="step-number glow-text">04</div>
				<h3>Build Audiences</h3>
				<p>Create segments from behavioral data. Real-time evaluation. Export to your marketing tools without PII exposure.</p>
			</div>
		</div>
	</div>
</section>

<!-- PRICING -->
<section class="pricing-section" id="pricing">
	<div class="section-inner">
		<h2 class="section-title"><span class="glow-text">Pricing</span></h2>
		<p class="section-desc">Transparent. No per-seat fees. No surprise overages.</p>
		<div class="pricing-grid">
			<div class="card pricing-card">
				<div class="pricing-tier">Free</div>
				<div class="pricing-price">€0<span>/mo</span></div>
				<ul class="pricing-features">
					<li>100K events / month</li>
					<li>2 sources</li>
					<li>2 destinations</li>
					<li>7-day event retention</li>
					<li>Community support</li>
				</ul>
				<a href="/auth/register" class="btn-secondary" style="width:100%;text-align:center;">Start Free</a>
			</div>
			<div class="card pricing-card pricing-featured">
				<div class="pricing-badge badge badge-primary">POPULAR</div>
				<div class="pricing-tier">Growth</div>
				<div class="pricing-price">€39<span>/mo</span></div>
				<ul class="pricing-features">
					<li>1M events / month</li>
					<li>10 sources</li>
					<li>10 destinations</li>
					<li>90-day event retention</li>
					<li>Identity resolution</li>
					<li>Priority support</li>
				</ul>
				<a href="/auth/register" class="btn-primary" style="width:100%;text-align:center;">Get Started</a>
			</div>
			<div class="card pricing-card">
				<div class="pricing-tier">Business</div>
				<div class="pricing-price">€99<span>/mo</span></div>
				<ul class="pricing-features">
					<li>10M events / month</li>
					<li>Unlimited sources</li>
					<li>Unlimited destinations</li>
					<li>1-year event retention</li>
					<li>Audience segments</li>
					<li>Dedicated support</li>
					<li>SSO / SAML</li>
				</ul>
				<a href="/auth/register" class="btn-secondary" style="width:100%;text-align:center;">Contact Us</a>
			</div>
		</div>
	</div>
</section>

<!-- FOOTER -->
<footer class="landing-footer">
	<div class="footer-inner">
		<div class="footer-compliance">
			<span class="badge badge-success">GDPR COMPLIANT</span>
			<span class="badge badge-success">SCHREMS II</span>
			<span class="badge badge-success">EU-ONLY INFRA</span>
			<span class="badge badge-primary">SOC 2 TYPE II</span>
		</div>
		<div class="footer-links">
			<a href="/">Home</a>
			<a href="#features">Features</a>
			<a href="#pricing">Pricing</a>
			<a href="/auth/login">Login</a>
		</div>
		<div class="footer-copy">
			© {currentYear} CONDUIT. EU-Sovereign Customer Data Platform. All data processed within the European Union.
		</div>
	</div>
</footer>

<style>
	/* NAV */
	.landing-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: rgba(10, 10, 15, 0.9);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--color-border);
	}
	.nav-inner {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0.75rem 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.nav-logo {
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: var(--color-primary);
		text-decoration: none;
	}
	.nav-links {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}
	.nav-links a {
		font-size: 0.72rem;
		color: var(--color-text);
		text-decoration: none;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		font-weight: 600;
		transition: color 0.2s;
	}
	.nav-links a:hover { color: var(--color-text-bright); }

	/* HERO */
	.hero {
		padding: 8rem 1.5rem 4rem;
		text-align: center;
	}
	.hero-inner {
		max-width: 700px;
		margin: 0 auto;
	}
	.hero-badge {
		margin-bottom: 1.5rem;
	}
	.hero-title {
		font-size: 4rem;
		font-weight: 700;
		letter-spacing: 0.3em;
		color: var(--color-primary);
		margin-bottom: 0.5rem;
	}
	.hero-subtitle {
		font-size: 1rem;
		color: var(--color-text-bright);
		margin-bottom: 0.75rem;
		letter-spacing: 0.05em;
	}
	.hero-desc {
		font-size: 0.82rem;
		color: var(--color-text-dim);
		line-height: 1.6;
		margin-bottom: 2rem;
		max-width: 520px;
		margin-left: auto;
		margin-right: auto;
	}
	.hero-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 3rem;
	}

	/* CODE BLOCK */
	.code-block {
		background: #080810;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		text-align: left;
		max-width: 500px;
		margin: 0 auto;
		overflow: hidden;
	}
	.code-header {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0.5rem 0.75rem;
		background: rgba(255, 140, 0, 0.05);
		border-bottom: 1px solid var(--color-border);
	}
	.code-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}
	.code-dot.red { background: #ff4444; }
	.code-dot.yellow { background: #ffaa00; }
	.code-dot.green { background: #00cc88; }
	.code-title {
		margin-left: 0.5rem;
		font-size: 0.65rem;
		color: var(--color-text-dim);
		letter-spacing: 0.05em;
	}
	.code-block pre {
		padding: 1rem;
		font-size: 0.75rem;
		line-height: 1.7;
		overflow-x: auto;
	}
	.code-block code {
		color: var(--color-text);
	}
	:global(.code-comment) { color: #5a5a6e; }
	:global(.code-keyword) { color: #ff8c00; }
	:global(.code-fn) { color: #e0e0ec; }
	:global(.code-string) { color: #00cc88; }
	:global(.code-prop) { color: #a8a8b8; }
	:global(.code-num) { color: #ffaa00; }

	/* SECTIONS */
	.section-inner {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}
	.section-title {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-bright);
		text-align: center;
		margin-bottom: 0.5rem;
	}
	.section-desc {
		text-align: center;
		color: var(--color-text-dim);
		font-size: 0.8rem;
		margin-bottom: 2.5rem;
	}

	/* FEATURES */
	.features-section {
		padding: 5rem 0;
	}
	.features-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
	.feature-card {
		text-align: center;
	}
	.feature-icon {
		font-size: 1.8rem;
		margin-bottom: 0.75rem;
	}
	.feature-card h3 {
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-bright);
		margin-bottom: 0.5rem;
	}
	.feature-card p {
		font-size: 0.72rem;
		color: var(--color-text-dim);
		line-height: 1.6;
	}

	/* HOW IT WORKS */
	.how-section {
		padding: 5rem 0;
		background: rgba(255, 140, 0, 0.02);
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
	}
	.steps-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.5rem;
	}
	.step-card {
		text-align: center;
	}
	.step-number {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-primary);
		margin-bottom: 0.75rem;
	}
	.step-card h3 {
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-bright);
		margin-bottom: 0.4rem;
	}
	.step-card p {
		font-size: 0.72rem;
		color: var(--color-text-dim);
		line-height: 1.5;
	}

	/* PRICING */
	.pricing-section {
		padding: 5rem 0;
	}
	.pricing-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.25rem;
		align-items: start;
	}
	.pricing-card {
		text-align: center;
		position: relative;
	}
	.pricing-featured {
		border-color: var(--color-primary);
		box-shadow: 0 0 30px rgba(255, 140, 0, 0.1);
	}
	.pricing-badge {
		position: absolute;
		top: -0.6rem;
		right: 1rem;
	}
	.pricing-tier {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--color-text-dim);
		margin-bottom: 0.5rem;
	}
	.pricing-price {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-text-bright);
		margin-bottom: 1.25rem;
	}
	.pricing-price span {
		font-size: 0.8rem;
		color: var(--color-text-dim);
		font-weight: 400;
	}
	.pricing-features {
		list-style: none;
		margin-bottom: 1.5rem;
	}
	.pricing-features li {
		padding: 0.4rem 0;
		font-size: 0.72rem;
		color: var(--color-text);
		border-bottom: 1px solid var(--color-border);
	}
	.pricing-features li:last-child { border-bottom: none; }

	/* FOOTER */
	.landing-footer {
		padding: 3rem 1.5rem;
		border-top: 1px solid var(--color-border);
		text-align: center;
	}
	.footer-inner {
		max-width: 1100px;
		margin: 0 auto;
	}
	.footer-compliance {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}
	.footer-links {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		margin-bottom: 1rem;
	}
	.footer-links a {
		font-size: 0.7rem;
		color: var(--color-text-dim);
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.footer-links a:hover { color: var(--color-primary); }
	.footer-copy {
		font-size: 0.65rem;
		color: var(--color-text-dim);
	}

	@media (max-width: 768px) {
		.hero-title { font-size: 2.5rem; letter-spacing: 0.15em; }
		.features-grid { grid-template-columns: 1fr; }
		.steps-grid { grid-template-columns: 1fr 1fr; }
		.pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
		.nav-links a:not(.btn-primary) { display: none; }
	}
</style>
