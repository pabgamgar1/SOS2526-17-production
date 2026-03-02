let express = require("express");
let bodyParser = require("body-parser");
let cool = require("cool-ascii-faces");

const app = express();
const port = process.env.PORT || 3000;

const layout = (content) => `
  <!DOCTYPE html>
  <html lang="es">
      <head>
          <meta charset="UTF-8" />
          <title>About - SOS2526-17</title>
          <style>
            body {
              font-family:
                  system-ui,
                  -apple-system,
                  BlinkMacSystemFont,
                  "Segoe UI",
                  Roboto,
                  Oxygen,
                  Ubuntu,
                  Cantarell,
                  "Open Sans",
                  "Helvetica Neue",
                  sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 40px auto;
              padding: 0 20px;
              color: #24292e;
            }
          </style>
      </head>
      <body>
        <main>
          ${content}
        </main>
      </body>
  </html>
  `;

app.use("/", express.static("./static"));
app.use(bodyParser.json());

// --- RUTA ABOUT ---
app.get("/about", (req, res) => {
  // __dirname  dice "donde esté este archivo index.js"
  res.sendFile(__dirname + "/static/about.html");
});

// --- RUTA COOL ---
app.get("/cool", (req, res) => {
  res.send(cool());
  console.log("New cool face delivered");
});
// --- RUTA index.html ---
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/static/index.html");
});

// --- (MRG) ---
{
  let BASE_URL_API = "/api/v1/water-productivities";


  let dataMRG = require("./datos-mrg.json") || [];

  // Ruta dinámica /samples/MRG
  app.get("/samples/MRG", (req, res) => {
    let avrgWaterProductAFG =
      dataMRG
        .filter((d) => d.country === "Afghanistan")
        .map((d) => d.waterProductivity)
        .reduce((a, b) => a + b) /
      dataMRG.filter((d) => d.country === "Afghanistan").length;
    res.send(
      `<html><body><h3>The average water productivity for Afghanistan is ${avrgWaterProductAFG.toString()}</h3></body></html>`,
    );
  });

  let waterStats = [];

  // Cargar datos iniciales
  app.get(BASE_URL_API + "/loadInitialData", (req, res) => {
    if (waterStats.length === 0) {
      waterStats = [...dataMRG];
      res.status(200).send("Datos iniciales cargados con éxito.");
    } else {
      res.status(400).send("Bad Request: Data already exists");
    }
  });

  // B. GET a la lista de recursos
  app.get(BASE_URL_API, (req, res) => {
    // Si el usuario ha puesto ?country=XXX, lo guardamos, etc.
    const { country, year, from, to } = req.query;

    let filteredData = [...waterStats];

    // 3. SI el usuario ha puesto ?country=XXX, filtramos la lista
    if (country) {
      filteredData = filteredData.filter(
        (d) => d.country.toLowerCase() === country.toLowerCase(),
      );
    }
    if (year) {
      filteredData = filteredData.filter((d) => d.year == year);
    }
    if (from) {
      filteredData = filteredData.filter((d) => d.year >= parseInt(from));
    }
    if (to) {
      filteredData = filteredData.filter((d) => d.year <= parseInt(to));
    }

    res.status(200).send(JSON.stringify(filteredData, null, 2));
  });

  // GET de un país con rango (Ej: /Spain?from=2000&to=2010)
  app.get(BASE_URL_API + "/:country", (req, res) => {
    let country = req.params.country;
    let { from, to } = req.query;

    // Filtramos por país
    let filteredData = waterStats.filter(
      (d) => d.country.toLowerCase() === country.toLowerCase(),
    );

    // Filtramos por rango si existe
    if (from)
      filteredData = filteredData.filter((d) => d.year >= parseInt(from));
    if (to) filteredData = filteredData.filter((d) => d.year <= parseInt(to));

    res.status(200).send(JSON.stringify(filteredData, null, 2));
  });

  // POST: Crear nuevo recurso
  app.post(BASE_URL_API, (req, res) => {
    let newData = req.body;
    // Comprobar campos obligatorios
    if (!newData.country || !newData.year) {
      return res.sendStatus(400); // Bad Request
    }
    // Comprobar si ya existe un recurso con el mismo país y año
    let exists = waterStats.some(
      (d) => d.country === newData.country && d.year == newData.year,
    );
    if (exists) {
      res.sendStatus(409); // Conflict
    } else {
      waterStats.push(newData);
      res.status(201).send("CREATED"); // Created
    }
  });

  // PUT sobre la lista (NO PERMITIDO)
  app.put(BASE_URL_API, (req, res) => {
    res.sendStatus(405); // Method Not Allowed
  });

  // DELETE de toda la lista
  app.delete(BASE_URL_API, (req, res) => {
    // Si el usuario no envía .../api/v1/water-productivities?admin=true
    if (req.query.admin !== "true") {
      return res.sendStatus(401); // Unauthorized
    }

    waterStats = [];
    res.sendStatus(200);
  });

  // MÉTODOS SOBRE UN RECURSO CONCRETO

  // GET (Ej: /api/v1/water-productivities/Spain/2000)
  app.get(BASE_URL_API + "/:country/:year", (req, res) => {
    let { country, year } = req.params;
    let resource = waterStats.find(
      (d) => d.country === country && d.year == year,
    );
    if (resource) {
      res.status(200).send(JSON.stringify(resource, null, 2));
    } else {
      res.sendStatus(404); // Not Found
    }
  });

  // Post (NO PERMITIDO)
  app.post(BASE_URL_API + "/:country/:year", (req, res) => res.sendStatus(405));

  // PUT (Ej: /api/v1/water-productivities/Spain/2000)
  app.put(BASE_URL_API + "/:country/:year", (req, res) => {
    let { country, year } = req.params;
    let updatedData = req.body;

    // ERROR 400: El país/año de la URL no coincide con el del cuerpo JSON
    if (country !== updatedData.country || year != updatedData.year) {
      return res.sendStatus(400);
    }

    // Posición en el array
    let index = waterStats.findIndex(
      (d) => d.country === country && d.year == year,
    );

    if (index !== -1) {
      // Si existe, lo sustituimos por los nuevos datos
      waterStats[index] = updatedData;
      res.sendStatus(200);
    } else {
      // ERROR 404: No existe ese país/año para actualizar
      res.sendStatus(404);
    }
  });

  // DELETE (Ej: /api/v1/water-productivities/Spain/2000)
  app.delete(BASE_URL_API + "/:country/:year", (req, res) => {
    let { country, year } = req.params;
    let index = waterStats.findIndex(
      (d) => d.country === country && d.year == year,
    );
    if (index !== -1) {
      waterStats.splice(index, 1); // Elimina 1 elemento en la posición index
      res.sendStatus(200);
    } else {
      res.sendStatus(404); // Not Found
    }
  });
}

