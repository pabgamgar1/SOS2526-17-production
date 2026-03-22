<script>
    import { onMount } from 'svelte';

    // Ruta relativa para compatibilidad Local/Render
    let API = '/api/v1/water-productivities';

    /** @type {any[]} */
    let data = $state([]); 
    let message = $state("");
    let messageType = $state("");

    // Variables para FILTROS
    let searchCountry = $state("");
    let searchYear = $state("");

    // Formulario con los 6 campos
    let newEntry = $state({
        country: "",
        year: "",
        countryCode: "",
        waterProductivity: "",
        waterStress: "",
        annualFreshwater: ""
    });

    // Función de mensajes de error comprensibles
    function handleResponseError(status, action) {
        messageType = "error";
        if (status === 404) message = "No se ha encontrado el recurso solicitado.";
        else if (status === 409) message = `El registro de ${newEntry.country} para el año ${newEntry.year} ya existe en el sistema.`;
        else if (status === 400) message = "Error: Faltan datos o el formato es incorrecto (revisa los números).";
        else message = `Error ${status} al intentar ${action}.`;
    }

    // --- ACCIÓN: LISTAR RECURSOS (Automática y con filtros) ---
    async function getData() {
        let url = API;
        const queryParams = new URLSearchParams();
        if (searchCountry) queryParams.append("country", searchCountry);
        if (searchYear) queryParams.append("year", searchYear);
        
        if (queryParams.toString()) url += "?" + queryParams.toString();

        try {
            const res = await fetch(url);
            if (res.ok) {
                data = await res.json();
                if (searchCountry || searchYear) {
                    message = data.length > 0 ? "Búsqueda finalizada con éxito." : "No hay resultados para esa búsqueda.";
                    messageType = "info";
                }
            } else {
                handleResponseError(res.status, "obtener los datos");
            }
        } catch (e) {
            message = "Error: No se puede conectar con el servidor.";
            messageType = "error";
        }
    }

    // --- ACCIÓN: CARGAR DATOS INICIALES ---
    async function loadInitialData() {
        const res = await fetch(`${API}/loadInitialData`);
        if (res.ok) {
            message = "¡Datos de ejemplo cargados con éxito!";
            messageType = "success";
            getData(); 
        } else {
            message = "Los datos ya existen o el servidor ha fallado.";
            messageType = "error";
        }
    }

    // --- ACCIÓN: CREAR RECURSO ---
    async function addEntry() {
        const res = await fetch(API, {
            method: "POST",
            body: JSON.stringify({
                country: newEntry.country,
                year: parseInt(newEntry.year),
                countryCode: newEntry.countryCode,
                waterProductivity: parseFloat(newEntry.waterProductivity),
                waterStress: parseFloat(newEntry.waterStress),
                annualFreshwater: parseFloat(newEntry.annualFreshwater)
            }),
            headers: { "Content-Type": "application/json" }
        });

        if (res.status === 201) {
            message = `¡Hecho! Se ha añadido ${newEntry.country} correctamente.`;
            messageType = "success";
            getData(); 
        } else {
            handleResponseError(res.status, "crear el registro");
        }
    }

    // --- ACCIÓN: BORRAR UNO ---
    async function deleteEntry(country, year) {
        const res = await fetch(`${API}/${country}/${year}`, { method: "DELETE" });
        if (res.ok) {
            message = `Registro de ${country} (${year}) eliminado.`;
            messageType = "success";
            getData();
        } else {
            handleResponseError(res.status, "borrar el registro");
        }
    }

    // --- ACCIÓN: BORRAR TODO ---
    async function deleteAll() {
        if (confirm("¿Seguro que quieres borrar todos los datos?")) {
            const res = await fetch(API, { method: "DELETE" });
            if (res.ok) {
                message = "Base de datos vaciada con éxito.";
                messageType = "success";
                data = [];
            }
        }
    }

    onMount(getData);
</script>

