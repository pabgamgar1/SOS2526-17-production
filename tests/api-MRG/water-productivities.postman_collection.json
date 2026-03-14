{
  "info": {
    "_postman_id": "9efbd975-9b4b-4ab0-9ea2-bc4b7125d540",
    "name": "water-productivities",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "52393924",
    "_collection_link": "https://go.postman.co/collection/52393924-9efbd975-9b4b-4ab0-9ea2-bc4b7125d540?source=collection_link"
  },
  "item": [
    {
      "name": "Carga inicial de datos - 200",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200\", function () {\r",
              "    pm.response.to.have.status(200);\r",
              "});"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/v1/water-productivities/loadInitialData",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "api",
            "v1",
            "water-productivities",
            "loadInitialData"
          ]
        }
      },
      "response": []
    },
    {
      "name": "Get conjunto datos - 200",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "// 1. Comprobamos el código de estado 200\r",
              "pm.test(\"Status code is 200\", function () {\r",
              "    pm.response.to.have.status(200);\r",
              "});\r",
              "\r",
              "// 2. Comprobamos que NINGÚN elemento del conjunto tenga el campo _id\r",
              "pm.test(\"Ningún recurso contiene el campo _id\", function () {\r",
              "    var jsonData = pm.response.json();\r",
              "    \r",
              "    // Recorremos el array para asegurar que la limpieza fue total\r",
              "    jsonData.forEach(function(item) {\r",
              "        pm.expect(item).to.not.have.property(\"_id\");\r",
              "    });\r",
              "});"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/v1/water-productivities/",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "api",
            "v1",
            "water-productivities",
            ""
          ]
        }
      },
      "response": []
    },
    {
      "name": "Get a un dato - 200",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200\", function () {\r",
              "    pm.response.to.have.status(200);\r",
              "});\r",
              "\r",
              "pm.test(\"El dato tiene la estructura correcta\", function () {\r",
              "    var jsonData = pm.response.json();\r",
              "    pm.expect(jsonData.country).to.be.a('string');\r",
              "    pm.expect(jsonData.waterStress).to.be.a('number');\r",
              "});"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/v1/water-productivities/Spain/2000",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "api",
            "v1",
            "water-productivities",
            "Spain",
            "2000"
          ]
        }
      },
      "response": []
    },
    {
      "name": "Post al conjunto de datos - 201",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 201\", function () {\r",
              "    pm.response.to.have.status(201);\r",
              "});"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\r\n\"country\": \"Macedonia\",\r\n\"year\": 2000,\r\n\"countryCode\": \"AGO\",\r\n\"waterProductivity\": 63.2,\r\n\"waterStress\": 28.68,\r\n\"annualFreshwater\": 22.69\r\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/api/v1/water-productivities/",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "api",
            "v1",
            "water-productivities",
            ""
          ]
        }
      },
      "response": []
    },
    {
      "name": "Post al conjunto de datos - 409 duplicado",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 409\", function () {\r",
              "    pm.response.to.have.status(409);\r",
              "});"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\r\n\"country\": \"Macedonia\",\r\n\"year\": 2000,\r\n\"countryCode\": \"AGO\",\r\n\"waterProductivity\": 63.2,\r\n\"waterStress\": 28.68,\r\n\"annualFreshwater\": 22.69\r\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/api/v1/water-productivities/",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "api",
            "v1",
            "water-productivities",
            ""
          ]
        }
      },
      "response": []
    },
    {
      "name": "Post al conjunto de datos - 400 sin campo year",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 400\", function () {\r",
              "    pm.response.to.have.status(400);\r",
              "});"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\r\n\"country\": \"Macedonia\",\r\n\"countryCode\": \"AGO\",\r\n\"waterProductivity\": 63.2,\r\n\"waterStress\": 28.68,\r\n\"annualFreshwater\": 22.69\r\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/api/v1/water-productivities/",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "api",
            "v1",
            "water-productivities",
            ""
          ]
        }
      },
      "response": []
    },
    {
      "name": "Post a un dato - 405 (No permitido)",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 405\", function () {\r",
              "    pm.response.to.have.status(405);\r",
              "});"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/api/v1/water-productivities/Spain/2009",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "api",
            "v1",
            "water-productivities",
            "Spain",
            "2009"
          ]
        }
      },
      "response": []
    },
    {
      "name": "PUT al conjunto - 405 (No permitido)",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 405\", function () {\r",
              "    pm.response.to.have.status(405);\r",
              "});"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "method": "PUT",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/api/v1/water-productivities/",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "api",
            "v1",
            "water-productivities",
            ""
          ]
        }
      },
      "response": []
    },
    {
      "name": "Put a un dato - 200",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200\", function () {\r",
              "    pm.response.to.have.status(200);\r",
              "});"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "method": "PUT",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\r\n\"country\": \"Spain\",\r\n\"year\": 2000,\r\n\"countryCode\": \"ESP\",\r\n\"waterProductivity\": 10,\r\n\"waterStress\": 25.68,\r\n\"annualFreshwater\": 22.69\r\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/api/v1/water-productivities/Spain/2000",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "api",
            "v1",
            "water-productivities",
            "Spain",
            "2000"
          ]
        }
      },
      "response": []
    },
    {
      "name": "Get a dato que no existe - 404",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 404\", function () {\r",
              "    pm.response.to.have.status(404);\r",
              "});"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "protocolProfileBehavior": {
        "disableBodyPruning": true
      },
      "request": {
        "method": "GET",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/api/v1/water-productivities/Spain/2018",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "api",
            "v1",
            "water-productivities",
            "Spain",
            "2018"
          ]
        }
      },
      "response": []
    },
    {
      "name": "Delete a un dato - 200",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200\", function () {\r",
              "    pm.response.to.have.status(200);\r",
              "});"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "method": "DELETE",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\r\n        \"country\": \"Spain\",\r\n        \"year\": 2000,\r\n        \"countryCode\": \"ESP\",\r\n        \"waterProductivity\": 15,\r\n        \"waterStress\": 28.68,\r\n        \"annualFreshwater\": 22.69\r\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/api/v1/water-productivities/Afghanistan/2014",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "api",
            "v1",
            "water-productivities",
            "Afghanistan",
            "2014"
          ]
        }
      },
      "response": []
    },
    {
      "name": "Delete del conjunto - 200",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200\", function () {\r",
              "    pm.response.to.have.status(200);\r",
              "});"
            ],
            "type": "text/javascript",
            "packages": {},
            "requests": {}
          }
        }
      ],
      "request": {
        "method": "DELETE",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/v1/water-productivities",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "api",
            "v1",
            "water-productivities"
          ]
        }
      },
      "response": []
    }
  ]
}