// --- (PGG) ---

let datosPGG = require("./datos-pgg.json") || [];

let mediaElectricidadHydroAfghanistan =
  datosPGG
    .filter((d) => d.country === "Afghanistan")
    .map((d) => d.hydro)
    .reduce((a, b) => a + b) /
  datosPGG.filter((d) => d.country === "Afghanistan").length;

app.get("/samples/PGG", (req, res) => {
  res.send(
    `<p>Media de electridad renovable hidráulica producida por Afghanistan: ${mediaElectricidadHydroAfghanistan}</p>`,
  );
});

{
  let BASE_URL_API = "/api/v1/renewable-energy-consumptions";

  app.get(BASE_URL_API + "/loadInitialData", async (req, res) => {
    if (datosPGG.length === 0) {
      datosPGG = require("./datos-pgg.json");
      return res.status(201).send("Array was empty: Added data"); // Created
    }
    res.status(400).send(layout(`<p>Array isn't empty</p>`)); // Bad Request
  });

  // GET todos
  app.get(BASE_URL_API + "/", (req, res) => {
    res.status(200).send(datosPGG);
  });

  // GET dato específico
  app.get(BASE_URL_API + "/:country/:year", (req, res) => {
    let { country, year } = req.params;
    let resource = datosPGG.find(
      (d) => d.country === country && d.year == year,
    );
    if (resource) {
      res.status(200).send(JSON.stringify(resource, null, 2)); // OK
    } else {
      res.sendStatus(404); // Not Found
    }
  });

  // POST (no permitido)
  app.post(BASE_URL_API + "/:country/:year", (req, res) => res.sendStatus(405));

  // POST (añadir uno nuevo)
  app.post(BASE_URL_API + "/", (req, res) => {
    let newData = req.body;
    // Comprobar campos obligatorios
    if (!newData.country || newData.year === undefined) {
      return res.sendStatus(400); // Bad Request
    }
    let exists = datosPGG.some(
      (d) => d.country === newData.country && d.year == newData.year,
    );
    if (exists) {
      res.sendStatus(409); // Conflict
    } else {
      datosPGG.push(newData);
      res.sendStatus(201); // Created
    }
  });

  // PUT sobre la lista (NO PERMITIDO)
  app.put(BASE_URL_API, (req, res) => {
    res.sendStatus(405); // Method Not Allowed
  });

  // PUT (sustituir info de uno)
  app.put(BASE_URL_API + "/:country/:year", (req, res) => {
    let { country, year } = req.params;
    let updatedData = req.body;

    // ERROR 400: El país/año de la URL no coincide con el del cuerpo JSON
    if (country !== updatedData.country || year != updatedData.year) {
      return res.sendStatus(400);
    }

    // Posición en el array
    let index = datosPGG.findIndex(
      (d) => d.country === country && d.year == year,
    );

    if (index !== -1) {
      // Si existe, lo sustituimos por los nuevos datos
      datosPGG[index] = updatedData;
      res.sendStatus(200);
    } else {
      // ERROR 404: No existe ese país/año para actualizar
      res.sendStatus(404);
    }
  });

  // DELETE todos
  app.delete(BASE_URL_API + "/", (req, res) => {
    // Si el usuario no envía .../api/v1/renewable-energy-consumptions?admin=true
    if (req.query.admin !== "true") {
      return res.sendStatus(401); // Unauthorized
    }

    datosPGG = [];
    res.sendStatus(200);
  });

  // DELETE dato específico
  app.delete(BASE_URL_API + "/:country/:year", (req, res) => {
    let { country, year } = req.params;
    let index = datosPGG.findIndex(
      (d) => d.country === country && d.year == year,
    );
    if (index !== -1) {
      datosPGG.splice(index, 1); // Elimina 1 elemento en la posición index
      res.sendStatus(200);
    } else {
      res.sendStatus(404); // Not Found
    }
  });
}

