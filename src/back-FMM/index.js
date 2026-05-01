import Datastore from 'nedb';
import fs from 'fs';
import util from 'util';

const APP_BASE_URL = 'https://sos2526-17-energy.up.railway.app';
const BASE_URL_API = '/api/v1/agriculture-land';

const db = new Datastore({ filename: './src/db/agriculture-land.db', autoload: false });
const agricultureLandReady = new Promise((resolve, reject) => {
    db.loadDatabase((err) => {
        if (!err) {
            resolve();
            return;
        }

        const message = String(err && err.message ? err.message : err);
        const isCrashSafeRecoveryError =
            err && err.code === 'ENOENT' &&
            message.includes('rename') &&
            message.includes('agriculture-land.db~');

        if (isCrashSafeRecoveryError) {
            console.warn('Recovered agriculture-land database after a crash-safe write error.');
            if (db.executor && typeof db.executor.processBuffer === 'function') {
                db.executor.processBuffer();
            }
            resolve();
            return;
        }

        reject(err);
    });
});

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

function normalizeDoc(doc) {
    const cleanedDoc = { ...doc };
    delete cleanedDoc._id;
    if (cleanedDoc['country ']) {
        cleanedDoc.country = cleanedDoc['country '];
        delete cleanedDoc['country '];
    }
    return cleanedDoc;
}

function loadBackendFMM(app) {
    app.get(BASE_URL_API + '/loadInitialData', (req, res) => {
        db.remove({}, { multi: true }, (removeErr) => {
            if (removeErr) return res.status(500).send('Error limpiando DB');
            db.insert(initialAgricultureData, (insertErr, newDocs) => {
                if (insertErr) {
                    return res.status(500).send('Error insertando datos iniciales');
                }
                return res.status(201).send(`✅ Éxito: ${newDocs.length} registros cargados.`);
            });
        });
    });

    app.get(BASE_URL_API, (req, res) => {
        const { country, year, from, to, limit, offset } = req.query;
        const query = {};

        if (country) {
            query.$or = [{ country }, { 'country ': country }];
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
                res.status(200).send(docs.map(normalizeDoc));
            });
    });

    app.get(BASE_URL_API + '/:country/:year', (req, res) => {
        const { country, year } = req.params;
        db.find(
            {
                $or: [{ country }, { 'country ': country }],
                year: parseInt(year)
            },
            (err, docs) => {
                if (err) return res.sendStatus(500);
                if (docs.length === 0) return res.sendStatus(404);
                return res.status(200).json(normalizeDoc(docs[0]));
            }
        );
    });

    app.post(BASE_URL_API, (req, res) => {
        const newData = req.body;
        const expectedKeys = ['country', 'year', 'country_code', 'land_agriculture', 'types_land', 'index'];
        const receivedKeys = Object.keys(newData);

        const hasExactShape =
            expectedKeys.every((field) => receivedKeys.includes(field)) &&
            receivedKeys.length === expectedKeys.length;

        if (!hasExactShape) return res.sendStatus(400);

        db.find(
            {
                $or: [{ country: newData.country }, { 'country ': newData.country }],
                year: parseInt(newData.year)
            },
            (err, docs) => {
                if (err) return res.sendStatus(500);
                if (docs.length > 0) return res.sendStatus(409);

                db.insert(newData, (insertErr) => {
                    if (insertErr) return res.sendStatus(500);
                    res.sendStatus(201);
                });
            }
        );
    });

    app.put(BASE_URL_API + '/:country/:year', (req, res) => {
        const { country, year } = req.params;
        const updatedData = req.body;
        const expectedKeys = ['country', 'year', 'country_code', 'land_agriculture', 'types_land', 'index'];
        const receivedKeys = Object.keys(updatedData);

        if (
            receivedKeys.length !== expectedKeys.length ||
            country !== updatedData.country ||
            parseInt(year) !== updatedData.year
        ) {
            return res.sendStatus(400);
        }

        db.update(
            { $or: [{ country }, { 'country ': country }], year: parseInt(year) },
            { $set: updatedData },
            {},
            (err, numReplaced) => {
                if (err) return res.sendStatus(500);
                numReplaced > 0 ? res.sendStatus(200) : res.sendStatus(404);
            }
        );
    });

    app.delete(BASE_URL_API + '/:country/:year', (req, res) => {
        const { country, year } = req.params;
        db.remove(
            { $or: [{ country }, { 'country ': country }], year: parseInt(year) },
            {},
            (err, numRemoved) => {
                if (err) return res.sendStatus(500);
                numRemoved > 0 ? res.sendStatus(200) : res.sendStatus(404);
            }
        );
    });

    app.delete(BASE_URL_API, (req, res) => {
        if (req.query.admin !== 'true') return res.sendStatus(401);
        db.remove({}, { multi: true }, (err) => {
            if (err) return res.sendStatus(500);
            res.sendStatus(200);
        });
    });

    app.post(BASE_URL_API + '/:country/:year', (req, res) => res.sendStatus(405));
    app.put(BASE_URL_API, (req, res) => res.sendStatus(405));
    app.get(BASE_URL_API + '/docs', (req, res) => {
        res.type('html').send(`
            <main>
                <h1>Agriculture Land API</h1>
                <p>Base URL: <code>${APP_BASE_URL}${BASE_URL_API}</code></p>
                <ul>
                    <li>GET <code>${BASE_URL_API}</code></li>
                    <li>GET <code>${BASE_URL_API}/:country/:year</code></li>
                    <li>POST <code>${BASE_URL_API}</code></li>
                    <li>PUT <code>${BASE_URL_API}/:country/:year</code></li>
                    <li>DELETE <code>${BASE_URL_API}</code></li>
                </ul>
            </main>
        `);
    });
}

export { agricultureLandReady, loadBackendFMM };
