//import datosFMM from "../../datos-fmm.json" with { type: "json" };

import Datastore from 'nedb';
import fs from 'fs';
let BASE_URL_API = "/api/v1/agriculture-land";

const db = new Datastore({ filename: './src/db/agriculture-land.db', autoload: true });
const jsonRawData = fs.readFileSync('./datos-fmm.json', 'utf8');
const initialAgricultureData = JSON.parse(jsonRawData);

function loadBackendFMM(app) {
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
  );});
*/

app.get(BASE_URL_API + "/loadInitialData", (req, res) => {
    // 1. Borramos todo
    db.remove({}, { multi: true }, (err, numRemoved) => {
        if (err) {
            res.status(500).send("Error limpiando la base de datos");
        } else {
            // 2. Insertamos los datos
            db.insert(initialAgricultureData, (err, newDocs) => {
                if (err) {
                    res.status(500).send("Error insertando datos iniciales");
                } else {
                    res.status(201).send(`Cargados ${newDocs.length} recursos del archivo JSON.`);
                }
            });
        }
    });
});



/*
  app.get(BASE_URL_API + "/loadInitialData", async (req, res) => {
  if (datosFMM.length === 0) {
    datosFMM = require("./datos-fmm.json");
    return res.send(layout(`<p>nope</p>`));
  }
  res.send(layout(`<p>Creado con exito</p>`));
});*/
//GET ALL
/*
app.get(BASE_URL_API + "/", (req, res) => {
  res.status(200).send(datosFMM);
});
*/

/*
app.get(BASE_URL_API + "/", (req, res) => {
    db.find({}, (err, docs) => {
        docs.forEach(d => delete d._id); // Limpiamos el ID interno de NeDB
        res.status(200).send(docs);
    });
});*/


// GET General: Soporta 
app.get(BASE_URL_API, (req, res) => {
    // 1. Extraemos todos los posibles parámetros
    let { country, year, country_code, land_agriculture, types_land, index, limit, offset } = req.query;
    
    // 2. Construimos el objeto de búsqueda 
    let query = {};

    // Filtros de texto
    if (country) query.country = country;
    if (country_code) query.country_code = country_code;

    // Filtros numéricos 
    if (year) query.year = parseInt(year);
    if (land_agriculture) query.land_agriculture = parseFloat(land_agriculture);
    if (types_land) query.types_land = parseInt(types_land);
    if (index) query.index = parseFloat(index);

    // 3. Ejecutamos la consulta con Paginación 
    db.find(query)
      .skip(parseInt(offset) || 0) 
      .limit(parseInt(limit) || 0)
      .exec((err, docs) => {
          if (err) {
              res.sendStatus(500);
          } else {
              // Limpiamos el campo _id
              const result = docs.map((d) => {
                  const cleanedDoc = { ...d };
                  delete cleanedDoc._id;
                  return cleanedDoc;
              });
              res.status(200).send(result);
          }
      });
});


//GET
/*
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
*/
app.get(BASE_URL_API + "/:country/:year", (req, res) => {
    const { country, year } = req.params;

    // Buscamos exactamente por los dos campos 
    db.find({ country: country, year: parseInt(year) }, (err, docs) => {
        if (err) {
            res.sendStatus(500);
        } else if (docs.length > 0) {
            // Cogemos solo el primer elemento para devolver un OBJETO, no un array
            const resource = docs[0];
            delete resource._id; 
            res.status(200).json(resource); // objeto puro
        } else {
            // Si el array de resultados está vacío, el recurso no existe
            res.sendStatus(404); 
        }
    });
});





////////////////////
/*
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
}); */

