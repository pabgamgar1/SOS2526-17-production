<script>
	const resources = [
		{
			name: 'Water Productivities',
			slug: 'water-productivities',
			api: '/api/v1/water-productivities',
			detail: '/water-productivities'
		},
		{
			name: 'Agriculture Land',
			slug: 'agriculture-land',
			api: '/api/v1/agriculture-land',
			detail: '/agriculture-land'
		},
		{
			name: 'Renewable Energy Consumptions',
			slug: 'renewable-energy-consumptions',
			api: '/api/v1/renewable-energy-consumptions',
			detail: '/renewable-energy-consumptions'
		}
	];
</script>

<svelte:head>
	<title>SOS2526-17</title>
</svelte:head>

<main class="page">
	<header class="intro">
		<h1>SOS2526-17</h1>
		<p>Three public APIs and the matching frontend pages.</p>
	</header>

	<section class="panel">
		<table>
			<thead>
				<tr>
					<th>Resource</th>
					<th>Frontend</th>
					<th>API</th>
				</tr>
			</thead>
			<tbody>
				{#each resources as resource}
					<tr>
						<td>
							<div class="resource-name">{resource.name}</div>
							<div class="resource-slug">{resource.slug}</div>
						</td>
						<td><a class="link" href={resource.detail}>Open page</a></td>
						<td><a class="link" href={resource.api} target="_blank" rel="noreferrer">Open API</a></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		background: #f6f7f9;
		color: #111827;
	}

	.page {
		max-width: 1040px;
		margin: 0 auto;
		padding: 40px 20px 60px;
	}

	.intro {
		margin-bottom: 24px;
	}

	h1 {
		margin: 0 0 8px;
		font-size: 2rem;
		line-height: 1.1;
	}

	p {
		margin: 0;
		color: #4b5563;
	}

	.panel {
		background: #fff;
		border: 1px solid #dbe1e7;
		border-radius: 12px;
		overflow: hidden;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 16px 18px;
		border-bottom: 1px solid #e5e7eb;
		text-align: left;
		vertical-align: middle;
	}

	th {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #6b7280;
		background: #fafafa;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	.resource-name {
		font-weight: 600;
	}

	.resource-slug {
		font-size: 0.92rem;
		color: #6b7280;
		margin-top: 2px;
	}

	.link {
		color: #1d4ed8;
		text-decoration: none;
		font-weight: 500;
	}

	.link:hover {
		text-decoration: underline;
	}
</style>
