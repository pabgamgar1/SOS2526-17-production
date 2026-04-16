<script>
    import { onMount } from 'svelte';

    onMount(async () => {
        const Highcharts = (await import('highcharts')).default;

        // --- 1. CARGA DE LAS 3 APIs DEL GRUPO 17 ---
        
        // MIEMBRO 1: (Compañero A)
        const res1 = await fetch('/api/v1/PONER_RUTA_COMPAÑERO_1');
        const data1 = res1.ok ? await res1.json() : [];

        // MIEMBRO 2: (Compañero B)
        const res2 = await fetch('/api/v1/PONER_RUTA_COMPAÑERO_2');
        const data2 = res2.ok ? await res2.json() : [];

        // MIEMBRO 3: (Agriculture Land)
        const res3 = await fetch('/api/v1/agriculture-land');
        const data3 = res3.ok ? await res3.json() : [];

        // --- 2. PROCESAMIENTO ---
        const categories = data3.slice(0, 12).map(d => d.country.trim());

        Highcharts.chart('grafica-grupal-17', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                style: { fontFamily: "'Inter', sans-serif" }
            },
            title: {
                text: 'Dashboard de Análisis Integrado',
                style: { color: '#2c3e50', fontWeight: '600', fontSize: '24px' }
            },
            subtitle: {
                text: 'S.O.S. 2025 - Grupo 17',
                style: { color: '#7f8c8d' }
            },
            xAxis: {
                categories: categories,
                labels: { style: { color: '#7f8c8d', fontSize: '11px' } },
                lineColor: '#dcdde1'
            },
            yAxis: {
                title: { text: 'Impacto Global', style: { color: '#95a5a6' } },
                gridLineColor: '#f0f2f5',
                labels: { style: { color: '#95a5a6' } }
            },
            legend: {
                itemStyle: { color: '#34495e', fontWeight: '500' }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderRadius: 12,
                shared: true,
                useHTML: true,
                headerFormat: '<span style="font-size:12px; font-weight:bold; color:#2c3e50">{point.key}</span><br/>',
                borderWidth: 1,
                borderColor: '#eee'
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    borderRadius: 6,
                    borderWidth: 0,
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            series: [
                {
                    name: 'Dato Miembro 1',
                    data: categories.map(c => {
                        const d = data1.find(item => item.country.trim().toLowerCase() === c.toLowerCase());
                        return d ? parseFloat(d.valor || 0) : 0;
                    }),
                    color: '#82a0bc' // Azul Acero Apagado
                },
                {
                    name: 'Dato Miembro 2',
                    data: categories.map(c => {
                        const d = data2.find(item => item.country.trim().toLowerCase() === c.toLowerCase());
                        return d ? parseFloat(d.valor || 0) : 0;
                    }),
                    color: '#d4a373' // Arcilla / Terracota Suave
                },
                {
                    // LEYENDA CORREGIDA: Se ha quitado "(Tú)"
                    name: 'Superficie Agrícola (Tierra)', 
                    data: categories.map(c => {
                        const d = data3.find(item => item.country.trim().toLowerCase() === c.toLowerCase());
                        return d ? parseFloat(d.land_agriculture) : 0;
                    }),
                    color: '#84a59d' // Verde Salvia
                }
            ]
        });
    });
</script>

<main>
    <div class="container">
        <div class="glass-card">
            <div id="grafica-grupal-17"></div>
            <div class="footer-note">
                <span class="badge">Grupo 17</span>
                <p>Visualización Conjunta - Datos Sincronizados</p>
            </div>
        </div>
    </div>
</main>

<style>
    :global(body) {
        background: radial-gradient(circle at top right, #fdfcfb 0%, #e2d1c3 100%);
        min-height: 100vh;
        margin: 0;
        font-family: 'Inter', sans-serif;
    }

    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px 20px;
    }

    .glass-card {
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(15px);
        padding: 40px;
        border-radius: 35px;
        box-shadow: 0 25px 50px rgba(0,0,0,0.06);
        width: 100%;
        max-width: 1100px;
        border: 1px solid rgba(255,255,255,0.4);
    }

    #grafica-grupal-17 {
        width: 100%;
        height: 550px;
    }

    .footer-note {
        margin-top: 35px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .badge {
        background: #4a5568;
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.2px;
    }

    .footer-note p {
        color: #a0aec0;
        font-size: 13px;
        margin: 0;
    }
</style>