let express =require ("express");

const datos  = [
{country : "afghanistan",
 year: 1961 ,
 country_code: "afg" ,
 land_agriculture: 57.87835579 ,
 types_land: 0, 
 index: 1 ,
 },
{country : "angola",
 year: 1969,
 country_code: "ago",
 land_agriculture: 27.8634119805249,
 types_land: 0, 
 index: 0.5,
},
{country : "albania ",
 year: 1970 ,
 country_code: "alb",
 land_agriculture:20.4545454545455 ,
 types_land:0, 
 index: 0.3,
},
{country : "argentina",
 year:1972 ,
 country_code:"arg" ,
 land_agriculture: 52.1739130434783,
 types_land: 1, 
 index: 0.2,
},
{country :"australia" ,
 year: 1973,
 country_code: "aus" ,
 land_agriculture:41.2748424624333 ,
 types_land: 0, 
 index:0.1 ,
},
{country : "bahamas",
 year:1989 ,
 country_code: "bhs",
 land_agriculture:0.999000999000999 ,
 types_land:3 , 
 index: 0.5,
},
{country : "Afghanistan",
 year:1967 ,
 country_code:"afg" ,
 land_agriculture: 58.1550158686353,
 types_land:0 , 
 index: 1.5,},

{country : "Afghanistan",
 year:1968  ,
 country_code:"afg" ,
 land_agriculture: 57.9550158686353,
 types_land: 0, 
 index: 1,},

{country : "bolivia",
 year: 1981,
 country_code: "bol",
 land_agriculture:33.0779055731558 ,
 types_land: 0, 
 index: 1,},
 
{country :"bermuda ",
 year: 1986,
 country_code:"bhs" ,
 land_agriculture:58.123668031216 ,
 types_land: 2, 
 index:1 ,
},
];







let mediaLandAgriculture = datos
    .filter((d) => d.index >= 0 && d.index <= 0.5)
    .map((d) => d.land_agriculture)
    .reduce((a, b) => a + b, 0) / 
  datos.filter((d) => d.index >= 0 && d.index <= 0.5).length;

console.log(mediaLandAgriculture);

const app =express();


let BASE_URL_API ="/api/V1"

app.use("/",express.static("./static"))




app.get("/", (req, res) => {
  res.send(
    `<html><body><h1>Media de tierra que es apta para agricultura por indice de pulicion entre 0 y 0.5 :${mediaLandAgriculture}</h1></body></html>`,
  );
});

app.listen(3000, () => {
  console.log("Listening on port 3000...");
});





// clase 6 marzo  lo de hoy no es necesario para feedback del lunes
//nebd base de datos para javaScript relaciona facil y facil con mongodb

//   "type": "module", luego cambia los require a una forma diferente usando import 
//import  express from 'express'
// function loadbackend(app {el codigo esta dentro de esta funcion })
// export {loadBackend}
//hay que dividir index.js , cada api en una carpeta y el index.js como conector 

//nedb
//https://github.com/pafmon/SOS2526-labs/blob/L06/index.js
//