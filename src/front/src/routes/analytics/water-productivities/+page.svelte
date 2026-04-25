<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/highcharts-more.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>

<script>
    import { onMount } from 'svelte';

    let data = [];

    onMount(async () => {
        // 1. Obtener tus datos de la API
        const res = await fetch('/api/v1/water-productivities');
        if (res.ok) {
            data = await res.json();
            renderChart();
        }
    });

    function renderChart() {
        // 2. Mapear tus datos al formato de la gráfica de burbujas
        const chartData = data.map(d => ({
            x: d.waterProductivity, // Eje X
            y: d.waterStress,       // Eje Y
            z: d.annualFreshwater,  // Tamaño
            name: d.countryCode,    // Etiqueta (AFG, ESP, etc.)
            country: d.country,     // Nombre completo para el tooltip
            year: d.year
        }));

        Highcharts.chart('container', {
            chart: {
                type: 'bubble',
                plotBorderWidth: 1,
                zooming: { type: 'xy' }
            },
            legend: { enabled: false },
            title: { text: 'Impacto Hídrico: Eficiencia vs. Estrés' },
            subtitle: { text: 'Análisis Multidimensional de Recursos Hídricos' },
            
            xAxis: {
                gridLineWidth: 1,
                title: { text: 'Productividad del Agua ($/m³)' },
                labels: { format: '{value}' }
            },

            yAxis: {
                startOnTick: false,
                endOnTick: false,
                title: { text: 'Estrés Hídrico (%)' },
                labels: { format: '{value}%' },
                maxPadding: 0.2
            },

            tooltip: {
                useHTML: true,
                headerFormat: '<table>',
                pointFormat: '<tr><th colspan="2"><h3>{point.country} ({point.year})</h3></th></tr>' +
                    '<tr><th>Productividad:</th><td>{point.x} $/m³</td></tr>' +
                    '<tr><th>Estrés:</th><td>{point.y}%</td></tr>' +
                    '<tr><th>Agua Dulce:</th><td>{point.z} km³</td></tr>',
                footerFormat: '</table>',
                followPointer: true
            },

            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}'
                    }
                }
            },

            series: [{
                data: chartData,
                colorByPoint: true
            }]
        });
    }
</script>

<main>
    <figure class="highcharts-figure">
        <div id="container"></div>
        <p class="highcharts-description">
            Esta gráfica de burbujas compara la <b>Productividad del Agua</b> (eje X) frente al 
            <b>Estrés Hídrico</b> (eje Y). El tamaño de la burbuja representa el volumen de 
            <b>Agua Dulce Anual</b> disponible.
        </p>
    </figure>
</main>

<style>
    .highcharts-figure {
        min-width: 310px;
        max-width: 900px;
        margin: 2em auto;
        padding: 20px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    #container {
        height: 500px;
    }

    .highcharts-description {
        margin-top: 1rem;
        color: #666;
        font-size: 0.9rem;
        text-align: center;
    }
</style>