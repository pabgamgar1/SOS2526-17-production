//import dataMRG from "../../datos-mrg.json" with { type: "json" };
import Datastore from 'nedb';
import fs from 'fs';

// 1. Creamos la DB con persistencia en la carpeta /db
const db = new Datastore({ filename: './src/db/water-productivities.db', autoload: true });

// 2. Leemos los datos iniciales
const jsonRawData = fs.readFileSync('./datos-mrg.json', 'utf8');
const dataMRG = JSON.parse(jsonRawData);

function setupAPI(app, versionRuta, isV2 = false) {
    // API RESTful

    // Cargar datos iniciales
    app.get(versionRuta + "/loadInitialData", (req, res) => {
        db.find({}, (err, stats) => {
            if (stats.length === 0) {
                db.insert(dataMRG);
                res.status(200).send("Datos iniciales cargados con éxito.");
            } else {
                res.status(400).send("Bad Request: Data already exists");
            }
        });
    });

    // GET a la documentación (Dinámico según la versión)
    app.get(versionRuta + "/docs", (req, res) => {
        if (isV2) {
            // Pon aquí el enlace de Postman de tu colección V2
            res.redirect("https://documenter.getpostman.com/view/52393924/2sBXijJXCR");
        } else {
            // Este es el enlace de tu V1 actual
            res.redirect("https://documenter.getpostman.com/view/52393924/2sBXigMDbc");
        }
    });

    // GET a la lista de recursos (con filtros, limpieza de _id y PAGINACIÓN)
    app.get(versionRuta, (req, res) => {
        const { country, year, countryCode, waterProductivity, waterStress, annualFreshwater, from, to } = req.query;

        // Parámetros de paginación
        let limit = parseInt(req.query.limit);
        let offset = parseInt(req.query.offset);

        db.find({}, (err, stats) => {
            let filteredData = stats;

            // Filtros de búsqueda
            if (country) filteredData = filteredData.filter(d => d.country.toLowerCase() === country.toLowerCase());
            if (countryCode) filteredData = filteredData.filter(d => d.countryCode.toLowerCase() === countryCode.toLowerCase());
            if (year) filteredData = filteredData.filter(d => d.year == year);
            if (waterProductivity) filteredData = filteredData.filter(d => d.waterProductivity == waterProductivity);
            if (waterStress) filteredData = filteredData.filter(d => d.waterStress == waterStress);
            if (annualFreshwater) filteredData = filteredData.filter(d => d.annualFreshwater == annualFreshwater);
            if (from) filteredData = filteredData.filter(d => d.year >= parseInt(from));
            if (to) filteredData = filteredData.filter(d => d.year <= parseInt(to));

            // PAGINACIÓN sobre los datos ya filtrados
            if (!isNaN(limit) && !isNaN(offset)) {
                filteredData = filteredData.slice(offset, offset + limit);
            }

            // Limpiamos _id y enviamos
            res.status(200).json(filteredData.map(d => { 
                delete d._id; 
                // MEJORA V2: Añadimos un campo calculado de eficiencia
                if(isV2) {
                    d.efficiency_ratio = d.waterStress > 0 ? (d.waterProductivity / d.waterStress).toFixed(2) : 0;
                }
                return d; 
            }));
        });
    });

    // GET de un país con rango (Ej: /Spain?from=2000&to=2010) y PaGINACIÓN
    app.get(versionRuta + "/:country", (req, res) => {
        let country = req.params.country;
        let { from, to } = req.query;
        let limit = parseInt(req.query.limit);
        let offset = parseInt(req.query.offset);

        db.find({ country: country }, (err, stats) => {
            let filteredData = stats;

            if (from) filteredData = filteredData.filter((d) => d.year >= parseInt(from));
            if (to) filteredData = filteredData.filter((d) => d.year <= parseInt(to));

            // Aplicamos paginación si se proporcionan los parámetros
            if (!isNaN(limit) && !isNaN(offset)) {
                filteredData = filteredData.slice(offset, offset + limit);
            }

            res.status(200).json(filteredData.map(d => { 
                delete d._id; 
                if(isV2) d.efficiency_ratio = d.waterStress > 0 ? (d.waterProductivity / d.waterStress).toFixed(2) : 0;
                return d; 
            }));
        });
    });

    // POST: Crear nuevo recurso
    app.post(versionRuta, (req, res) => {
        let newData = req.body;

        if (!newData.country ||
            !newData.year ||
            !newData.countryCode ||
            newData.waterProductivity === undefined ||
            newData.waterStress === undefined ||
            newData.annualFreshwater === undefined ||
            Object.keys(newData).length !== 6) {

            return res.sendStatus(400);
        }

        db.find({ country: newData.country, year: parseInt(newData.year) }, (err, stats) => {
            if (stats.length > 0) {
                res.sendStatus(409);
            } else {
                db.insert(newData);
                res.status(201).send("CREATED");
            }
        });
    });

    // PUT sobre la lista (NO PERMITIDO)
    app.put(versionRuta, (req, res) => {
        res.sendStatus(405);
    });

    // DELETE de toda la lista
    app.delete(versionRuta, (req, res) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            res.sendStatus(200);
        });
    });

    // GET Recurso específico
    app.get(versionRuta + "/:country/:year", (req, res) => {
        let { country, year } = req.params;
        db.find({ country: country, year: parseInt(year) }, (err, stats) => {
            if (stats.length > 0) {
                const resource = stats[0];
                delete resource._id;
                if(isV2) resource.efficiency_ratio = resource.waterStress > 0 ? (resource.waterProductivity / resource.waterStress).toFixed(2) : 0;
                res.status(200).json(resource);
            } else {
                res.sendStatus(404);
            }
        });
    });

    // POST Recurso específico (NO PERMITIDO)
    app.post(versionRuta + "/:country/:year", (req, res) => res.sendStatus(405));

    // PUT Recurso específico
    app.put(versionRuta + "/:country/:year", (req, res) => {
        let { country, year } = req.params;
        let updatedData = req.body;

        if (country !== updatedData.country || year != updatedData.year) {
            return res.status(400).send("URL and Body inconsistent");
        }

        if (!updatedData.country ||
            !updatedData.year ||
            !updatedData.countryCode ||
            updatedData.waterProductivity === undefined ||
            updatedData.waterStress === undefined ||
            updatedData.annualFreshwater === undefined ||
            Object.keys(updatedData).length !== 6) {

            return res.status(400).send("Invalid JSON structure");
        }

        db.update({ country: country, year: parseInt(year) }, updatedData, {}, (err, numReplaced) => {
            if (err) {
                res.sendStatus(500);
            } else if (numReplaced === 0) {
                res.sendStatus(404);
            } else {
                res.sendStatus(200);
            }
        });
    });

    // DELETE Recurso específico
    app.delete(versionRuta + "/:country/:year", (req, res) => {
        let { country, year } = req.params;
        db.remove({ country: country, year: parseInt(year) }, {}, (err, numRemoved) => {
            if (numRemoved === 0) {
                res.sendStatus(404);
            } else {
                res.sendStatus(200);
            }
        });
    });
}

// --- EXPORTACIÓN DE FUNCIONES POR VERSIÓN ---

export function loadBackendMRG(app) {
    setupAPI(app, "/api/v1/water-productivities", false);
}

export function loadBackendMRG_v2(app) {
    setupAPI(app, "/api/v2/water-productivities", true);
}