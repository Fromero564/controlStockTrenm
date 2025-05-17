const express = require("express");
const router = express.Router();
const path = require("path");
const apiAdministrativeController= require("../../controllers/api/administrativeApiController");



//Api para ver proveedores cargados
router.get("/allProviders",apiAdministrativeController.allProviders);
//Api para cargar proveedor filtrado
router.get("/provider/:id",apiAdministrativeController.filterProvider);
//Api para cargar cliente filtrado
router.get("/client/:id",apiAdministrativeController.filterClient);
//Api para ver clientes cargados
router.get("/allClients",apiAdministrativeController.allClients);

//Api para actualizar proveedor
router.put("/provider-edit/:id",apiAdministrativeController.editProvider)
//Api para actualizar cliente
router.put("/client-edit/:id",apiAdministrativeController.editClient)


//Cargar nuevo proveedor
router.post("/provider-load",apiAdministrativeController.loadNewProvider);
//Cargar nuevo cliente
router.post("/client-load",apiAdministrativeController.loadNewClient);
//Cargar nuevo producto en la bd para ser usado en operaciones
router.post("/product-load",apiAdministrativeController.loadNewProduct);

//Api para eliminar proveedor
router.delete('/deleteProvider/:id', apiAdministrativeController.deleteProvider);
//Api para eliminar cliente
router.delete('/deleteClient/:id', apiAdministrativeController.deleteClient);

module.exports = router;