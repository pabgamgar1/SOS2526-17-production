import datosFMM from "../../datos-fmm.json" with { type: "json" };
let BASE_URL_API = "/api/v1/agriculture-land";

function loadBackendFMM(app) {

let mediaLandAgriculture =
  datosFMM
    .filter((d) => d.index >= 0 && d.index <= 0.5)
    .map((d) => d.land_agriculture)
    .reduce((a, b) => a + b, 0) /
  datosFMM.filter((d) => d.index >= 0 && d.index <= 0.5).length;

app.get("/samples/FMM", (req, res) => {
  res.send(
    `<html><body><h1>Media de tierra que es apta para agricultura por indice de pulicion entre 0 y 0.5 :${mediaLandAgriculture}</h1></body></html>`,
  );});


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








}

export { loadBackendFMM };