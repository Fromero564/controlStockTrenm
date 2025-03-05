const express = require("express");
const router = express.Router();
const path = require("path");
const apiAdministrativeController= require("../../controllers/api/administrativeApiController");


//Cargar los nombres de los productos
router.get("/product-primary-name",apiAdministrativeController.loadProductsPrimary)
//Cargar nuevo producto en la bd para ser usado en operaciones
router.post("/product-load",apiAdministrativeController.loadNewProduct);

module.exports = router;