//------------------FMM-----------------------------------------

let datosFMM = require("./datos-fmm.json") || [];

let mediaLandAgriculture =
  datosFMM
    .filter((d) => d.index >= 0 && d.index <= 0.5)
    .map((d) => d.land_agriculture)
    .reduce((a, b) => a + b, 0) /
  datosFMM.filter((d) => d.index >= 0 && d.index <= 0.5).length;

app.get("/samples/FMM", (req, res) => {
  res.send(
    `<html><body><h1>Media de tierra que es apta para agricultura por indice de pulicion entre 0 y 0.5 :${mediaLandAgriculture}</h1></body></html>`,
  );
});

let BASE_URL_API = "/api/v1/agriculture-land";

app.get(BASE_URL_API + "/loadInitialData", async (req, res) => {
  if (datosFMM.length === 0) {
    datosFMM = require("./datos-fmm.json");
    return res.send(layout(`<p>nope</p>`));
  }
  res.send(layout(`<p>Creado con exito</p>`));
});
//GET ALL

app.get(BASE_URL_API + "/", (req, res) => {
  res.status(200).send(datosFMM);
});

//GET

app.get(BASE_URL_API + "/:country/:country_code", (req, res) => {
    const { country, country_code } = req.params;
    console.log(`Buscando: ${country} con código ${country_code}`);
    console.log("Datos disponibles:", datosFMM.length);

    const resource = datosFMM.find(d => 
        d.country.toLowerCase() === country.toLowerCase() && 
        d.country_code.toLowerCase() === country_code.toLowerCase()
    );

    if (resource) {
        res.json(resource);
    } else {
        res.status(404).send("Resource not found in our database");
    }
});

// POST
app.post(BASE_URL_API + "/", (req, res) => {
  let newData = req.body;
  // Comprobar campos obligatorios
  if (!newData.country || newData.country_code === undefined) {
    return res.sendStatus(400); // Bad Request
  }
  // Comprobar
  let exists = datosFMM.some(
    (d) =>
      d.country === newData.country && d.country_code == newData.country_code,
  );
  if (exists) {
    res.sendStatus(409); // Conflict
  } else {
    datosFMM.push(newData);
    res.sendStatus(201); // Created
  }
});

// PUT (
app.put(BASE_URL_API + "/:country/:country_code", (req, res) => {
  let { country, country_code } = req.params;
  let updatedData = req.body;
  // ERROR 400
  if (
    country !== updatedData.country ||
    country_code != updatedData.country_code
  ) {
    return res.sendStatus(400);
  }
  // Posición
  let index = datosFMM.findIndex(
    (d) => d.country === country && d.country_code == country_code,
  );
  if (index !== -1) {
    datosFMM[index] = updatedData;
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// DELETE
app.delete(BASE_URL_API + "/", (req, res) => {
  if (req.query.admin !== "true") {
    return res.sendStatus(401); // Unauthorized
  }
  datosFMM = [];
  res.sendStatus(200);
});

// DELETE2
app.delete(BASE_URL_API + "/:country/:country_code", (req, res) => {
  let { country, country_code } = req.params;
  let index = datosFMM.findIndex(
    (d) => d.country === country && d.country_code == country_code,
  );
  if (index !== -1) {
    datosFMM.splice(index, 1);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(port, () => {
  console.log(`Servidor de grupo funcionando en puerto ${port}`);
});
