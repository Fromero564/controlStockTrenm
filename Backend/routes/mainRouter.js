const express = require("express");
const router = express.Router();
const apiMainRoutes = require("./api/routeApiMain.js");
const apiProviderRouters= require("./api/routeProviderApiController.js")
const apiAdministativeRouters= require("./api/routerAdministrativeApiController.js")


//Se traen datos de Api Principal
router.use("/", apiMainRoutes);

//Se traen datos de Api Proveedores
router.use("/", apiProviderRouters)

//Se traen datos de Api Administrativo
router.use("/", apiAdministativeRouters)

module.exports = router;