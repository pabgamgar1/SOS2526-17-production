<script>
    // Ruta relativa para compatibilidad Local/Render
    let API = '/api/v1/water-productivities';

    /** @type {any[]} */
    let data = $state([]); 
    let message = $state("");
    let messageType = $state("");

    // Variables para FILTROS
    let searchCountry = $state("");
    let searchYear = $state("");

    // Formulario con los 6 CAMPOS COMPLETOS
    let newEntry = $state({
        country: "",
        year: "",
        countryCode: "",
        waterProductivity: "",
        waterStress: "",
        annualFreshwater: ""
    });

    // Función para gestionar mensajes de error comprensibles
    function handleResponseError(status, action, params = {}) {
        messageType = "error";
        if (status === 404) message = `No se encontró el recurso solicitado.`;
        else if (status === 409) message = `Error: El registro de ${newEntry.country} para el año ${newEntry.year} ya existe.`;
        else if (status === 400) message = "Error: Faltan campos o el formato de los datos es incorrecto.";
        else message = `Error ${status} al intentar ${action}.`;
    }

    // --- ACCIÓN: LISTAR RECURSOS (Con Filtros) ---
    async function getData() {
        let url = API;
        const queryParams = new URLSearchParams();
        if (searchCountry) queryParams.append("country", searchCountry);
        if (searchYear) queryParams.append("year", searchYear);
        
        if (queryParams.toString()) url += "?" + queryParams.toString();

        const res = await fetch(url);
        if (res.ok) {
            data = await res.json();
            message = data.length > 0 ? "Datos recuperados con éxito." : "No hay datos que coincidan con la búsqueda.";
            messageType = "success";
        } else {
            handleResponseError(res.status, "listar los recursos");
        }
    }

    // --- ACCIÓN: CARGAR DATOS INICIALES ---
    async function loadInitialData() {
        const res = await fetch(`${API}/loadInitialData`);
        if (res.ok) {
            message = "Datos iniciales cargados en la base de datos. Pulsa 'Listar' para verlos.";
            messageType = "success";
        } else {
            message = "Los datos ya estaban cargados o hubo un error en el servidor.";
            messageType = "error";
        }
    }

    // --- ACCIÓN: CREAR RECURSO (6 Campos) ---
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
            message = `Registro de ${newEntry.country} creado correctamente.`;
            messageType = "success";
            getData(); // Refrescar lista
        } else {
            handleResponseError(res.status, "crear el registro");
        }
    }

    // --- ACCIÓN: BORRAR UNO ---
    async function deleteEntry(country, year) {
        const res = await fetch(`${API}/${country}/${year}`, { method: "DELETE" });
        if (res.ok) {
            message = `Eliminado registro de ${country} (${year}).`;
            messageType = "success";
            getData();
        } else {
            handleResponseError(res.status, "borrar el registro");
        }
    }

    // --- ACCIÓN: BORRAR TODO ---
    async function deleteAll() {
        if (confirm("¿Seguro que quieres borrar TODOS los registros?")) {
            const res = await fetch(API, { method: "DELETE" });
            if (res.ok) {
                message = "Base de datos vaciada por completo.";
                messageType = "success";
                data = [];
            }
        }
    }
</script>

<main>
    <h2>Administración de Water Productivities</h2>

    {#if message}
        <div class="alert {messageType}">{message}</div>
    {/if}

    <div class="actions-bar">
        <button class="btn-load" onclick={loadInitialData}>1. CARGAR DATOS INICIALES</button>
        <button class="btn-list" onclick={getData}>2. LISTAR RECURSOS</button>
        <button class="btn-danger" onclick={deleteAll}>BORRAR TODO</button>
    </div>

    <section class="section-box">
        <h4>🔍 Filtrar búsqueda</h4>
        <div class="grid-inputs">
            <input bind:value={searchCountry} placeholder="Buscar por País..." />
            <input type="number" bind:value={searchYear} placeholder="Buscar por Año..." />
            <button class="btn-search" onclick={getData}>Filtrar</button>
            <button class="btn-clear" onclick={() => {searchCountry=""; searchYear=""; getData();}}>Limpiar</button>
        </div>
    </section>

    <section class="section-box">
        <h4>➕ Añadir Nuevo Registro</h4>
        <div class="grid-inputs">
            <input bind:value={newEntry.country} placeholder="País (ej. Spain)" />
            <input type="number" bind:value={newEntry.year} placeholder="Año (ej. 2024)" />
            <input bind:value={newEntry.countryCode} placeholder="Código (ej. ESP)" />
            <input type="number" step="0.01" bind:value={newEntry.waterProductivity} placeholder="Prod. Agua" />
            <input type="number" step="0.01" bind:value={newEntry.waterStress} placeholder="Estrés Hídrico" />
            <input type="number" step="0.01" bind:value={newEntry.annualFreshwater} placeholder="Agua Dulce Anual" />
        </div>
        <button class="btn-add" onclick={addEntry}>Guardar en Base de Datos</button>
    </section>

    <table>
        <thead>
            <tr>
                <th>País</th>
                <th>Año</th>
                <th>Código</th>
                <th>Prod.</th>
                <th>Estrés</th>
                <th>Agua Dulce</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each data as entry}
                <tr>
                    <td>{entry.country}</td>
                    <td>{entry.year}</td>
                    <td>{entry.countryCode}</td>
                    <td>{entry.waterProductivity}</td>
                    <td>{entry.waterStress}</td>
                    <td>{entry.annualFreshwater}</td>
                    <td>
                        <button class="btn-del" onclick={() => deleteEntry(entry.country, entry.year)}>Eliminar</button>
                    </td>
                </tr>
            {:else}
                <tr><td colspan="7" style="text-align:center">Usa "Listar Recursos" para mostrar los datos.</td></tr>
            {/each}
        </tbody>
    </table>
</main>

<style>
    main { max-width: 1000px; margin: 2rem auto; font-family: 'Segoe UI', sans-serif; padding: 0 1rem; }
    
    .alert { padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-weight: bold; border: 1px solid; }
    .success { background-color: #dcfce7; color: #166534; border-color: #bbf7d0; }
    .error { background-color: #fee2e2; color: #991b1b; border-color: #fecaca; }
    .info { background-color: #e0f2fe; color: #075985; border-color: #bae6fd; }

    .actions-bar { display: flex; gap: 15px; margin-bottom: 25px; }
    .section-box { background: #f9fafb; padding: 1.2rem; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
    .grid-inputs { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 10px; }
    
    input { padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.9rem; }
    
    table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
    th { background: #1f2937; color: white; padding: 12px; text-align: left; font-size: 0.85rem; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }

    button { cursor: pointer; border-radius: 4px; border: none; padding: 10px 15px; font-weight: bold; transition: 0.2s; }
    .btn-list { background: #2563eb; color: white; }
    .btn-load { background: #059669; color: white; }
    .btn-add { background: #d97706; color: white; width: 100%; margin-top: 10px; }
    .btn-danger { background: #4b5563; color: white; margin-left: auto; }
    .btn-search { background: #6366f1; color: white; }
    .btn-clear { background: #9ca3af; color: white; }
    .btn-del { background: #ef4444; color: white; padding: 6px 10px; font-size: 0.8rem; }
    
    button:hover { opacity: 0.85; }
</style>