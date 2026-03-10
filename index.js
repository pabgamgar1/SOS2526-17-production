import express from "express";
import bodyParser from "body-parser";
import cool from "cool-ascii-faces";

import path from 'path';

import { loadBackendMRG } from "./src/back-MRG/index.js";

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
  // process.cwd() apunta a la raíz del proyecto
  res.sendFile(path.join(process.cwd(), "static", "about.html"));
});

// --- RUTA COOL ---
app.get("/cool", (req, res) => {
  res.send(cool());
  console.log("New cool face delivered");
});
// --- RUTA index.html ---
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "static", "index.html"));
});

 
loadBackendMRG(app);


// --- (PGG) ---

/*let datosPGG = require("./datos-pgg.json") || [];

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
    res.status(400).send("Array isn't empty"); // Bad Request
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
      res.status(200).send(resource); // OK
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
}*/

//------------------FMM-----------------------------------------

//let datosFMM = require("./datos-fmm.json") || [];
/*
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
app.get(BASE_URL_API + "/:country/:year", (req, res) => {
    const { country, year } = req.params;

    const resource = datosFMM.find((d) => {
        // Comprobamos que 'd' y 'd.country' existan para evitar el error 500
        if (d && d.country) {
            return d.country.toLowerCase() === country.toLowerCase() && 
                   d.year == year; // El '==' permite comparar "1961" con 1961
        }
        return false;
    });

    if (resource) {
        // Usamos res.json para que Postman lo reciba correctamente como objeto
        res.status(200).json(resource); 
    } else {
        res.sendStatus(404);
    }
});

//Esta la tenias comentada
app.get(BASE_URL_API + "/:country/:year", (req, res) => {
  let { country, year } = req.params;
  let resource = datosFMM.find((d) => d.country === country && d.year === parseInt(year));
  if (resource) {
    res.status(200).send(JSON.stringify(resource, null, 2)); // OK
  } else {
    res.sendStatus(404); // Not Found
  }
});

app.post(BASE_URL_API + "/:country/:year", (req, res) =>
  res.sendStatus(405),
);

// POST
app.post(BASE_URL_API + "/", (req, res) => {
    let newData = req.body;

    // Validación campos obligatorios (Evita el error 400 y 500)
    if (!newData || !newData.country || !newData.year) {
        return res.status(400).send("Bad Request: Faltan campos obligatorios");
    }

    // Comprobar si ya existe (Para devolver 409)
    let exists = datosFMM.some((d) => {
        // Comparamos país y año para identificar el recurso único
        return d.country === newData.country && d.year === newData.year;
    });

    if (exists) {
        return res.sendStatus(409); // Conflict: El recurso ya existe
    } else {
        datosFMM.push(newData);
        return res.sendStatus(201); // Created
    }
});
//////


app.put(BASE_URL_API, (req, res) => {
  res.sendStatus(405); // Method Not Allowed
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
*/

app.listen(port, () => {
  console.log(`Servidor de grupo funcionando en puerto ${port}`);
});





