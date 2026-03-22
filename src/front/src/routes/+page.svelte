<script>
    // Datos del equipo (Rellena esto con los de tus compañeros)
    const team = [
        { 
            name: "Tu Nombre", 
            resource: "water-productivities", 
            frontend: "/water-productivities",
            api: "/api/v1/water-productivities",
            postman: "https://documenter.getpostman.com/view/..." // Tu link de Postman
        },
        { 
            name: "Compañero 2", 
            resource: "agriculture-land", 
            frontend: "/agriculture-land",
            api: "/api/v1/agriculture-land",
            postman: "LINK_POSTMAN_2" 
        },
        { 
            name: "Compañero 3", 
            resource: "renewable-energy", 
            frontend: "/renewable-energy",
            api: "/api/v1/renewable-energy",
            postman: "LINK_POSTMAN_3" 
        }
    ];

    const githubRepo = "https://github.com/gti-sos/SOS2526-17";
</script>

<main>
    <header>
        <h1>SOS2526-17 - Gestión de Recursos</h1>
        <p>Proyecto de la asignatura Sistemas de Operación y Servicios</p>
    </header>

    <section class="team-section">
        <h2>Componentes del Equipo</h2>
        <div class="card-container">
            {#each team as member}
                <div class="card">
                    <h3>{member.name}</h3>
                    <p><strong>Fuente de datos:</strong> <code>{member.resource}</code></p>
                    <hr>
                    <div class="links">
                        <a href={member.frontend} class="btn">Ver Front-end</a>
                        <a href={member.api} target="_blank" class="btn secondary">Ver API (v1)</a>
                        <a href={member.postman} target="_blank" class="btn postman">Documentación Postman</a>
                    </div>
                </div>
            {/each}
        </div>
    </section>

    <section class="global-links">
        <h2>Enlaces del Proyecto</h2>
        <a href={githubRepo} target="_blank" class="github-link">
            📦 Repositorio de GitHub
        </a>
    </section>
</main>

<style>
    :global(body) { background-color: #f0f2f5; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    main { max-width: 1000px; margin: 0 auto; padding: 40px 20px; text-align: center; }
    header { margin-bottom: 50px; }
    h1 { color: #1a202c; font-size: 2.5rem; }
    
    .card-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 30px; }
    .card { background: white; padding: 25px; border-radius: 12px; shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
    .card h3 { margin-top: 0; color: #2d3748; }
    
    .links { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
    .btn { padding: 10px; border-radius: 6px; text-decoration: none; font-weight: bold; transition: 0.3s; }
    .btn { background-color: #4a90e2; color: white; }
    .btn.secondary { background-color: #edf2f7; color: #4a5568; }
    .btn.postman { background-color: #ef5b25; color: white; }
    .btn:hover { opacity: 0.8; }

    .github-link { display: inline-block; margin-top: 30px; font-size: 1.2rem; color: #2d3748; text-decoration: none; font-weight: bold; border: 2px solid #2d3748; padding: 10px 20px; border-radius: 8px; }
    .github-link:hover { background: #2d3748; color: white; }
</style>