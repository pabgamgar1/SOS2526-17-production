import express from "express";
import bodyParser from "body-parser";
import cool from "cool-ascii-faces";

import path from 'path';

import { loadBackendMRG } from "./src/back-MRG/index.js";
import { loadBackendFMM } from "./src/back-FMM/index.js";
import { loadBackendPGG } from "./src/back-PGG/index.js";

const app = express();
const port = process.env.PORT || 3000;

const layout = (content) => `
  <!DOCTYPE html>
  <html lang="es">
      <head>
          <meta charset="UTF-8" />
          <title>About - SOS2526-17</title>
          <style>
            body {
              font-family:
                  system-ui,
                  -apple-system,
                  BlinkMacSystemFont,
                  "Segoe UI",
                  Roboto,
                  Oxygen,
                  Ubuntu,
                  Cantarell,
                  "Open Sans",
                  "Helvetica Neue",
                  sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 40px auto;
              padding: 0 20px;
              color: #24292e;
            }
          </style>
      </head>
      <body>
        <main>
          ${content}
        </main>
      </body>
  </html>
  `;

app.use("/", express.static("./static"));
app.use(bodyParser.json());

// --- RUTA ABOUT ---
app.get("/about", (req, res) => {
  // process.cwd() apunta a la raíz del proyecto
  res.sendFile(path.join(process.cwd(), "static", "about.html"));
});

// --- RUTA COOL ---
/*
app.get("/cool", (req, res) => {
  res.send(cool());
  console.log("New cool face delivered");
});*/
// --- RUTA index.html ---
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "static", "index.html"));
});

 
loadBackendMRG(app);
loadBackendFMM(app);
loadBackendPGG(app);

//------------------FMM-----------------------------------------

app.listen(port, () => {
  console.log(`Servidor de grupo funcionando en puerto ${port}`);
});




