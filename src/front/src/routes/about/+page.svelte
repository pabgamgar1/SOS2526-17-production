<svelte:head>
    <title>About - SOS2526-17</title>
</svelte:head>

<script>
    let { data } = $props();
</script>

<main>
    <h1>Project Information (SOS2526-17)</h1>

    <section>
        <h2>Team</h2>
        <ul>
            <li>
                <a href="https://github.com/pabgamgar1">Pablo Gamero García</a>
            </li>
            <li>
                <a href="https://github.com/felmormar">Felipe Morgado Martinez</a>
            </li>
            <li>
                <a href="https://github.com/marioraga29">Mario Ramírez García</a>
            </li>
        </ul>
    </section>

    <section>
        <h2>Project Description</h2>
        <p>
            Our project is going to analyse the impact of water and renewable
            energy on agricultural productivity in the countries.
        </p>
    </section>

    <section>
        <h2>Repository</h2>
        <p>
            <a href="https://github.com/pabgamgar1/SOS2526-17-production">pabgamgar1/SOS2526-17-production</a>
        </p>
    </section>

    <section>
        <h2>URL</h2>
        <p>
            <a href={data.baseUrl}>{data.baseUrl}</a>
        </p>
    </section>

    <section>
        <h2>APIs</h2>
        <ul>
            <li>
                <a href="/api/v1/water-productivities">Water Productivities API</a>
                (Mario Ramírez García)
            </li>
            <li>
                <a href="/api/v1/renewable-energy-consumptions">Renewable Energy Consumptions API</a>
                (Pablo Gamero García)
            </li>
            <li>
                <a href="/api/v1/agriculture-land">Agricultural land API</a>
                (Felipe Morgado Martinez)
            </li>
        </ul>
    </section>
    
    <div style="margin-top: 40px;">
        <a href="/" style="font-weight: bold;">← Volver al Home</a>
    </div>
</main>

<style>
    main {
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        max-width: 800px;
        margin: 40px auto;
        padding: 0 20px;
        color: #24292e;
    }
    
    h1, h2 {
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
    }
    
    section {
        margin-bottom: 20px;
    }

    a {
        color: #0366d6;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    ul {
        padding-left: 20px;
    }
</style>
