const express = require("express");
const router = express.Router();
const apiMainRoutes = require("./api/routeApiMain.js");
const apiOperatorRouters= require("./api/routeOperatorApiController.js")
const apiAdministativeRouters= require("./api/routerAdministrativeApiController.js")
const {authenticateJWT}=require("../middlewares/authMiddleware.js");


//Se traen datos de Api Principal
router.use("/", apiMainRoutes);

//Se traen datos de Api Proveedores
router.use("/",apiOperatorRouters)

//Se traen datos de Api Administrativo
router.use("/",apiAdministativeRouters)

module.exports = router;