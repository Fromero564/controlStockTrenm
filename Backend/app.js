require("dotenv").config();

const path = require("path");
const express = require('express');
const cors = require("cors");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const session = require("express-session");
const router = require("./routes/mainRouter.js");


const app = express();



app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.json());

//Se utiliza cors
app.use(cors());

//Acceso a la carpeta Public
app.use(express.static(path.join(__dirname, "public")));

// Usa un puerto por defecto si process.env.PORT no está definido
const PORT = process.env.PORT || 3000;

//Puerto donde se ejecuta la aplicación
app.listen(PORT, () => {
  console.log(`Proyecto corriendo en puerto: ${PORT}`)
});


//Llama a las rutas para que se ejecuten

app.use("/", router);