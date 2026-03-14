let datosPGG = require("./datos-pgg.json") || [];

let mediaElectricidadHydroAfghanistan =
  datosPGG
    .filter((d) => d.country === "Afghanistan")
    .map((d) => d.hydro)
    .reduce((a, b) => a + b) /
  datosPGG.filter((d) => d.country === "Afghanistan").length;

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
}
