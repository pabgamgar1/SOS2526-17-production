<script>
    import { onMount } from 'svelte';

    // Usamos $state para Svelte 5 (Reactividad)
    let data = $state([]);
    let nuevoRegistro = $state({ 
        "country ": "", 
        "year": "", 
        "country_code": "", 
        "land_agriculture": "", 
        "types_land": "", 
        "index": "" 
    });
    
    let mensajeUsuario = $state("");
    let tipoAlerta = $state("");

    // --- FUNCIONES ---

    async function cargarDatos() {
        const res = await fetch("/api/v1/agriculture-land");
        if (res.ok) {
            data = await res.json();
        } else {
            notificar("No se han podido cargar los datos del servidor.", "error");
        }
    }

   async function crearDato() {
    // SOS suele exigir todos los campos del esquema, aunque estén vacíos
    const registroLimpio = {
        "country ": String(nuevoRegistro["country "]), // CON el espacio al final
        "year": Number(nuevoRegistro.year),
        "country_code": "and", // Ponemos uno por defecto por si el 400 es por campo faltante
        "land_agriculture": Number(nuevoRegistro.land_agriculture),
        "types_land": 1,       // Valor numérico por defecto
        "index": 1             // Valor numérico por defecto
    };

    console.log("Intentando enviar:", registroLimpio);

    const res = await fetch("/api/v1/agriculture-land", {
        method: "POST",
        body: JSON.stringify(registroLimpio),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (res.status === 201) {
        notificar(`✅ Guardado correctamente`, "exito");
        cargarDatos();
    } else {
        // Esto nos dirá qué le molesta al servidor
        const textoError = await res.text();
        console.error("Respuesta del servidor:", textoError);
        notificar("Error: " + (textoError || "Estructura incorrecta"), "error");
    }
}

    async function borrarUno(pais, anyo) {
        if (confirm(`¿Eliminar el registro de ${pais} en ${anyo}?`)) {
            const res = await fetch(`/api/v1/agriculture-land/${pais}/${anyo}`, { method: "DELETE" });
            if (res.ok) {
                notificar("Registro eliminado con éxito.", "exito");
                cargarDatos();
            }
        }
    }

    async function borrarTodo() {
        if (confirm("🚨 ¿BORRAR TODOS LOS DATOS? Esta acción no se puede deshacer.")) {
            const res = await fetch("/api/v1/agriculture-land", { method: "DELETE" });
            if (res.ok) {
                notificar("Base de datos vaciada.", "exito");
                cargarDatos();
            }
        }
    }

    // Botón para llamar a la ruta de carga inicial que arreglamos antes
    async function cargarIniciales() {
        const res = await fetch("/api/v1/agriculture-land/loadInitialData");
        if (res.ok) {
            notificar("✅ Datos iniciales cargados con éxito.", "exito");
            cargarDatos();
        } else {
            notificar("Error al cargar los datos iniciales.", "error");
        }
    }

    function notificar(texto, tipo) {
        mensajeUsuario = texto;
        tipoAlerta = tipo;
        setTimeout(() => mensajeUsuario = "", 5000);
    }

    onMount(cargarDatos);
</script>

<main>
    <h1>🌍 Gestión de Tierras Agrícolas</h1>

    {#if mensajeUsuario}
        <div class="alerta {tipoAlerta}">{mensajeUsuario}</div>
    {/if}

    <section class="formulario">
        <h2>Nuevo registro</h2>
        <div class="campos">
            <input bind:value={nuevoRegistro["country "]} placeholder="País" />
            <input bind:value={nuevoRegistro.year} type="number" placeholder="Año" />
            <input bind:value={nuevoRegistro.land_agriculture} type="number" step="0.01" placeholder="Superficie %" />
            <button onclick={crearDato} class="btn-crear">Guardar</button>
        </div>
        <button onclick={cargarIniciales} class="btn-load">Cargar datos de ejemplo</button>
    </section>

    <hr />

    <table>
        <thead>
            <tr>
                <th>País</th>
                <th>Año</th>
                <th>Superficie (%)</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each data as d}
                <tr>
                    <td>{d["country "]}</td>
                    <td>{d.year}</td>
                    <td>{d.land_agriculture}</td>
                    <td>
                        <button onclick={() => borrarUno(d["country "], d.year)} class="btn-borrar">Eliminar</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>

    <button onclick={borrarTodo} class="btn-borrar-todo">Vaciar Tabla Completa</button>
</main>

<style>
    main { font-family: 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; color: #333; }
    
    .alerta { padding: 15px; margin-bottom: 20px; border-radius: 8px; text-align: center; font-weight: bold; animation: fadein 0.5s; }
    .exito { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

    .formulario { background: #f8f9fa; padding: 20px; border-radius: 12px; border: 1px solid #dee2e6; margin-bottom: 30px; }
    .campos { display: flex; gap: 10px; margin-bottom: 15px; }
    input { padding: 10px; border: 1px solid #ced4da; border-radius: 6px; flex: 1; }

    table { width: 100%; border-collapse: collapse; margin-top: 10px; background: white; }
    th, td { padding: 12px; border: 1px solid #dee2e6; text-align: left; }
    th { background-color: #3498db; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }

    .btn-crear { background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
    .btn-load { background: #17a2b8; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; width: 100%; }
    .btn-borrar { background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
    .btn-borrar-todo { background: #343a40; color: white; border: none; padding: 12px; width: 100%; margin-top: 30px; border-radius: 6px; cursor: pointer; font-weight: bold; }

    button:hover { opacity: 0.9; transform: translateY(-1px); transition: 0.2s; }
    
    @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
</style>