const express = require("express");
const router = express.Router();
const apiMainRoutes = require("./api/routeApiMain.js");
const apiProviderRouters= require("./api/routeProviderApiController.js")


//Se traen datos de Api Principal
router.use("/", apiMainRoutes);

//Se traen datos de Api Proveedores
router.use("/", apiProviderRouters)

module.exports = router;