<main>
    <header>
        <h1>💧 Productividad de Agua</h1>
        <p>Gestión y administración de recursos hídricos</p>
    </header>

    {#if message}
        <div class="alert {messageType}">
            <span class="alert-icon">
                {#if messageType === 'success'}✅ {:else if messageType === 'error'}⚠️ {:else}ℹ️ {/if}
            </span>
            {message}
        </div>
    {/if}

    <div class="top-buttons">
        <button class="btn-load" onclick={loadInitialData}>📥 Cargar Datos Iniciales</button>
        <button class="btn-danger" onclick={deleteAll}>🗑️ Borrar Todo</button>
    </div>

    <section class="card shadow">
        <h4>🔍 Filtrar Datos</h4>
        <div class="filter-row">
            <input bind:value={searchCountry} placeholder="País (ej: Spain)" />
            <input type="number" bind:value={searchYear} placeholder="Año (ej: 2020)" />
            <button class="btn-search" onclick={getData}>Buscar</button>
            <button class="btn-clear" onclick={() => {searchCountry=""; searchYear=""; getData();}}>Limpiar</button>
        </div>
    </section>

    <section class="card shadow">
        <h4>➕ Añadir Nuevo Registro</h4>
        <div class="grid">
            <input bind:value={newEntry.country} placeholder="País" />
            <input type="number" bind:value={newEntry.year} placeholder="Año" />
            <input bind:value={newEntry.countryCode} placeholder="Cód. País" />
            <input type="number" step="0.01" bind:value={newEntry.waterProductivity} placeholder="Productividad" />
            <input type="number" step="0.01" bind:value={newEntry.waterStress} placeholder="Estrés (%)" />
            <input type="number" step="0.01" bind:value={newEntry.annualFreshwater} placeholder="Agua Dulce" />
        </div>
        <button class="btn-add" onclick={addEntry}>Guardar en Base de Datos</button>
    </section>

    <div class="table-container shadow">
        <table>
            <thead>
                <tr>
                    <th>País</th>
                    <th>Año</th>
                    <th>Cód</th>
                    <th>Productividad</th>
                    <th>Estrés Hídrico</th>
                    <th>Agua Dulce</th>
                    <th style="text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each data as entry}
                    <tr>
                        <td class="bold">{entry.country}</td>
                        <td><span class="badge-year">{entry.year}</span></td>
                        <td><span class="badge-code">{entry.countryCode}</span></td>
                        <td>{entry.waterProductivity}</td>
                        <td>{entry.waterStress}%</td>
                        <td>{entry.annualFreshwater}</td>
                        <td style="text-align: center;">
                            <button class="btn-del" onclick={() => deleteEntry(entry.country, entry.year)}>Eliminar</button>
                        </td>
                    </tr>
                {:else}
                    <tr><td colspan="7" class="empty">No hay datos. Haz clic en "Cargar Datos Iniciales".</td></tr>
                {/each}
            </tbody>
        </table>
    </div>
</main>

<style>
    :global(body) { background-color: #f8fafc; margin: 0; }
    main { max-width: 1100px; margin: 2rem auto; font-family: 'Segoe UI', system-ui, sans-serif; padding: 0 1rem; color: #334155; }
    
    header { text-align: center; margin-bottom: 2rem; }
    header h1 { margin: 0; color: #1e293b; font-size: 2.2rem; }
    header p { margin: 5px 0; color: #64748b; }

    /* Alertas */
    .alert { padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem; font-weight: 600; border: 1px solid; display: flex; align-items: center; gap: 10px; }
    .success { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
    .error { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
    .info { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }

    .top-buttons { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
    
    /* Tarjetas */
    .card { background: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; }
    .shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); }
    h4 { margin-top: 0; margin-bottom: 1rem; color: #475569; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }

    /* Layouts horizontales */
    .filter-row { display: flex; gap: 10px; align-items: center; }
    .filter-row input { flex: 1; }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    
    input { padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; transition: 0.2s; }
    input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    
    /* Tabla */
    .table-container { background: white; border-radius: 12px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1e293b; color: #f8fafc; padding: 14px; text-align: left; font-size: 0.85rem; text-transform: uppercase; }
    td { padding: 14px; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; }
    tr:hover { background: #f8fafc; }
    .bold { font-weight: bold; color: #0f172a; }
    .badge-year { background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 5px; font-weight: bold; }
    .badge-code { background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 5px; font-family: monospace; }
    .empty { text-align: center; padding: 3rem; color: #94a3b8; }

    /* Botones */
    button { cursor: pointer; border-radius: 6px; border: none; padding: 10px 16px; font-weight: bold; transition: 0.2s; }
    .btn-load { background: #10b981; color: white; }
    .btn-add { background: #3b82f6; color: white; width: 100%; margin-top: 15px; font-size: 1rem; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-search { background: #334155; color: white; }
    .btn-clear { background: #cbd5e1; color: #334155; }
    .btn-del { background: #fee2e2; color: #dc2626; font-size: 0.8rem; padding: 6px 12px; }
    .btn-del:hover { background: #dc2626; color: white; }
    button:hover { opacity: 0.9; transform: translateY(-1px); }
</style>