<script>
    import { onMount } from 'svelte';

    // --- ESTADO (Svelte 5) ---
    let data = $state([]);
    let nuevoRegistro = $state({ 
        "country ": "", 
        "year": "", 
        "land_agriculture": "" 
    });
    
    let mensajeUsuario = $state("");
    let tipoAlerta = $state("");

    // --- FUNCIONES ---

    function notificar(texto, tipo) {
        mensajeUsuario = texto;
        tipoAlerta = tipo;
        setTimeout(() => mensajeUsuario = "", 5000);
    }

    async function cargarDatos() {
        const res = await fetch("/api/v1/agriculture-land");
        if (res.ok) {
            data = await res.json();
        } else {
            notificar("⚠️ No se han podido cargar los datos.", "error");
        }
    }

    async function crearDato() {
        // Validamos que no haya campos vacíos antes de enviar
        if (!nuevoRegistro["country "].trim() || !nuevoRegistro.year) {
            notificar("Por favor, rellena los campos obligatorios.", "error");
            return;
        }

        // Construimos el objeto exacto que pide la v1 (con campos de relleno para evitar el 400)
        const registroParaV1 = {
            "country": nuevoRegistro["country "], 
            "year": parseInt(nuevoRegistro.year),
            "country_code": "n/a", 
            "land_agriculture": parseFloat(nuevoRegistro.land_agriculture) || 0,
            "types_land": 1,
            "index": 1
        };

        const res = await fetch("/api/v1/agriculture-land", {
            method: "POST",
            body: JSON.stringify(registroParaV1),
            headers: { "Content-Type": "application/json" }
        });

        if (res.status === 201) {
            notificar("✅ Registro guardado con éxito", "exito");
            // Limpiar formulario
            nuevoRegistro = { "country ": "", "year": "", "land_agriculture": "" };
            cargarDatos();
        } else if (res.status === 409) {
            notificar("❌ Error: Ese país y año ya existen.", "error");
        } else {
            const errorMsg = await res.text();
            notificar("❌ Error al guardar: " + (errorMsg || "Datos incorrectos"), "error");
        }
    }

    async function borrarUno(pais, anyo) {
        if (confirm(`¿Eliminar el registro de ${pais} en ${anyo}?`)) {
            const res = await fetch(`/api/v1/agriculture-land/${pais}/${anyo}`, { method: "DELETE" });
            if (res.ok) {
                notificar("Registro eliminado.", "exito");
                cargarDatos();
            }
        }
    }

    async function borrarTodo() {
        if (confirm("🚨 ¿BORRAR TODO? Esta acción es irreversible.")) {
            const res = await fetch("/api/v1/agriculture-land", { method: "DELETE" });
            if (res.ok) {
                notificar("Base de datos vaciada.", "exito");
                data = [];
            }
        }
    }

    async function cargarIniciales() {
        const res = await fetch("/api/v1/agriculture-land/loadInitialData");
        if (res.ok) {
            notificar("✅ Datos iniciales cargados.", "exito");
            cargarDatos();
        } else {
            notificar("Error al cargar datos iniciales.", "error");
        }
    }

    onMount(cargarDatos);
</script>

<main>
    <header>
        <h1>🌍 Gestión de Tierras Agrícolas</h1>
        <p>Panel de administración de datos FMM</p>
    </header>

    {#if mensajeUsuario}
        <div class="alerta {tipoAlerta}" role="alert">
            {mensajeUsuario}
        </div>
    {/if}

    <section class="card formulario">
        <h2>➕ Nuevo registro</h2>
        <div class="campos">
            <div class="input-group">
                <label for="country">País</label>
                <input id="country" bind:value={nuevoRegistro["country "]} placeholder="Ej: Spain" />
            </div>
            <div class="input-group">
                <label for="year">Año</label>
                <input id="year" type="number" bind:value={nuevoRegistro.year} placeholder="2024" />
            </div>
            <div class="input-group">
                <label for="land">Superficie %</label>
                <input id="land" type="number" step="0.01" bind:value={nuevoRegistro.land_agriculture} placeholder="45.2" />
            </div>
            <button onclick={crearDato} class="btn-crear">Guardar</button>
        </div>
        <button onclick={cargarIniciales} class="btn-load">⚡ Cargar datos de ejemplo</button>
    </section>

    <section class="card">
        <table>
            <thead>
                <tr>
                    <th>País</th>
                    <th>Año</th>
                    <th>Superficie (%)</th>
                    <th class="text-center">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each data as d}
                    <tr>
                        <td><strong>{d["country "] || d.country}</strong></td>
                        <td>{d.year}</td>
                        <td>{d.land_agriculture}%</td>
                        <td class="text-center">
                            <button onclick={() => borrarUno(d["country "] || d.country, d.year)} class="btn-borrar">
                                🗑️ Eliminar
                            </button>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="4" class="text-center">No hay datos disponibles.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </section>

    <footer>
        <button onclick={borrarTodo} class="btn-borrar-todo">🧨 Vaciar toda la base de datos</button>
    </footer>
</main>

<style>
    :global(body) { background-color: #f0f2f5; margin: 0; }
    
    main { 
        font-family: 'Inter', system-ui, sans-serif; 
        max-width: 1000px; 
        margin: 40px auto; 
        padding: 20px; 
    }

    header { text-align: center; margin-bottom: 30px; }
    h1 { color: #1a365d; margin-bottom: 5px; }
    header p { color: #64748b; margin-top: 0; }

    .card { 
        background: white; 
        padding: 25px; 
        border-radius: 12px; 
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); 
        margin-bottom: 20px; 
    }

    .alerta { 
        padding: 15px; 
        margin-bottom: 20px; 
        border-radius: 8px; 
        text-align: center; 
        font-weight: 600; 
        animation: slideDown 0.4s ease-out; 
    }
    .exito { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .error { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

    .campos { display: flex; gap: 15px; align-items: flex-end; margin-bottom: 20px; }
    .input-group { display: flex; flex-direction: column; flex: 1; gap: 5px; }
    label { font-size: 0.85rem; font-weight: 600; color: #475569; }
    input { 
        padding: 10px; 
        border: 1px solid #cbd5e1; 
        border-radius: 6px; 
        font-size: 1rem;
        transition: border-color 0.2s;
    }
    input:focus { outline: none; border-color: #3b82f6; ring: 2px solid #bfdbfe; }

    table { width: 100%; border-collapse: collapse; }
    th { background-color: #f8fafc; color: #475569; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; padding: 15px; border-bottom: 2px solid #e2e8f0; text-align: left; }
    td { padding: 15px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    tr:hover { background-color: #f1f5f9; }

    button { 
        cursor: pointer; 
        font-weight: 600; 
        transition: all 0.2s; 
        border-radius: 6px; 
        border: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .btn-crear { background: #22c55e; color: white; padding: 10px 24px; height: 42px; }
    .btn-crear:hover { background: #16a34a; transform: translateY(-1px); }

    .btn-load { background: #3b82f6; color: white; padding: 10px; width: 100%; font-size: 0.9rem; }
    .btn-load:hover { background: #2563eb; }

    .btn-borrar { background: #fee2e2; color: #dc2626; padding: 6px 12px; font-size: 0.85rem; }
    .btn-borrar:hover { background: #fecaca; }

    .btn-borrar-todo { background: #1e293b; color: white; padding: 12px; width: 100%; margin-top: 20px; }
    .btn-borrar-todo:hover { background: #0f172a; }

    .text-center { text-align: center; }

    @keyframes slideDown { 
        from { transform: translateY(-10px); opacity: 0; } 
        to { transform: translateY(0); opacity: 1; } 
    }
</style>