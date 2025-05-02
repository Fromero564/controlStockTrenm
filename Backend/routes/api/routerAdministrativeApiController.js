const express = require("express");
const router = express.Router();
const path = require("path");
const apiAdministrativeController= require("../../controllers/api/administrativeApiController");



//Api para ver proveedores cargados
router.get("/allProviders",apiAdministrativeController.allProviders);
//Api para ver clientes cargados
router.get("/allClients",apiAdministrativeController.allClients);



//Cargar nuevo proveedor
router.post("/provider-load",apiAdministrativeController.loadNewProvider);
//Cargar nuevo cliente
router.post("/client-load",apiAdministrativeController.loadNewClient);
//Cargar nuevo producto en la bd para ser usado en operaciones
router.post("/product-load",apiAdministrativeController.loadNewProduct);

module.exports = router;