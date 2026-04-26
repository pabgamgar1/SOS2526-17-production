import Datastore from "nedb";
import fs from "fs";

const BASE_URL_API = "/api/v1/renewable-energy-consumptions";

const db = new Datastore({
  filename: "./src/db/renewable-energy-consumptions.db",
  autoload: true,
});

const jsonRawData = fs.readFileSync("./datos-pgg.json", "utf8");
const initialData = JSON.parse(jsonRawData);

function insertDocumentsSequentially(collection, docs, done) {
  const items = docs.map((doc) => ({ ...doc }));

  const insertNext = (index) => {
    if (index >= items.length) {
      done(null);
      return;
    }

    collection.insert(items[index], (insertErr) => {
      if (insertErr) {
        done(insertErr);
        return;
      }

      insertNext(index + 1);
    });
  };

  insertNext(0);
}

function loadBackendPGG(app) {
  // Cargar datos iniciales
  app.get(BASE_URL_API + "/loadInitialData", (req, res) => {
    db.remove({}, { multi: true }, (removeErr) => {
      if (removeErr) {
        return res.status(500).send("Error clearing data");
      }

      insertDocumentsSequentially(db, initialData, (insertErr) => {
        if (insertErr) {
          return res.status(500).send("Error loading initial data");
        }

        return res.status(200).send("Datos iniciales cargados con éxito.");
      });
    });
  });

  // Documentación
  app.get(BASE_URL_API + "/docs", (req, res) => {
    const target = "https://documenter.getpostman.com/view/52407239/2sBXigMYvk";
    res.redirect(target);
  });

  // GET colección (con filtros y paginación básica)
  app.get(BASE_URL_API, (req, res) => {
    const {
      country,
      code,
      year,
      wind,
      hydro,
      solar,
      other,
      from,
      to,
      limit,
      offset,
      page,
    } = req.query;

    let lim = parseInt(limit);
    let off = parseInt(offset);
    let pg = parseInt(page);
    const hasLimit = limit !== undefined;
    const hasPage = page !== undefined;
    const hasOffset = offset !== undefined;

    db.find({}, (err, stats) => {
      let filteredData = stats;

      if (country)
        filteredData = filteredData.filter(
          (d) => d.country.toLowerCase() === country.toLowerCase(),
        );
      if (code)
        filteredData = filteredData.filter(
          (d) => d.code.toLowerCase() === code.toLowerCase(),
        );
      if (year) filteredData = filteredData.filter((d) => d.year == year);
      if (wind) filteredData = filteredData.filter((d) => d.wind == wind);
      if (hydro) filteredData = filteredData.filter((d) => d.hydro == hydro);
      if (solar) filteredData = filteredData.filter((d) => d.solar == solar);
      if (other) filteredData = filteredData.filter((d) => d.other == other);
      if (from)
        filteredData = filteredData.filter((d) => d.year >= parseInt(from));
      if (to) filteredData = filteredData.filter((d) => d.year <= parseInt(to));

      if (hasLimit && !isNaN(lim)) {
        let start = 0;
        if (hasPage && !isNaN(pg) && pg > 0) {
          start = (pg - 1) * lim;
        } else if (hasOffset && !isNaN(off)) {
          start = off;
        }
        filteredData = filteredData.slice(start, start + lim);
      }

      res.status(200).json(
        filteredData.map((d) => {
          delete d._id;
          return d;
        }),
      );
    });
  });

  // GET recurso específico
  app.get(BASE_URL_API + "/:country/:year", (req, res) => {
    const { country, year } = req.params;

    db.find({ country: country, year: parseInt(year) }, (err, stats) => {
      if (stats.length > 0) {
        const resource = stats[0];
        delete resource._id;
        res.status(200).json(resource);
      } else {
        res.sendStatus(404);
      }
    });
  });

  // POST recurso específico (no permitido)
  app.post(BASE_URL_API + "/:country/:year", (req, res) => res.sendStatus(405));

  // POST colección
  app.post(BASE_URL_API, (req, res) => {
    const newData = req.body;

    if (
      !newData.country ||
      !newData.code ||
      newData.year === undefined ||
      newData.wind === undefined ||
      newData.hydro === undefined ||
      newData.solar === undefined ||
      newData.other === undefined ||
      Object.keys(newData).length !== 7
    ) {
      return res.sendStatus(400);
    }

    db.find(
      { country: newData.country, year: parseInt(newData.year) },
      (err, stats) => {
        if (stats.length > 0) {
          res.sendStatus(409);
        } else {
          db.insert(newData);
          res.status(201).send("CREATED");
        }
      },
    );
  });

  // PUT colección (no permitido)
  app.put(BASE_URL_API, (req, res) => {
    res.sendStatus(405);
  });

  // PUT recurso específico
  app.put(BASE_URL_API + "/:country/:year", (req, res) => {
    const { country, year } = req.params;
    const updatedData = req.body;

    if (country !== updatedData.country || year != updatedData.year) {
      return res.status(400).send("URL and Body inconsistent");
    }

    if (
      !updatedData.country ||
      !updatedData.code ||
      updatedData.year === undefined ||
      updatedData.wind === undefined ||
      updatedData.hydro === undefined ||
      updatedData.solar === undefined ||
      updatedData.other === undefined ||
      Object.keys(updatedData).length !== 7
    ) {
      return res.status(400).send("Invalid JSON structure");
    }

    db.update(
      { country: country, year: parseInt(year) },
      updatedData,
      {},
      (err, numReplaced) => {
        if (err) {
          res.sendStatus(500);
        } else if (numReplaced === 0) {
          res.sendStatus(404);
        } else {
          res.sendStatus(200);
        }
      },
    );
  });

  // DELETE colección
  app.delete(BASE_URL_API, (req, res) => {
    if (req.query.admin !== "true") {
      return res.sendStatus(401);
    }

    db.remove({}, { multi: true }, (err, numRemoved) => {
      res.sendStatus(200);
    });
  });

  // DELETE recurso específico
  app.delete(BASE_URL_API + "/:country/:year", (req, res) => {
    const { country, year } = req.params;

    db.remove(
      { country: country, year: parseInt(year) },
      {},
      (err, numRemoved) => {
        if (numRemoved === 0) {
          res.sendStatus(404);
        } else {
          res.sendStatus(200);
        }
      },
    );
  });
}

export { loadBackendPGG };
