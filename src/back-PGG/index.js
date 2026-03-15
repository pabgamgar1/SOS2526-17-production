//import initialData from "../../datos-pgg.json" with { type: "json" };

import Datastore from "nedb";
import fs from "fs";

const BASE_URL_API = "/api/v1/renewable-energy-consumptions";

const REQUIRED_FIELDS = [
  "country",
  "code",
  "year",
  "wind",
  "hydro",
  "solar",
  "other",
];

const db = new Datastore({
  filename: "./src/db/renewable-energy-consumptions.db",
  autoload: true,
});

const jsonRawData = fs.readFileSync("./datos-pgg.json", "utf8");
const initialData = JSON.parse(jsonRawData);

function compositeId(country, year) {
  return `${country}__${year}`;
}

function sanitize(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest;
}

function hasOnlyRequiredFields(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  const keys = Object.keys(obj);
  if (keys.length !== REQUIRED_FIELDS.length) return false;
  for (const key of keys) {
    if (!REQUIRED_FIELDS.includes(key)) return false;
  }
  return true;
}

function isValidPayload(obj) {
  if (!hasOnlyRequiredFields(obj)) return false;
  if (typeof obj.country !== "string" || obj.country.trim() === "")
    return false;
  if (typeof obj.code !== "string" || obj.code.trim() === "") return false;
  if (!Number.isInteger(obj.year)) return false;
  if (typeof obj.wind !== "number" || Number.isNaN(obj.wind)) return false;
  if (typeof obj.hydro !== "number" || Number.isNaN(obj.hydro)) return false;
  if (typeof obj.solar !== "number" || Number.isNaN(obj.solar)) return false;
  if (typeof obj.other !== "number" || Number.isNaN(obj.other)) return false;
  return true;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getQueryValue(query, key) {
  const value = query[key];
  if (value === undefined) return { ok: true, present: false };
  if (Array.isArray(value)) return { ok: false };
  return { ok: true, present: true, value };
}

function parseNumericParam(raw, { integer = false } = {}) {
  if (raw === undefined) return { ok: true, present: false };
  const num = Number(raw);
  if (!Number.isFinite(num)) return { ok: false };
  if (integer && !Number.isInteger(num)) return { ok: false };
  return { ok: true, present: true, value: num };
}

function parsePagination(query) {
  const hasLimit = query.limit !== undefined;
  const hasOffset = query.offset !== undefined;
  const hasPage = query.page !== undefined;

  if ((hasOffset || hasPage) && !hasLimit) {
    return { ok: false };
  }
  if (hasOffset && hasPage) {
    return { ok: false };
  }

  if (!hasLimit) {
    return { ok: true, limit: null, offset: 0 };
  }

  const limit = Number(query.limit);
  if (!Number.isInteger(limit) || limit <= 0) {
    return { ok: false };
  }

  let offset = 0;
  if (hasOffset) {
    const off = Number(query.offset);
    if (!Number.isInteger(off) || off < 0) return { ok: false };
    offset = off;
  }

  if (hasPage) {
    const page = Number(query.page);
    if (!Number.isInteger(page) || page <= 0) return { ok: false };
    offset = (page - 1) * limit;
  }

  return { ok: true, limit, offset };
}

function loadBackendPGG(app) {
  /* Ruta dinámica /samples/PGG
  app.get("/samples/PGG", (req, res) => {
    const averageHydroAfghanistan =
      initialData
        .filter((d) => d.country === "Afghanistan")
        .map((d) => d.hydro)
        .reduce((a, b) => a + b) /
      initialData.filter((d) => d.country === "Afghanistan").length;

    res.send(
      `<p>Media de electridad renovable hidráulica producida por Afghanistan: ${averageHydroAfghanistan}</p>`,
    );
  });*/

  app.get(BASE_URL_API + "/docs", (req, res) => {
    const target =
      process.env.PGG_DOCS_URL ||
      "https://sos2526-XX.onrender.com/api/v1/FFFFF/docs";
    res.redirect(target);
  });

  app.get(BASE_URL_API + "/loadInitialData", (req, res) => {
    db.count({}, (err, count) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (count > 0) {
        return res.status(409).json({ error: "Data already initialized" });
      }
      const docs = initialData.map((d) => ({
        ...d,
        _id: compositeId(d.country, d.year),
      }));
      db.insert(docs, (insertErr, newDocs) => {
        if (insertErr) {
          return res.status(500).json({ error: "Failed to load initial data" });
        }
        return res
          .status(201)
          .json({ message: "Initial data loaded", count: newDocs.length });
      });
    });
  });

  // GET todos
  app.get(BASE_URL_API, (req, res) => {
    const pagination = parsePagination(req.query);
    if (!pagination.ok) return res.sendStatus(400);

    const countryParam = getQueryValue(req.query, "country");
    const codeParam = getQueryValue(req.query, "code");
    const yearParam = parseNumericParam(req.query.year, { integer: true });
    const windParam = parseNumericParam(req.query.wind);
    const hydroParam = parseNumericParam(req.query.hydro);
    const solarParam = parseNumericParam(req.query.solar);
    const otherParam = parseNumericParam(req.query.other);
    const fromParam = parseNumericParam(req.query.from, { integer: true });
    const toParam = parseNumericParam(req.query.to, { integer: true });

    if (
      !countryParam.ok ||
      !codeParam.ok ||
      !yearParam.ok ||
      !windParam.ok ||
      !hydroParam.ok ||
      !solarParam.ok ||
      !otherParam.ok ||
      !fromParam.ok ||
      !toParam.ok
    ) {
      return res.sendStatus(400);
    }

    const filters = [];

    if (countryParam.present) {
      const regex = new RegExp(`^${escapeRegExp(countryParam.value)}$`, "i");
      filters.push({ country: regex });
    }

    if (codeParam.present) {
      const regex = new RegExp(`^${escapeRegExp(codeParam.value)}$`, "i");
      filters.push({ code: regex });
    }

    if (yearParam.present) {
      filters.push({ year: yearParam.value });
    }

    if (fromParam.present || toParam.present) {
      const range = {};
      if (fromParam.present) range.$gte = fromParam.value;
      if (toParam.present) range.$lte = toParam.value;
      filters.push({ year: range });
    }

    if (windParam.present) filters.push({ wind: windParam.value });
    if (hydroParam.present) filters.push({ hydro: hydroParam.value });
    if (solarParam.present) filters.push({ solar: solarParam.value });
    if (otherParam.present) filters.push({ other: otherParam.value });

    const query = filters.length ? { $and: filters } : {};

    let cursor = db.find(query);
    if (pagination.limit !== null) {
      cursor = cursor.skip(pagination.offset).limit(pagination.limit);
    }

    cursor.exec((err, docs) => {
      if (err) return res.status(500).json({ error: "Database error" });
      const sanitized = docs.map(sanitize);
      return res.status(200).json(sanitized);
    });
  });

  // GET dato específico
  app.get(BASE_URL_API + "/:country/:year", (req, res) => {
    const { country, year } = req.params;
    const yearNum = Number(year);
    if (!Number.isInteger(yearNum)) return res.sendStatus(400);

    db.findOne({ _id: compositeId(country, year) }, (err, doc) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!doc) return res.sendStatus(404);
      return res.status(200).json(sanitize(doc));
    });
  });

  // POST (no permitido)
  app.post(BASE_URL_API + "/:country/:year", (req, res) =>
    res.sendStatus(405),
  );

  // POST (añadir uno nuevo)
  app.post(BASE_URL_API, (req, res) => {
    const newData = req.body;
    if (!isValidPayload(newData)) {
      return res.sendStatus(400);
    }

    const id = compositeId(newData.country, newData.year);

    db.findOne({ _id: id }, (findErr, existing) => {
      if (findErr) return res.status(500).json({ error: "Database error" });
      if (existing) return res.sendStatus(409);

      const doc = { ...newData, _id: id };
      db.insert(doc, (insertErr) => {
        if (insertErr) return res.status(500).json({ error: "Database error" });
        return res.sendStatus(201);
      });
    });
  });

  // PUT sobre la lista (NO PERMITIDO)
  app.put(BASE_URL_API, (req, res) => {
    res.sendStatus(405);
  });

  // PUT (sustituir info de uno)
  app.put(BASE_URL_API + "/:country/:year", (req, res) => {
    const { country, year } = req.params;
    const yearNum = Number(year);
    if (!Number.isInteger(yearNum)) return res.sendStatus(400);

    const updatedData = req.body;
    if (!isValidPayload(updatedData)) {
      return res.sendStatus(400);
    }

    if (country !== updatedData.country || yearNum !== updatedData.year) {
      return res.sendStatus(400);
    }

    const id = compositeId(country, year);
    const doc = { ...updatedData, _id: id };

    db.update({ _id: id }, doc, {}, (err, numUpdated) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (numUpdated === 0) return res.sendStatus(404);
      return res.sendStatus(200);
    });
  });

  // DELETE todos
  app.delete(BASE_URL_API, (req, res) => {
    if (req.query.admin !== "true") {
      return res.sendStatus(401);
    }

    db.remove({}, { multi: true }, (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      return res.sendStatus(200);
    });
  });

  // DELETE dato específico
  app.delete(BASE_URL_API + "/:country/:year", (req, res) => {
    const { country, year } = req.params;
    const yearNum = Number(year);
    if (!Number.isInteger(yearNum)) return res.sendStatus(400);

    db.remove({ _id: compositeId(country, year) }, {}, (err, numRemoved) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (numRemoved === 0) return res.sendStatus(404);
      return res.sendStatus(200);
    });
  });
}

export { loadBackendPGG };