// --- POST GENERAL ---
// recursos nuevos
app.post(BASE_URL_API, (req, res) => {
    const newData = req.body;

    // 1. VALIDACIÓN DE ESTRUCTURA 
    // campos esperamos 
    const camposEsperados = ["country", "year", "country_code", "land_agriculture", "types_land", "index"];
    const camposRecibidos = Object.keys(newData);

    // Comprobamos que están todos los campos 
    const tieneEstructuraExacta = camposEsperados.every(f => camposRecibidos.includes(f)) 
                                  && camposRecibidos.length === camposEsperados.length;

    if (!tieneEstructuraExacta) {
        // Si el JSON es raro 
        return res.sendStatus(400); 
    }

    // 2. VALIDACIÓN DE DUPLICADOS 
    // No podemos tener dos recursos con el mismo país y año
    db.find({ country: newData.country, year: newData.year }, (err, docs) => {
        if (err) return res.sendStatus(500);

        if (docs.length > 0) {
            // Si ya existe, devolvemos 409 (Conflict)
            res.sendStatus(409); 
        } else {
            // 3. INSERCIÓN 
            db.insert(newData, (err, doc) => {
                if (err) return res.sendStatus(500);
                res.sendStatus(201); 
            });
        }
    });
});

// --- POST ESPECÍFICO ---
app.post(BASE_URL_API + "/:country/:year", (req, res) => {
    // Devolvemos 405 (Method Not Allowed)
    res.sendStatus(405); 
});



//////
 /*

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
*/
// --- PUT ESPECÍFICO ---
app.put(BASE_URL_API + "/:country/:year", (req, res) => {
    const { country, year } = req.params;
    const updatedData = req.body;

    // 1. VALIDACIÓN DE ESTRUCTURA 
    const camposEsperados = ["country", "year", "country_code", "land_agriculture", "types_land", "index"];
    const camposRecibidos = Object.keys(updatedData);

    const tieneEstructuraExacta = camposEsperados.every(f => camposRecibidos.includes(f)) 
                                  && camposRecibidos.length === camposEsperados.length;

    if (!tieneEstructuraExacta) {
        // Si el JSON tiene campos de más o le falta alguno: 400
        return res.sendStatus(400); 
    }

    // 2. VALIDACIÓN DE IDENTIDAD 
    // Evitamos que intenten actualizar 'Spain/2020' enviando un JSON de 'France/2021'
    if (country !== updatedData.country || parseInt(year) !== updatedData.year) {
        return res.sendStatus(400);
    }

    // 3. ACTUALIZACIÓN EN BASE DE DATOS
    db.update({ country: country, year: parseInt(year) }, { $set: updatedData }, {}, (err, numReplaced) => {
        if (err) {
            return res.sendStatus(500);
        }
        
        if (numReplaced > 0) {
            // Si encontró el recurso y lo actualizó: 200 OK
            res.sendStatus(200);
        } else {
            // Si no encontró el recurso con ese país y año: 404 Not Found
            res.sendStatus(404);
        }
    });
});

// --- PUT GENERAL ---
// No se permite actualizar toda la colección de golpe
app.put(BASE_URL_API, (req, res) => {
    res.sendStatus(405); 
});
/*
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
// --- DELETE GENERAL  ---
app.delete(BASE_URL_API, (req, res) => {
    if (req.query.admin !== "true") {
        return res.sendStatus(401); // Unauthorized
    }

    db.remove({}, { multi: true }, (err, numRemoved) => {
        if (err) {
            res.sendStatus(500);
        } else {
            
            res.sendStatus(200);
        }
    });
});

// --- DELETE ESPECÍFICO ---
app.delete(BASE_URL_API + "/:country/:year", (req, res) => {
    const { country, year } = req.params;

    db.remove({ country: country, year: parseInt(year) }, {}, (err, numRemoved) => {
        if (err) {
            res.sendStatus(500);
        } else if (numRemoved > 0) {
            // Se encontró y se borró con éxito
            res.sendStatus(200);
        } else {
            // Si el recurso no existía, devolvemos 404 
            res.sendStatus(404);
        }
    });
});

// documentación
app.get(BASE_URL_API + "/docs", (req, res) => {
    // POSTMAN
    res.redirect("https://documenter.getpostman.com/view/52395584/2sBXigMDSm");
});

}

export { loadBackendFMM };
