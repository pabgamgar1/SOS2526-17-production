//import datosFMM from "../../datos-fmm.json" with { type: "json" };

import Datastore from 'nedb';
import fs from 'fs';
let BASE_URL_API = "/api/v1/agriculture-land";

const db = new Datastore({ filename: './src/db/agriculture-land.db', autoload: true });
const jsonRawData = fs.readFileSync('./datos-fmm.json', 'utf8');
const initialAgricultureData = JSON.parse(jsonRawData);
import util from 'util';

if (typeof util.isRegExp !== 'function') {
    util.isRegExp = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Date]' || obj instanceof RegExp;
    };
}

// PARCHE 2:
if (typeof util.isDate !== 'function') {
    util.isDate = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    };
}
function loadBackendFMM(app) {

/*
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
});*/
app.get(BASE_URL_API + "/loadInitialData", (req, res) => {
    db.remove({}, { multi: true }, (err, numRemoved) => {
        if (err) return res.status(500).send("Error limpiando DB");

        
        db.insert(initialAgricultureData, (err, newDocs) => {
            if (err) {
            
                console.log("Fallo real al insertar:", err); 
                return res.status(500).send("Error insertando datos iniciales: " + err);
            } else {
                return res.status(201).send(`✅ Éxito: ${newDocs.length} registros cargados.`);
            }
        });
    });
});



// GET General: Soporta 
app.get(BASE_URL_API, (req, res) => {
  
    let { country, year, country_code, land_agriculture, types_land, index, limit, offset } = req.query;
    

    let query = {};

  
    if (country) query.country = country;
    if (country_code) query.country_code = country_code;


    if (year) query.year = parseInt(year);
    if (land_agriculture) query.land_agriculture = parseFloat(land_agriculture);
    if (types_land) query.types_land = parseInt(types_land);
    if (index) query.index = parseFloat(index);

    db.find(query)
      .skip(parseInt(offset) || 0) 
      .limit(parseInt(limit) || 0)
      .exec((err, docs) => {
          if (err) {
              res.sendStatus(500);
          } else {
            
              const result = docs.map((d) => {
                  const cleanedDoc = { ...d };
                  delete cleanedDoc._id;
                  return cleanedDoc;
              });
              res.status(200).send(result);
          }
      });
});

/*
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
*/
app.get(BASE_URL_API + "/:country/:year", (req, res) => {
    const { country, year } = req.params;

   
    db.find({ 
        $or: [{ country: country }, { "country ": country }], 
        year: parseInt(year) 
    }, (err, docs) => {
        if (err) {
            console.error("Error en DB:", err);
            return res.sendStatus(500);
        }

        if (docs && docs.length > 0) {
          
            const resource = JSON.parse(JSON.stringify(docs[0]));
           
            delete resource._id;
         
            return res.status(200).json(resource);
        } else {
            
            return res.sendStatus(404);
        }
    });
});
// --- POST GENERAL ---

app.post(BASE_URL_API, (req, res) => {
    const newData = req.body;

    const camposEsperados = ["country", "year", "country_code", "land_agriculture", "types_land", "index"];
    const camposRecibidos = Object.keys(newData);

    
    const tieneEstructuraExacta = camposEsperados.every(f => camposRecibidos.includes(f)) 
                                  && camposRecibidos.length === camposEsperados.length;

    if (!tieneEstructuraExacta) {
       
        return res.sendStatus(400); 
    }

    // 2. VALIDACIÓN DE DUPLICADOS 
   
    db.find({ country: newData.country, year: newData.year }, (err, docs) => {
        if (err) return res.sendStatus(500);

        if (docs.length > 0) {
   
            res.sendStatus(409); 
        } else {
     
            db.insert(newData, (err, doc) => {
                if (err) return res.sendStatus(500);
                res.sendStatus(201); 
            });
        }
    });
});

// --- POST ESPECÍFICO ---
app.post(BASE_URL_API + "/:country/:year", (req, res) => {

    res.sendStatus(405); 
});



// --- PUT ESPECÍFICO ---
app.put(BASE_URL_API + "/:country/:year", (req, res) => {
    const { country, year } = req.params;
    const updatedData = req.body;

    
    const camposEsperados = ["country", "year", "country_code", "land_agriculture", "types_land", "index"];
    const camposRecibidos = Object.keys(updatedData);

    const tieneEstructuraExacta = camposEsperados.every(f => camposRecibidos.includes(f)) 
                                  && camposRecibidos.length === camposEsperados.length;

    if (!tieneEstructuraExacta) {
    
        return res.sendStatus(400); 
    }


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
       
            res.sendStatus(404);
        }
    });
});

// --- PUT GENERAL ---
app.put(BASE_URL_API, (req, res) => {
    res.sendStatus(405); 
});

// --- DELETE GENERAL  ---
app.delete(BASE_URL_API, (req, res) => {
    
    if (req.query.admin !== "true") {
        return res.sendStatus(401); 
    }

    db.remove({}, { multi: true }, (err, numRemoved) => {
        if (err) return res.sendStatus(500);
        res.sendStatus(200);
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

function loadBackendFMM_v2(app) {
    let BASE_URL_API_V2 = "/api/v2/agriculture-land";

    app.get(BASE_URL_API_V2, (req, res) => {
        db.find({}, (err, docs) => {
            if (err) return res.sendStatus(500);
            const result = docs.map(d => {
                const copy = { ...d };
                delete copy._id;
                return copy;
            });
            res.status(200).json(result);
        });
    });


    app.post(BASE_URL_API_V2, (req, res) => {
        const newData = req.body;
        
        db.insert(newData, (err) => {
            if (err) return res.sendStatus(500);
            res.sendStatus(201);
        });
    });

    // loadInitialData v2
    app.get(BASE_URL_API_V2 + "/loadInitialData", (req, res) => {
        db.remove({}, { multi: true }, () => {
            db.insert(initialAgricultureData, () => {
                res.sendStatus(201);
            });
        });
    });
}


export { loadBackendFMM, loadBackendFMM_v2 };


