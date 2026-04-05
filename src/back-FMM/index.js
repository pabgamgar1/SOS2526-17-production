import Datastore from 'nedb';
import fs from 'fs';
import util from 'util';

let BASE_URL_API = "/api/v1/agriculture-land";

const db = new Datastore({ filename: './src/db/agriculture-land.db', autoload: true });
const jsonRawData = fs.readFileSync('./datos-fmm.json', 'utf8');
const initialAgricultureData = JSON.parse(jsonRawData);

if (typeof util.isRegExp !== 'function') {
    util.isRegExp = function (obj) {
        return Object.prototype.toString.call(obj) === '[object RegExp]' || obj instanceof RegExp;
    };
}
if (typeof util.isDate !== 'function') {
    util.isDate = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    };
}

function loadBackendFMM(app) {

    app.get(BASE_URL_API + "/loadInitialData", (req, res) => {
        db.remove({}, { multi: true }, (err) => {
            if (err) return res.status(500).send("Error limpiando DB");
            db.insert(initialAgricultureData, (err, newDocs) => {
                if (err) {
                    return res.status(500).send("Error insertando datos iniciales");
                } else {
                    return res.status(201).send(`✅ Éxito: ${newDocs.length} registros cargados.`);
                }
            });
        });
    });

    app.get(BASE_URL_API, (req, res) => {
        let { country, year, from, to, limit, offset } = req.query;
        let query = {};

        if (country) {
            query.$or = [{ country: country }, { "country ": country }];
        }

        if (year) {
            query.year = parseInt(year);
        } else if (from || to) {
            query.year = {};
            if (from) query.year.$gte = parseInt(from);
            if (to) query.year.$lte = parseInt(to);
        }

        db.find(query)
          .skip(parseInt(offset) || 0) 
          .limit(parseInt(limit) || 0)
          .exec((err, docs) => {
              if (err) return res.sendStatus(500);
              const result = docs.map((d) => {
                  const cleanedDoc = { ...d };
                  delete cleanedDoc._id;
                  if (cleanedDoc["country "]) {
                      cleanedDoc.country = cleanedDoc["country "];
                      delete cleanedDoc["country "];
                  }
                  return cleanedDoc;
              });
              res.status(200).send(result);
          });
    });

    app.get(BASE_URL_API + "/:country/:year", (req, res) => {
        const { country, year } = req.params;
        db.find({ 
            $or: [{ country: country }, { "country ": country }], 
            year: parseInt(year) 
        }, (err, docs) => {
            if (err) return res.sendStatus(500);
            if (docs.length > 0) {
                const resource = { ...docs[0] };
                delete resource._id;
                if (resource["country "]) {
                    resource.country = resource["country "];
                    delete resource["country "];
                }
                return res.status(200).json(resource);
            }
            res.sendStatus(404);
        });
    });

    app.post(BASE_URL_API, (req, res) => {
        const newData = req.body;
        const camposEsperados = ["country", "year", "country_code", "land_agriculture", "types_land", "index"];
        const camposRecibidos = Object.keys(newData);

        const tieneEstructuraExacta = camposEsperados.every(f => camposRecibidos.includes(f)) 
                                      && camposRecibidos.length === camposEsperados.length;

        if (!tieneEstructuraExacta) return res.sendStatus(400); 

        db.find({ 
            $or: [{ country: newData.country }, { "country ": newData.country }], 
            year: parseInt(newData.year) 
        }, (err, docs) => {
            if (err) return res.sendStatus(500);
            if (docs.length > 0) return res.sendStatus(409); 

            db.insert(newData, (err) => {
                if (err) return res.sendStatus(500);
                res.sendStatus(201); 
            });
        });
    });

    app.put(BASE_URL_API + "/:country/:year", (req, res) => {
        const { country, year } = req.params;
        const updatedData = req.body;
        const camposEsperados = ["country", "year", "country_code", "land_agriculture", "types_land", "index"];
        const camposRecibidos = Object.keys(updatedData);

        if (camposRecibidos.length !== camposEsperados.length || country !== updatedData.country || parseInt(year) !== updatedData.year) {
            return res.sendStatus(400);
        }

        db.update(
            { $or: [{ country: country }, { "country ": country }], year: parseInt(year) }, 
            { $set: updatedData }, 
            {}, 
            (err, numReplaced) => {
                if (err) return res.sendStatus(500);
                numReplaced > 0 ? res.sendStatus(200) : res.sendStatus(404);
            }
        );
    });

    app.delete(BASE_URL_API + "/:country/:year", (req, res) => {
        const { country, year } = req.params;
        db.remove({ 
            $or: [{ country: country }, { "country ": country }], 
            year: parseInt(year) 
        }, {}, (err, numRemoved) => {
            if (err) return res.sendStatus(500);
            numRemoved > 0 ? res.sendStatus(200) : res.sendStatus(404);
        });
    });

    app.delete(BASE_URL_API, (req, res) => {
        if (req.query.admin !== "true") return res.sendStatus(401); 
        db.remove({}, { multi: true }, (err) => {
            if (err) return res.sendStatus(500);
            res.sendStatus(200);
        });
    });

    app.post(BASE_URL_API + "/:country/:year", (req, res) => res.sendStatus(405));
    app.put(BASE_URL_API, (req, res) => res.sendStatus(405));
    app.get(BASE_URL_API + "/docs", (req, res) => res.redirect("https://documenter.getpostman.com/view/52395584/2sBXigMDSm"));
}

function loadBackendFMM_v2(app) {
    let BASE_URL_API_V2 = "/api/v2/agriculture-land";
    app.get(BASE_URL_API_V2, (req, res) => {
        db.find({}, (err, docs) => {
            if (err) return res.sendStatus(500);
            res.status(200).json(docs.map(d => { const c = {...d}; delete c._id; return c; }));
        });
    });
}

export { loadBackendFMM, loadBackendFMM_v2 };