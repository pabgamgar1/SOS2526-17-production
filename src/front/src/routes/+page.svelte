<div class="container">
    <h1>SOS2526-17 API Dashboard</h1>
    
    <div class="description">
        <strong>Descripción del Proyecto:</strong> Nuestro proyecto analizará el impacto del agua y las energías renovables en la productividad agrícola de los países.
    </div>

    <div class="team-section">
        <p>Desarrollado por nuestro equipo de 3 miembros.</p>
        <a href="https://github.com/gti-sos/SOS2526-17" target="_blank">Repositorio de GitHub</a>
    </div>

    <h3>API Endpoints (v1)</h3>
    <div class="api-grid">
        <div class="api-card">
            <h4>Water Productivities</h4>
            <p>Análisis de la eficiencia del uso del agua por país.</p>
            <div class="links">
                <a href="https://sos2526-17.onrender.com/api/v1/water-productivities" class="btn" target="_blank">Ver API (v1)</a>
                <a href="/water-productivities" class="btn btn-front">Ver Front-end</a>
            </div>
        </div>

        <div class="api-card">
            <h4>Renewable Energy</h4>
            <p>Estadísticas de consumo de energía renovable.</p>
            <div class="links">
                <a href="https://sos2526-17.onrender.com/api/v1/renewable-energy-consumptions" class="btn" target="_blank">Ver API (v1)</a>
                <a href="/renewable-energy" class="btn btn-front">Ver Front-end</a>
            </div>
        </div>

        <div class="api-card">
            <h4>Agriculture Land</h4>
            <p>Distribución y uso de tierras agrícolas.</p>
            <div class="links">
                <a href="https://sos2526-17.onrender.com/api/v1/agriculture-land" class="btn" target="_blank">Ver API (v1)</a>
                <a href="/agriculture-land" class="btn btn-front">Ver Front-end</a>
            </div>
        </div>
    </div>

    <div class="footer-links">
        <a href="/about" class="btn btn-about">Sobre el Proyecto (About)</a>
    </div>

    <footer>
        <p>&copy; 2026 Equipo SOS2526-17 | Desplegado en Render</p>
    </footer>
</div>

<style>
    :global(body) {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f0f2f5;
    }

    .container {
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        text-align: center;
    }

    h1 { color: #1a3a5a; margin-bottom: 10px; }

    .description {
        font-style: italic;
        color: #444;
        background: #eef9fe;
        padding: 15px;
        border-left: 5px solid #3498db;
        margin: 20px 0;
        text-align: left;
    }

    .team-section { 
        margin: 25px 0; 
        padding: 15px; 
        border-top: 1px solid #eee; 
    }
    
    .api-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 30px;
    }

    .api-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #e1e4e8;
        transition: transform 0.2s;
    }

    .api-card:hover { 
        transform: translateY(-5px); 
        border-color: #3498db; 
    }
    
    .api-card h4 { margin-top: 0; color: #2980b9; }

    .links {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 15px;
    }
    
    .btn {
        display: inline-block;
        text-decoration: none;
        color: white;
        background: #3498db;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.85em;
    }

    .btn-front { background: #2ecc71; }

    .btn-about { 
        background: #7f8c8d; 
        margin-top: 20px; 
    }

    footer { 
        margin-top: 40px; 
        font-size: 0.85em; 
        color: #95a5a6; 
    }
</style>