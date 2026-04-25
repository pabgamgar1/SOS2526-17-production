<svelte:head>
    <script src="https://code.highcharts.com/maps/highmaps.js"></script>
    <script src="https://code.highcharts.com/maps/modules/data.js"></script>
    <script src="https://code.highcharts.com/maps/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/maps/modules/accessibility.js"></script>
</svelte:head>

<script>
    import { onMount } from 'svelte';

    onMount(async () => {
        // 1. Cargamos la topología del mundo
        const topology = await fetch(
            'https://code.highcharts.com/mapdata/custom/world.topo.json'
        ).then(response => response.json());

        // 2. Cargamos TUS datos de la API
        const res = await fetch('/api/v1/water-productivities');
        let apiData = [];
        if (res.ok) {
            const json = await res.json();
            // Transformamos tus datos al formato que espera el mapa
            apiData = json.map(d => ({
                code: d.countryCode.toUpperCase(),
                value: d.waterStress, // O el dato que prefieras mostrar
                name: d.country
            }));
        }

        // 3. Inicializamos el mapa
        Highcharts.mapChart('map-container', {
            chart: {
                map: topology
            },

            title: {
                text: 'Estrés Hídrico por País',
                align: 'left'
            },

            subtitle: {
                text: 'Visualización Geoespacial - Datos de mi API'
            },

            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },

            colorAxis: {
                min: 0,
                max: 100,
                stops: [
                    [0, '#EFEFFF'],
                    [0.5, '#4444FF'],
                    [1, '#FF0000']
                ]
            },

            tooltip: {
                valueDecimals: 1,
                valueSuffix: '%'
            },

            series: [{
                name: 'Estrés Hídrico',
                joinBy: ['iso-a3', 'code'],
                data: apiData, // Aquí inyectamos los datos de la API
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }]
        });
    });
</script>

<main>
    <div id="map-container"></div>
    <p class="description">
        Este mapa muestra el estrés hídrico global utilizando los datos geolocalizados de la API individual.
    </p>
</main>

<style>
    #map-container {
        height: 600px;
        min-width: 310px;
        max-width: 1000px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        padding: 10px;
    }

    .description {
        text-align: center;
        color: #666;
        font-family: sans-serif;
        margin-top: 10px;
    }
</style>