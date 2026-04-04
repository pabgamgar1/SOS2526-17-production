import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {handler} from "./src/front/build/handler.js";
//import cool from "cool-ascii-faces";

import path from "path";

import { loadBackendMRG } from "./src/back-MRG/index.js";
import { loadBackendFMM } from "./src/back-FMM/index.js";
import { loadBackendPGG } from "./src/back-PGG/index.js";

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(bodyParser.json());


loadBackendMRG(app);
loadBackendFMM(app);
loadBackendPGG(app);

app.use(handler);

app.listen(port, () => {
  console.log(`Servidor de grupo funcionando en puerto ${port}`);
});
